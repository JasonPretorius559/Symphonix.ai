document.addEventListener('DOMContentLoaded', async () => {
    async function updateDropdownUserInfo() {
        try {
            const response = await fetch('/home/user-info');
            const result = await response.json();

            if (result.success) {
                const user = result.user;
                const userInfoElement = document.getElementById('userInfo');
                const logoutOption = document.getElementById('logoutOption');

                if (userInfoElement) {
                    userInfoElement.textContent = `${user.username}`;
                    
                    // Check for access role and create button if necessary
                    if (user.role === 1) {  // Ensure 'role' is used
                        const adminButton = document.createElement('button');
                        adminButton.textContent = 'Admin Tools';
                        adminButton.id = 'adminToolsButton'; // Apply the CSS class
                        adminButton.addEventListener('click', () => {
                            window.location.href = '/management-console';
                            console.log('Admin Tools button clicked');
                        });

                        // Insert the admin button before the logout option
                        const dropdownContent = document.querySelector('.dropdown-content');
                        dropdownContent.insertBefore(adminButton, logoutOption);
                    }
                }
            } else {
                console.error('Failed to fetch user info:', result.error);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error.message);
        }
    }

    updateDropdownUserInfo();
});
