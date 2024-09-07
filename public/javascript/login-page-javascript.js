document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popup-message');
  const popupClose = document.getElementById('popup-close');
  const popupOk = document.getElementById('popup-ok');
  const spinnerContainer = document.getElementById('spinner-container'); // Reference to spinner container

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Show the spinner when form submission starts
    spinnerContainer.style.display = 'flex'; // Show the spinner container

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
        popupMessage.textContent = result.error || 'Login failed.';
        popup.style.display = 'block';
      }
    } catch (error) {
      popupMessage.textContent = 'An error occurred: ' + error.message;
      popup.style.display = 'block';
    } finally {
      // Hide the spinner once the response is received
      spinnerContainer.style.display = 'none'; // Hide the spinner container
    }
  });

  // Close the popup when the user clicks on the close button
  popupClose.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  // Redirect to the home page when the user clicks on the okay button
  popupOk.addEventListener('click', () => {
    popup.style.display = 'none';
    window.location.href = '/home'; // Optional: redirect if needed
  });

  // Close the popup if the user clicks anywhere outside of the popup content
  window.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });
});
