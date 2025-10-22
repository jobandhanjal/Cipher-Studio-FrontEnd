import React from 'react';

const Button = ({ children, ...props }) => {
  return (
    <button {...props}>
      {children || 'Button'}
    </button>
  );
};

export default Button;
