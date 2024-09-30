// JavaScript to handle logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent the default link behavior

            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Ensure cookies/session data is included
                });

                if (response.ok) {
                    window.location.href = '/'; // Redirect to the login page or home page
                } else {
                    console.error('Failed to log out:', await response.text());
                    alert('Failed to log out. Please try again.');
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
                alert('An unexpected error occurred. Please try again.');
            }
        });
    }
});
