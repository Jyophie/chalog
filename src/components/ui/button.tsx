import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display font-bold transition-colors outline-none disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-brand/40",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white shadow-brand hover:bg-brand-dark",
        outline:
          "border border-border bg-surface text-brand-ink hover:bg-tint-green",
        ghost: "text-ink-muted hover:text-brand-ink",
      },
      size: {
        lg: "h-14 px-6 text-base rounded-pill",
        md: "h-12 px-5 text-sm rounded-[14px]",
        sm: "h-10 px-4 text-sm rounded-[12px]",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "lg", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
