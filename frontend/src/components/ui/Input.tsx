import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-[12px] font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            h-8 w-full rounded-lg border bg-white px-3 text-[13px] text-ink-900 placeholder-ink-300
            transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
            ${error ? "border-red-400 focus:ring-red-300" : "border-card-border hover:border-ink-300"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
