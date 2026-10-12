const path = require("node:path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const connectDB = require("./config/db");
const requireDatabase = require("./middleware/database");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const adminRoutes = require("./routes/admin");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const root = path.resolve(__dirname, "..");
const blockedStaticPrefixes = ["/.git", "/node_modules", "/server", "/tests"];

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "10kb", type: "application/json" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
    const mongoose = require("mongoose");
    const connected = mongoose.connection.readyState === 1;
    return res.status(connected ? 200 : 503).json({ status: connected ? "ok" : "unavailable", database: connected ? "connected" : "disconnected" });
});

app.use("/api/auth", authRoutes);
app.use("/api", requireDatabase);
app.use("/api/employee", employeeRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res, next) => {
    const requestPath = decodeURIComponent(req.path).toLowerCase();
    if (blockedStaticPrefixes.some((prefix) => requestPath.startsWith(prefix)) || /^\/(\.env|package(-lock)?\.json|readme)/i.test(requestPath)) {
        return res.sendStatus(404);
    }
    return next();
});

app.use(express.static(root, { dotfiles: "deny", index: false }));
app.get("/", (req, res) => res.sendFile(path.join(root, "index.html")));
app.use("/api", (req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.use((req, res) => res.status(404).send("Not found."));

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    if (error.code === 11000) {
        return res.status(409).json({ error: "An account already uses that email or employee ID." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ error: "Submitted data is invalid." });
    }
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) {
        console.error("Request failed.", error.message);
    }
    return res.status(status).json({ error: status >= 500 ? "An unexpected server error occurred." : error.message });
});

function startServer() {
    const port = Number(process.env.PORT) || 3000;
    const server = app.listen(port, () => console.log(`Hardee's portal listening on port ${port}.`));

    connectDB().catch(() => {
        console.error("MongoDB connection failed. Check MONGODB_URI and confirm the database is available.");
    });

    const shutdown = () => {
        server.close(() => {
            require("mongoose").disconnect().finally(() => process.exit(0));
        });
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
    return server;
}

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };