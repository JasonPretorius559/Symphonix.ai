document.addEventListener('DOMContentLoaded', () => {
    const registerUserButton = document.getElementById('add-user-btn');
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');

    if (!registerUserButton) {
        console.error('Register user button not found.');
        return;
    }

    // Password complexity check function (Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char)
    function isPasswordComplex(password) {
        const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return complexityRegex.test(password);
    }

    function showPopup(message) {
        popupMessage.innerText = message;
        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.add('hide');
        }, 3000);

        setTimeout(() => {
            popup.classList.remove('show', 'hide');
        }, 3500);
    }

    registerUserButton.addEventListener('click', async () => {
        const username = document.getElementById('name').value.trim();
        const password = document.getElementById('password').value.trim();
        const status = document.getElementById('status').value;
        const permissions = document.getElementById('permissions').value;

        if (!username || !password) {
            showPopup('Username and password are required.');
            return;
        }

        // Frontend password complexity validation
        if (!isPasswordComplex(password)) {
            showPopup('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
            return;
        }

        const userData = { username, password, status, permissions };

        try {
            const response = await fetch('/management-console/admin-register-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('User registered successfully:', result);
                showPopup('User registered successfully!');
                document.querySelector('.user-form').reset();
            } else {
                const errorMessage = await response.text();
                console.error('Error adding user:', errorMessage);
                showPopup('Failed to register user. Please try again.');
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error.message);
            showPopup('An unexpected error occurred. Please try again.');
        }
    });
});
