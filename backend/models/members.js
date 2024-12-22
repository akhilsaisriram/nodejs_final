const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const members = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            match: [/^\d{10}$/, "Invalid phone number"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        isvaid: {
            type: Number,
            default:0
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            default: 'user'
        },
    },
    { timestamps: true }
);

// Middleware to hash the password before saving
members.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare passwords
members.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("members", members);
