const Product = require("../models/productModel");
const fs = require("fs");
const path = require("path");
const slugify = require("../utils/slugify"); // Assuming you have a slugify utility function

// Path to the JSON file
const jsonFilePath = path.join(__dirname, "../data/students.json");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sellerName,
      sellerPhone,
      price,
      discount,
      category,
      subcategory,
    } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Product image is required" });
    }

    const user = await Product.findOne({ name: name });

    if (user) {
      return res.status(400).json({ error: "Product with this name already exists" });
    }
    
    // Generate slug for the product
    const slug = slugify(name);

    // Construct the product object to save
    const newProduct = {
      name,
      sellerName,
      sellerPhone,
      price,
      discount,
      category,
      subcategory,
      slug, // Include slug in the product object
      image: req.file.path, // Save the image path in the JSON file
      createdAt: new Date(),
    };

    // Read the current products from the JSON file
    let productsData = [];
    if (fs.existsSync(jsonFilePath)) {
      const fileData = fs.readFileSync(jsonFilePath, "utf8");

      // If fileData is empty, set productsData to an empty array
      if (fileData.trim()) {
        try {
          productsData = JSON.parse(fileData); // Try parsing the JSON
        } catch (err) {
          console.error("Error parsing JSON:", err);
          productsData = []; // In case of invalid JSON, reset to empty array
        }
      }
    }
    // Check if the sellerPhone already exists in the productsData (JSON file)
    const existingProductInFile = productsData.find(
      (product) => product.sellerPhone === sellerPhone
    );
    if (existingProductInFile) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Seller phone number already exists in the file",
        });
    }
    // Add the new product to the array
    productsData.push(newProduct);

    // Write the updated product array back to the JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(productsData, null, 2));

    // If there are 3 or more products, perform a bulk insert
    if (productsData.length >= 3) {
      // Bulk insert into the database
      await Product.insertMany(productsData);

      // Clear the JSON file after bulk insert
      fs.writeFileSync(jsonFilePath, JSON.stringify([], null, 2));

      return res
        .status(201)
        .json({ success: true, message: "Products inserted successfully!" });
    }

    // If less than 3 products, just return the current product
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controller to get all unique categories and corresponding subcategories
const getCategoriesWithSubcategories = async (req, res) => {
  console.log("hi");

  try {
    // Aggregate unique categories and corresponding subcategories

    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category", // Group by category
          subcategories: { $addToSet: "$subcategory" }, // Collect unique subcategories
        },
      },
      {
        $project: {
          _id: 0, // Exclude the MongoDB _id field
          category: "$_id", // Rename _id to category
          subcategories: 1, // Include subcategories
        },
      },
    ]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Products

