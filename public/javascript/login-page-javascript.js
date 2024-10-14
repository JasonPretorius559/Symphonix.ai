document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-message'); // Reference to the error message element
  const spinnerContainer = document.getElementById('spinner-container'); // Reference to spinner container

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Show the spinner when form submission starts
    spinnerContainer.style.display = 'flex'; // Show the spinner container

    // Clear previous error message
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Handle unexpected HTML response
        throw new Error('Unexpected response format');
      }

      if (response.ok) {
        window.location.href = '/home'; // Redirect on successful login
      } else {
        // Show the error message under the login button
        errorMessage.textContent = result.error || 'Username or password is incorrect.';
        errorMessage.style.display = 'block'; // Make it visible
      }
    } catch (error) {
      errorMessage.textContent = 'An error occurred: ' + error.message;
      errorMessage.style.display = 'block'; // Make it visible
    } finally {
      // Hide the spinner once the response is received
      spinnerContainer.style.display = 'none'; // Hide the spinner container
    }
  });
});
