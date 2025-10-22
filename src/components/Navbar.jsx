import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { FiSun, FiMoon, FiLogOut, FiSave } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "../assets/react.svg";

const Navbar = ({ onSave, projectName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    push({ title: "Logged Out", message: "You have been logged out successfully." });
  };

  // Determine which buttons to show
  const isLogin = location.pathname === '/login';
  const isSignup = location.pathname === '/signup';
  const isDashboard = location.pathname === '/dashboard';
  const isIDE = location.pathname.startsWith('/editor');

  return (
    <nav className="h-14 px-4 flex items-center justify-between bg-gray-900 border-b border-gray-800 relative">
      {/* Branding */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
        <img src={logo} alt="CipherStudio Logo" className="w-8 h-8" />
        <span className="text-xl font-semibold text-white">CipherStudio</span>
      </div>
      {/* Centered Project Name on IDE */}
      {isIDE && projectName && (
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <span className="text-lg font-bold text-white text-center" style={{ minWidth: '200px' }}>{projectName}</span>
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-4">
        {isIDE && onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            <FiSave className="text-lg" />
            Save Project
          </button>
        )}{isIDE && (
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
          </button>
        )}
        {((isIDE || isDashboard)) && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:text-white transition-colors"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        )}
        
      </div>
    </nav>
  );
};

export default Navbar;