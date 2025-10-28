import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../services/api';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/react.svg';
import Navbar from '../components/Navbar';
import Text from '../components/Text';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-100 to-white';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelColor = theme === 'dark' ? 'text-blue-200' : 'text-blue-900';
  const inputBg = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900';
  const btnBg = theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';

  return (
    <div className={`page-container ${bgClass}`} style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={`form-card ${cardBg} ${textColor}`} style={{padding:"15px",  boxShadow: '0 8px 32px rgba(0,0,0,0.12)', borderRadius: '1.5rem', maxWidth: '400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt="CipherStudio Logo" className="w-16 h-16 mb-2" />
          <Text as="h2" variant="heading" className={`text-2xl font-extrabold mb-1 text-center`} style={{ color: theme === 'dark' ? '#60a5fa' : '#1d4ed8', letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>Create Account</Text>
          <Text as="p" variant="body" className={`mb-4 text-base font-semibold text-center`} style={{ color: theme === 'dark' ? '#93c5fd' : '#2563eb' }}>Sign up to get started</Text>
          {error && <Text as="p" variant="small" className="text-red-500 text-sm mb-4 text-center">{error}</Text>}
          <form onSubmit={handleSubmit} className="space-y-4 w-full flex flex-col items-center">
            <div className="w-4/5 mx-auto">
              <Text as="label" variant="label" className={`block text-sm font-semibold mb-2 w-full text-left ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>Name</Text>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                required
                style={{ fontSize: '1rem' }}
              />
              <Text as="label" variant="label" className={`block text-sm font-semibold mb-2 w-full text-left ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>Email</Text>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                required
                style={{ fontSize: '1rem' }}
              />
              <Text as="label" variant="label" className={`block text-sm font-semibold mb-2 w-full text-left ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>Password</Text>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                  required
                  style={{ fontSize: '1rem' }}
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <IconButton style={{ 'margin-bottom': '10px' }} onClick={(e) => { e.preventDefault(); setShowPassword(s => !s); }} aria-pressed={showPassword} title={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </IconButton>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className={`mt-2 ${btnBg} text-white py-2 rounded-lg transition font-semibold w-4/5 mx-auto text-lg`}
              variant="primary"
              style={{ letterSpacing: '0.5px' }}
            >
              <Text as="span" variant="label">Signup</Text>
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Text as="p" variant="small" className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>Already have an account?</Text>
            <a href="/login" className="text-blue-500 hover:underline"><Text as="span" variant="label">Login</Text></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;