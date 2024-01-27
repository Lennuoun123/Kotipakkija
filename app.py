from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import pandas as pd
import openpyxl
import itertools as it

df = pd.read_excel(io="nyc_excel.xlsx", dtype='object')

komb = [
    '00000', '00001', '00010', '00011',
    '00100', '00101', '00110', '00111',
    '01000', '01001', '01010', '01011',
    '01100', '01101', '01110', '01111',
    '10000', '10001', '10010', '10011',
    '10100', '10101', '10110', '10111',
    '11000', '11001', '11010', '11011',
    '11100', '11101', '11110', '11111'
]
sisesta_klass = input("Sisesta klass: ")
klass = [sisesta_klass]
sisesta_päev = input("Sisesta päev: ").lower()

if sisesta_päev == "esmaspäev":
    päev_binary = 0
elif sisesta_päev == "teisipäev":
    päev_binary = 1
elif sisesta_päev == "kolmapäev":
    päev_binary = 2
elif sisesta_päev == "neljapäev":
    päev_binary = 3
elif sisesta_päev == "reede":
    päev_binary = 4

filtered_numbers = []
for binary_number in komb:
    if binary_number[päev_binary] == '1':
        filtered_numbers.append(binary_number)

df_päev = df[df['Cycle Day'].isin(filtered_numbers)]
df_päev_klass = df_päev[df['SectionID'].isin(klass)]

print(df_päev_klass.head(50))

klass_filter = df[df['SectionID'].isin(klass)]
#values_list = klass_filter['Course name'].tolist()
unique_values_list = klass_filter['Course name'].unique().tolist()
print(unique_values_list)

unique_values_set = set(df['CourseCode'])
#unique_classes = set(unique_values_set['SectionID'])
#print(unique_classes)
# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})


# sanity check route
@app.route('/ping', methods=['GET'])
def ping_pong():
    return jsonify("hello")

if __name__ == '__main__':
    app.run()
