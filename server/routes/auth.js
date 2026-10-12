const express = require("express");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const requireAuth = require("../middleware/auth");
const requireDatabase = require("../middleware/database");
const validate = require("../middleware/validation");

const router = express.Router();
const authLimiter = require("express-rate-limit").rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Please try again later." },
});

const cleanText = (value) => value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
const requireAuthConfig = (req, res, next) => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        return res.status(503).json({ error: "Authentication is not configured." });
    }
    return next();
};
const passwordRule = body("password").isString().withMessage("Password is required.")
    .bail().isLength({ min: 12, max: 72 }).withMessage("Password must be 12 to 72 characters.")
    .bail().custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must not exceed 72 UTF-8 bytes.");
const emailRule = body("email").isString().withMessage("A valid email is required.")
    .bail().isEmail().withMessage("A valid email is required.").normalizeEmail();

function issueSession(res, user) {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        const error = new Error("Authentication is not configured. Set JWT_SECRET to at least 32 characters.");
        error.status = 503;
        throw error;
    }

    const token = jwt.sign({ sub: user.id }, secret, { expiresIn: "8h" });
    res.cookie("portal_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 8 * 60 * 60 * 1000,
        path: "/",
    });
}

function userProfile(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        jobTitle: user.jobTitle,
        location: user.location,
    };
}

router.post("/register", authLimiter, requireAuthConfig, requireDatabase,
    body("name").isString().withMessage("Name is required.").bail().customSanitizer(cleanText).isLength({ min: 2, max: 100 }),
    emailRule,
    body("employeeId").isString().withMessage("Employee ID is required.").bail().trim().toUpperCase().matches(/^[A-Z0-9-]{3,30}$/),
    body("registrationCode").isString().withMessage("Registration code is required.").bail().custom((value) => {
        const expected = process.env.REGISTRATION_CODE || "";
        const submitted = cleanText(value);
        const submittedBytes = Buffer.from(submitted);
        const expectedBytes = Buffer.from(expected);
        return expectedBytes.length > 0 && submittedBytes.length === expectedBytes.length && crypto.timingSafeEqual(submittedBytes, expectedBytes);
    }).withMessage("Registration is disabled or the registration code is invalid."),
    passwordRule,
    validate,
    asyncHandler(async (req, res) => {
        const user = await User.create({
            name: cleanText(req.body.name),
            email: req.body.email,
            employeeId: req.body.employeeId.trim().toUpperCase(),
            password: req.body.password,
            role: "employee",
        });
        issueSession(res, user);
        return res.status(201).json({ user: userProfile(user) });
    }));

for (const role of ["employee", "admin"]) {
    router.post(`/${role}-login`, authLimiter, requireAuthConfig, requireDatabase,
        body("identifier").optional().isString().withMessage("Enter your sign-in ID or email.").bail().customSanitizer(cleanText),
        body("employeeId").optional().isString().withMessage("Employee ID must be text.").bail().trim().toUpperCase(),
        body("email").optional().isString().withMessage("Email must be text.").bail().isEmail().normalizeEmail(),
        passwordRule,
        validate,
        asyncHandler(async (req, res) => {
            const identifier = (req.body.identifier || req.body.employeeId || req.body.email || "").trim();
            if (!identifier || identifier.length > 254) {
                return res.status(400).json({ error: "Enter your sign-in ID and password." });
            }

            const selector = role === "employee"
                ? { employeeId: identifier.toUpperCase(), role: "employee" }
                : { email: identifier.toLowerCase(), role: "admin" };
            const user = await User.findOne(selector).select("+password");
            if (!user || !user.active || !(await user.comparePassword(req.body.password))) {
                return res.status(401).json({ error: "Invalid sign-in credentials." });
            }

            issueSession(res, user);
            return res.json({ user: userProfile(user) });
        }));
}

router.post("/logout", (req, res) => {
    res.clearCookie("portal_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });
    return res.status(204).end();
});

router.get("/me", requireDatabase, requireAuth, (req, res) => res.json({ user: userProfile(req.user) }));

module.exports = router;