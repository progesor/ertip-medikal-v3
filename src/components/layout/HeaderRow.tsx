"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./HeaderRow.module.css";

export function HeaderRow({ children, compact }: { children: ReactNode; compact: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const row = ref.current;
    if (!row) return;
    let active = true;
    const fit = () => {
      if (!active) return;
      const previous = row.dataset.fit;
      row.dataset.fit = "drawer";
      if (row.clientWidth >= 768) {
        for (const mode of ["wide", "compact", "wrap"]) {
          row.dataset.fit = mode;
          const parts = Array.from(row.children);
          const css = getComputedStyle(row);
          const required = parts.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
            + (parts.length - 1) * parseFloat(css.columnGap)
            + parseFloat(css.paddingLeft) + parseFloat(css.paddingRight);
          const [brand, nav] = parts;
          const tooTall = mode === "wrap" && Array.from(nav.children).some(link => {
            const style = getComputedStyle(link);
            const textHeight = link.getBoundingClientRect().height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
            return textHeight > 2 * parseFloat(style.lineHeight) + 1;
          });
          if (required <= row.clientWidth && !tooTall) {
            const centeredLeft = (row.clientWidth - nav.getBoundingClientRect().width) / 2;
            const firstPossibleLeft = parseFloat(css.paddingLeft) + brand.getBoundingClientRect().width + parseFloat(css.columnGap);
            const offset = Math.max(0, Math.min(centeredLeft - firstPossibleLeft, row.clientWidth - required));
            row.style.setProperty("--nav-offset", offset + "px");
            break;
          }
          row.dataset.fit = "drawer";
        }
      }
      if (previous === "drawer" && row.dataset.fit !== "drawer") {
        row.dispatchEvent(new Event("desktopmenu"));
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    const mutations = new MutationObserver(fit);
    mutations.observe(row, { childList: true, characterData: true, subtree: true });
    document.fonts.ready.then(fit);
    return () => { active = false; observer.disconnect(); mutations.disconnect(); };
  }, []);
  return <div ref={ref} data-fit="drawer" className={`${styles.row} ${compact ? "min-h-16 py-2" : "min-h-[4.5rem] py-3"}`}>{children}</div>;
}