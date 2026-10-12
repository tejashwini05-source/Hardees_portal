require("dotenv").config({ path: require("node:path").resolve(__dirname, "../../.env") });

const connectDB = require("../config/db");
const User = require("../models/User");

async function createAdmin() {
    const { ADMIN_NAME: name, ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
    if (!name || !email || !password || password.length < 12 || password.length > 72 || Buffer.byteLength(password, "utf8") > 72) {
        throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and a 12-72 character ADMIN_PASSWORD in .env before running this command.");
    }

    await connectDB();
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
        throw new Error("An account already uses ADMIN_EMAIL.");
    }

    await User.create({ name: name.trim(), email: normalizedEmail, password, role: "admin" });
    console.log("Administrator account created.");
}

createAdmin()
    .catch((error) => {
        console.error(error.message || "Administrator creation failed.");
        process.exitCode = 1;
    })
    .finally(async () => {
        await require("mongoose").disconnect();
    });