document.addEventListener('DOMContentLoaded', () => { 

    const logoutOption = document.getElementById('logout-button');
    const activeChatsWidget = document.getElementById('activeChatsWidget');
    const activeSessionsSpan = document.getElementById('activeSessions');

    if (logoutOption) {
        logoutOption.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    window.location.href = '/';
                } else {
                    console.error('Logout failed:', await response.text());
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            }
        });
    }

    if (activeChatsWidget) {
        activeChatsWidget.addEventListener('click', async () => {
            try {
                const response = await fetch('/management-console/refresh-sessions'); // Endpoint to fetch updated session count
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                
                // Ensure the data has the totalSessions property
                if (data.totalSessions !== undefined) {
                    activeSessionsSpan.textContent = data.totalSessions; // Update the span with new value
                    console.log(`Updated Active Sessions Value: ${data.totalSessions}`); // Corrected logging
                } else {
                    console.error('Unexpected response data:', data);
                }

            } catch (error) {
                console.error('Error fetching updated sessions:', error);
            }
        });
    }
});
