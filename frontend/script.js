// Global variable to keep track of the lessons for the selected class
let lessons = [];

// Helper function to create input fields for each lesson
function createLessonInputs(lessons) {
    const dynamicInputsDiv = document.getElementById('dynamic-lesson-inputs');
    dynamicInputsDiv.innerHTML = ''; // Clear existing inputs

    lessons.forEach(lesson => {
        const label = document.createElement('label');
        label.htmlFor = `input-${lesson}`;
        label.textContent = `${lesson}: `;
        dynamicInputsDiv.appendChild(label);
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `input-${lesson}`;
        input.name = `input-${lesson}`;
        input.placeholder = `Enter items for ${lesson}`;
        dynamicInputsDiv.appendChild(input);
        
        dynamicInputsDiv.appendChild(document.createElement('br'));
    });
}

// Helper function to display the list of items required for the lessons
function displayItemList(itemList) {
    const requiredItemsList = document.getElementById('required-items-list');
    requiredItemsList.innerHTML = ''; // Clear existing content
    console.log('Updating the item list on the page:', itemList);

    itemList.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        requiredItemsList.appendChild(listItem);
    });
}

// Event listener for when the class is changed
document.getElementById('class').addEventListener('change', function(event) {
    const selectedClass = event.target.value;

    fetch('http://127.0.0.1:5000/api/getClassLessons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class: selectedClass }),
    })
    .then(response => response.json())
    .then(data => {
        lessons = data.lessons;
        console.log('Received lessons:', lessons);
        createLessonInputs(lessons);
    })
    .catch(error => {
        console.error('Error fetching class lessons:', error);
    });
});

// Event listener for the Generate List button
document.getElementById('generate-list').addEventListener('click', function() {
    console.log("Button pressed")
    const selectedClass = document.getElementById('class').value;
    const selectedDay = document.getElementById('day').value;

    let userItems = {};
    lessons.forEach(lesson => {
        const inputElement = document.getElementById(`input-${lesson}`);
        userItems[lesson] = inputElement ? inputElement.value : '';
    });

    console.log('Sending data to generate item list:', {
        day: selectedDay,
        class: selectedClass,
        userItems: userItems,
    });

    fetch('http://127.0.0.1:5000/api/generateItemList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            day: selectedDay,
            class: selectedClass,
            userItems: userItems,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received item list:', data.items);
        displayItemList(data.items);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
