// components/ui/spin.tsx
"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

type SpinSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export type SpinProps = {
  className?: string;
  size?: SpinSize;
  text?: React.ReactNode; // optional label, e.g. "Loading..."
};

const SIZE_STYLES = {
  xs: { box: "h-3 w-3", border: "border-2", text: "text-xs" },
  sm: { box: "h-4 w-4", border: "border-2", text: "text-sm" },
  md: { box: "h-5 w-5", border: "border-[3px]", text: "text-sm" },
  lg: { box: "h-8 w-8", border: "border-4", text: "text-base" },
  xl: { box: "h-10 w-10", border: "border-[5px]", text: "text-lg" },
} as const;

export function Spin({ className, size = "md", text }: SpinProps) {
  const isNumber = typeof size === "number";

  // When size is numeric, we style width/height/borderWidth inline.
  const numericStyle = isNumber
    ? {
        width: size,
        height: size,
        borderWidth: Math.max(2, Math.round((size as number) / 8)),
      }
    : undefined;

  const preset = !isNumber
    ? SIZE_STYLES[size as keyof typeof SIZE_STYLES]
    : undefined;

  const spinner = (
    <span
      aria-hidden="true"
      style={numericStyle}
      className={cn(
        "inline-block animate-spin rounded-full border-solid",
        // colors
        "border-muted-foreground/30 border-t-transparent",
        // sizing for preset sizes
        !isNumber && preset?.box,
        !isNumber && preset?.border,
        // fallback if number: still need color classes above; size via style
        className
      )}
    />
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2",
        !isNumber && preset?.text
      )}
    >
      {spinner}
      {text ? (
        <span className="text-muted-foreground">{text}</span>
      ) : (
        <span className="sr-only">Loading…</span>
      )}
    </div>
  );
}

export default Spin;
