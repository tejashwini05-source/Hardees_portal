const express = require("express");
const { body, param, query } = require("express-validator");
const User = require("../models/User");
const Performance = require("../models/Performance");
const Shift = require("../models/Shift");
const asyncHandler = require("../middleware/asyncHandler");
const requireAuth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const validate = require("../middleware/validation");

const router = express.Router();
const cleanText = (value) => value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
const idParam = param("id").isMongoId().withMessage("Employee ID is invalid.");
const email = body("email").isString().bail().isEmail().withMessage("A valid email is required.").normalizeEmail();
const password = body("password").isString().bail().isLength({ min: 12, max: 72 }).withMessage("Password must be 12 to 72 characters.")
    .bail().custom((value) => Buffer.byteLength(value, "utf8") <= 72).withMessage("Password must not exceed 72 UTF-8 bytes.");

router.use(requireAuth, allowRoles("admin"));

router.get("/employees",
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    validate,
    asyncHandler(async (req, res) => {
        const employees = await User.find({ role: "employee" })
            .select("name email employeeId jobTitle location active createdAt")
            .sort({ name: 1 }).limit(Number(req.query.limit) || 100).lean();
        return res.json({ employees });
    }));

router.post("/employees",
    body("name").isString().bail().customSanitizer(cleanText).isLength({ min: 2, max: 100 }).withMessage("Name must be 2 to 100 characters."),
    email,
    body("employeeId").isString().bail().trim().toUpperCase().matches(/^[A-Z0-9-]{3,30}$/).withMessage("Employee ID format is invalid."),
    password,
    body("jobTitle").optional().isString().bail().customSanitizer(cleanText).isLength({ max: 80 }),
    body("location").optional().isString().bail().customSanitizer(cleanText).isLength({ max: 120 }),
    validate,
    asyncHandler(async (req, res) => {
        const employee = await User.create({
            name: req.body.name,
            email: req.body.email,
            employeeId: req.body.employeeId,
            password: req.body.password,
            role: "employee",
            jobTitle: req.body.jobTitle || "Crew Member",
            location: req.body.location || "Rockingham, NC",
        });
        return res.status(201).json({ employee: employee.toJSON() });
    }));

router.patch("/employees/:id",
    idParam,
    body("name").optional().isString().bail().customSanitizer(cleanText).isLength({ min: 2, max: 100 }),
    body("email").optional().isString().bail().isEmail().normalizeEmail(),
    body("employeeId").optional().isString().bail().trim().toUpperCase().matches(/^[A-Z0-9-]{3,30}$/),
    body("jobTitle").optional().isString().bail().customSanitizer(cleanText).isLength({ max: 80 }),
    body("location").optional().isString().bail().customSanitizer(cleanText).isLength({ max: 120 }),
    body("active").optional().isBoolean().toBoolean(),
    validate,
    asyncHandler(async (req, res) => {
        const allowed = ["name", "email", "employeeId", "jobTitle", "location", "active"];
        const changes = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
        if (!Object.keys(changes).length) {
            return res.status(400).json({ error: "Provide at least one supported employee field." });
        }
        const employee = await User.findOneAndUpdate(
            { _id: req.params.id, role: "employee" }, changes, { new: true, runValidators: true },
        ).select("name email employeeId role jobTitle location active");
        if (!employee) {
            return res.status(404).json({ error: "Employee not found." });
        }
        return res.json({ employee });
    }));

router.delete("/employees/:id", idParam, validate, asyncHandler(async (req, res) => {
    const employee = await User.findOneAndUpdate(
        { _id: req.params.id, role: "employee" }, { active: false }, { new: true },
    ).select("name email employeeId role jobTitle location active");
    if (!employee) {
        return res.status(404).json({ error: "Employee not found." });
    }
    return res.json({ employee });
}));

router.post("/employees/:id/shifts",
    idParam,
    body("startAt").isISO8601().toDate().withMessage("A valid shift start time is required."),
    body("endAt").isISO8601().toDate().withMessage("A valid shift end time is required."),
    body("location").optional().isString().bail().customSanitizer(cleanText).isLength({ max: 120 }),
    body("role").optional().isString().bail().customSanitizer(cleanText).isLength({ max: 80 }),
    validate,
    asyncHandler(async (req, res) => {
        if (req.body.endAt <= req.body.startAt) {
            return res.status(400).json({ error: "Shift end time must be after start time." });
        }
        const employee = await User.findOne({ _id: req.params.id, role: "employee", active: true });
        if (!employee) {
            return res.status(404).json({ error: "Active employee not found." });
        }
        const shift = await Shift.create({
            employee: employee.id,
            startAt: req.body.startAt,
            endAt: req.body.endAt,
            location: req.body.location || employee.location,
            role: req.body.role || employee.jobTitle,
        });
        return res.status(201).json({ shift });
    }));

router.post("/employees/:id/performance",
    idParam,
    body("period").isString().bail().customSanitizer(cleanText).isLength({ min: 1, max: 80 }),
    body("score").isFloat({ min: 0, max: 100 }).toFloat(),
    body("notes").optional().isString().bail().customSanitizer(cleanText).isLength({ max: 1000 }),
    validate,
    asyncHandler(async (req, res) => {
        const employee = await User.findOne({ _id: req.params.id, role: "employee" });
        if (!employee) {
            return res.status(404).json({ error: "Employee not found." });
        }
        const performance = await Performance.create({
            employee: employee.id,
            period: req.body.period,
            score: req.body.score,
            notes: req.body.notes || "",
        });
        return res.status(201).json({ performance });
    }));

module.exports = router;