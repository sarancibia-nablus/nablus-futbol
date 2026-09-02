const Card = ({ children, className = '', hover = false, padding = true, ...props }) => {
  return (
    <div
      className={`${hover ? 'glass-card-hover' : 'glass-card'} ${padding ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
