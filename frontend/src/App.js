import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails";
import Login from "./auth/Login";
import Register from "./auth/Register";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProductsPage />} />

        <Route path="/reg" element={<Register />} />

        <Route path="/product/:slug" element={<ProductDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
