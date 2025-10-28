import React from 'react';

/**
 * Reusable Button component
 * Props:
 * - variant: primary | secondary | cta | icon | danger | toggle | default
 * - className: additional class names to merge
 * - children, rest of button props are forwarded
 */
const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  cta: 'btn-cta',
  icon: 'btn-icon',
  danger: 'btn-danger',
  toggle: 'btn-toggle',
  default: 'btn',
};

const Button = React.forwardRef(({ variant = 'default', className = '', children, ...rest }, ref) => {
  const base = VARIANT_CLASS[variant] || VARIANT_CLASS.default;
  // Always include the core .btn so layout/spacing comes from centralized styles
  const merged = `btn ${base} ${className}`.trim();

  return (
    <button ref={ref} className={merged} {...rest}>
      {children}
    </button>
  );
});

export default Button;
