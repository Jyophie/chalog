"use client";

import { cn } from "@/lib/utils";

export function Chip({
  selected,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-brand bg-brand text-white"
          : "border-border bg-surface text-brand-ink hover:bg-tint-green",
        className,
      )}
      {...props}
    />
  );
}
