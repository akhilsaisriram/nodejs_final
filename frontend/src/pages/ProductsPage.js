import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import UploadCSV from "./UploadCSV";
const ProductsPage = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  useEffect(() => {
    if (query.trim() === "") {
        setSuggestions([]);
        return;
    }

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/products/auto`, {
                params: { query },
            });
            setSuggestions(response.data);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        } finally {
            setLoading(false);
        }
    };

    const debounce = setTimeout(fetchSuggestions, 300); // Debounce API calls
    return () => clearTimeout(debounce); // Cleanup previous timeouts
}, [query]);

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    sellerName: "",
    sellerPhone: "",
    minPrice: "",
    maxPrice: "",
    minDiscount: "",
    maxDiscount: "",
  });
  const [sortOption, setSortOption] = useState(""); // State for sorting
  const [showPopup, setShowPopup] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Toggle filters visibility

  // Fetch Products
  const fetchProducts = async (filterQuery = "", sortQuery = "") => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/products${filterQuery}${sortQuery}`
      );
      setProducts(response.data.data);
      const lowestPrice = response.data.lowest;
      console.log(lowestPrice);
      setFilters((prevFilters) => ({
        ...prevFilters,
        minPrice: lowestPrice, // Update only the minPrice filter
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch Products with Filters
  const fetchProductsFilter = async (filters, sortQuery = "") => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/products/filter${sortQuery}`,
        filters
      );
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    }
  };

  // Check if popup should be shown on initial load
  useEffect(() => {
    const popupStatus = sessionStorage.getItem("popupOpened");
    if (!popupStatus) {
      const timer = setTimeout(() => {
        if(localStorage.getItem('user')!=='user'){
          setShowPopup(true);

        }
      }, 5000); // 5 seconds delay

      // Clean up the timeout if the component is unmounted
      return () => clearTimeout(timer);
    }
  }, []);
  const [categories, setCategories] = useState([]); // State for categories and subcategories

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/products/categories`
      );
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  // Fetch all products on initial render
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle Filter Changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply Filters
  const applyFilters = () => {
    fetchProductsFilter(filters, `?sort=${sortOption}`);
  };

  const applySorting = (e) => {
    setSortOption(e.target.value); // Update sort state
    fetchProducts(`?sort=${e.target.value}`); // Fetch sorted data
  };

  // Handle Popup Close
  const handlePopupClose = () => {
    setShowPopup(false);
    sessionStorage.setItem("popupOpened", "true");
  };
  // Handle Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchProducts(); // Refresh product list after adding a new product
      handlePopupClose();
    } catch (error) {
        console.log(error.response.data.message)
            // alert(error.response.data.message)
            setSnackbar({
                    open: true,
                    message:
                      error.response?.data?.message || "Failed to fetch product details.",
                    severity: "error",
                  });
      console.error("Error submitting product:", error);
    }
  };

  // Handle Category Selection
  const handleCategorySelect = (category) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      category,
      subcategory: "", // Reset subcategory when a new category is selected
    }));
  };

  // Handle Subcategory Selection
  const handleSubcategorySelect = (subcategory) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      subcategory,
    }));
    console.log("Selected Category:", filters.category);
    console.log("Selected Subcategory:", subcategory);
    fetchProducts(`?category=${filters.category}_${subcategory}`); // Fetch sorted data
  };

  const handleDownload = async () => {
    try {
      // Make a GET request to download the data as CSV
      const response = await axios({
        url: `${process.env.REACT_APP_API_URL}/download-data`, // Endpoint to fetch the data
        method: "GET",
        responseType: "blob", // Ensure the response is a blob for file download
      });

      // Create a link to trigger the file download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data); // Create an object URL for the blob data
      link.setAttribute("download", "products_data.json"); // Specify the default filename
      document.body.appendChild(link);
      link.click(); // Trigger the click event to download the file
      document.body.removeChild(link); // Clean up the DOM
    } catch (error) {
      console.error("Error downloading data:", error);
      // alert("Error downloading the file");
      setSnackbar({
        open: true,
        message:
         "Error downloading the file" || "Failed to fetch product details.",
        severity: "error",
      });
    }
  };
  const navigate = useNavigate(); // Hook for navigation

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  return (
    <div className="p-4">
            <Snackbar
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              open={snackbar.open}
              onClose={handleSnackbarClose}
              autoHideDuration={6000}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbar.severity}
                sx={{ width: "100%" }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add a New Product</h2>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="text"
                name="sellerName"
                placeholder="Seller Name"
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="text"
                name="sellerPhone"
                placeholder="Seller Phone"
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="number"
                name="discount"
                placeholder="Discount"
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="text"
                name="category"
                placeholder="category"
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="text"
                name="subcategory"
                placeholder="subcategory"
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="file"
                name="image"
                className="w-full mb-3 p-2"
                accept="image/*"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded w-full"
              >
                Submit
              </button>
            </form>
            <button
              onClick={handlePopupClose}
              className="mt-4 text-gray-500 underline w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <button
  onClick={() => {
    localStorage.removeItem("token"); // Remove token from localStorage
    localStorage.removeItem("user"); // Remove token from localStorage
    navigate("/")  }}
  className="bg-red-500 text-white py-2 px-4 rounded mb-4 absolute right-0 top-0"
>
  Logout
</button>
      <div style={{ width: "300px", margin: "0 auto" }}>
            <input
                type="text"
                placeholder="Search for a product..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "5px" }}
            />
            {loading && <p>Loading...</p>}
            <ul
                style={{
                    border: "1px solid #ddd",
                    listStyle: "none",
                    padding: "0",
                    maxHeight: "200px",
                    overflowY: "auto",
                }}
            >
                {suggestions.map((item) => (
                    <li
                        key={item.slug}
                        style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                            cursor: "pointer",
                        }}
                        // onClick={() => alert(`Selected: ${item.name}`)}
                    >
                        {item.name}
                    </li>
                ))}
            </ul>
        </div>
      <button
        onClick={handleDownload}
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
      >
        Download All Data
      </button>
