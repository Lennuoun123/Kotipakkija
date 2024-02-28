from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, current_user, logout_user, login_required
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
import openpyxl
import os


app = Flask(__name__)
app.secret_key = 'B85YAMZRZOJASEJ732WYN6RYIKXZL9'
CORS(app, supports_credentials=True, resources={r"*": {"origins": "*", "methods": ["GET", "POST"], "allow_headers": ["Content-Type", "Authorization"]}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///yourdatabase.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # to avoid SQLAlchemy warning
db = SQLAlchemy(app)

migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # Store hashed passwords

class UserItems(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    lesson = db.Column(db.String(80), nullable=False)
    items = db.Column(db.String(200), nullable=False)

    user = db.relationship('User', backref=db.backref('items', lazy=True))

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = data['password']
    hashed_password = generate_password_hash(password)

    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Registered successfully!'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if user and check_password_hash(user.password, data['password']):
        login_user(user)
        return jsonify({'message': 'Login successful!'}), 200

    return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/logout', methods=['POST'])
def logout():

    if current_user.is_authenticated:
        logout_user()
        return jsonify({'message': 'You have been logged out.'}), 200
    else:
        # User not authenticated, but still return a successful response
        print('No active session')
        return jsonify({'message': 'No active session.'}), 200

@app.route('/protected')
@login_required
def protected():
    return 'This is a protected route.'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Function to parse the xlsx file and get the timetable
def parse_xlsx(class_code):

    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, 'data')  # Adjust the subdirectory name as necessary
    xlsx_file = os.path.join(data_dir, 'nyc_excel.xlsx')  #File name

    wb = openpyxl.load_workbook(xlsx_file)
    ws = wb.active

    # Find the schedule for the given class code
    schedule = []
    for row in ws.iter_rows(min_row=2, values_only=True):

        if str(row[4]).startswith(class_code):
            schedule.append(row)
    return schedule

# This function now also takes a dictionary of userItems where the key is the lesson name
# and the value is a string of items the user requires for that lesson.
def generate_list_for_day(schedule, day_index, user_items):
    items = set()
    for lesson in schedule:

        if lesson[7][day_index] == '1':  # If there is a class on that day
            course_name = lesson[5]
            # Get the user's items for this lesson, if they have been provided
            lesson_items = user_items.get(course_name, "No items specified")
            items.add(f"{course_name}: {lesson_items}")        
    return list(items)


@app.route('/api/generateItemList', methods=['POST'])
@login_required
def generate_item_list():
    data = request.json
    selected_day = data.get('day')
    selected_class = data.get('class')
    user_items = data.get('userItems', {})

    # For simplicity, using provided `user_items` directly

    day_index_map = {'Esmaspäev': 0, 'Teisipäev': 1, 'Kolmapäev': 2, 'Neljapäev': 3, 'Reede': 4}
    day_index = day_index_map[selected_day]
    schedule = parse_xlsx(selected_class)
    item_list = generate_list_for_day(schedule, day_index, user_items)

    return jsonify({'items': item_list})


@app.route('/api/getClassLessons', methods=['POST'])
def get_class_lessons():
    data = request.json
    selected_class = data.get('class')

    # Parse the xlsx data to get the class schedule
    schedule = parse_xlsx(selected_class)

    # Extract lessons from the schedule
    lessons = {row[5] for row in schedule}

    return jsonify({'lessons': list(lessons)})

@app.route('/api/userItems', methods=['GET', 'POST'])
def add_user_items():
    data = request.json

    print("Data:", data)

    username = data.get('username')
    lesson = data.get('lesson')
    items = data.get('items')

    print(username, lesson, items)

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user_item = UserItems.query.filter_by(user_id=user.id, lesson=lesson).first()
    if user_item:
        user_item.items = items  # Update existing items
    else:
        new_user_item = UserItems(user_id=user.id, lesson=lesson, items=items)  # Add new item entry
        db.session.add(new_user_item)
    print("Committing to database")
    db.session.commit()
    print("Commit successful.")
    return jsonify({'message': 'Items updated successfully'}), 200

@app.route('/api/getUserItems', methods=['POST', 'OPTIONS'])
def get_user_items():
    if request.method == 'OPTIONS':
        return _build_cors_prelight_response()
    
    data = request.json
    username = data.get('username')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user_items = UserItems.query.filter_by(user_id=user.id).all()

    # Now constructing items_dict without considering the class
    items_dict = {item.lesson: item.items for item in user_items}

    #print("Printing user items: ", user_items)
    #print("Printing items_dict", items_dict)

    return jsonify({'userItems': items_dict}), 200


def _build_cors_prelight_response():
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response

if __name__ == '__main__':
    app.run(debug=True)

