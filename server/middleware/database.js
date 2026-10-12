const mongoose = require("mongoose");

function requireDatabase(req, res, next) {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: "The database is unavailable. Please try again shortly." });
    }
    return next();
}

module.exports = requireDatabase;