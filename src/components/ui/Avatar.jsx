import { User } from 'lucide-react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-nablus-gray-600 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-nablus-primary/20 border border-nablus-primary/30 flex items-center justify-center font-semibold text-nablus-primary ${className}`}
    >
      {initials || <User className="w-1/2 h-1/2" />}
    </div>
  );
};

export default Avatar;
