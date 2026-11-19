"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import type { CatalogConfig, CatalogImage } from "@/types/catalog";
import styles from "./CoverDesigner.module.css";
type Design = CatalogConfig["coverDesign"];
type Props = {
  config: CatalogConfig;
  title: string;
  image: CatalogImage | null;
  disabled: boolean;
  onChange: (patch: Partial<CatalogConfig>) => void;
};
export function CoverDesigner({
  config,
  title,
  image,
  disabled,
  onChange,
}: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    kind: "title" | "image";
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const [draft, setDraft] = useState<Partial<Design> | null>(null);
  const design = { ...config.coverDesign, ...draft };
  const update = (patch: Partial<Design>) =>
    onChange({ coverDesign: { ...config.coverDesign, ...patch } });
  const start = (event: React.PointerEvent, kind: "title" | "image") => {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      kind,
      startX: event.clientX,
      startY: event.clientY,
      x: design[kind === "title" ? "titleX" : "imageX"],
      y: design[kind === "title" ? "titleY" : "imageY"],
    };
  };
  const move = (event: React.PointerEvent) => {
    const active = drag.current,
      bounds = frame.current?.getBoundingClientRect();
    if (!active || !bounds) return;
    const x = Math.max(
      active.kind === "title" ? 5 : 0,
      Math.min(
        active.kind === "title" ? 60 : 70,
        active.x + ((event.clientX - active.startX) / bounds.width) * 100,
      ),
    );
    const y = Math.max(
      active.kind === "title" ? 12 : 5,
      Math.min(
        active.kind === "title" ? 72 : 80,
        active.y + ((event.clientY - active.startY) / bounds.height) * 100,
      ),
    );
    setDraft(
      active.kind === "title"
        ? { titleX: x, titleY: y }
        : { imageX: x, imageY: y },
    );
  };
  const finish = () => {
    if (draft) update(draft);
    drag.current = null;
    setDraft(null);
  };
  const nudge = (event: React.KeyboardEvent, kind: "title" | "image") => {
    const delta = event.shiftKey ? 5 : 1;
    const directions: Record<string, [number, number]> = {
      ArrowUp: [0, -delta],
      ArrowDown: [0, delta],
      ArrowLeft: [-delta, 0],
      ArrowRight: [delta, 0],
    };
    const step = directions[event.key];
    if (!step || disabled) return;
    event.preventDefault();
    if (kind === "title")
      update({
        titleX: Math.max(5, Math.min(60, design.titleX + step[0])),
        titleY: Math.max(12, Math.min(72, design.titleY + step[1])),
      });
    else
      update({
        imageX: Math.max(0, Math.min(70, design.imageX + step[0])),
        imageY: Math.max(5, Math.min(80, design.imageY + step[1])),
      });
  };
  const slider = (
    label: string,
    key: keyof Design,
    min: number,
    max: number,
  ) => (
    <label>
      {label}
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={Number(design[key])}
        disabled={disabled}
        onChange={(e) => update({ [key]: Number(e.target.value) })}
      />
    </label>
  );
  return (
    <div className={styles.designer}>
      <p>
        Başlığı ve görseli sürükleyin. Klavyede ok tuşlarıyla
        konumlandırabilirsiniz.
      </p>
      <div
        ref={frame}
        className={styles.frame}
        style={{
          aspectRatio:
            config.orientation === "portrait" ? "210/297" : "297/210",
          background: design.background,
          color: design.foreground,
        }}
      >
        <div className={styles.brand}>{design.eyebrow}</div>
        {config.cover !== "type" && image && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Kapak görselini taşı"
            className={styles.image}
            onPointerDown={(e) => start(e, "image")}
            onPointerMove={move}
            onPointerUp={finish}
            onPointerCancel={() => {
              drag.current = null;
              setDraft(null);
            }}
            onKeyDown={(e) => nudge(e, "image")}
            style={{
              left: design.imageX + "%",
              top: design.imageY + "%",
              width: design.imageWidth + "%",
              height: design.imageHeight + "%",
            }}
          >
            <Image
              src={image.url}
              alt=""
              fill
              unoptimized
              style={{ objectFit: design.imageFit }}
              draggable={false}
            />
          </div>
        )}
        <div
          role="button"
          tabIndex={0}
          aria-label="Kapak başlığını taşı"
          className={styles.title}
          onPointerDown={(e) => start(e, "title")}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={() => {
            drag.current = null;
            setDraft(null);
          }}
          onKeyDown={(e) => nudge(e, "title")}
          style={{
            left: design.titleX + "%",
            top: design.titleY + "%",
            width: design.titleWidth + "%",
            textAlign: design.align,
            fontSize: design.titleSize * 0.35,
          }}
        >
          <strong>{design.title || title}</strong>
          <small>{config.subtitle}</small>
        </div>
      </div>
      <label>
        Kapak başlığı
        <input
          value={design.title}
          maxLength={150}
          placeholder={title}
          disabled={disabled}
          onChange={(e) => update({ title: e.target.value })}
        />
      </label>
      <label>
        Marka / üst başlık
        <input
          value={design.eyebrow}
          maxLength={80}
          disabled={disabled}
          onChange={(e) => update({ eyebrow: e.target.value })}
        />
      </label>
      <label>
        Edisyon / yıl
        <input
          value={design.edition}
          maxLength={80}
          disabled={disabled}
          onChange={(e) => update({ edition: e.target.value })}
        />
      </label>
      <div className={styles.colors}>
        <label>
          Zemin
          <input
            type="color"
            value={design.background}
            disabled={disabled}
            onChange={(e) => update({ background: e.target.value })}
          />
        </label>
        <label>
          Yazı
          <input
            type="color"
            value={design.foreground}
            disabled={disabled}
            onChange={(e) => update({ foreground: e.target.value })}
          />
        </label>
      </div>
      {slider("Başlık boyutu", "titleSize", 20, 64)}
      {slider("Başlık genişliği", "titleWidth", 30, 88)}
      <label>
        Başlık hizası
        <select
          value={design.align}
          disabled={disabled}
          onChange={(e) => update({ align: e.target.value as Design["align"] })}
        >
          <option value="left">Sol</option>
          <option value="center">Orta</option>
          <option value="right">Sağ</option>
        </select>
      </label>
      {slider("Görsel genişliği", "imageWidth", 20, 100)}
      {slider("Görsel yüksekliği", "imageHeight", 10, 80)}
      <label>
        Görsel yerleşimi
        <select
          value={design.imageFit}
          disabled={disabled}
          onChange={(e) =>
            update({ imageFit: e.target.value as Design["imageFit"] })
          }
        >
          <option value="contain">Tamamını göster</option>
          <option value="cover">Alanı doldur</option>
        </select>
      </label>
    </div>
  );
}
