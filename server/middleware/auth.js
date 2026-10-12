const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
    const secret = process.env.JWT_SECRET;
    const token = req.cookies && req.cookies.portal_token;
    if (!secret || !token) {
        return res.status(401).json({ error: "Authentication required." });
    }

    try {
        const payload = jwt.verify(token, secret);
        const user = await User.findById(payload.sub).select("name email employeeId role jobTitle location active");
        if (!user || !user.active) {
            return res.status(401).json({ error: "Authentication required." });
        }
        req.user = user;
        return next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Authentication required." });
        }
        return next(error);
    }
}

module.exports = requireAuth;