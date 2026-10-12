const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    location: { type: String, trim: true, maxlength: 120, default: "Rockingham, NC" },
    role: { type: String, trim: true, maxlength: 80, default: "Crew Member" },
}, { timestamps: true });

shiftSchema.index({ employee: 1, startAt: 1 });

module.exports = mongoose.model("Shift", shiftSchema);