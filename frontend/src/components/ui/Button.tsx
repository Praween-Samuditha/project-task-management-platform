import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "xs" | "sm" | "md";
  loading?: boolean;
}

const variants = {
  primary: "bg-accent hover:bg-accent-hover text-white border-transparent shadow-sm",
  secondary: "bg-white hover:bg-surface text-ink-700 border-card-border shadow-sm",
  danger: "bg-red-500 hover:bg-red-600 text-white border-transparent shadow-sm",
  ghost: "bg-transparent hover:bg-surface text-ink-700 border-transparent",
};

const sizes = {
  xs: "h-6 px-2 text-[11px] gap-1 rounded-md",
  sm: "h-7 px-3 text-[12px] gap-1.5 rounded-md",
  md: "h-8 px-3.5 text-[13px] gap-2 rounded-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, disabled, children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center border font-medium
          transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1
          disabled:cursor-not-allowed disabled:opacity-50
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
