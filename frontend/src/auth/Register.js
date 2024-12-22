// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     name: '',
//     phone: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate(); // Hook for navigation

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, formData);
//       setMessage(response.data.message);
//       setError('');
//       navigate("/")
//     } catch (err) {
//       setError(err.response?.data?.error || 'Something went wrong');
//       setMessage('');
//     }
//   };

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
//         <h2 className="text-2xl font-bold text-center">Register</h2>
//         {error && <div className="text-red-500 text-sm">{error}</div>}
//         {message && <div className="text-green-500 text-sm">{message}</div>}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//               Username
//             </label>
//             <input
//               id="username"
//               name="username"
//               type="text"
//               value={formData.username}
//               onChange={handleChange}
//               className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
//               placeholder="Enter your username"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               id="name"
//               name="name"
//               type="text"
//               value={formData.name}
//               onChange={handleChange}
//               className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
//               placeholder="Enter your name"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//               Phone
//             </label>
//             <input
//               id="phone"
//               name="phone"
//               type="text"
//               value={formData.phone}
//               onChange={handleChange}
//               className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
//               placeholder="Enter your phone number"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               id="password"
//               name="password"
//               type="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
//               placeholder="Enter your password"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none"
//           >
//             Register
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phone: '',
    password: '',
    role: 'user', // Default role is 'user'
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, formData);
      setMessage(response.data.message);
      setError('');
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {message && <div className="text-green-500 text-sm">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
