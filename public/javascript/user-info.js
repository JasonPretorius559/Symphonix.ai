document.addEventListener('DOMContentLoaded', async () => {
    async function updateDropdownUserInfo() {
        try {
            const response = await fetch('/home/user-info');
            const result = await response.json();

            if (result.success) {
                const user = result.user;
                const userInfoElement = document.getElementById('userInfo');
                const logoutOption = document.getElementById('logoutOption');
                const homeOption = document.getElementById('homeOption');

                if (userInfoElement) {
                    userInfoElement.textContent = `${user.username}`;
                    
                    // Check for access role and create button if necessary
                    if (user.role === 1) { // Ensure 'role' is used
                        const adminButton = document.createElement('span'); // Create a span for the button
                        adminButton.textContent = 'Admin Tools';
                        
                        adminButton.className = 'common-text'; // Add a class for styling
                        adminButton.style.cursor = 'pointer'; // Change cursor to pointer
                        adminButton.addEventListener('click', () => {
                            window.location.href = '/management-console'; // Navigate to admin console
                            console.log('Admin Tools button clicked');
                            closeDropdown(); // Close dropdown after navigation
                        });

                        // Insert the admin button before the logout option
                        const dropdownContent = document.querySelector('.dropdown-content');
                        dropdownContent.insertBefore(adminButton, logoutOption); // Insert the button
                    }

                }
            } else {
                console.error('Failed to fetch user info:', result.error);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error.message);
        }
    }

    function closeDropdown() {
        const dropdownContent = document.querySelector('.dropdown-content');
        const logo = document.querySelector('.logo'); // Get the logo element
        if (dropdownContent) {
            dropdownContent.classList.remove('active'); // Remove active class to close dropdown
            logo.style.animation = 'none'; // Remove any animation
        }
    }

   // Add click event listener to dropdown button to toggle the dropdown
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    dropbtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event from bubbling up to the window
        const logo = document.querySelector('.logo'); // Get the logo element

        // Toggle dropdown visibility
        if (dropdownContent) {
            dropdownContent.classList.toggle('active'); // Toggle active class
            
            // Apply spin animation
            if (dropdownContent.classList.contains('active')) {
                logo.style.animation = 'spin 0.5s forwards'; // Spin on open
            } else {
                logo.style.animation = 'spin 0.5s reverse forwards'; // Spin on close
            }
        }
    });

    // Close dropdown if clicking outside
    window.addEventListener('click', (event) => {
        if (dropdownContent && !event.target.matches('.dropbtn') && !dropdownContent.contains(event.target)) {
            closeDropdown(); // Hide dropdown if clicking outside
        }
    });

    updateDropdownUserInfo();
});
