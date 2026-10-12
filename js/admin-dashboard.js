const employees = [
    { name: "Jordan Miller", id: "DEMO-1042", role: "Crew Member", shift: "6:00 AM – 2:00 PM", status: "On shift", score: 94 },
    { name: "Maya Collins", id: "DEMO-1088", role: "Shift Lead", shift: "6:00 AM – 2:00 PM", status: "On shift", score: 97 },
    { name: "Nia Brooks", id: "DEMO-1124", role: "Crew Member", shift: "10:00 AM – 6:00 PM", status: "On shift", score: 91 },
    { name: "Ethan Parker", id: "DEMO-1172", role: "Manager", shift: "7:00 AM – 4:00 PM", status: "On shift", score: 96 },
    { name: "Avery James", id: "DEMO-1216", role: "Crew Member", shift: "12:00 PM – 8:00 PM", status: "Upcoming", score: 89 },
    { name: "Sofia Bennett", id: "DEMO-1263", role: "Shift Lead", shift: "2:00 PM – 10:00 PM", status: "Upcoming", score: 95 },
    { name: "Noah Hayes", id: "DEMO-1301", role: "Crew Member", shift: "Day off", status: "Off today", score: 87 },
    { name: "Riley Carter", id: "DEMO-1329", role: "Crew Member", shift: "6:00 AM – 2:00 PM", status: "On shift", score: 93 },
];

const attendance = [
    { employee: "Maya Collins", clockIn: "5:54 AM", clockOut: "—", hours: "4.1", status: "On shift" },
    { employee: "Jordan Miller", clockIn: "6:02 AM", clockOut: "—", hours: "4.0", status: "On shift" },
    { employee: "Ethan Parker", clockIn: "6:48 AM", clockOut: "—", hours: "3.2", status: "On shift" },
    { employee: "Riley Carter", clockIn: "6:12 AM", clockOut: "—", hours: "3.8", status: "On shift" },
    { employee: "Nia Brooks", clockIn: "9:56 AM", clockOut: "—", hours: "0.4", status: "On shift" },
];

const performance = [
    { employee: "Maya Collins", role: "Shift Lead", score: 97, focus: "Guest experience" },
    { employee: "Jordan Miller", role: "Crew Member", score: 94, focus: "Teamwork" },
    { employee: "Riley Carter", role: "Crew Member", score: 93, focus: "Order accuracy" },
    { employee: "Nia Brooks", role: "Crew Member", score: 91, focus: "Station readiness" },
];

const schedule = [
    { employee: "Maya Collins", offset: 1, type: "Opening shift", hours: "8.0" },
    { employee: "Jordan Miller", offset: 1, type: "Midday shift", hours: "8.0" },
    { employee: "Avery James", offset: 2, type: "Closing shift", hours: "8.0" },
];

const employeeRows = document.getElementById("employeeRows");
const searchInput = document.getElementById("employeeSearch");
const roleFilter = document.getElementById("roleFilter");
const scheduleRows = document.getElementById("scheduleRows");
const scheduleMessage = document.getElementById("scheduleMessage");

function addCell(row, value, className = "") {
    const cell = document.createElement("td");
    cell.textContent = value;
    if (className) cell.className = className;
    row.append(cell);
}

function renderEmployees() {
    const search = searchInput.value.trim().toLowerCase();
    const role = roleFilter.value;
    const visible = employees.filter((employee) => {
        const matchesText = `${employee.name} ${employee.id}`.toLowerCase().includes(search);
        return matchesText && (role === "all" || employee.role === role);
    });

    employeeRows.replaceChildren();
    visible.forEach((employee) => {
        const row = document.createElement("tr");
        const personCell = document.createElement("td");
        personCell.className = "person-cell";
        const initials = employee.name.split(" ").map((part) => part[0]).join("");
        const avatar = document.createElement("span");
        avatar.className = "table-avatar";
        avatar.textContent = initials;
        const identity = document.createElement("span");
        identity.className = "table-identity";
        const name = document.createElement("strong");
        name.textContent = employee.name;
        const caption = document.createElement("small");
        caption.textContent = "Rockingham location";
        identity.append(name, caption);
        personCell.append(avatar, identity);
        row.append(personCell);
        addCell(row, employee.id);
        addCell(row, employee.role);
        addCell(row, employee.shift);
        addCell(row, employee.status, `status-text status-${employee.status.toLowerCase().replaceAll(" ", "-")}`);
        addCell(row, String(employee.score));
        employeeRows.append(row);
    });

    document.getElementById("teamCount").textContent = String(employees.length);
    document.getElementById("employeeResultCount").textContent = `${visible.length} shown · ${employees.length} demo profiles`;
    document.getElementById("employeeEmpty").hidden = visible.length > 0;
}

