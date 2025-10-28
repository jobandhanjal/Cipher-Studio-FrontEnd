import React from 'react';

/**
 * Text component - centralizes text/label rendering so themes and variants
 * can be controlled from a single place.
 *
 * Props:
 * - as: string (tag to render, default 'span' or 'p')
 * - variant: 'body'|'small'|'label'|'heading'|'brand'|'muted' (maps to css classes)
 * - className: additional classes to merge
 * - children
 */
const VARIANT_TO_CLASS = {
  body: 'text-body',
  small: 'text-small',
  label: 'text-label',
  heading: 'text-heading',
  brand: 'text-brand',
  muted: 'text-muted',
};

const Text = ({ as = 'span', variant = 'body', className = '', children, style: styleProp, allowColorOverride = false, ...rest }) => {
  const Component = as;
  const baseClass = VARIANT_TO_CLASS[variant] || VARIANT_TO_CLASS.body;

  // merge classes without extra dependency
  const merged = `${baseClass} ${className || ''}`.trim();

  // Ensure readable text color uses theme tokens. By default we force color to
  // var(--color-text) so light theme shows dark text and dark theme shows light text.
  // Components may opt-out by passing `allowColorOverride`.
  const mergedStyle = {
    ...(styleProp || {}),
    ...(allowColorOverride ? {} : { color: 'var(--color-text)' }),
  };

  return (
    <Component className={merged} style={mergedStyle} {...rest}>
      {children}
    </Component>
  );
};

export default Text;
