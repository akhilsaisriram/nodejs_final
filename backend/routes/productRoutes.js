
const express = require("express");
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    filterProducts,
    getCategoriesWithSubcategories,
    autocompleteProducts,
    csvupload,
} = require("../controllers/productController");
const handleMulterError = require("../utils/m");
const checkRole = require("../utils/role");
const router = express.Router();

// Get all unique categories and corresponding subcategories (accessible to all users)
router.get("/categories", getCategoriesWithSubcategories);

// Create a new product (accessible to admin and superadmin)
// router.post("/", checkRole(["admin", "superadmin"]), handleMulterError, createProduct);
router.post("/",  handleMulterError, createProduct);

// Get all products (accessible to all users)
router.get("/", getProducts);

// Autocomplete product names (accessible to all users)
router.get("/auto", autocompleteProducts);

// Get a single product by slug (accessible to all users)
router.get("/:slug", getProduct);

// Update a product by slug (accessible to superadmin)
router.put("/:slug", checkRole(["superadmin"]), handleMulterError, updateProduct);

// Delete a product by slug (accessible to superadmin)
router.delete("/:slug", checkRole(["superadmin"]), deleteProduct);

// Filter products based on various criteria (accessible to all users)
router.post("/filter", filterProducts);

// csv upload
router.post("/csv", handleMulterError,csvupload);


module.exports = router;
