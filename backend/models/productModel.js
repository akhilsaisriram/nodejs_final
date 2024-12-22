const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const productSchemav1 = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        sellerName: {
            type: String,
            required: [true, "Seller name is required"],
        },
        sellerPhone: {
            type: String,
            required: [true, "Seller phone number is required"],
            match: [/^\d{10}$/, "Invalid phone number"],
            unique: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price must be positive"],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, "Discount must be positive"],
            max: [100, "Discount cannot exceed 100%"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
        },
        subcategory: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        image: {
            type: String,
            required: [true, "Product image is required"],
        },
    },
    { timestamps: true }
);

// Middleware to generate slug
productSchemav1.pre("save", function (next) {
    this.slug = slugify(this.name);
    next();
});

module.exports = mongoose.model("Productv1", productSchemav1);
