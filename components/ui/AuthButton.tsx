"use client";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "ghost";
}

export default function AuthButton({
  children,
  loading,
  variant = "primary",
  className = "",
  ...props
}: AuthButtonProps) {
  const base =
    "w-full py-3 text-sm tracking-[0.2em] uppercase transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-cacao text-white hover:bg-sage",
    ghost: "border border-cacao text-cacao hover:bg-cacao hover:text-white",
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Please wait…
        </span>
      ) : (
        children
      )}
    </button>
  );
}