const getProducts = async (req, res) => {
  try {
    // Extract sorting parameter from query
    const sortParam = req.query.sort || "name_asc"; // Default to "name_asc" if not provided
    const cat = req.query.category;
    // Parse the sorting parameter
    const [sortField, sortDirection] = sortParam.split("_");

    const [category, subcategory] = cat ? cat.split("_") : [null, null];

    const sortOrder = sortDirection === "asc" ? 1 : -1;

    // Construct sorting object
    const sortQuery = {};

    // Map fields like price, date to their respective database fields
    switch (sortField) {
      case "price":
        sortQuery.price = sortOrder;
        break;
      case "date":
        sortQuery.createdAt = sortOrder;
        break;
      case "name":
      default:
        sortQuery.name = sortOrder;
        break;
    }

    // Fetch products with sorting and limit to top 5
    console.log(sortQuery);
    const filterQuery = {};
    if (category) filterQuery.category = category;
    if (subcategory) filterQuery.subcategory = subcategory;

    // Fetch products with sorting and filtering
    console.log("Filter Query:", filterQuery);

    let products = [];

    // Check if the JSON file exists and has data
    if (fs.existsSync(jsonFilePath)) {
      const fileData = fs.readFileSync(jsonFilePath, "utf8");

      // If JSON file has valid data, use it
      if (fileData.trim()) {
        try {
          const productsData = JSON.parse(fileData);
          products = productsData.filter((product) => {
            // Apply filtering based on category and subcategory
            if (category && product.category !== category) return false;
            if (subcategory && product.subcategory !== subcategory)
              return false;
            return true;
          });

          // Apply sorting
          products.sort((a, b) => {
            const fieldA = a[sortField] || "";
            const fieldB = b[sortField] || "";
            if (sortOrder === 1) return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
          });

          // Limit to top 5 products
          products = products.slice(0, 5);

          // Respond with the products from JSON
        } catch (jsonParseError) {
          console.error("Error parsing JSON file:", jsonParseError);
        }
      }
    }
    const productsa = await Product.find(filterQuery)
      .select("image price name slug") // Specify fields to retrieve
      .sort(sortQuery) // Apply sorting
      .limit(5); // Limit to top 5 products
    const lowestPriceProduct = await Product.findOne().sort({ price: 1 }); // Sort by price in ascending order to get the lowest

    const lowestPrice = lowestPriceProduct ? lowestPriceProduct.price : 0; // Ensure a default value of 0 if no products exist
    products = products.concat(productsa);
    console.log("s",products);
    
    // Map through products and convert image to base64
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        if (product.image) {
          const imagePath = path.join(product.image); // Adjust the path as necessary
          try {
            const fileData = fs.readFileSync(imagePath);
            const mimeType = "image/jpeg"; // Adjust MIME type as needed
            product.image = `data:${mimeType};base64,${fileData.toString(
              "base64"
            )}`;
          } catch (imageError) {
            console.error(
              `Error reading image for product ${product._id}:`,
              imageError
            );
            product.image = null; // Set to null if the image cannot be read
          }
        } else {
          product.image = null; // No image provided
        }
        return product;
      })
    );

    // Respond with sorted products
    res
      .status(200)
      .json({ success: true, data: updatedProducts, lowest: lowestPrice });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getProduct = async (req, res) => {
  try {
    // First, try to fetch the product from the database
    let product = await Product.findOne({ slug: req.params.slug });

    // If not found in the database, check the JSON file
    if (!product) {
      let productsData = [];

      // Check if the JSON file exists
      if (fs.existsSync(jsonFilePath)) {
        const fileData = fs.readFileSync(jsonFilePath, "utf8");

        // If fileData is not empty, parse it
        if (fileData.trim()) {
          try {
            productsData = JSON.parse(fileData); // Parse JSON file
          } catch (err) {
            console.error("Error parsing JSON:", err);
            productsData = []; // Reset to empty array in case of invalid JSON
          }
        }
      }

      // Search for the product in the JSON file based on the slug
      product = productsData.find((p) => p.slug === req.params.slug);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
    }

    // Handle image if it exists
    if (product.image) {
      const imagePath = path.join(product.image); // Adjust path as needed

      try {
        const fileData = fs.readFileSync(imagePath);
        const mimeType = "image/jpeg"; // Adjust MIME type if needed
        product.image = `data:${mimeType};base64,${fileData.toString("base64")}`;
      } catch (imageError) {
        console.error(`Error reading image for product ${product._id}:`, imageError);
        product.image = null; // Set to null if the image cannot be read
      }
    } else {
      product.image = null; // No image provided
    }

    // Send the product data as the response
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    console.log(updateData);

    // If an image is uploaded, set the new image path
    if (req.file) {
      updateData.image = req.file.path;
      console.log(req.file.path);
    }

    // Now, update the product in the JSON file if it exists
    if (fs.existsSync(jsonFilePath)) {
      const fileData = fs.readFileSync(jsonFilePath, "utf8");

      if (fileData.trim()) {
        try {
          let productsData = JSON.parse(fileData); // Parse the JSON file
          
          // Find and update the product in the JSON array based on the slug
          const productIndex = productsData.findIndex(
            (p) => p.slug === req.params.slug
          );

          if (productIndex !== -1) {
            // Replace the old product data with the updated data
            productsData[productIndex] = { ...productsData[productIndex], ...updateData };
            
            // Write the updated data back to the JSON file
            fs.writeFileSync(jsonFilePath, JSON.stringify(productsData, null, 2));
            res.status(200).json({ success: true, data: productsData[productIndex] });

          }
        } catch (err) {
          console.error("Error parsing JSON:", err);
        }
      }
    }

    
    // Update the product in the MongoDB database using the slug
    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// Delete Product


const deleteProduct = async (req, res) => {
  try {
    const slug = req.params.slug;

    // Step 1: Check if the product exists in the JSON file
    let productsData = [];
    if (fs.existsSync(jsonFilePath)) {
      const fileData = fs.readFileSync(jsonFilePath, "utf8");
      if (fileData.trim()) {
        try {
          productsData = JSON.parse(fileData);
        } catch (err) {
          console.error("Error parsing JSON:", err);
          productsData = []; // Reset if JSON is invalid
        }
      }
    }

    // Check if the product is in the JSON file
    const productInJson = productsData.find((prod) => prod.slug === slug);

    if (productInJson) {
      // If product found in JSON, delete it
      productsData = productsData.filter((prod) => prod.slug !== slug);
      // Write the updated data back to the JSON file
      fs.writeFileSync(jsonFilePath, JSON.stringify(productsData, null, 2));
      return res.status(200).json({ success: true, message: "Product deleted from JSON file" });
    }

    // Step 2: If product not found in JSON, check the database
    const product = await Product.findOneAndDelete({ slug: slug });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found in the database" });
    }

    res.status(200).json({ success: true, message: "Product deleted from the database" });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Filter Products

const filterProducts = async (req, res) => {
  try {
    const {
      name,
      sellerName,
      sellerPhone,
      minPrice,
      maxPrice,
      minDiscount,
      maxDiscount,
    } = req.body;
    console.log(req.body);

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }
    if (sellerName) {
      query.sellerName = { $regex: sellerName, $options: "i" };
    }
    if (sellerPhone) {
      query.sellerPhone = sellerPhone;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minDiscount || maxDiscount) {
      query.discount = {};
      if (minDiscount) query.discount.$gte = Number(minDiscount);
      if (maxDiscount) query.discount.$lte = Number(maxDiscount);
    }

    const products = await Product.find(query);
    console.log(products);
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        if (product.image) {
          // Ensure the product has an image path
          const imagePath = path.join(product.image); // Adjust path as needed
          console.log(imagePath);

          try {
            const fileData = fs.readFileSync(imagePath);
            // console.log(fileData);

            const mimeType = "image/jpeg"; // Replace with actual MIME type if necessary
            product.image = `data:${mimeType};base64,${fileData.toString(
              "base64"
            )}`;
          } catch (imageError) {
            console.error(
              `Error reading image for product ${product._id}:`,
              imageError
            );
            product.image = null; // Set to null if the image cannot be read
          }
        } else {
          product.image = null; // No image provided
        }
        return product;
      })
    );
    res.status(200).json({ success: true, data: updatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Autocomplete Controller Function
const autocompleteProducts = async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from the query params
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Find product names matching the query (case-insensitive, partial match)
    const products = await Product.find(
      { name: { $regex: query, $options: "i" } }, // Case-insensitive regex search
      "name slug" // Project only the name and slug fields
    ).limit(10); // Limit to 10 results for performance

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in autocomplete:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const csvupload = async (req, res) => {
  const { products } = req.body; // assuming products is an array of product objects
  console.log(products);

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'No products data provided' });
  }

  // Filter out invalid products with missing required fields
  const validProducts = products.filter(product => {
    return (
      product.name &&
      product.sellerName &&
      product.sellerPhone &&
      product.price !== null &&
      product.category &&
      product.image &&
      product.subcategory 
      
    );
  });

  if (validProducts.length === 0) {
    return res.status(400).json({ message: 'No valid products to upload' });
  }
  // Generate a slug for each product if not already provided
  products.forEach(product => {
    if (!product.slug) {
        product.slug = slugify(product.name, { lower: true });
    }
});
  try {
    const insertedProducts = await Product.insertMany(validProducts);
    res.status(201).json({ message: 'Products uploaded successfully', data: insertedProducts });
  } catch (error) {
    console.error('Error inserting products:', error);
    res.status(500).json({ message: 'Failed to upload products', error });
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  filterProducts,
  getCategoriesWithSubcategories,
  autocompleteProducts,
  csvupload,
};
