"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedStatValueProps = {
  value: string;
  prefix?: string | null;
  suffix?: string | null;
  enabled?: boolean;
  className?: string;
};

function parseNumericValue(value: string) {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDecimalPlaces(value: number) {
  const valueString = String(value);
  const decimalIndex = valueString.indexOf(".");
  return decimalIndex === -1 ? 0 : valueString.length - decimalIndex - 1;
}

export function AnimatedStatValue({
  value,
  prefix,
  suffix,
  enabled = false,
  className,
}: AnimatedStatValueProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const numericValue = useMemo(() => parseNumericValue(value), [value]);
  const [displayValue, setDisplayValue] = useState(
    enabled && numericValue !== null ? 0 : numericValue,
  );
  const [hasAnimated, setHasAnimated] = useState(!enabled);

  useEffect(() => {
    if (!enabled || numericValue === null || hasAnimated) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDisplayValue(numericValue);
      setHasAnimated(true);
      return;
    }

    const element = rootRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const duration = 900;
        const startedAt = performance.now();

        const update = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(numericValue * eased);

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            setDisplayValue(numericValue);
            setHasAnimated(true);
          }
        };

        requestAnimationFrame(update);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, hasAnimated, numericValue]);

  const formattedValue =
    numericValue === null
      ? value
      : new Intl.NumberFormat("tr-TR", {
          minimumFractionDigits: getDecimalPlaces(numericValue),
          maximumFractionDigits: getDecimalPlaces(numericValue),
        }).format(displayValue ?? numericValue);

  const accessibleValue = `${prefix || ""}${value}${suffix || ""}`;

  return (
    <span ref={rootRef} className={className} aria-label={accessibleValue}>
      <span aria-hidden="true">
        {prefix}
        {formattedValue}
        {suffix}
      </span>
    </span>
  );
}
