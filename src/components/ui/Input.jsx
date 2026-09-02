import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-nablus-gray-300">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nablus-gray-400" />
        )}
        <input
          ref={ref}
          className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-nablus-danger/60 focus:border-nablus-danger focus:ring-nablus-danger/10' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-nablus-danger">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

const Select = forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-nablus-gray-300">{label}</label>
      )}
      <select
        ref={ref}
        className={`input-field appearance-none cursor-pointer ${error ? 'border-nablus-danger/60' : ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-nablus-danger">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-nablus-gray-300">{label}</label>
      )}
      <textarea
        ref={ref}
        className={`input-field resize-none ${error ? 'border-nablus-danger/60' : ''}`}
        rows={3}
        {...props}
      />
      {error && <span className="text-xs text-nablus-danger">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Input, Select, Textarea };
export default Input;
