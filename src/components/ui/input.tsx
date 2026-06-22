import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-[50px] w-full rounded-[16px] border border-hairline bg-field px-[17px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
