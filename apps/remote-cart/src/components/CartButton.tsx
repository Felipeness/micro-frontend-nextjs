import { ButtonHTMLAttributes, useState } from 'react';

interface CartButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger';
}

export default function CartButton({ 
  children, 
  variant = 'primary', 
  onClick,
  ...props 
}: CartButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Cart button clicked');
    
    if (onClick) {
      onClick(event);
    }
  };

  const baseStyles = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minWidth: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(0)',
  };

  const variantStyles = {
    primary: {
      background: isHovered ? 'linear-gradient(135deg, #1976d2, #64b5f6)' : 'linear-gradient(135deg, #1565c0, #42a5f5)',
      color: 'white',
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 6px 16px rgba(21, 101, 192, 0.4)' : '0 2px 8px rgba(0,0,0,0.15)',
    },
    danger: {
      background: isHovered ? 'linear-gradient(135deg, #e53e3e, #fc8181)' : 'linear-gradient(135deg, #dc143c, #ff6b6b)',
      color: 'white',
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 6px 16px rgba(220, 20, 60, 0.4)' : '0 2px 8px rgba(0,0,0,0.15)',
    },
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}