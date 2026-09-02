const NablusLogo = ({ className = "h-8 w-auto", showText = true, variant = "dark" }) => {
  // Brand colors
  const portage = "#A493DC";
  const portageDark = "#8472C6";
  const misteryBlack = "#191919";
  const white = "#FFFFFF";

  const textColor = variant === "light" ? white : misteryBlack;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Nablus geometric N Isotipo */}
      <svg
        className="h-8 w-8 shrink-0 overflow-visible"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left vertical fold */}
        <polygon
          points="14,10 26,10 20,54 8,54"
          fill={variant === "primary" ? portage : variant === "light" ? white : misteryBlack}
        />
        {/* Diagonal Ribbon */}
        <polygon
          points="24,10 38,10 50,54 36,54"
          fill={variant === "primary" ? portageDark : variant === "light" ? "rgba(255,255,255,0.75)" : "#374151"}
        />
        {/* Right vertical fold */}
        <polygon
          points="37,10 49,10 56,54 44,54"
          fill={variant === "primary" ? portage : variant === "light" ? white : misteryBlack}
        />
      </svg>

      {showText && (
        <span
          className="text-lg font-black tracking-tight font-sans"
          style={{ color: textColor }}
        >
          NABLUS
        </span>
      )}
    </div>
  );
};

export default NablusLogo;
