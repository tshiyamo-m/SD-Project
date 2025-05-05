// middleware/authMiddleware.js
const { users } = require("../stubData/db");

const authMiddleware = (req, res, next) => {
    const userId = req.header("x-user-id");
    if (!userId) return res.status(401).json({ error: "Missing x-user-id header" });

    const user = users.find(u => u._id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
};

module.exports = authMiddleware;
