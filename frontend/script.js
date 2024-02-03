// Global variable to keep track of the lessons for the selected class
let lessons = [];

// Helper function to create input fields for each lesson
function createLessonInputs(lessons) {
    console.log("Creating lesson inputs")
    const dynamicInputsDiv = document.getElementById('dynamic-lesson-inputs');
    dynamicInputsDiv.innerHTML = ''; // Clear existing inputs

    lessons.forEach(lesson => {
        const label = document.createElement('label');
        //label.textContent = `${lesson}: `;
        //dynamicInputsDiv.appendChild(label);
        label.htmlFor = `input-${lesson}`;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `input-${lesson}`;
        input.name = `input-${lesson}`;
        input.placeholder = `Sisesta asjad: ${lesson}`;
        dynamicInputsDiv.appendChild(input);
        dynamicInputsDiv.appendChild(document.createElement('br'));
        console.log("input.id:", input.id)
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
        console.log(item)
    });
}

function registerUser() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

function loginUser() {
    console.log("loginUser")
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Handle login success, e.g., storing logged-in user in sessionStorage
        if (data.message === 'Login successful!') {
            sessionStorage.setItem('username', username);
        }
    })
    .catch(error => console.error('Error:', error));
}

function saveUserItems() {
    console.log("Function saveUserItems.")
    const username = sessionStorage.getItem('username');
    console.log(username)
    lessons.forEach(lesson => {
        const itemsInput = document.getElementById(`input-${lesson}`).value; // Get the items from the input field
        if (itemsInput) { // Check if the input field is not empty
            debugger;// Send the data to the server
            fetch('http://127.0.0.1:5000/api/userItems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    lesson: lesson,
                    items: itemsInput
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Response from saving items", data); // Log the response from the server
                // Here you can update the UI to show a success message
            })
            .catch(error => console.error('Error saving items:', error));
        }
    });
}


// Event listener for when the class is changed
document.getElementById('class').addEventListener('change', function(event) {
    console.log("Class changed")
    debugger;
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
        fetchSavedItemsForClass(selectedClass);
    })
    .catch(error => {
        console.error('Error fetching class lessons:', error);
    });

    fetchSavedItemsForClass(selectedClass);
});

function fetchSavedItemsForClass(selectedClass) {
    const username = sessionStorage.getItem('username'); // Retrieve the username from session storage
    console.log("Username and class being sent:", username, selectedClass);

    fetch('http://127.0.0.1:5000/api/getUserItems', { // This endpoint should return the saved items for the user
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            class: selectedClass
        }),
    })
    .then(response => response.json()) // Convert response to JSON
    .then(fetchedData => { // Ensure 'data' is defined in this scope as the result of the response.json() promise
        console.log("Fetched data:", fetchedData); // Log the fetched data
        console.log("Fetched userItems:", fetchedData.userItems);
        // Assuming the response data is an object where keys are lesson names and values are the items
        Object.entries(fetchedData.userItems).forEach(([lesson, items]) => { // Use 'fetchedData' here
            const inputElement = document.getElementById(`input-${lesson}`);
            if (inputElement) {
                inputElement.value = items; // Set the value of the input field to the saved items
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



// Event listener for the Generate List button
document.getElementById('generate-list').addEventListener('click', function() {
    console.log("Button pressed")
    const selectedClass = document.getElementById('class').value;
    const selectedDay = document.getElementById('day').value;
    const username = sessionStorage.getItem('username')

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
            username,
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

document.getElementById('save-items-button').addEventListener('click', function(event) {
    console.log('Button clicked, calling preventDefault');
    event.preventDefault(); // Prevent the default form submission
    saveUserItems();
    debugger;
});

function updateLoggedInUserDisplay() {
    const loggedInUser = sessionStorage.getItem('username');
    const loggedInUserElement = document.getElementById('logged-in-user');

    if (loggedInUser) {
        loggedInUserElement.textContent = loggedInUser;
    } else {
        loggedInUserElement.textContent = 'Not logged in';
    }
    console.log(sessionStorage.getItem('username'))
}

function loginUser() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.message === 'Login successful!') {
            sessionStorage.setItem('username', username);
            updateLoggedInUserDisplay(); // Update the username display
            // Redirect to another page or update the UI as needed
        }
    })
    .catch(error => console.error('Error:', error));
}

