document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", function(e) {
            e.preventDefault();
            const targetTab = this.getAttribute("data-tab");

            // Deactivate all tabs and contents
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(tc => tc.classList.remove("active"));

            // Activate the clicked tab and its corresponding content
            this.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
        });
    });
});