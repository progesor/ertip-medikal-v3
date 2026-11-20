"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import styles from "./ArchiveDeleteButton.module.css";

export async function deleteArchive(
  endpoint: string,
  header: string,
  id: string | number,
) {
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", [header]: "1" },
    body: JSON.stringify({ id, confirm: true }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw Error(result?.message || "Dosya silinemedi. Lütfen tekrar deneyin.");
  }
}

export function ArchiveDeleteButton({
  label,
  disabled,
  onDelete,
}: {
  label: string;
  disabled?: boolean;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className={styles.root}>
      <button
        ref={trigger}
        type="button"
        className={styles.danger}
        disabled={disabled || pending}
        aria-label={label + " sil"}
        aria-expanded={open}
        onClick={() => {
          setError("");
          setOpen(!open);
        }}
      >
        <Trash2 size={15} aria-hidden="true" /> Sil
      </button>
      {open && (
        <div className={styles.confirm} role="group" aria-label="Silme onayı">
          <strong>{label}</strong>
          <p>
            Arşiv kaydı ve dosyası kalıcı olarak silinecek. Ürünler, kaynak
            görseller ve katalog tasarımınız korunur.
          </p>
          {error && <p role="alert">{error}</p>}
          <div className={styles.actions}>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className={styles.danger}
              disabled={disabled || pending}
              onClick={async () => {
                setPending(true);
                setError("");
                try {
                  await onDelete();
                  setOpen(false);
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Dosya silinemedi.",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              {pending ? "Siliniyor…" : "Kalıcı olarak sil"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
