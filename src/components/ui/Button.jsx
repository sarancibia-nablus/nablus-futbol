import { forwardRef } from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
};

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  iconRight: IconRight,
  loading = false,
  className = '', 
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} inline-flex items-center justify-center gap-2 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {IconRight && <IconRight className="w-4 h-4" />}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
