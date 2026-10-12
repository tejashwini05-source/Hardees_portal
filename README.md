# Hardee's Restaurant Portal

This independent Hardee's-inspired demo keeps the restaurant homepage and employee workspace and includes optional Express/MongoDB backend code. The redesigned frontend uses fictional sample data and works without MongoDB configuration.

## Preview the UI

Requires Node.js 18.18 or newer and npm. No `.env`, MongoDB URI, or database is needed to preview the pages.

```powershell
npm install
npm run dev:frontend
```

Open `http://127.0.0.1:5173`. The frontend preview runs independently and does not need MongoDB or `MONGODB_URI`. The login/signup forms and dashboard actions are local previews only: credentials and profile details are not sent or stored, and sample attendance/schedule changes reset when the page reloads. The preview notice is not a claim of real HR, attendance, or payroll functionality.

## Optional backend setup

To connect the API later, use Node.js 18.18 or newer and a MongoDB Community Server or Atlas deployment. Create a local environment file when ready:

```powershell
Copy-Item .env.example .env
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and a private `REGISTRATION_CODE`. The supplied Mongo URI is for a local MongoDB instance; for Atlas, use the connection string from your Atlas deployment and allow your development IP in its network access settings.

Start the backend server with:

```powershell
npm run dev:backend
```

The server can serve the preview pages while MongoDB is unavailable; authenticated API operations return `503` until a database connection succeeds. The health endpoint reports `database: "connected"` only after Mongoose establishes a connection: `http://127.0.0.1:3000/api/health`.

For production, configure environment variables in the hosting environment, use HTTPS, set `NODE_ENV=production`, and use a MongoDB account with only the permissions the application needs. The session cookie is HttpOnly, SameSite Strict, and Secure in production.

## Create the first administrator

Set temporary `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` values in `.env` (password length 12-72 characters), then run:

```powershell
npm run create-admin
```

Remove those three bootstrap variables from `.env` after the account is created. Sign in at `/admin-login.html`. The command hashes the password before storing the account.

Administrators can add employee accounts from the admin dashboard. Self-registration at `/signup.html` is disabled unless `REGISTRATION_CODE` is set; share that code only with authorized employees. Registration accepts employee accounts only, never administrator roles.

## Run and validate

- `npm run dev:frontend` starts the Vite frontend preview at `http://127.0.0.1:5173`.
- `npm run dev:backend` starts the Express backend with automatic restart at port `3000` (`npm run dev` remains a backend alias).
- `npm start` starts the production server.
- `npm test` checks the existing site assets and the required application files and frontend/API wiring.

## API overview

Authentication uses signed JWTs in an HttpOnly cookie. Passwords are hashed with bcrypt. Authenticated employee and admin permissions are loaded from the database on each request.

- `POST /api/auth/register` - register an employee (requires the configured registration code)
- `POST /api/auth/employee-login` - employee ID and password
- `POST /api/auth/admin-login` - admin email and password
- `POST /api/auth/logout` - clear the session cookie
- `GET /api/auth/me` - current authenticated profile
- `GET /api/employee/attendance` - attendance history
- `POST /api/employee/attendance/clock-in` and `/clock-out` - record attendance
- `GET /api/employee/schedule` - upcoming shifts
- `GET /api/employee/performance` - performance reviews
- `GET /api/admin/employees` - list employees
- `POST /api/admin/employees` - create an employee
- `PATCH /api/admin/employees/:id` - update supported employee fields
- `DELETE /api/admin/employees/:id` - deactivate an employee
- `POST /api/admin/employees/:id/shifts` - assign a shift
- `POST /api/admin/employees/:id/performance` - create a performance review
- `GET /api/health` - application and database connection status

Requests use JSON. Invalid or unknown employee-management fields are not applied, and API errors do not return stack traces. The old demo payroll/tax placeholders are not connected to a payroll provider and are not represented as real payroll data.
