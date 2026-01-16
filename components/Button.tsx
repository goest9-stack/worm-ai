import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-mono font-medium tracking-tighter transition-all duration-300 rounded group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worm-primary";
  
  const variants = {
    primary: "bg-worm-dim text-worm-primary border border-worm-primary hover:bg-worm-secondary/20 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]",
    secondary: "bg-transparent text-worm-muted border border-worm-border hover:text-white hover:border-white",
    danger: "bg-red-950/30 text-red-500 border border-red-500/50 hover:bg-red-900/40"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-worm-primary rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
      <span className="relative flex items-center gap-2">
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        )}
        {children}
      </span>
    </button>
  );
};