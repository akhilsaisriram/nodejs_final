import React, { useState } from 'react';
import axios from 'axios';

function UploadCSV() {
    const [csvFile, setCsvFile] = useState(null);

    const handleFileChange = (e) => {
        setCsvFile(e.target.files[0]);
    };

    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;
            const rows = text.split('\n');
            const products = rows.slice(1).map(row => {
                const [name, sellerName, sellerPhone, price, discount, category, subcategory, image] = row.split(',');
                return {
                    name,
                    sellerName,
                    sellerPhone,
                    price: parseFloat(price),
                    discount: parseFloat(discount),
                    category,
                    subcategory,
                    image
                };
            });
            sendDataToBackend(products);
        };
        reader.readAsText(file);
    };

    const sendDataToBackend = async (products) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/products/csv`, { products });
            console.log('Data uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading data:', error);
        }
    };

    const handleUpload = () => {
        if (csvFile) {
            parseCSV(csvFile);
        }
    };

    return (
        <div>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}

export default UploadCSV;
