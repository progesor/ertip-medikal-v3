"use client";

import { useFormFields } from "@payloadcms/ui";
import { Menu } from "lucide-react";

export function MenuPreview() {
  const links = useFormFields(([fields]) =>
    (fields.items?.rows ?? []).map((row, index) => ({
      id: row.id,
      label: String(fields[`items.${index}.label`]?.value || "Adsız bağlantı"),
    })),
  );

  return (
    <section className="ertip-menu-preview" aria-label="Menü önizlemesi">
      <h2>
        <Menu size={18} aria-hidden="true" /> Menü önizlemesi
      </h2>
      {links.length ? (
        <ol>
          {links.map(({ id, label }) => (
            <li key={id}>{label}</li>
          ))}
        </ol>
      ) : (
        <p>İlk bağlantıyı eklediğinizde menü sırasını burada görebilirsiniz.</p>
      )}
    </section>
  );
}
