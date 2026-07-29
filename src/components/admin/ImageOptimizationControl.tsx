"use client";

import { useCallback, useEffect, useState } from "react";

type OptimizationStatusValue =
  | "idle"
  | "stale"
  | "running"
  | "ready"
  | "partial";

type OptimizationStatus = {
  enabled: boolean;
  format: "webp" | "avif";
  currentFingerprint: string;
  activeFingerprint: string | null;
  status: OptimizationStatusValue;
  processedCount: number;
  skippedCount: number;
  errorCount: number;
  totalCount: number;
  lastOptimizedAt: string | null;
  message: string | null;
};

type RunResponse = {
  success?: boolean;
  nextPage?: number | null;
  hasNextPage?: boolean;
  totalDocs?: number;
  processedCount?: number;
  skippedCount?: number;
  errorCount?: number;
  message?: string | null;
};

type ErrorResponse = {
  message?: string;
};

const statusLabels: Record<OptimizationStatusValue, string> = {
  idle: "Henüz çalıştırılmadı",
  stale: "Yeni / değişen görseller bekliyor",
  running: "İşleniyor",
  ready: "Hazır",
  partial: "Kısmen tamamlandı",
};

function createRunId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(value: string | null) {
  if (!value) return "Henüz çalıştırılmadı";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function readErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => ({}))) as ErrorResponse;
  return data.message || fallback;
}

