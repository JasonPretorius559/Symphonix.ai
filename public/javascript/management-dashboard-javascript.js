document.addEventListener('DOMContentLoaded', () => {
    
    const activeChatsWidget = document.getElementById('activeChatsWidget');
    const activeSessionsSpan = document.getElementById('activeSessions');
    const refreshButton = document.getElementById('refreshButton');
    const tableBody = document.getElementById('sessionsTableBody');
    const searchInput = document.getElementById('searchInput');
    const exportChatsButton = document.getElementById('exportChatsButton');
    const addUserButton = document.getElementById('addUserButton');

    // Ensure all elements are found
    if (!searchInput || !tableBody || !refreshButton || !activeSessionsSpan) {
        console.error('One or more required elements are missing from the DOM.');
        return;
    }

    // Function to format date to "YYYY/MM/DD, HH:MM:SS"
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
        const day = d.getDate().toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');

        return `${year}/${month}/${day}, ${hours}:${minutes}:${seconds}`;
    };

    // Function to filter table rows based on the search input
    const filterTable = () => {
        const query = searchInput.value ? searchInput.value.toLowerCase() : '';
        const rows = tableBody.getElementsByTagName('tr');

        for (const row of rows) {
            const cells = row.getElementsByTagName('td');
            let rowVisible = false;

            for (const cell of cells) {
                if (cell.textContent.toLowerCase().includes(query)) {
                    rowVisible = true;
                    break;
                }
            }

            row.style.display = rowVisible ? '' : 'none';
        }
    };

    // Add event listener to filter table on input change
    searchInput.addEventListener('input', filterTable);

    // Function to populate table rows (you should replace this with your actual data fetching logic)
    const populateTable = async () => {
        try {
            const response = await fetch('/management-console/refresh-sessions', {
                method: 'POST', // Change the method to POST
                headers: {
                    'Content-Type': 'application/json' // Ensure the content type is JSON
                },
                body: JSON.stringify({}) // If needed, you can include data in the body
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();

            if (data.sessionData && Array.isArray(data.sessionData)) {
                tableBody.innerHTML = '';

                data.sessionData.forEach(session => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${session.UserName}</td>
                        <td>${session.UserID}</td>
                        <td>${session.OpenChats}</td>
                        <td>${formatDate(session.LastSession)}</td>
                        <td>${formatDate(session.ExpiryTime)}</td>
                        <td>${session.IPAddress}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                console.error('Unexpected data format:', data);
            }
        } catch (error) {
            console.error('Error fetching session data:', error);
        }
    };

    // Initially populate the table with data
    populateTable();

    // Event listener for refreshing sessions
    refreshButton.addEventListener('click', async () => {
        refreshButton.classList.add('spinner-active');

        try {
            const response = await fetch('/management-console/refresh-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();

            if (data.totalSessions !== undefined) {
                activeSessionsSpan.textContent = data.totalSessions;
            } else {
                console.error('Unexpected response data:', data);
            }

            if (data.sessionData && Array.isArray(data.sessionData)) {
                tableBody.innerHTML = '';

                data.sessionData.forEach(session => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${session.UserName}</td>
                        <td>${session.UserID}</td>
                        <td>${session.OpenChats}</td>
                        <td>${formatDate(session.LastSession)}</td>
                        <td>${formatDate(session.ExpiryTime)}</td>
                        <td>${session.IPAddress}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                console.error('Invalid data format:', data);
            }
        } catch (error) {
            console.error('Error refreshing sessions:', error);
        } finally {
            refreshButton.classList.remove('spinner-active');
        }
    });

    // Event listener for exporting chats
    if (exportChatsButton) {
        exportChatsButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/management-console/export-chats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'sessions.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    console.error('Error exporting chats:', await response.text());
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            }
        });
    }

    if (addUserButton) {
        addUserButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/management-console/profiles', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
    
                if (response.ok) {
                    // The backend will handle setting the active tab; just redirect
                    window.location.href = '/management-console/profiles';
                } else {
                    console.error('Error navigating to profiles:', await response.text());
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            }
        });
    }
});

