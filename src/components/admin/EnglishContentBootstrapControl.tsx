"use client";

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
  return (
    <div style={styles.stack}>
      <EnglishBootstrapSection />
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
    <section style={styles.wrapper} aria-label="Çoklu dil içerik araçları">
      <div style={styles.copy}>
        <span style={styles.eyebrow}>Çoklu Dil</span>
        <h2 style={styles.title}>İngilizce İçerik Başlangıcını Hazırla</h2>
        <p style={styles.description}>
          Türkçe içerikleri kaynak alarak yalnızca boş İngilizce alanları
          doldurur. Mevcut İngilizce çeviriler korunur. Sayfaların Page Builder
          blokları, ürün içerikleri, kategoriler, haberler, ana menü ve site
          ayarları kapsama dahildir.
        </p>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={() => void runBootstrap()}
          disabled={isRunning}
          style={{
            ...styles.button,
            cursor: isRunning ? "not-allowed" : "pointer",
            opacity: isRunning ? 0.65 : 1,
          }}
        >
          {isRunning
            ? "İngilizce İçerik Hazırlanıyor..."
            : "Eksik İngilizce İçeriği Türkçeden Doldur"}
        </button>
        <small style={styles.note}>
          Güvenli mod: dolu İngilizce alanların üzerine yazılmaz.
        </small>
      </div>

      {message && !error && <p style={styles.message}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
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
        if (!response.ok) throw new Error(data.message || "UI metinleri yüklenemedi.");
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
              : "UI metinleri yüklenemedi.",
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
      if (!response.ok) throw new Error(data.message || "UI metinleri yüklenemedi.");
      setValues(data.data || {});
    } catch (loadError) {
      setValues({});
      setError(
        loadError instanceof Error ? loadError.message : "UI metinleri yüklenemedi.",
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
      if (!response.ok) throw new Error(data.message || "UI metinleri kaydedilemedi.");
      setValues(data.data || {});
      setMessage(data.message || "UI metinleri kaydedildi.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "UI metinleri kaydedilemedi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetLocale = async () => {
    const confirmed = window.confirm(
      `${locale.toUpperCase()} için tanımlanmış tüm özel UI metinleri temizlenecek ve sistem varsayılanlarına dönülecek. Devam edilsin mi?`,
    );
    if (!confirmed) return;

    await save({});
  };

  return (
    <section style={styles.editorWrapper} aria-label="UI metinleri düzenleyicisi">
      <div style={styles.editorHeader}>
        <div style={styles.copy}>
          <span style={styles.eyebrow}>UI Metinleri</span>
          <h2 style={styles.title}>Sabit Site Metinlerini Düzenle</h2>
          <p style={styles.description}>
            Ziyaretçiye görünen temel buton, başlık ve form metinlerini dil bazında
            özelleştirin. Alanı boş bırakırsanız kod içindeki güvenli varsayılan
            otomatik olarak kullanılır.
          </p>
        </div>

        <div style={styles.localeSwitcher} aria-label="Düzenlenecek dil">
          {(["tr", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => void loadLocale(option)}
              disabled={isLoading || isSaving}
              style={{
                ...styles.localeButton,
                ...(locale === option ? styles.localeButtonActive : {}),
              }}
            >
              {option === "tr" ? "Türkçe" : "English"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p style={styles.loading}>UI metinleri yükleniyor...</p>
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
          style={styles.secondaryButton}
        >
          Bu Dili Varsayılanlara Döndür
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={isLoading || isSaving}
          style={{
            ...styles.button,
            opacity: isLoading || isSaving ? 0.65 : 1,
          }}
        >
          {isSaving ? "Kaydediliyor..." : `${locale.toUpperCase()} UI Metinlerini Kaydet`}
        </button>
      </div>

      {message && !error && <p style={styles.message}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
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
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "1rem 1.5rem",
    alignItems: "center",
    padding: "1.25rem",
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: "14px",
    background: "var(--theme-elevation-50)",
  },
  editorWrapper: {
    padding: "1.25rem",
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: "14px",
    background: "var(--theme-elevation-50)",
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
    color: "var(--theme-elevation-500)",
    fontSize: "0.72rem",
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
    color: "var(--theme-elevation-600)",
    lineHeight: 1.55,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "0.45rem",
    minWidth: "300px",
  },
  button: {
    border: 0,
    borderRadius: "9px",
    padding: "0.85rem 1.05rem",
    background: "var(--theme-success-500, #15803d)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid var(--theme-elevation-250)",
    borderRadius: "9px",
    padding: "0.8rem 1rem",
    background: "var(--theme-elevation-100)",
    color: "var(--theme-text)",
    fontWeight: 700,
    cursor: "pointer",
  },
  note: {
    color: "var(--theme-elevation-500)",
    textAlign: "center",
  },
  localeSwitcher: {
    display: "flex",
    gap: "0.4rem",
    padding: "0.3rem",
    borderRadius: "10px",
    background: "var(--theme-elevation-100)",
  },
  localeButton: {
    border: 0,
    borderRadius: "7px",
    padding: "0.55rem 0.8rem",
    background: "transparent",
    color: "var(--theme-elevation-650)",
    fontWeight: 750,
    cursor: "pointer",
  },
  localeButtonActive: {
    background: "var(--theme-elevation-0)",
    color: "var(--theme-text)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  loading: {
    margin: "1rem 0 0",
    color: "var(--theme-elevation-600)",
  },
  editorSections: {
    display: "grid",
    gap: "0.65rem",
    marginTop: "1rem",
  },
  details: {
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: "10px",
    background: "var(--theme-elevation-0)",
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
    color: "var(--theme-elevation-550)",
    fontSize: "0.82rem",
    fontWeight: 400,
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "0.9rem",
    padding: "0 1rem 1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  fieldLabel: {
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    border: "1px solid var(--theme-elevation-250)",
    borderRadius: "7px",
    padding: "0.65rem 0.75rem",
    background: "var(--theme-elevation-0)",
    color: "var(--theme-text)",
    font: "inherit",
    resize: "vertical",
  },
  defaultHint: {
    color: "var(--theme-elevation-500)",
    lineHeight: 1.35,
  },
  editorActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.65rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  },
  message: {
    margin: "0.75rem 0 0",
    padding: "0.75rem",
    borderRadius: "8px",
    background: "var(--theme-success-100, #dcfce7)",
    color: "var(--theme-success-700, #166534)",
    fontWeight: 650,
  },
  error: {
    margin: "0.75rem 0 0",
    padding: "0.75rem",
    borderRadius: "8px",
    background: "var(--theme-error-100, #fee2e2)",
    color: "var(--theme-error-700, #b91c1c)",
    fontWeight: 650,
  },
};
