const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Directory for storing uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Only JPEG and PNG are allowed."), false);
    }
    cb(null, true);
};

// Multer configuration with file size limit 
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter,
}).single("image");

// Middleware to handle Multer errors
const handleMulterError = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ success: false, message: "Image is too large" });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

module.exports = handleMulterError;
