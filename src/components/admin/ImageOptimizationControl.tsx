"use client";

import { useCallback, useEffect, useState } from "react";

type OptimizationStatus = {
  enabled: boolean;
  format: "webp" | "avif";
  currentFingerprint: string;
  activeFingerprint: string | null;
  status: "idle" | "stale" | "running" | "ready" | "partial";
  processedCount: number;
  skippedCount: number;
  errorCount: number;
  totalCount: number;
  lastOptimizedAt: string | null;
  message: string | null;
};

type RunResponse = {
  success?: boolean;
  currentFingerprint?: string;
  nextPage?: number | null;
  hasNextPage?: boolean;
  totalDocs?: number;
  processedCount?: number;
  skippedCount?: number;
  errorCount?: number;
  finished?: boolean;
  status?: OptimizationStatus["status"];
  message?: string | null;
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

const statusLabels: Record<OptimizationStatus["status"], string> = {
  idle: "Hazır değil",
  stale: "Ayarlar değişti — yeniden çalıştırılmalı",
  running: "İşleniyor",
  ready: "Hazır",
  partial: "Kısmen tamamlandı",
};

export function ImageOptimizationControl() {
  const [status, setStatus] = useState<OptimizationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/media-optimization/status", {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await response.json()) as OptimizationStatus & {
      message?: string;
    };

    if (!response.ok) {
      throw new Error(data.message || "Optimizasyon durumu okunamadı.");
    }

    setStatus(data);
  }, []);

  useEffect(() => {
    void loadStatus()
      .catch((statusError) => {
        setError(
          statusError instanceof Error
            ? statusError.message
            : "Optimizasyon durumu okunamadı.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [loadStatus]);

  const runOptimization = async () => {
    if (isRunning) return;

    const confirmed = window.confirm(
      "Kaydedilmiş boyut ve kalite ayarlarıyla tüm görseller yeniden oluşturulacak. Orijinal dosyalar değiştirilmeyecek. Devam edilsin mi?",
    );

    if (!confirmed) return;

    setIsRunning(true);
    setError(null);
    setProgressMessage("Kaydedilmiş ayarlar okunuyor...");

    try {
      await loadStatus();
      const freshResponse = await fetch("/api/media-optimization/status", {
        credentials: "include",
        cache: "no-store",
      });
      const freshStatus = (await freshResponse.json()) as OptimizationStatus & {
        message?: string;
      };

      if (!freshResponse.ok) {
        throw new Error(
          freshStatus.message || "Kaydedilmiş ayarlar okunamadı.",
        );
      }

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
            force: true,
            expectedFingerprint: freshStatus.currentFingerprint,
          }),
        });
        const data = (await response.json()) as RunResponse;

        if (!response.ok || !data.success) {
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
      setProgressMessage("Optimizasyon tamamlandı.");
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
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1.25rem",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "12px",
        background: "var(--theme-elevation-50)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: "720px" }}>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>
            Toplu Görsel Optimizasyonu
          </h3>
          <p
            style={{
              margin: "0.5rem 0 0",
              color: "var(--theme-elevation-600)",
              lineHeight: 1.55,
            }}
          >
            Önce yukarıdaki ayarları Payload’ın <strong>Kaydet</strong>{" 