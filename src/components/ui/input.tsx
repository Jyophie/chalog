import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-[50px] w-full rounded-[14px] border border-border bg-surface px-4 text-sm text-brand-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
