"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { Mail, Phone } from "lucide-react";

export function ContactOverview() {
  const { id } = useDocumentInfo();
  const { name, company, email, phone } = useFormFields(([fields]) => ({
    name: String(fields.customerName?.value || fields.name?.value || ""),
    company: String(fields.company?.value || ""),
    email: String(fields.email?.value || ""),
    phone: String(fields.phone?.value || ""),
  }));
  if (!id || !name) return null;

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase("tr"))
    .join("");

  return (
    <section className="ertip-contact" aria-label="İletişim bilgileri">
      <span className="ertip-contact__initials" aria-hidden="true">
        {initials}
      </span>
      <div className="ertip-contact__person">
        <strong>{company || email || name}</strong>
        {company && email && <span>{email}</span>}
      </div>
      <div className="ertip-contact__actions">
        {email && (
          <a href={`mailto:${email}`}>
            <Mail size={16} /> E-posta yaz
          </a>
        )}
        {phone && (
          <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>
            <Phone size={16} /> Ara
          </a>
        )}
      </div>
    </section>
  );
}
