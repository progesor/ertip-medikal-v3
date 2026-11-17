"use client";

import { useAuth } from "@payloadcms/ui";
import { isAdmin } from "@/access/roles";
import { useEffect, useState } from "react";
import type { SiteLocale } from "@/lib/i18n/config";
import {
  getUiTextDefaultValue,
  uiTextOverrideSections,
  type UiTextOverrides,
} from "@/lib/i18n/uiTextOverrides";

type BootstrapResponse = {
  success?: boolean;
  scanned?: number;
  updated?: number;
  unchanged?: number;
  errors?: Array<{ scope: string; id?: number | string; message: string }>;
  message?: string;
};

type UiTextResponse = {
  success?: boolean;
  locale?: SiteLocale;
  data?: UiTextOverrides;
  message?: string;
};

export function EnglishContentBootstrapControl() {
  const { user } = useAuth();
  return (
    <div style={styles.stack}>
      {isAdmin(user) && <EnglishBootstrapSection />}
      <UiTextOverrideEditor />
    </div>
  );
}

function EnglishBootstrapSection() {
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBootstrap = async () => {
    if (isRunning) return;

    const confirmed = window.confirm(
      "Türkçe içerikler taranacak ve yalnızca İngilizce karşılığı boş olan alanlar doldurulacak. Mevcut İngilizce çeviriler değiştirilmeyecek. Page Builder blokları, ürün içerikleri, menü ve site ayarları da kapsama dahildir. Devam edilsin mi?",
    );

    if (!confirmed) return;

    setIsRunning(true);
    setMessage("Türkçe içerikler taranıyor ve eksik İngilizce alanlar dolduruluyor...");
    setError(null);

    try {
      const response = await fetch("/api/i18n/bootstrap-english", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await response.json().catch(() => ({}))) as BootstrapResponse;

      if (!response.ok && response.status !== 207) {
        throw new Error(data.message || "İngilizce içerik aktarımı başlatılamadı.");
      }

      if (data.errors?.length) {
        setError(
          `${data.message || "Aktarım kısmen tamamlandı."} İlk hata: ${data.errors[0]?.scope}${data.errors[0]?.id ? ` #${data.errors[0].id}` : ""} — ${data.errors[0]?.message}`,
        );
      } else {
        setMessage(
          data.message ||
            `${data.updated || 0} kayıt güncellendi, ${data.unchanged || 0} kayıt değişmeden bırakıldı.`,
        );
      }
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "İngilizce içerik aktarımı tamamlanamadı.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="ertip-module" style={styles.wrapper} aria-label="Çoklu dil içerik araçları">
      <div style={styles.copy}>
        <span style={styles.eyebrow}>Çoklu Dil</span>
        <h2 style={styles.title}>Eksik İngilizce içerikler</h2>
        <p style={styles.description}>
          Türkçe içerikleri kaynak alarak yalnızca boş İngilizce alanları
          doldurur. Mevcut çeviriler korunur.
        </p>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={() => void runBootstrap()}
          disabled={isRunning}
          className="ertip-module__button ertip-module__button--primary"
        >
          {isRunning
            ? "İngilizce İçerik Hazırlanıyor..."
            : "Eksik İngilizce İçeriği Türkçeden Doldur"}
        </button>
      </div>

      {message && !error && <p className="ertip-module__notice">{message}</p>}
      {error && <p className="ertip-module__notice ertip-module__notice--error">{error}</p>}
    </section>
  );
}

function UiTextOverrideEditor() {
  const [locale, setLocale] = useState<SiteLocale>("tr");
  const [values, setValues] = useState<UiTextOverrides>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/i18n/ui-text-overrides", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "load", locale: "tr" }),
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as UiTextResponse;
        if (!response.ok) throw new Error(data.message || "Site metinleri yüklenemedi.");
        if (!cancelled) {
          setValues(data.data || {});
          setIsLoading(false);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Site metinleri yüklenemedi.",
          );
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadLocale = async (nextLocale: SiteLocale) => {
    if (nextLocale === locale || isLoading || isSaving) return;

    setLocale(nextLocale);
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/i18n/ui-text-overrides", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load", locale: nextLocale }),
      });
      const data = (await response.json().catch(() => ({}))) as UiTextResponse;
      if (!response.ok) throw new Error(data.message || "Site metinleri yüklenemedi.");
      setValues(data.data || {});
    } catch (loadError) {
      setValues({});
      setError(
        loadError instanceof Error ? loadError.message : "Site metinleri yüklenemedi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const save = async (nextValues: UiTextOverrides = values) => {
    if (isSaving || isLoading) return;

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/i18n/ui-text-overrides", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", locale, data: nextValues }),
      });
      const data = (await response.json().catch(() => ({}))) as UiTextResponse;
      if (!response.ok) throw new Error(data.message || "Site metinleri kaydedilemedi.");
      setValues(data.data || {});
      setMessage(data.message || "Site metinleri kaydedildi.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Site metinleri kaydedilemedi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetLocale = async () => {
    const confirmed = window.confirm(
      `${locale.toUpperCase()} için tanımlanmış tüm özel Site metinleri temizlenecek ve sistem varsayılanlarına dönülecek. Devam edilsin mi?`,
    );
    if (!confirmed) return;

    await save({});
  };

  return (
    <section className="ertip-module" aria-label="Site metinleri düzenleyicisi">
      <div style={styles.editorHeader}>
        <div style={styles.copy}>
          <h2 style={styles.title}>Düğme ve sayfa metinleri</h2>
          <p style={styles.description}>
            Düzenlemek istediğiniz dili seçin. Boş bıraktığınız alanlarda sitenin varsayılan metni gösterilir.
          </p>
        </div>

        <div style={styles.localeSwitcher} aria-label="Düzenlenecek dil">
          {(["tr", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => void loadLocale(option)}
              disabled={isLoading || isSaving}
              aria-pressed={locale === option}
              className="ertip-module__locale"
            >
              {option === "tr" ? "Türkçe" : "English"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p style={styles.loading}>Site metinleri yükleniyor...</p>
      ) : (
        <div style={styles.editorSections}>
          {uiTextOverrideSections.map((section, sectionIndex) => (
            <details key={section.id} open={sectionIndex === 0} style={styles.details}>
              <summary style={styles.summary}>
                <strong>{section.label}</strong>
                <span style={styles.summaryDescription}>{section.description}</span>
              </summary>

              <div style={styles.fieldGrid}>
                {section.fields.map((field) => {
                  const currentValue = values[field.key] || "";
                  const defaultValue = getUiTextDefaultValue(locale, field.key);
                  const commonProps = {
                    value: currentValue,
                    placeholder: `Varsayılan: ${defaultValue}`,
                    disabled: isSaving,
                    onChange: (
                      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                    ) => {
                      const nextValue = event.target.value;
                      setValues((previous) => ({
                        ...previous,
                        [field.key]: nextValue,
                      }));
                    },
                    style: styles.input,
                  };

                  return (
                    <label key={field.key} style={styles.field}>
                      <span style={styles.fieldLabel}>{field.label}</span>
                      {field.multiline ? (
                        <textarea {...commonProps} rows={3} />
                      ) : (
                        <input {...commonProps} type="text" />
                      )}
                      <small style={styles.defaultHint}>
                        Boş = {defaultValue}
                      </small>
                    </label>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      )}

      <div style={styles.editorActions}>
        <button
          type="button"
          onClick={() => void resetLocale()}
          disabled={isLoading || isSaving}
          className="ertip-module__button"
        >
          Bu Dili Varsayılanlara Döndür
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={isLoading || isSaving}
          className="ertip-module__button ertip-module__button--primary"
        >
          {isSaving ? "Kaydediliyor..." : `${locale.toUpperCase()} Site metinlerini Kaydet`}
        </button>
      </div>

      {message && !error && <p className="ertip-module__notice">{message}</p>}
      {error && <p className="ertip-module__notice ertip-module__notice--error">{error}</p>}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  stack: {
    display: "grid",
    gap: "1rem",
    marginTop: "1.25rem",
  },
  wrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))",
    gap: "1rem 1.5rem",
    alignItems: "center",
  },
  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  },
  copy: {
    minWidth: 0,
  },
  eyebrow: {
    display: "block",
    marginBottom: "0.3rem",
    color: "var(--ertip-admin-muted)",
    fontSize: "var(--ertip-admin-caption-size)",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "1.05rem",
  },
  description: {
    maxWidth: "760px",
    margin: "0.45rem 0 0",
    color: "var(--ertip-admin-muted)",
    lineHeight: 1.55,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "0.45rem",
    minWidth: 0,
  },
  note: {
    color: "var(--ertip-admin-muted)",
    textAlign: "center",
  },
  localeSwitcher: {
    display: "flex",
    gap: "0.4rem",
    padding: "0.3rem",
    borderRadius: "10px",
    background: "var(--theme-elevation-100)",
  },
  loading: {
    margin: "1rem 0 0",
    color: "var(--ertip-admin-muted)",
  },
  editorSections: {
    display: "grid",
    gap: "0.65rem",
    marginTop: "1rem",
  },
  details: {
    border: "1px solid var(--ertip-admin-border)",
    borderRadius: "10px",
    background: "var(--ertip-admin-panel-subtle)",
    overflow: "hidden",
  },
  summary: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    padding: "0.9rem 1rem",
    cursor: "pointer",
  },
  summaryDescription: {
    color: "var(--ertip-admin-muted)",
    fontSize: "var(--ertip-admin-caption-size)",
    fontWeight: 400,
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: "0.9rem",
    padding: "0 1rem 1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  fieldLabel: {
    fontSize: "var(--ertip-admin-caption-size)",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    border: "1px solid var(--ertip-admin-control-border)",
    borderRadius: "7px",
    padding: "0.65rem 0.75rem",
    background: "var(--ertip-admin-panel-subtle)",
    color: "var(--theme-text)",
    font: "inherit",
    resize: "vertical",
  },
  defaultHint: {
    color: "var(--ertip-admin-muted)",
    lineHeight: 1.35,
  },
  editorActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.65rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  },
};
