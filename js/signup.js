const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!signupForm.reportValidity()) return;
    signupMessage.textContent = "Demo only: your details were not sent, saved, or used to create an account.";
    signupMessage.className = "auth-message success";
});
