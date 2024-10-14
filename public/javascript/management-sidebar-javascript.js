document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutOption');
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

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
                    const errorMessage = await response.text();
                    console.error('Failed to log out:', errorMessage);
                    alert('Failed to log out. Please try again.'); // Inform user of the error
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
                alert('An unexpected error occurred. Please try again.'); // Inform user of unexpected error
            }
        });
    }

    function closeDropdown() {
        if (dropdownContent) {
            dropdownContent.classList.remove('active'); // Remove active class to close dropdown
            const logo = document.querySelector('.logo'); // Get the logo element
            logo.style.animation = 'none'; // Remove any animation
        }
    }

    // Add click event listener to dropdown button to toggle the dropdown
    if (dropbtn) {
        dropbtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent event from bubbling up to the window
            const logo = document.querySelector('.logo'); // Get the logo element

            // Toggle dropdown visibility
            if (dropdownContent) {
                dropdownContent.classList.toggle('active'); // Toggle active class
                
                // Apply spin animation
                if (dropdownContent.classList.contains('active')) {
                    logo.style.animation = 'spin 0.5s forwards'; // Spin on open
                    triggerTypewriterEffect(dropdownContent); // Trigger typewriter effect when opened
                } else {
                    logo.style.animation = 'spin 0.5s reverse forwards'; // Spin on close
                }
            }
        });
    }

    // Close dropdown if clicking outside
    window.addEventListener('click', (event) => {
        if (dropdownContent && !event.target.matches('.dropbtn') && !dropdownContent.contains(event.target)) {
            closeDropdown(); // Hide dropdown if clicking outside
        }
    });

    function triggerTypewriterEffect(dropdown) {
        const items = dropdown.querySelectorAll('div, span'); // Select dropdown items
        items.forEach((item, index) => {
            item.style.display = 'none'; // Hide items initially
            setTimeout(() => {
                createTypewriterEffect(item); // Create typewriter effect for each item
            }, index * 300); // Delay each item by 300ms
        });
    }
});
