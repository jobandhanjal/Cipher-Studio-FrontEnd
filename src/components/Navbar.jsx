import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProject } from '../context/ProjectContext';
import { useNotifications } from '../context/NotificationContext';
import Icon from './Icon';
import IconButton from './IconButton';
import { FiMenu, FiFolder } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearSessionAndRedirect } from '../services/api';
import logo from "../assets/react.svg";
import Text from './Text';
import Button from './Button';

const Navbar = ({ onSave, onRun, onLoad, projectName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  // responsive state: when true, collapse action buttons into a hamburger + center title
  const [isCompact, setIsCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      // breakpoint: collapse when viewport width is small (mobile / narrow editors)
      setIsCompact(window.innerWidth < 720);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleLogout = () => {
    // Show a notification and then clear session + redirect
    push({ title: "Logged Out", message: "You have been logged out successfully." });
    // Small delay to allow notification to be visible before redirect
    setTimeout(() => {
      clearSessionAndRedirect();
    }, 150);
  };

  // Determine which buttons to show
  const isLogin = location.pathname === '/login';
  const isSignup = location.pathname === '/signup';
  const isDashboard = location.pathname === '/dashboard';
  const isIDE = location.pathname.startsWith('/editor');

  // access autosave from project context (safe when no provider present)
  const projectCtx = useProject();
  const autoSave = projectCtx?.autoSave ?? false;
  const setAutoSave = projectCtx?.setAutoSave ?? (() => {});

  const handleRightIconClick = async () => {
    // If a save handler is provided, save first; then always navigate to dashboard
    try {
      if (typeof onSave === 'function') {
        // support async save
        await onSave();
      }
    } catch (err) {
      // if save failed, don't navigate
      return;
    }
    navigate('/dashboard');
  };

  return (
    <nav className="h-14 px-4 flex items-center justify-between navbar relative">
      {/* Left: branding or compact hamburger */}
      <div className="flex items-center gap-2">
        {isCompact ? (
          // compact: show hamburger which toggles a dropdown menu containing the actions
          <IconButton onClick={() => setMenuOpen((s) => !s)} aria-expanded={menuOpen} title="Menu">
            <FiMenu size={20} />
          </IconButton>
        ) : (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src={logo} alt="CipherStudio Logo" className="w-8 h-8" />
            <Text as="span" variant="brand" className="text-xl font-semibold">Cipher School</Text>
          </div>
        )}
      </div>

      {/* Center: project title (IDE only) */}
      {isIDE && projectName && (
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <Text as="span" variant="body" className="text-lg font-bold project-title text-center" style={{ minWidth: '160px', maxWidth: '60vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{projectName}</Text>
        </div>
      )}

      {/* Right: actions (either full or compact icon) */}
      <div className="flex items-center gap-4">
        {isIDE && isCompact ? (
          // compact IDE: show only the right icon (save+go dashboard) and theme/logout icons in compact form
          <>
            <IconButton onClick={handleRightIconClick} title="Go to Dashboard">
              <FiFolder size={18} />
            </IconButton>
            <IconButton
              onClick={toggleTheme}
              aria-pressed={isDark}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Icon name="sun" size={18} /> : <Icon name="moon" size={18} />}
            </IconButton>
            {((isIDE || isDashboard)) && (
              <IconButton onClick={handleLogout} title="Logout" className="btn-logout">
                <Icon name="logout" size={18} />
              </IconButton>
            )}
          </>
        ) : (
          // non-compact: show full set of buttons as before
          <>
            {isIDE && (
              <>
                {onSave && (
                  <Button onClick={onSave} variant="primary" className="flex items-center gap-2 text-sm" title="Save project">
                    <Icon name="save" size={18} className="text-lg" />
                    <Text as="span" variant="label">Save</Text>
                  </Button>
                )}
                {typeof onRun === 'function' && (
                  <Button onClick={onRun} variant="primary" className="flex items-center gap-2 text-sm" title="Run project">
                    <Icon name="play" size={18} className="text-lg" />
                    <Text as="span" variant="label">Run</Text>
                  </Button>
                )}
                {/* {typeof onLoad === 'function' && (
                  <Button onClick={onLoad} variant="secondary" className="flex items-center gap-2 text-sm" title="Load local project">
                    <Icon name="download" size={18} className="text-lg" />
                    <Text as="span" variant="label">Load</Text>
                  </Button>
                )}
                <Button
                  onClick={() => setAutoSave(!autoSave)}
                  variant="toggle"
                  className={`text-sm ${autoSave ? 'text-green-300' : 'text-gray-400'}`}
                  title="Toggle autosave"
                  aria-pressed={autoSave}
                >
                  {autoSave ? 'Autosave: On' : 'Autosave: Off'}
                </Button> */}
              </>
            )}
            <IconButton
              onClick={toggleTheme}
              aria-pressed={isDark}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Icon name="sun" size={18} /> : <Icon name="moon" size={18} />}
            </IconButton>
            {((isIDE || isDashboard)) && (
              <Button onClick={handleLogout} variant="danger" className="btn-logout flex items-center gap-2 text-sm" title="Logout">
                <Icon name="logout" className="text-lg" size={18} />
                <Text as="span" variant="label">Logout</Text>
              </Button>
            )}
          </>
        )}
      </div>

      {/* Dropdown menu for compact hamburger */}
      {menuOpen && isCompact && (
        <div className="absolute left-4 top-full mt-2 card p-2 shadow-md rounded z-50" style={{ minWidth: 180 }}>
          <div className="flex flex-col gap-2">
            {onSave && (
              <button className="text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={async () => { setMenuOpen(false); await onSave(); }}>
                Save
              </button>
            )}
            {typeof onRun === 'function' && (
              <button className="text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMenuOpen(false); onRun(); }}>
                Run
              </button>
            )}
            {typeof onLoad === 'function' && (
              <button className="text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMenuOpen(false); onLoad(); }}>
                Load
              </button>
            )}
            <button className="text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMenuOpen(false); setAutoSave(!autoSave); }}>
              {autoSave ? 'Disable Autosave' : 'Enable Autosave'}
            </button>
            <button className="text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMenuOpen(false); toggleTheme(); }}>
              Toggle Theme
            </button>
            <button className="text-left px-2 py-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900" onClick={() => { setMenuOpen(false); handleLogout(); }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;