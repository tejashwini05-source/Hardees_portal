const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginMessage = document.getElementById("adminLoginMessage");

adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!adminLoginForm.reportValidity()) return;
    adminLoginMessage.textContent = "Demo preview only. Credentials are not verified or sent.";
    adminLoginMessage.className = "auth-message success";
    document.getElementById("adminPreviewLink").hidden = false;
});
