import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, { identifier, password });
      setMessage(response.data.message);
      console.log(response.data.token);
      localStorage.setItem('token',response.data.token)
      localStorage.setItem('user',response.data.user)

      setError('');
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setMessage(err.response.data.message);

      setMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {message && <div className="text-green-500 text-sm">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
              Username or Phone
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your username or phone"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
          >
            Login
          </button>
          <button
            onClick={()=>{ navigate('/reg');}}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
          >
            signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
