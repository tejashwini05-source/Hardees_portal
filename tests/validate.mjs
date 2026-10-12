import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "index.html",
  "signup.html",
  "employee-login.html",
  "admin-login.html",
  "employee-dashboard.html",
  "admin-dashboard.html",
  "css/style.css",
  "css/auth.css",
  "css/employee-dashboard.css",
  "css/admin-dashboard.css",
  "js/app.js",
  "js/signup.js",
  "js/employee-login.js",
  "js/admin-login.js",
  "js/dashboard.js",
  "js/admin-dashboard.js",
  "server/server.js",
  "server/config/db.js",
  "server/models/User.js",
  "server/models/Attendance.js",
  "server/models/Performance.js",
  "server/models/Shift.js",
  "server/middleware/auth.js",
  "server/middleware/roles.js",
  "server/routes/auth.js",
  "server/routes/employee.js",
  "server/routes/admin.js",
  ".env.example",
  ".gitignore",
  "README.md",
  "assets/hardees_logo.png",
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  throw new Error(`Missing required files: ${missing.join(", ")}`);
}

const index = readFileSync(resolve(root, "index.html"), "utf8");
const dashboard = readFileSync(resolve(root, "employee-dashboard.html"), "utf8");
const dashboardCss = readFileSync(resolve(root, "css/employee-dashboard.css"), "utf8");
const dashboardJs = readFileSync(resolve(root, "js/dashboard.js"), "utf8");
const appJs = readFileSync(resolve(root, "js/app.js"), "utf8");
const server = readFileSync(resolve(root, "server/server.js"), "utf8");
const authRoutes = readFileSync(resolve(root, "server/routes/auth.js"), "utf8");
const employeeRoutes = readFileSync(resolve(root, "server/routes/employee.js"), "utf8");
const adminRoutes = readFileSync(resolve(root, "server/routes/admin.js"), "utf8");
const authMiddleware = readFileSync(resolve(root, "server/middleware/auth.js"), "utf8");
const userModel = readFileSync(resolve(root, "server/models/User.js"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const signup = readFileSync(resolve(root, "signup.html"), "utf8");
const signupJs = readFileSync(resolve(root, "js/signup.js"), "utf8");
const employeeLogin = readFileSync(resolve(root, "employee-login.html"), "utf8");
const employeeLoginJs = readFileSync(resolve(root, "js/employee-login.js"), "utf8");
const adminLogin = readFileSync(resolve(root, "admin-login.html"), "utf8");
const adminLoginJs = readFileSync(resolve(root, "js/admin-login.js"), "utf8");
const adminDashboard = readFileSync(resolve(root, "admin-dashboard.html"), "utf8");
const adminDashboardJs = readFileSync(resolve(root, "js/admin-dashboard.js"), "utf8");
const htmlPages = ["index.html", "signup.html", "employee-login.html", "admin-login.html", "employee-dashboard.html", "admin-dashboard.html"]
  .map((file) => [file, readFileSync(resolve(root, file), "utf8")]);
const logoPagesUseUploadedAsset = htmlPages.every(([, html]) =>
  /<img\b(?=[^>]*\bsrc=["']assets\/hardees_logo\.png["'])(?=[^>]*\balt=["']Hardee's logo["'])[^>]*>/i.test(html),
);
const brokenLocalImages = htmlPages.flatMap(([file, html]) =>
  [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map(([, src]) => [file, src])
    .filter(([, src]) => !/^(?:https?:|data:|\/\/)/i.test(src) && !existsSync(resolve(root, decodeURIComponent(src)))),
);

const checks = [
  [index.includes('js/app.js') && appJs.includes("Demo preview only") && appJs.includes("previewDashboard") && !appJs.includes('/api/auth/employee-login'), "landing login remains a non-sending demo preview"],
  [!index.includes('Demo@123') && !index.includes('DEMO1001'), "no demo password or employee ID is exposed on the public page"],
  [dashboard.includes("welcomeHeading") && dashboardJs.includes('name: "Jordan Miller"') && dashboardJs.includes("DEMO-1042"), "dashboard uses clearly identified fictional sample profile data"],
  [dashboard.includes('data-profile="employeeId"') && dashboard.includes('data-profile="name"') && dashboard.includes('data-profile="location"'), "employee profile fields are data-driven"],
  [dashboard.includes("Check In / Check Out") && dashboard.includes("My Schedule") && dashboard.includes("My Hours") && dashboard.includes("Performance") && dashboard.includes("Pay Statements") && dashboard.includes("Profile") && dashboard.includes("Exit preview"), "sidebar navigation is complete"],
  [dashboard.includes("Checked Out") && dashboard.includes("CHECK IN"), "initial status and check-in control are present"],
  [dashboard.includes("Today's worked hours") && dashboard.includes("This week's hours") && dashboard.includes("Performance score") && dashboard.includes("Attendance rate") && dashboard.includes("Today's attendance") && dashboard.includes("Upcoming shift"), "dashboard metrics cover attendance, hours, performance and shifts"],
  [!dashboard.includes("DEMO EMPLOYEE SYSTEM") && !dashboard.toLowerCase().includes("simulated demonstration"), "employee dashboard no longer reports a simulated session"],
  [dashboardCss.includes("@media") && dashboardCss.includes("grid-template-columns"), "responsive dashboard CSS is present"],
  [dashboardJs.includes("checkInButton") && dashboardJs.includes("not saved") && dashboardJs.includes("window.location.assign(\"employee-login.html\")") && !dashboardJs.includes("fetch(") && !dashboardJs.includes("localStorage"), "dashboard controls are local-only and do not persist attendance"],
  [logoPagesUseUploadedAsset, "all six pages use the uploaded logo PNG with descriptive alternative text"],
  [index.includes('<a href="index.html" class="logo-link">'), "landing-page logo links to index.html"],
  [brokenLocalImages.length === 0, `all local HTML image paths resolve${brokenLocalImages.length ? `: ${brokenLocalImages.map(([file, src]) => `${file} -> ${src}`).join(", ")}` : ""}`],
  [server.includes("connectDB()") && server.includes('connected ? "connected" : "disconnected"') && server.includes("503"), "database health reflects successful connection state"],
  [authRoutes.includes('"/register"') && authRoutes.includes('`/${role}-login`') && authRoutes.includes('"/logout"') && authRoutes.includes('"/me"'), "authentication REST routes are present"],
  [employeeRoutes.includes('"/attendance"') && employeeRoutes.includes('"/schedule"') && employeeRoutes.includes('"/performance"') && adminRoutes.includes('"/employees"'), "employee and admin REST routes are present"],
  [userModel.includes('bcrypt.hash') && userModel.includes('select: false') && authRoutes.includes("httpOnly: true") && authMiddleware.includes("jwt.verify"), "passwords are hashed and sessions use verified HttpOnly cookies"],
  [packageJson.scripts.dev.includes("nodemon") && packageJson.scripts.start.includes("node") && packageJson.dependencies.mongoose, "development and production scripts and MongoDB dependencies are configured"],
  [index.includes("navigationToggle") && index.includes("signup.html") && index.includes("admin-login.html") && index.toLowerCase().includes("not an official hr"), "landing navigation and demo disclosures are present"],
  [signup.includes('name="phone"') && signup.includes('name="email"') && signup.includes('name="password"') && signup.includes("Employee account") && !signup.includes("Admin account"), "signup includes required employee fields without public admin selection"],
  [signupJs.includes("not sent") && !signupJs.includes("fetch("), "signup preview validates without transmitting or storing form data"],
  [employeeLoginJs.includes("not checked or sent") && adminLoginJs.includes("not verified or sent") && !employeeLoginJs.includes("fetch(") && !adminLoginJs.includes("fetch("), "employee and admin sign-in forms are explicitly demo-only"],
  [employeeLogin.includes("employeePreviewLink") && adminLogin.includes("adminPreviewLink") && adminDashboard.includes("DEMO PREVIEW"), "login pages open visibly labeled dashboard previews"],
  [adminDashboard.includes("employeeSearch") && adminDashboard.includes("attendanceRows") && adminDashboard.includes("performanceList") && adminDashboard.includes("scheduleForm"), "admin preview includes employee, attendance, performance, and schedule views"],
  [adminDashboardJs.includes("const employees = [") && adminDashboardJs.includes("No schedule was saved") && !adminDashboardJs.includes("fetch(") && !adminDashboardJs.includes("localStorage"), "admin search and shift planning use fictional non-persistent sample data"],
];

const failed = checks.filter(([passed]) => !passed);
if (failed.length) {
  throw new Error(`Validation failed: ${failed.map(([, message]) => message).join("; ")}`);
}

console.log(`Validated ${checks.length} application requirements and ${requiredFiles.length} required files.`);
