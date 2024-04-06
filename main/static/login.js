document.getElementById('login-button').addEventListener('click', function() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message');

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();  // Assuming the backend sends a success message
        } else {
            throw new Error('Login failed');
        }
    })
    .then(data => {
        console.log(data);
        messageDiv.textContent = data.message;
        window.location.href = '/home'; // Redirect to a protected page or dashboard
    })
    .catch(error => {
        console.error('Error:', error);
        messageDiv.textContent = 'Login failed. Please try again.';
    });
});

document.getElementById('register-button').addEventListener('click', function() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const messageDiv = document.getElementById('register-message');

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        messageDiv.textContent = data.message;
        if (data.message === 'Registered successfully!') {
            // Optionally auto-login the user or redirect them to the login page
            // For now, just inform them to log in
            messageDiv.textContent += ' Please log in with your new credentials.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        messageDiv.textContent = 'Registration failed. Please try again.';
    });
});

