const checkInButton = document.getElementById("checkInButton");
const workStatus = document.getElementById("workStatus");
const workedHours = document.getElementById("workedHours");
const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");
const workspacePanel = document.getElementById("workspacePanel");
const workspaceContent = document.getElementById("workspaceContent");

const employee = {
    name: "Jordan Miller",
    employeeId: "DEMO-1042",
    jobTitle: "Crew Member",
    location: "Rockingham, NC",
    email: "jordan.miller@example.test",
};

const demoNow = new Date();
let clockInAt = new Date(demoNow.getTime() - 4.4 * 60 * 60 * 1000);
let checkedIn = true;
let attendance = [
    { clockIn: clockInAt, clockOut: null },
    { clockIn: new Date(demoNow.getTime() - 24 * 60 * 60 * 1000), clockOut: new Date(demoNow.getTime() - 23.2 * 60 * 60 * 1000) },
    { clockIn: new Date(demoNow.getTime() - 48 * 60 * 60 * 1000), clockOut: new Date(demoNow.getTime() - 47.1 * 60 * 60 * 1000) },
];
const schedule = [1, 2, 4].map((days, index) => {
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + days);
    startAt.setHours(index === 1 ? 11 : 6, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + 8 * 60 * 60 * 1000);
    return { startAt, endAt, role: index === 1 ? "Midday shift" : "Opening shift", location: employee.location };
});
const reviews = [
    { period: "September 2026", score: 94, notes: "Consistent service and reliable teamwork." },
    { period: "August 2026", score: 91, notes: "Strong guest care; continue building station speed." },
];

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function updateDateTime() {
    const now = new Date();
    document.getElementById("currentDate").textContent = now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    document.getElementById("currentWeekday").textContent = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    document.getElementById("currentTime").textContent = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function setProfile() {
    document.querySelectorAll("[data-profile]").forEach((element) => {
        element.textContent = employee[element.dataset.profile] || "Not provided";
    });
    document.getElementById("welcomeHeading").textContent = `Welcome back, ${employee.name.split(" ")[0]}!`;
    const initials = employee.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    document.querySelectorAll(".avatar, .profile-avatar").forEach((element) => {
        element.textContent = initials;
    });
}

function hoursFor(entry, endAt = Date.now()) {
    return Math.max(0, new Date(endAt) - new Date(entry.clockIn)) / 3600000;
}

function formatTime(value) {
    return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(value) {
    return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function setAttendanceState() {
    checkInButton.disabled = false;
    checkInButton.classList.toggle("checked", checkedIn);
    checkInButton.innerHTML = checkedIn ? "<span>✓</span> CHECK OUT" : "<span>✓</span> CHECK IN";
    workStatus.classList.toggle("checked-in", checkedIn);
    workStatus.innerHTML = checkedIn ? "<span></span> Checked In · DEMO" : "<span></span> Checked Out · DEMO";

    const active = attendance.find((entry) => !entry.clockOut);
    const todayHours = active ? hoursFor(active) : attendance[0].clockOut ? hoursFor(attendance[0], attendance[0].clockOut) : 7.4;
    workedHours.textContent = todayHours.toFixed(1);
    document.getElementById("recentActivityTitle").textContent = "Today's attendance · sample";
    document.getElementById("recentActivityText").textContent = active
        ? `Clocked in at ${formatTime(active.clockIn)} · no clock-out yet`
        : `Clock in ${formatTime(attendance[0].clockIn)} · clock out ${formatTime(attendance[0].clockOut)}`;
    document.getElementById("recentActivityHours").textContent = active ? "IN PROGRESS" : `${todayHours.toFixed(1)} hrs`;
}

function setUpcomingShift() {
    const next = schedule[0];
    document.getElementById("weeklyHours").textContent = "32.5";
    document.getElementById("todaysShiftTitle").textContent = "Opening shift";
    document.getElementById("todaysShiftTime").textContent = "6:00 AM – 2:00 PM";
    document.getElementById("upcomingShiftRole").textContent = next.role;
    const start = next.startAt;
    const end = next.endAt;
    const day = start.toLocaleDateString("en-US", { day: "2-digit" });
    const month = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const time = `${formatTime(start)} – ${formatTime(end)}`;
    document.getElementById("upcomingDateBadge").textContent = `${month} ${day}`;
    document.getElementById("upcomingDay").textContent = day;
    document.getElementById("upcomingMonth").textContent = month;
    document.getElementById("upcomingShiftName").textContent = next.role;
    document.getElementById("upcomingShiftTime").textContent = time;
    document.getElementById("upcomingShiftLocation").textContent = `${employee.location} · 8 hours · sample`;
    document.getElementById("nextShiftText").textContent = start.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    document.getElementById("nextShiftTime").textContent = time;
    document.getElementById("performanceScore").textContent = String(reviews[0].score);
    document.getElementById("performanceSummary").textContent = reviews[0].period;
    document.getElementById("performanceSummaryScore").textContent = `${reviews[0].score} score`;
}

function makeTable(headers, rows) {
    const wrapper = document.createElement("div");
    wrapper.className = "workspace-table-wrap";
    const table = document.createElement("table");
    const head = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach((label) => {
        const cell = document.createElement("th");
        cell.textContent = label;
        headerRow.append(cell);
    });
    head.append(headerRow);
    const body = document.createElement("tbody");
    rows.forEach((row) => {
        const tableRow = document.createElement("tr");
        row.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value == null ? "--" : String(value);
            tableRow.append(cell);
        });
        body.append(tableRow);
    });
    table.append(head, body);
    wrapper.append(table);
    return wrapper;
}

function showPanel(section) {
    const dashboard = document.getElementById("dashboard");
    const titles = {
        schedule: "My Schedule",
        hours: "Working Hours",
        performance: "Performance",
        pay: "Pay Statements",
        profile: "My Profile",
        checkin: "Today's Attendance",
    };
    if (section === "dashboard") {
        dashboard.hidden = false;
        workspacePanel.hidden = true;
        return;
    }
    dashboard.hidden = true;
    workspacePanel.hidden = false;
    document.getElementById("workspaceTitle").textContent = titles[section] || "Employee workspace";
    workspaceContent.replaceChildren();

    if (section === "schedule") {
        const rows = schedule.map((shift) => [formatDate(shift.startAt), formatDate(shift.endAt), shift.location, shift.role, "Sample"]);
        workspaceContent.append(makeTable(["Start", "End", "Location", "Shift", "Source"], rows));
    } else if (section === "hours" || section === "checkin") {
        const rows = attendance.map((entry) => [formatDate(entry.clockIn), entry.clockOut ? formatDate(entry.clockOut) : "In progress", `${hoursFor(entry, entry.clockOut || Date.now()).toFixed(2)} hrs`, "Demo data"]);
        workspaceContent.append(makeTable(["Clock in", "Clock out", "Duration", "Record type"], rows));
        const note = document.createElement("p");
        note.className = "demo-panel-note";
        note.textContent = "Preview controls change this page only. No attendance data is submitted or stored.";
        workspaceContent.append(note);
    } else if (section === "performance") {
        const rows = reviews.map((review) => [review.period, `${review.score}/100`, review.notes, "Sample"]);
        workspaceContent.append(makeTable(["Review period", "Score", "Notes", "Source"], rows));
    } else if (section === "profile") {
        workspaceContent.append(makeTable(["Field", "Value"], [
            ["Name", employee.name],
            ["Employee ID", employee.employeeId],
            ["Email", employee.email],
            ["Role", employee.jobTitle],
            ["Location", employee.location],
            ["Data", "Fictional demo profile"],
        ]));
    } else {
        const note = document.createElement("p");
        note.className = "demo-panel-note";
        note.textContent = "No payroll provider is connected. This independent demo does not contain or display pay statements.";
        workspaceContent.append(note);
    }
}

checkInButton.addEventListener("click", () => {
    if (checkedIn) {
        checkedIn = false;
        attendance[0].clockOut = new Date();
        showToast("Demo only. Check-out changed on this page and was not saved.");
    } else {
        checkedIn = true;
        clockInAt = new Date();
        attendance.unshift({ clockIn: clockInAt, clockOut: null });
        showToast("Demo only. Check-in changed on this page and was not saved.");
    }
    setAttendanceState();
});

document.getElementById("mobileMenuButton").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const open = sidebar.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelectorAll(".nav-item").forEach((navItem) => navItem.classList.remove("active"));
        item.classList.add("active");
        sidebar.classList.remove("open");
        document.getElementById("mobileMenuButton").setAttribute("aria-expanded", "false");
        showPanel(item.dataset.section);
    });
});

document.querySelectorAll("[data-open-section]").forEach((button) => {
    button.addEventListener("click", () => document.querySelector(`[data-section="${button.dataset.openSection}"]`)?.click());
});

document.getElementById("logoutButton").addEventListener("click", () => {
    window.location.assign("employee-login.html");
});

setProfile();
setAttendanceState();
setUpcomingShift();
updateDateTime();
window.setInterval(updateDateTime, 1000);
