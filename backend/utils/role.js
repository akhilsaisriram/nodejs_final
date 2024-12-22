const members = require("../models/members");

// Middleware to check user role
const checkRole = (roles) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const token = authHeader.split(' ')[1];
    const user = await members.findById(token); // Assuming req.user contains the user ID

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = checkRole;
