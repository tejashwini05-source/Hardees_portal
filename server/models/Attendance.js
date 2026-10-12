const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clockIn: { type: Date, required: true, default: Date.now },
    clockOut: { type: Date, default: null },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, clockIn: -1 });
attendanceSchema.index({ employee: 1 }, {
    unique: true,
    partialFilterExpression: { clockOut: null },
});

module.exports = mongoose.model("Attendance", attendanceSchema);