function renderAttendance() {
    const body = document.getElementById("attendanceRows");
    body.replaceChildren();
    attendance.forEach((item) => {
        const row = document.createElement("tr");
        addCell(row, item.employee);
        addCell(row, item.clockIn);
        addCell(row, item.clockOut);
        addCell(row, item.hours);
        addCell(row, item.status, "status-text status-on-shift");
        body.append(row);
    });
}

function renderPerformance() {
    const list = document.getElementById("performanceList");
    list.replaceChildren();
    performance.forEach((item) => {
        const card = document.createElement("article");
        card.className = "performance-card";
        const top = document.createElement("div");
        top.className = "performance-card-top";
        const avatar = document.createElement("span");
        avatar.className = "performance-avatar";
        avatar.textContent = item.employee.split(" ").map((part) => part[0]).join("");
        const identity = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = item.employee;
        const role = document.createElement("small");
        role.textContent = item.role;
        identity.append(name, role);
        const score = document.createElement("b");
        score.textContent = String(item.score);
        top.append(avatar, identity, score);
        const bar = document.createElement("div");
        bar.className = "score-track";
        const fill = document.createElement("span");
        fill.style.width = `${item.score}%`;
        bar.append(fill);
        const focus = document.createElement("p");
        focus.textContent = `Strength · ${item.focus}`;
        card.append(top, bar, focus);
        list.append(card);
    });
}

function displayDate(offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function renderSchedule() {
    scheduleRows.replaceChildren();
    schedule.forEach((item) => {
        const row = document.createElement("tr");
        addCell(row, item.employee);
        addCell(row, item.date ? new Date(`${item.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : displayDate(item.offset));
        addCell(row, item.type);
        addCell(row, item.hours);
        addCell(row, "Preview", "preview-state");
        scheduleRows.append(row);
    });
    document.getElementById("shiftCount").textContent = `${schedule.length} preview shifts`;
}

function showToast(message) {
    const toast = document.getElementById("adminToast");
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3200);
}

searchInput.addEventListener("input", renderEmployees);
roleFilter.addEventListener("change", renderEmployees);

document.getElementById("scheduleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const start = document.getElementById("shiftStart").value;
    const end = document.getElementById("shiftEnd").value;
    if (end <= start) {
        scheduleMessage.textContent = "Choose an end time later than the start time.";
        scheduleMessage.className = "form-feedback error";
        return;
    }
    const employeeIndex = Number(document.getElementById("scheduleEmployee").value);
    const employee = employees[employeeIndex];
    schedule.unshift({
        employee: employee.name,
        date: document.getElementById("scheduleDate").value,
        type: document.getElementById("shiftType").value,
        hours: ((new Date(`1970-01-01T${end}`) - new Date(`1970-01-01T${start}`)) / 3600000).toFixed(1),
    });
    renderSchedule();
    scheduleMessage.textContent = "Preview added on this page only. No schedule was saved.";
    scheduleMessage.className = "form-feedback success";
    showToast("Demo only · shift preview added, not saved");
});

document.querySelectorAll(".admin-nav a[data-section]").forEach((link) => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".admin-nav a").forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
        document.getElementById("adminSidebar").classList.remove("is-open");
        document.getElementById("adminMenuToggle").setAttribute("aria-expanded", "false");
    });
});

document.getElementById("adminMenuToggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const open = document.getElementById("adminSidebar").classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
});

const scheduleEmployee = document.getElementById("scheduleEmployee");
employees.forEach((employee, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${employee.name} · ${employee.role}`;
    scheduleEmployee.append(option);
});
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
document.getElementById("scheduleDate").value = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
document.getElementById("scheduleDate").min = new Date().toLocaleDateString("en-CA");
document.getElementById("adminToday").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase();

renderEmployees();
renderAttendance();
renderPerformance();
renderSchedule();
