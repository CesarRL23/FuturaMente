import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none",
          "focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200",
          "dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-400 dark:focus:ring-zinc-800",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