export function ImageOptimizationControl() {
  const [status, setStatus] = useState<OptimizationStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/media-optimization/status", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Optimizasyon durumu okunamadı."),
      );
    }

    const data = (await response.json()) as OptimizationStatus;
    setStatus(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      void loadStatus()
        .catch((statusError) => {
          if (cancelled) return;

          setError(
            statusError instanceof Error
              ? statusError.message
              : "Optimizasyon durumu okunamadı.",
          );
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [loadStatus]);

  const runOptimization = async (force: boolean) => {
    if (isRunning) return;

    const confirmed = window.confirm(
      force
        ? "Kaydedilmiş boyut ve kalite ayarlarıyla tüm görseller yeniden oluşturulacak. Orijinal dosyalar değiştirilmeyecek. Devam edilsin mi?"
        : "Yalnızca optimize türevi eksik olan yeni veya değişen görseller işlenecek. Hazır türevler yeniden oluşturulmadan atlanacak. Devam edilsin mi?",
    );

    if (!confirmed) return;

    setIsRunning(true);
    setError(null);
    setProgressMessage(
      force
        ? "Tüm görseller için ayarlar okunuyor..."
        : "Yeni ve değişen görseller kontrol ediliyor...",
    );

    try {
      const savedStatus = await loadStatus();
      const runId = createRunId();
      let page = 1;
      let iteration = 0;
      let hasNextPage = true;

      while (hasNextPage) {
        iteration += 1;

        if (iteration > 10_000) {
          throw new Error("Optimizasyon güvenlik sınırını aştı.");
        }

        const response = await fetch("/api/media-optimization/run", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId,
            page,
            batchSize: 5,
            force,
            expectedFingerprint: savedStatus.currentFingerprint,
          }),
        });

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response, "Görseller optimize edilemedi."),
          );
        }

        const data = (await response.json()) as RunResponse;

        if (!data.success) {
          throw new Error(data.message || "Görseller optimize edilemedi.");
        }

        const checked =
          (data.processedCount || 0) +
          (data.skippedCount || 0) +
          (data.errorCount || 0);

        setProgressMessage(
          `${checked} / ${data.totalDocs || 0} medya kontrol edildi.`,
        );

        hasNextPage = Boolean(data.hasNextPage);
        page = data.nextPage || page + 1;
      }

      await loadStatus();
      setProgressMessage(
        force
          ? "Tüm görseller yeniden oluşturuldu."
          : "Yeni ve değişen görsellerin optimizasyonu tamamlandı.",
      );
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Görseller optimize edilemedi.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const checkedCount = status
    ? status.processedCount + status.skippedCount + status.errorCount
    : 0;
  const progress =
    status?.totalCount && status.totalCount > 0
      ? Math.min(100, Math.round((checkedCount / status.totalCount) * 100))
      : 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.descriptionColumn}>
          <h3 style={styles.title}>Toplu Görsel Optimizasyonu</h3>
          <p style={styles.description}>
            Önce yukarıdaki ayarları Payload’ın Kaydet düğmesiyle kaydedin.
            Ardından yeni veya değişen raster görselleri artımlı olarak optimize
            edin. Gerektiğinde tüm türevleri yeniden oluşturabilirsiniz. PDF,
            SVG ve hareketli GIF dosyaları değiştirilmez.
          </p>
        </div>

        <div style={styles.actionGroup}>
          <button
            type="button"
            onClick={() => void runOptimization(false)}
            disabled={isRunning}
            style={{
              ...styles.actionButton,
              cursor: isRunning ? "not-allowed" : "pointer",
              opacity: isRunning ? 0.6 : 1,
            }}
          >
            {isRunning
              ? "Görseller İşleniyor..."
              : "Yeni / Değişenleri Optimize Et"}
          </button>
          <button
            type="button"
            onClick={() => void runOptimization(true)}
            disabled={isRunning}
            style={{
              ...styles.secondaryActionButton,
              cursor: isRunning ? "not-allowed" : "pointer",
              opacity: isRunning ? 0.6 : 1,
            }}
          >
            Tümünü Yeniden Oluştur
          </button>
        </div>
      </div>

      <div style={styles.statusGrid}>
        <StatusItem
          label="Durum"
          value={status ? statusLabels[status.status] : "Yükleniyor..."}
        />
        <StatusItem
          label="Son Çalışma"
          value={status ? formatDate(status.lastOptimizedAt) : "—"}
        />
        <StatusItem
          label="İşlenen"
          value={status ? String(status.processedCount) : "—"}
        />
        <StatusItem
          label="Atlanan"
          value={status ? String(status.skippedCount) : "—"}
        />
        <StatusItem
          label="Hata"
          value={status ? String(status.errorCount) : "—"}
        />
      </div>

      {(isRunning || status?.status === "running") && (
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }} />
        </div>
      )}

      {(progressMessage || status?.message) && !error && (
        <p style={styles.message}>{progressMessage || status?.message}</p>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.statusItem}>
      <div style={styles.statusLabel}>{label}</div>
      <div style={styles.statusValue}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: "1.5rem",
    padding: "1.25rem",
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: "12px",
    background: "var(--theme-elevation-50)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
    flexWrap: "wrap",
  },
  descriptionColumn: {
    maxWidth: "720px",
  },
  actionGroup: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "0.65rem",
  },
  title: {
    margin: 0,
    fontSize: "1rem",
  },
  description: {
    margin: "0.5rem 0 0",
    color: "var(--theme-elevation-600)",
    lineHeight: 1.55,
  },
  actionButton: {
    border: 0,
    borderRadius: "8px",
    padding: "0.8rem 1.1rem",
    background: "var(--theme-success-500, #15803d)",
    color: "white",
    fontWeight: 700,
  },
  secondaryActionButton: {
    border: "1px solid var(--theme-elevation-250)",
    borderRadius: "8px",
    padding: "0.8rem 1.1rem",
    background: "var(--theme-elevation-0)",
    color: "var(--theme-elevation-800)",
    fontWeight: 700,
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  statusItem: {
    padding: "0.75rem",
    borderRadius: "8px",
    background: "var(--theme-elevation-0)",
    border: "1px solid var(--theme-elevation-100)",
  },
  statusLabel: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--theme-elevation-500)",
    fontWeight: 700,
  },
  statusValue: {
    marginTop: "0.25rem",
    fontWeight: 700,
  },
  progressTrack: {
    height: "8px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "var(--theme-elevation-150)",
    marginTop: "1rem",
  },
  progressBar: {
    height: "100%",
    background: "var(--theme-success-500, #15803d)",
    transition: "width 200ms ease",
  },
  message: {
    margin: "1rem 0 0",
    color: "var(--theme-elevation-700)",
  },
  error: {
    margin: "1rem 0 0",
    padding: "0.75rem",
    borderRadius: "8px",
    background: "var(--theme-error-100, #fee2e2)",
    color: "var(--theme-error-600, #b91c1c)",
    fontWeight: 600,
  },
};
