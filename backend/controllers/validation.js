const validateProduct = (req, res, next) => {
    const { name, price, sellerName, sellerPhone } = req.body;

    if (!name || !price || !sellerName || !sellerPhone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!/^\d{10}$/.test(sellerPhone)) {
        return res.status(400).json({ message: "Invalid phone number" });
    }

    next();
};

module.exports = validateProduct;
