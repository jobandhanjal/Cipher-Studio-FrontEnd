import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/api";
import logo from "../assets/react.svg";
import { useTheme } from "../context/ThemeContext";
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const bgClass = theme === "dark"
    ? "bg-gray-900"
    : "bg-gradient-to-b from-blue-100 to-white";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const labelColor = theme === "dark" ? "text-blue-200" : "text-blue-900";
  const inputBg = theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900";
  const btnBg = theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600";

  return (
    <div className={`page-container ${bgClass}`} style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className={`form-card ${cardBg} ${textColor}`} style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding:"15px", borderRadius: "1.5rem", maxWidth: "400px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <img src={logo} alt="CipherStudio Logo" className="w-16 h-16 mb-2" />
          <h2 className={`text-2xl font-extrabold mb-1 text-center`} style={{ color: theme === 'dark' ? '#60a5fa' : '#1d4ed8', letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>Welcome Back</h2>
          <p className={`mb-4 text-base font-semibold text-center`} style={{ color: theme === 'dark' ? '#93c5fd' : '#2563eb' }}>Sign in to continue</p>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4 w-full flex flex-col items-center">
            <div className="w-4/5 mx-auto">
              <label className={`block text-sm font-semibold mb-2 w-full text-left ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>Email</label>
              <input
                type="email"
                placeholder="Email"
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ fontSize: '1rem' }}
              />
              <label className={`block text-sm font-semibold mb-2 w-full text-left ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>Password</label>
              <input
                type="password"
                placeholder="Password"
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ fontSize: '1rem' }}
              />
            </div>
            <button
              type="submit"
              className={`mt-2 ${btnBg} text-white py-2 rounded-lg transition font-semibold w-4/5 mx-auto text-lg`}
              style={{ letterSpacing: '0.5px' }}
            >
              Login
            </button>
          </form>
          <p className={`text-sm mt-4 text-center ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
