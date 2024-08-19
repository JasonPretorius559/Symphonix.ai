document.addEventListener('DOMContentLoaded', async () => {
    async function updateDropdownUserInfo() {
        try {
            const response = await fetch('/home/user-info');
            const result = await response.json();

            if (result.success) {
                const user = result.user;
                const userInfoElement = document.getElementById('userInfo');
                if (userInfoElement) {
                    userInfoElement.textContent = `${user.username}`;
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
