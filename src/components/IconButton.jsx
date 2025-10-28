import React from 'react';
import Button from './Button';

/**
 * IconButton
 * - icon-only button that follows theme and focus styles
 * - props forwarded to underlying Button
 * - supports aria-pressed for toggle-like behavior
 */
const IconButton = React.forwardRef(({ children, className = '', title, 'aria-pressed': ariaPressed, ...rest }, ref) => {
  return (
    <Button
      ref={ref}
      variant="icon"
      className={`${className}`.trim()}
      title={title}
      aria-pressed={ariaPressed}
      {...rest}
    >
      {children}
    </Button>
  );
});

export default IconButton;
