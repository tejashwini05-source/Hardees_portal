const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true,
        required() { return this.role === "employee"; },
    },
    password: { type: String, required: true, minlength: 12, select: false },
    role: { type: String, enum: ["employee", "admin"], default: "employee", immutable: true },
    jobTitle: { type: String, trim: true, maxlength: 80, default: "Crew Member" },
    location: { type: String, trim: true, maxlength: 120, default: "Rockingham, NC" },
    active: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: {
        transform(document, result) {
            delete result.password;
            delete result.__v;
            return result;
        },
    },
});

userSchema.pre("save", async function hashPassword() {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);