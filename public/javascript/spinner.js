// spinner.js

// Function to show the spinner
function showSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.remove('spinner-hidden');
    }
}

// Function to hide the spinner
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.add('spinner-hidden');
    }
}

// Export the functions if using modules
export { showSpinner, hideSpinner };
