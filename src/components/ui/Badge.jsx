const Badge = ({ children, variant = 'primary', dot = true, className = '' }) => {
  const variantStyles = {
    primary: 'bg-nablus-primary/10 text-nablus-primary-dark border-nablus-primary/25',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const dotStyles = {
    primary: 'bg-nablus-primary',
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500 animate-pulse',
    neutral: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-150 select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotStyles[variant] || dotStyles.primary
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

