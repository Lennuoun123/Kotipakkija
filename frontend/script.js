// Global variable to keep track of the lessons for the selected class
let lessons = [];

// Helper function to create input fields for each lessons
function createLessonInputs(lessons) {
    console.log("Creating lesson inputs")
    const dynamicInputsDiv = document.getElementById('dynamic-lesson-inputs');
    const fragment = document.createDocumentFragment(); // Create a DocumentFragment to hold the elements

    lessons.forEach(lesson => {
        const label = document.createElement('label');
        label.htmlFor = `input-${lesson}`;
        label.textContent = `${lesson} ⤵`;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `input-${lesson}`;
        input.name = `input-${lesson}`;
        input.placeholder = `Sisesta asjad`;

        fragment.appendChild(label);
        fragment.appendChild(input);
        fragment.appendChild(document.createElement('br'));
    });

     
    dynamicInputsDiv.innerHTML = ''; // Clear existing inputs once
    dynamicInputsDiv.appendChild(fragment); // Append all at once
}


function fetchSavedItemsForClass(selectedClass) {
    debugger;
    const username = sessionStorage.getItem('username'); // Retrieve the username from session storage
    console.log("Username being sent:", username);

    fetch('http://127.0.0.1:5000/api/getUserItems', { // This endpoint should return the saved items for the user
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username
        }),
    })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        const userItems = data.userItems;
        for (const lesson in userItems) {
            const inputElement = document.getElementById(`input-${lesson}`);
            if (inputElement) {
                inputElement.value = userItems[lesson];
            }
        }
    })
    
    .catch(error => {
        console.error('Error:', error);
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

// Event listener for the day change
document.getElementById('day').addEventListener('change', function() {
    console.log("Day changed")
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



function saveUserItems() {
    console.log("Function saveUserItems.")
    const username = sessionStorage.getItem('username');
    console.log(username)
    lessons.forEach(lesson => {
        const itemsInput = document.getElementById(`input-${lesson}`).value // Get the items from the input field
        const selectedClass = document.getElementById('class').value;
        
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
                
            })
            .catch(error => console.error('Error saving items:', error));

    });
}

document.getElementById('save-items-button').addEventListener('click', function(event) {
    saveUserItems();
});

function updateLoggedInUserDisplay() {
    const loggedInUser = sessionStorage.getItem('username');
    const loggedInUserElement = document.getElementById('logged-in-user');

    if (loggedInUser) {
        loggedInUserElement.textContent = loggedInUser;
    } else {
        loggedInUserElement.textContent = 'Pole sisse logitud';
    }
    console.log(sessionStorage.getItem('username'))
}

document.getElementById('logout-button').addEventListener('click', function() {
    debugger;
    fetch('http://127.0.0.1:5000/logout', {
        method: 'POST', // Use the same method defined in your Flask route
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    .then(response => {
        if (response.ok) {
            console.log('Logout successful');
            // Clear any client-side storage or state indicating user is logged in
            sessionStorage.removeItem('username');
            // Redirect to login page or home page
            window.location.href = '../frontend/login.html';
        } else {
            throw new Error('Logout failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('class').addEventListener('change', function() {
    // Check if a class has been selected
    if(this.value) {
        // Make the buttons visible
        document.getElementById('twobuttons').style.display = 'block';
        document.getElementById('day').style.display = 'flex'
    } else {
        // Hide the buttons if no class is selected
        document.getElementById('twobuttons').style.display = 'none';
        document.getElementById('day').style.display = 'none'
    }
});
