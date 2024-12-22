const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require("./routes/productRoutes");
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const { Parser } = require('json2csv');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const path = require("path");
const productModel = require('./models/productModel');
const userRoutes = require("./routes/userRoutes"); // Adjust path as needed

// Middleware




app.use(express.json({ limit: '500mb' })); // Configure limit for express.json()
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json({ limit: '500mb' })); // Configure limit for body-parser
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(cors());
app.use(morgan('dev')); // Log HTTP requests in dev format

// Routes
// Endpoint to download all products as CSV
app.get('/download-data', async (req, res) => {
    try {
        // Fetch all data from the database (adjust the model if necessary)
        const products = await productModel.find();
  
        // Convert the products data to JSON
        const jsonData = JSON.stringify(products, null, 2); // Pretty print the JSON data
  
        // Set the filename
        const fileName = 'products_data.json';
  
        // Set the response headers to prompt the browser to download the file
        res.header('Content-Type', 'application/json');
        res.header('Content-Disposition', `attachment; filename=${fileName}`);
  
        // Send the JSON data as a file download
        res.send(jsonData);
    } catch (error) {
        console.error('Error downloading data:', error);
        res.status(500).json({ success: false, message: 'Error fetching data' });
    }
});


const Usernew = require("./models/members"); // Path to your User schema

app.get("/verify", async (req, res) => {
    const { username } = req.query;

    try {
        // Find the user by username
        const user = await Usernew.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found or invalid link" });
        }

        // Check if already verified
        if (user.isvaid === 1) {
            return res.status(200).json({ message: "Account already verified" });
        }

        // Update `isvaid` to 1
        user.isvaid = 1;
        await user.save();

        res.status(200).json({ message: "Account verified successfully" });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: "An error occurred during verification" });
    }
});

app.use("/api", userRoutes);

app.use('/products', productRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
