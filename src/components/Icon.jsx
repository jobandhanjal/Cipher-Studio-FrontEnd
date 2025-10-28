import React from 'react';
import { FiSun, FiMoon, FiLogOut, FiSave, FiPlay, FiDownload } from 'react-icons/fi';

// Mapping of friendly names to icon components
const ICON_MAP = {
  sun: FiSun,
  moon: FiMoon,
  logout: FiLogOut,
  save: FiSave,
  play: FiPlay,
  download: FiDownload,
};

/**
 * Icon component
 * - name: one of keys in ICON_MAP
 * - size: numeric size (passed to react-icons)
 * - className: additional classes
 */
const Icon = ({ name, size = 18, className = '', ...rest }) => {
  const Comp = ICON_MAP[name];
  if (!Comp) return <span className={className} {...rest} />;
  return <Comp size={size} className={className} {...rest} />;
};

export default Icon;
