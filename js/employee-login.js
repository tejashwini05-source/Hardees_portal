const employeeLoginForm = document.getElementById("employeeLoginForm");
const employeeLoginMessage = document.getElementById("employeeLoginMessage");

employeeLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!employeeLoginForm.reportValidity()) return;
    employeeLoginMessage.textContent = "Demo preview only. Your credentials were not checked or sent.";
    employeeLoginMessage.className = "auth-message success";
    document.getElementById("employeePreviewLink").hidden = false;
});
