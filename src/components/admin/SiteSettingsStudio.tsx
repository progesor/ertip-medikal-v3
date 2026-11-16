"use client";

import { Building2, FileText, Link2, Mail, Palette, Phone } from "lucide-react";
import { useFormFields } from "@payloadcms/ui";

type FormField = {
  value?: unknown;
};

const asText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const countRows = (
  fields: Record<string, FormField>,
  value: unknown,
  path: string,
) => {
  const valueRows = asArray(value);
  if (valueRows.length) return valueRows.length;

  const indexes = new Set<string>();
  Object.keys(fields).forEach((key) => {
    const match = key.match(new RegExp(`^${path}\\.([0-9]+)\\.`));
    if (match) indexes.add(match[1]);
  });

  return indexes.size;
};

const hasValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return Boolean(value.trim());
  return Boolean(value);
};

export function SiteSettingsStudio() {
  const data = useFormFields(([fields]) => {
    const get = (path: string) => fields[path] as FormField | undefined;

    return {
      address: asText(get("contact.address")?.value),
      bottomLinks: countRows(fields, get("footer.bottomLinks")?.value, "footer.bottomLinks"),
      columns: countRows(fields, get("footer.columns")?.value, "footer.columns"),
      email: asText(get("contact.email")?.value),
      phone: asText(get("contact.phone")?.value),
      siteLogo: hasValue(get("general.siteLogo")?.value),
      socialMedia: countRows(fields, get("socialMedia")?.value, "socialMedia"),
      whiteLogo: hasValue(get("general.whiteLogo")?.value),
    };
  });

  return (
    <section className="ertip-studio ertip-settings-studio" aria-label="Site ayarları">
      <div className="ertip-studio__header">
        <span>Kurumsal Kimlik</span>
        <strong>Site Ayarları</strong>
      </div>

      <div className="ertip-settings-grid">
        <article>
          <Palette size={18} />
          <strong>{data.siteLogo && data.whiteLogo ? "Logo seti hazır" : "Logo seti eksik"}</strong>
          <small>Renkli / beyaz kullanım</small>
        </article>
        <article>
          <Mail size={18} />
          <strong>{data.email || "E-posta yok"}</strong>
          <small>Genel iletişim</small>
        </article>
        <article>
          <Phone size={18} />
          <strong>{data.phone || "Telefon yok"}</strong>
          <small>Destek hattı</small>
        </article>
        <article>
          <Building2 size={18} />
          <strong>{data.address ? "Adres tanımlı" : "Adres yok"}</strong>
          <small>Kurumsal konum</small>
        </article>
        <article>
          <Link2 size={18} />
          <strong>{data.socialMedia}</strong>
          <small>Sosyal kanal</small>
        </article>
        <article>
          <FileText size={18} />
          <strong>{data.columns + data.bottomLinks}</strong>
          <small>Footer öğesi</small>
        </article>
      </div>
    </section>
  );
}
