from flask import Flask, jsonify, request
from flask_cors import CORS
import openpyxl

app = Flask(__name__)
CORS(app)

# Function to parse the xlsx file and get the timetable
def parse_xlsx(class_code):
    # Open the workbook and select the active worksheet
    wb = openpyxl.load_workbook('/home/jakkobk/Kotipakkija/backend/data/3P_tunniplaan (1).xlsx')
    ws = wb.active

    print("Worksheet Data:")
    for row in ws.iter_rows(values_only=True):
        print(row)

    # Find the schedule for the given class code
    schedule = []
    for row in ws.iter_rows(values_only=True):
        if row[1].startswith(class_code):
            print("Matched Class Code:", row)
            schedule.append(row)
     

    return schedule

# This function now also takes a dictionary of userItems where the key is the lesson name
# and the value is a string of items the user requires for that lesson.
def generate_list_for_day(schedule, day_index, userItems):
    items = set()
    for lesson in schedule:
        if lesson[3][day_index] == '1':  # If there is a class on that day
            # Get the user's items for this lesson, if they have been provided
            lesson_items = userItems.get(lesson[0], "No items specified")
            items.add(f"{lesson[0]}: {lesson_items}")
    return list(items)


@app.route('/api/generateItemList', methods=['POST'])
def generate_item_list():
    data = request.json
    selected_day = data.get('day')
    selected_class = data.get('class')
    user_items = data.get('userItems', {})



    # Map the days to indexes
    day_index_map = {
        'Esmaspäev': 0,
        'Teisipäev': 1,
        'Kolmapäev': 2,
        'Neljapäev': 3,
        'Reede': 4
    }

    # Get the day index
    day_index = day_index_map[selected_day]

    # Parse the xlsx data
    schedule = parse_xlsx(selected_class)

    # Generate the list of items for the selected day
    item_list = generate_list_for_day(schedule, day_index, user_items)

    return jsonify({'items': item_list})

@app.route('/api/getClassLessons', methods=['POST'])
def get_class_lessons():
    data = request.json
    selected_class = data.get('class')

    # Parse the xlsx data to get the class schedule
    schedule = parse_xlsx(selected_class)

    # Extract lessons from the schedule
    lessons = {row[0] for row in schedule}

    return jsonify({'lessons': list(lessons)})
if __name__ == '__main__':
    app.run(debug=True)
