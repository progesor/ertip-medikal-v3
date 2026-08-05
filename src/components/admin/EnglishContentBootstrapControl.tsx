"use client";

import { useState } from "react";

type BootstrapResponse = {
  success?: boolean;
  scanned?: number;
  updated?: number;
  unchanged?: number;
  errors?: Array<{ scope: string; id?: number | string; message: string }>;
  message?: string;
};

export function EnglishContentBootstrapControl() {
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

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "1rem 1.5rem",
    alignItems: "center",
    marginTop: "1.25rem",
    padding: "1.25rem",
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: "14px",
    background: "var(--theme-elevation-50)",
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
  },
  note: {
    color: "var(--theme-elevation-500)",
    textAlign: "center",
  },
  message: {
    gridColumn: "1 / -1",
    margin: 0,
    padding: "0.75rem",
    borderRadius: "8px",
    background: "var(--theme-success-100, #dcfce7)",
    color: "var(--theme-success-700, #166534)",
    fontWeight: 650,
  },
  error: {
    gridColumn: "1 / -1",
    margin: 0,
    padding: "0.75rem",
    borderRadius: "8px",
    background: "var(--theme-error-100, #fee2e2)",
    color: "var(--theme-error-700, #b91c1c)",
    fontWeight: 650,
  },
};
