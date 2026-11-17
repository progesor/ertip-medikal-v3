"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@payloadcms/ui";

export function AdminThemeToggle() {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  const label = dark ? "Açık temaya geç" : "Koyu temaya geç";
  const Icon = dark ? Sun : Moon;

  return (
    <button
      type="button"
      className="ertip-theme-toggle"
      aria-label={label}
      title={label}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
