

const members = require("../models/members");
const Queue = require('bull');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a queue for handling email sending
const emailQueue = new Queue('emailQueue');

// Email transporter configuration
let transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email sending logic as a separate worker
emailQueue.process(async (job) => {
  const { mailOptions } = job.data;
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email Error:", error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { username, name, phone, password, role } = req.body;

        // Validate required fields
        if (!username || !name || !phone || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if username or phone already exists
        const existingUser = await members.findOne({
            $or: [{ username }, { phone }],
        });
        if (existingUser) {
            return res.status(400).json({ error: "Username or phone number already in use" });
        }

        // Create and save the new user
        const user = new members({ username, name, phone, password, role });
        await user.save();

        // Send emails to absent users (background job)
        const verificationLink = `${process.env.DOMAIN}/verify?username=${username}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'saisriram9848@gmail.com',
            subject: 'Verify Your Login',
            text: `Dear ${username},\n\nTo verify your login, please click the link below:\n\n${verificationLink}\n\nIf you did not initiate this request, please ignore this email or contact support.\n\nBest regards,\nThe Team`,
        };
        emailQueue.add({ mailOptions });
        res.status(201).json({ message: "User registered successfully. Please check your email to verify your login." });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Login a user
exports.loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body; // `identifier` is username or phone

        // Validate required fields
        if (!identifier || !password) {
            return res.status(400).json({ error: "Identifier and password are required" });
        }

        // Find user by username or phone
        const user = await members.findOne({
            $or: [{ username: identifier }, { phone: identifier }],
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the password is correct
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate a JWT token
        const token = user._id;
        console.log(token)
        if (user.isvaid === 1) {
            return res.status(200).json({ message: "Login successful", token,user:user.role });
        }
        return res.status(400).json({ message: "verify" });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get a user by ID
exports.getUser = async (req, res) => {
    try {
        const user = await members.find();
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await members.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