<UploadCSV></UploadCSV>
      <br></br>
      
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filter Dropdown */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              name="name"
              placeholder="Filter by product name"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="sellerName"
              placeholder="Filter by seller name"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="sellerPhone"
              placeholder="Filter by seller phone"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              placeholder="Min Price"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="minDiscount"
              placeholder="Min Discount"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxDiscount"
              placeholder="Max Discount"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
          </div>
        )}
        <button
          onClick={applyFilters}
          className="bg-green-500 text-white py-2 px-4 rounded mb-6"
        >
          Apply Filters
        </button>
      </div>

      {/* Sorting Options */}
      <div className="mb-6">
        <label htmlFor="sort" className="mr-2 font-bold">
          Sort By:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={applySorting}
          className="p-2 border rounded"
        >
          <option value="">Select...</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="date_desc">Date Added (new First)</option>
          <option value="date_asc">Date Added (old First)</option>

          <option value="price_asc">Price (Low to High)</option>
          <option value="price_desc">Price (High to Low)</option>
        </select>
      </div>

      {/* Displaying Products */}
      <div>
        <div className="mb-6">
          <h2 className="font-bold mb-2">Categories</h2>
          <div className="flex flex-wrap mb-4">
            {categories.map((category) => (
              <button
                key={category.category}
                onClick={() => handleCategorySelect(category.category)}
                className={`mr-4 mb-2 px-4 py-2 border rounded ${
                  filters.category === category.category
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>

          {/* Subcategory Selection */}
          {filters.category && (
            <div>
              <h3 className="font-semibold mb-2">Subcategories</h3>
              <div className="flex flex-wrap">
                {categories
                  .find((category) => category.category === filters.category)
                  .subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategorySelect(subcategory)}
                      className={`mr-4 mb-2 px-4 py-2 border rounded ${
                        filters.subcategory === subcategory
                          ? "bg-blue-500 text-white"
                          : "bg-white"
                      }`}
                    >
                      {subcategory}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.slug}
            className="border rounded p-4 cursor-pointer"
            onClick={() => window.open(`/product/${product.slug}`, "_blank")}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover mb-2"
            />
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p>
              Price:{" "}
              <span className="text-green-600 font-semibold">
                ${product.price}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
