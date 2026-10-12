const express = require("express");
const { body } = require("express-validator");
const Attendance = require("../models/Attendance");
const Performance = require("../models/Performance");
const Shift = require("../models/Shift");
const asyncHandler = require("../middleware/asyncHandler");
const requireAuth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const validate = require("../middleware/validation");

const router = express.Router();
router.use(requireAuth, allowRoles("employee"));

router.get("/attendance", asyncHandler(async (req, res) => {
    const entries = await Attendance.find({ employee: req.user.id }).sort({ clockIn: -1 }).limit(100).lean();
    return res.json({ attendance: entries });
}));

router.post("/attendance/clock-in", asyncHandler(async (req, res) => {
    const openEntry = await Attendance.findOne({ employee: req.user.id, clockOut: null });
    if (openEntry) {
        return res.status(409).json({ error: "You are already clocked in." });
    }
    const attendance = await Attendance.create({ employee: req.user.id });
    return res.status(201).json({ attendance });
}));

router.post("/attendance/clock-out", asyncHandler(async (req, res) => {
    const attendance = await Attendance.findOneAndUpdate(
        { employee: req.user.id, clockOut: null },
        { clockOut: new Date() },
        { new: true, sort: { clockIn: -1 }, runValidators: true },
    );
    if (!attendance) {
        return res.status(409).json({ error: "You are not currently clocked in." });
    }
    return res.json({ attendance });
}));

router.get("/schedule", asyncHandler(async (req, res) => {
    const shifts = await Shift.find({ employee: req.user.id, endAt: { $gte: new Date() } })
        .sort({ startAt: 1 }).limit(100).lean();
    return res.json({ shifts });
}));

router.get("/performance", asyncHandler(async (req, res) => {
    const reviews = await Performance.find({ employee: req.user.id }).sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ performance: reviews });
}));

router.post("/profile", (req, res) => res.status(405).json({ error: "Profile changes are not available here." }));

module.exports = router;