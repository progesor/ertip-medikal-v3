"use client";

import { useMemo, useState } from "react";
import { useAllFormFields } from "@payloadcms/ui";
import { reduceFieldsToValues } from "payload/shared";
import {
  previewConfiguredVariantGeneration,
} from "@/lib/sku-engine/applyLegacyVariantGeneration";
import {
  createGenerationFingerprint,
  readSkuRuleProfile,
} from "@/lib/sku-engine/configuration";
import type {
  ConfigurableGenerationResult,
  VariantGenerationData,
  VariantMatchStrategy,
} from "@/lib/sku-engine/types";

type SuccessfulPreview = Extract<
  ConfigurableGenerationResult,
  { ok: true }
>;

type PreviewState = {
  fingerprint: string;
  result: SuccessfulPreview;
};

const matchLabels: Record<VariantMatchStrategy, string> = {
  "combination-key": "Kimlik ile korundu",
  "target-sku": "Mevcut SKU ile eşleşti",
  "legacy-sku": "Eski Punch SKU ile taşındı",
  new: "Yeni varyant",
};

export function SkuRuleWorkbench() {
  const [fields, dispatchFields] = useAllFormFields();
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const formData = useMemo(
    () => reduceFieldsToValues(fields, true) as VariantGenerationData,
    [fields],
  );
  const profile = readSkuRuleProfile(formData.skuRuleProfile);
  const currentFingerprint = createGenerationFingerprint(formData);
  const previewIsStale = Boolean(
    preview && preview.fingerprint !== currentFingerprint,
  );

  const runPreview = () => {
    setApplied(false);
    setError(null);

    const result = previewConfiguredVariantGeneration(formData);
    if (!result) {
      setPreview(null);
      return;
    }

    if (!result.ok) {
      setPreview(null);
      setError(result.issues.map((issue) => issue.message).join("\n"));
      return;
    }

    setPreview({ fingerprint: currentFingerprint, result });
  };

  const applyPreview = () => {
    if (!preview) return;

    if (preview.fingerprint !== currentFingerprint) {
      setError(
        "Önizlemeden sonra SKU ayarları veya varyantlar değişti. Yeniden önizleme oluşturun.",
      );
      return;
    }

    if (
      preview.result.summary.removed > 0 &&
      !window.confirm(
        `${preview.result.summary.removed} mevcut varyant yeni kombinasyonlarda bulunmuyor. Önizleme yine de forma uygulansın mı?`,
      )
    ) {
      return;
    }

    dispatchFields({
      type: "UPDATE",
      path: "variants",
      value: preview.result.variants,
    });
    dispatchFields({
      type: "UPDATE",
      path: "triggerVariantGeneration",
      value: false,
    });
    setApplied(true);
    setError(null);
  };

  if (profile === "manual") {
    return (
      <section style={styles.wrapper}>
        <h3 style={styles.title}>SKU Kural Çalışma Alanı</h3>
        <p style={styles.description}>
          Manuel profil seçili. Varyantlar ve SKU kodları aşağıdaki listeden
          doğrudan yönetilir; otomatik üretim uygulanmaz.
        </p>
      </section>
    );
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>SKU Kural Çalışma Alanı</h3>
          <p style={styles.description}>
            Kaydetmeden önce oluşacak SKU’ları ve manuel verilerin nasıl
            korunacağını inceleyin. “Forma Uygula” yalnızca aşağıdaki varyant
            alanını günceller; son kayıt yine Payload’ın Kaydet düğmesiyle
            yapılır.
          </p>
        </div>
        <div style={styles.actions}>
          <button type="button" onClick={runPreview} style={styles.button}>
            Önizleme Oluştur
          </button>
          <button
            type="button"
            onClick={applyPreview}
            disabled={!preview || previewIsStale}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: !preview || previewIsStale ? 0.5 : 1,
              cursor: !preview || previewIsStale ? "not-allowed" : "pointer",
            }}
          >
            Forma Uygula
          </button>
        </div>
      </div>

      {previewIsStale && (
        <p style={styles.warning}>
          Önizlemeden sonra alanlar değişti. Uygulamadan önce yeniden önizleme
          oluşturun.
        </p>
      )}

      {error && <pre style={styles.error}>{error}</pre>}

      {preview && (
        <>
          <div style={styles.summaryGrid}>
            <SummaryItem
              label="Kombinasyon"
              value={preview.result.combinationCount}
            />
            <SummaryItem
              label="Korunan"
              value={preview.result.summary.preserved}
            />
            <SummaryItem label="Yeni" value={preview.result.summary.added} />
            <SummaryItem
              label="SKU Değişen"
              value={preview.result.summary.skuChanged}
            />
            <SummaryItem
              label="Çıkarılacak"
              value={preview.result.summary.removed}
            />
          </div>

          <div style={styles.detailLine}>
            Kimlik eşleşmesi: {preview.result.summary.matchedByCombinationKey} ·
            Hedef SKU ile başlangıç eşleşmesi: {" "}
            {preview.result.summary.bootstrappedByTargetSku} · Eski Punch SKU ile
            taşınan: {preview.result.summary.bootstrappedByLegacySku}
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Varyant</th>
                  <th style={styles.tableHeader}>Önceki SKU</th>
                  <th style={styles.tableHeader}>Yeni SKU</th>
                  <th style={styles.tableHeader}>Eşleştirme</th>
                </tr>
              </thead>
              <tbody>
                {preview.result.candidates.slice(0, 20).map((candidate) => (
                  <tr key={candidate.combinationKey}>
                    <td style={styles.tableCell}>{candidate.variant.title}</td>
                    <td style={styles.tableCell}>{candidate.previousSku || "—"}</td>
                    <td style={styles.tableCell}>{candidate.variant.sku}</td>
                    <td style={styles.tableCell}>
                      {matchLabels[candidate.matchStrategy]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.result.candidates.length > 20 && (
            <p style={styles.detailLine}>
              İlk 20 varyant gösteriliyor. Toplam {preview.result.candidates.length}
              varyant üretilecek.
            </p>
          )}

          {applied && (
            <p style={styles.success}>
              Önizleme varyant alanına uygulandı. Değişiklikleri kalıcı yapmak
              için ürünü kaydedin.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.summaryItem}>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    margin: "1rem 0",
    padding: "1rem",
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: "12px",
    background: "var(--theme-elevation-50)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: "1rem" },
  description: {
    margin: "0.45rem 0 0",
    maxWidth: "760px",
    color: "var(--theme-elevation-600)",
    lineHeight: 1.5,
  },
  actions: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  button: {
    padding: "0.7rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid var(--theme-elevation-250)",
    background: "var(--theme-elevation-0)",
    color: "var(--theme-text)",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    border: 0,
    background: "var(--theme-success-500, #15803d)",
    color: "white",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "0.65rem",
    marginTop: "1rem",
  },
  summaryItem: {
    padding: "0.7rem",
    borderRadius: "8px",
    border: "1px solid var(--theme-elevation-100)",
    background: "var(--theme-elevation-0)",
  },
  summaryLabel: {
    display: "block",
    fontSize: "0.72rem",
    textTransform: "uppercase",
    color: "var(--theme-elevation-500)",
    fontWeight: 700,
  },
  summaryValue: { display: "block", marginTop: "0.2rem", fontSize: "1.1rem" },
  detailLine: {
    margin: "0.8rem 0 0",
    color: "var(--theme-elevation-600)",
    fontSize: "0.85rem",
  },
  tableWrapper: { overflowX: "auto", marginTop: "1rem" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "680px" },
  tableHeader: {
    padding: "0.55rem",
    textAlign: "left",
    borderBottom: "1px solid var(--theme-elevation-200)",
    fontSize: "0.75rem",
    color: "var(--theme-elevation-600)",
  },
  tableCell: {
    padding: "0.55rem",
    borderBottom: "1px solid var(--theme-elevation-100)",
    fontSize: "0.85rem",
  },
  warning: {
    margin: "1rem 0 0",
    padding: "0.7rem",
    borderRadius: "8px",
    background: "var(--theme-warning-100, #fef3c7)",
    color: "var(--theme-warning-700, #92400e)",
  },
  error: {
    whiteSpace: "pre-wrap",
    margin: "1rem 0 0",
    padding: "0.7rem",
    borderRadius: "8px",
    background: "var(--theme-error-100, #fee2e2)",
    color: "var(--theme-error-700, #991b1b)",
    fontFamily: "inherit",
  },
  success: {
    margin: "1rem 0 0",
    padding: "0.7rem",
    borderRadius: "8px",
    background: "var(--theme-success-100, #dcfce7)",
    color: "var(--theme-success-700, #166534)",
    fontWeight: 700,
  },
};