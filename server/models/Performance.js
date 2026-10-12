const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    period: { type: String, required: true, trim: true, maxlength: 80 },
    score: { type: Number, required: true, min: 0, max: 100 },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Performance", performanceSchema);