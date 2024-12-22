import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Image, message, Modal, Input, Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});
  const [imageFile, setImageFile] = useState(null); // State for storing the selected image file
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/products/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProduct(response.data.data);
      setEditedProduct(response.data.data);
    } catch (error) {
      console.log(error.response.data.message);
      // alert(error.response.data.message)
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to fetch product details.",
        severity: "error",
      });
      console.error("Error fetching product details:", error);
    }
  };
  const [role, setRole] = useState(""); // State to store the role
  useEffect(() => {
    fetchProduct();
    const user = localStorage.getItem("user");
    if (user === "superadmin") {
      setRole("superadmin");
    } else {
      setRole("user"); // Or set to another default role
    }
  }, [slug]);

  if (!product)
    return <p className="text-center mt-8 text-gray-500">Loading...</p>;

  // Function to handle product deletion
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/products/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: "Product deleted successfully!",
        severity: "success",
      });
      if (response.data.success) {
        // setSnackbar({
        //   open: true,
        //   message: "Product deleted successfully!",
        //   severity: "success",
        // });
        message.success("Product deleted successfully!");
        window.location.href = "/home";
      }
    } catch (error) {
      console.log(error.response.data.message);
      // alert(error.response.data.message)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to delete product.",
        severity: "error",
      });
      console.error("Error deleting product:", error);
      message.error("Failed to delete product.");
    }
  };
  console.log(role);

  // Function to handle the edit form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  // Function to handle file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (imageFile) {
      console.log(imageFile);

      formData.append("image", imageFile);
    }
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/products/${slug}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.success);
      // alert(response.data.success)
      setSnackbar({
        open: true,
        message: response.data?.success || "Product updated successfully!",
        severity: "success",
      });
      fetchProduct(); // Refresh product list after adding a new product
      setIsEditing(false);
    } catch (error) {
      console.log(error.response.data.message);
      // alert(error.response.data.message)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update product.",
        severity: "error",
      });
      console.error("Error submitting product:", error);
    }
  };
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
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
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

      {/* Product Image */}
      <Image src={product.image} alt={product.name} width={600} height={400} />

      {/* Product Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Column 1 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Details</h2>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Price:</span> $
            {product.price}
          </p>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Discount:</span>{" "}
            {product.discount}%
          </p>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Created At:</span>{" "}
            {new Date(product.createdAt).toLocaleDateString()}{" "}
            {new Date(product.createdAt).toLocaleTimeString()}
          </p>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Updated At:</span>{" "}
            {new Date(product.updatedAt).toLocaleDateString()}{" "}
            {new Date(product.updatedAt).toLocaleTimeString()}
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Seller Information
          </h2>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Name:</span>{" "}
            {product.sellerName}
          </p>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Phone:</span>{" "}
            {product.sellerPhone}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between">
        <Button
          type="primary"
          onClick={() => setIsEditing(true)}
          className="mr-2"
          disabled={role !== "superadmin"} // Disable if not superadmin
        >
          Edit
        </Button>
        <Button
          type="danger"
          onClick={handleDelete}
          disabled={role !== "superadmin"} // Disable if not superadmin
        >
          Delete
        </Button>
      </div>

      {/* Edit Form Modal */}
      <Modal
        title="Edit Product"
        visible={isEditing}
        onCancel={() => setIsEditing(false)}
        footer={null} // Removing default footer to use form buttons inside
      >
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Name</label>
              <Input
                name="name"
                value={editedProduct.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Price</label>
              <Input
                type="number"
                name="price"
                value={editedProduct.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Discount</label>
              <Input
                type="number"
                name="discount"
                value={editedProduct.discount}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block mb-2">Seller Name</label>
              <Input
                name="sellerName"
                value={editedProduct.sellerName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Seller Phone</label>
              <Input
                name="sellerPhone"
                value={editedProduct.sellerPhone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              {imageFile && (
                <p className="mt-2">Selected image: {imageFile.name}</p>
              )}
            </div>
          </div>
          {/* Form Footer Buttons */}
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={() => setIsEditing(false)} key="cancel">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" key="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetails;
