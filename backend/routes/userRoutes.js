const express = require("express");
const { registerUser, loginUser,getUser ,deleteUser} = require("../controllers/userController");

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

router.get("/", getUser);

// Delete a user by ID
router.delete("/:id", deleteUser);
module.exports = router;
