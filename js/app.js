const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const previewLink = document.getElementById("previewDashboard");
const navigation = document.getElementById("navigation");
const navigationToggle = document.getElementById("navigationToggle");

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!loginForm.reportValidity()) return;
        loginMessage.textContent = "Demo preview only. Nothing was sent or saved.";
        loginMessage.className = "login-message success";
        previewLink.hidden = false;
    });
}

navigationToggle?.addEventListener("click", () => {
    const expanded = navigationToggle.getAttribute("aria-expanded") === "true";
    navigationToggle.setAttribute("aria-expanded", String(!expanded));
    navigation.classList.toggle("is-open", !expanded);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        const target = hash.length > 1 ? document.querySelector(hash) : null;
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
            navigation?.classList.remove("is-open");
            navigationToggle?.setAttribute("aria-expanded", "false");
        }
    });
});
