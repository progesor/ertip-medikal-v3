"use client";

import React from "react";
import { useFormFields } from "@payloadcms/ui";
import { themePalettes, radiusConfig } from "@/lib/themeConfig";

type ThemePaletteKey = keyof typeof themePalettes;
type RadiusKey = keyof typeof radiusConfig;

const hsl = (value?: string, fallback = "0 0% 100%") => `hsl(${value || fallback})`;

const hslAlpha = (value?: string, alpha = 1, fallback = "0 0% 0%") =>
    `hsl(${value || fallback} / ${alpha})`;

const themeLabels: Record<string, string> = {
    "dark-luxury": "Dark Luxury",
    "medical-blue": "Medical Blue",
    "medical-aqua": "Medical Aqua",
    ocean: "Ocean Trust",
    emerald: "Medical Emerald",
    "clinical-mint": "Clinical Mint",
    "premium-navy": "Premium Navy",
    "surgical-teal": "Surgical Teal",
    ruby: "Ruby Premium",
};

const radiusLabels: Record<string, string> = {
    sharp: "Sharp / Keskin",
    modern: "Modern / Hafif Yuvarlak",
    bubbly: "Soft / Bubbly",
};

const tokenGroups = [
    {
        title: "Ana Renkler",
        tokens: [
            "--primary",
            "--primary-foreground",
            "--background",
            "--foreground",
        ],
    },
    {
        title: "Yüzeyler",
        tokens: [
            "--surface",
            "--surface-muted",
            "--card",
            "--card-foreground",
            "--popover",
            "--popover-foreground",
        ],
    },
    {
        title: "İkincil & Pasif Alanlar",
        tokens: [
            "--secondary",
            "--secondary-foreground",
            "--muted",
            "--muted-foreground",
            "--accent",
            "--accent-foreground",
        ],
    },
    {
        title: "Çizgi & Odak",
        tokens: [
            "--border",
            "--input",
            "--ring",
        ],
    },
    {
        title: "Durum Renkleri",
        tokens: [
            "--success",
            "--success-foreground",
            "--error",
            "--error-foreground",
            "--warning",
            "--warning-foreground",
            "--info",
            "--info-foreground",
            "--destructive",
            "--destructive-foreground",
        ],
    },
    {
        title: "Ters Yüzey",
        tokens: [
            "--surface-inverse",
            "--surface-inverse-foreground",
        ],
    },
    {
        title: "Metin",
        tokens: [
            "--text-main",
            "--text-muted",
        ],
    },
];

export default function ThemePreview() {
    const colorPaletteField = useFormFields(([fields]) => fields.colorPalette);
    const borderRadiusField = useFormFields(([fields]) => fields.borderRadius);

    const colorPalette = ((colorPaletteField?.value as string) || "dark-luxury") as ThemePaletteKey;
    const borderRadius = ((borderRadiusField?.value as string) || "modern") as RadiusKey;

    const currentTheme =
        themePalettes[colorPalette] || themePalettes["dark-luxury"];

    const currentRadius =
        radiusConfig[borderRadius] || radiusConfig.modern;

    const radius = currentRadius["--radius"];
    const radiusXl = currentRadius["--radius-xl"];
    const radius2xl = currentRadius["--radius-2xl"];
    const radius3xl = currentRadius["--radius-3xl"];

    const styles = {
        wrapper: {
            marginTop: "2rem",
            marginBottom: "1.5rem",
            fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        } as React.CSSProperties,

        titleRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
        } as React.CSSProperties,

        title: {
            margin: 0,
            fontWeight: 700,
            fontSize: "14px",
            color: "var(--theme-elevation-800)",
        } as React.CSSProperties,

        adminBadge: {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.45rem 0.75rem",
            borderRadius: "999px",
            backgroundColor: "var(--theme-elevation-100)",
            color: "var(--theme-elevation-800)",
            fontSize: "12px",
            fontWeight: 600,
        } as React.CSSProperties,

        previewShell: {
            maxWidth: "1080px",
            overflow: "hidden",
            backgroundColor: hsl(currentTheme["--background"]),
            color: hsl(currentTheme["--foreground"]),
            borderRadius: radius2xl,
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            boxShadow: `0 20px 45px -20px ${hslAlpha(currentTheme["--surface-inverse"], 0.25)}`,
            transition: "all 0.35s ease",
        } as React.CSSProperties,

        topBar: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 1.5rem",
            borderBottom: `1px solid ${hsl(currentTheme["--border"])}`,
            backgroundColor: hsl(currentTheme["--surface"]),
            flexWrap: "wrap",
        } as React.CSSProperties,

        brand: {
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            minWidth: 0,
        } as React.CSSProperties,

        logoMark: {
            width: "42px",
            height: "42px",
            borderRadius: radius,
            background: `linear-gradient(135deg, ${hsl(currentTheme["--primary"])} 0%, ${hsl(
                currentTheme["--accent"],
                currentTheme["--secondary"] || currentTheme["--primary"],
            )} 100%)`,
            boxShadow: `0 10px 22px -12px ${hslAlpha(currentTheme["--primary"], 0.7)}`,
        } as React.CSSProperties,

        brandName: {
            margin: 0,
            fontSize: "1rem",
            fontWeight: 800,
            color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]),
            lineHeight: 1.1,
        } as React.CSSProperties,

        brandSub: {
            margin: "0.2rem 0 0",
            fontSize: "0.78rem",
            color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
        } as React.CSSProperties,

        nav: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
        } as React.CSSProperties,

        navItem: {
            padding: "0.5rem 0.75rem",
            borderRadius: radius,
            backgroundColor: hsl(currentTheme["--surface-muted"], currentTheme["--muted"]),
            color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
            fontSize: "0.78rem",
            fontWeight: 700,
        } as React.CSSProperties,

        content: {
            padding: "1.5rem",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
            gap: "1.25rem",
        } as React.CSSProperties,

        hero: {
            padding: "2rem",
            borderRadius: radius2xl,
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            background: `linear-gradient(135deg, ${hsl(currentTheme["--surface"])} 0%, ${hsl(
                currentTheme["--surface-muted"],
                currentTheme["--muted"],
            )} 100%)`,
            minHeight: "320px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "1.5rem",
        } as React.CSSProperties,

        heroBadge: {
            display: "inline-flex",
            width: "fit-content",
            padding: "0.45rem 0.75rem",
            borderRadius: "999px",
            backgroundColor: hslAlpha(currentTheme["--primary"], 0.1),
            color: hsl(currentTheme["--primary"]),
            border: `1px solid ${hslAlpha(currentTheme["--primary"], 0.2)}`,
            fontSize: "0.78rem",
            fontWeight: 800,
        } as React.CSSProperties,

        heroTitle: {
            margin: "1rem 0 0",
            fontSize: "2rem",
            lineHeight: 1.08,
            letterSpacing: 0,
            color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]),
            fontWeight: 850,
        } as React.CSSProperties,

        heroText: {
            maxWidth: "580px",
            margin: "1rem 0 0",
            color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
            lineHeight: 1.65,
            fontSize: "0.95rem",
        } as React.CSSProperties,

        buttonRow: {
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginTop: "1.5rem",
        } as React.CSSProperties,

        primaryButton: {
            border: "none",
            borderRadius: radius,
            backgroundColor: hsl(currentTheme["--primary"]),
            color: hsl(currentTheme["--primary-foreground"]),
            padding: "0.85rem 1.2rem",
            fontSize: "0.88rem",
            fontWeight: 800,
            cursor: "default",
            boxShadow: `0 12px 24px -14px ${hslAlpha(currentTheme["--primary"], 0.85)}`,
        } as React.CSSProperties,

        secondaryButton: {
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            borderRadius: radius,
            backgroundColor: hsl(currentTheme["--secondary"], currentTheme["--surface-muted"]),
            color: hsl(currentTheme["--secondary-foreground"], currentTheme["--foreground"]),
            padding: "0.85rem 1.2rem",
            fontSize: "0.88rem",
            fontWeight: 800,
            cursor: "default",
        } as React.CSSProperties,

        outlineButton: {
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            borderRadius: radius,
            backgroundColor: "transparent",
            color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]),
            padding: "0.85rem 1.2rem",
            fontSize: "0.88rem",
            fontWeight: 800,
            cursor: "default",
        } as React.CSSProperties,

        miniStats: {
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "0.75rem",
        } as React.CSSProperties,

        statCard: {
            padding: "1rem",
            borderRadius: radiusXl,
            backgroundColor: hsl(currentTheme["--surface"]),
            border: `1px solid ${hsl(currentTheme["--border"])}`,
        } as React.CSSProperties,

        statValue: {
            color: hsl(currentTheme["--primary"]),
            fontWeight: 850,
            fontSize: "1.1rem",
            margin: 0,
        } as React.CSSProperties,

        statLabel: {
            color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
            fontSize: "0.75rem",
            margin: "0.25rem 0 0",
        } as React.CSSProperties,

        sideColumn: {
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
        } as React.CSSProperties,

        panel: {
            padding: "1.25rem",
            borderRadius: radiusXl,
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            backgroundColor: hsl(currentTheme["--surface"]),
        } as React.CSSProperties,

        panelTitle: {
            margin: "0 0 0.75rem",
            fontSize: "0.95rem",
            fontWeight: 850,
            color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]),
        } as React.CSSProperties,

        productImage: {
            height: "120px",
            borderRadius: radius,
            background: `radial-gradient(circle at 30% 20%, ${hslAlpha(
                currentTheme["--primary"],
                0.25,
            )}, transparent 35%), linear-gradient(135deg, ${hsl(
                currentTheme["--muted"],
            )}, ${hsl(currentTheme["--secondary"], currentTheme["--muted"])})`,
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            marginBottom: "1rem",
        } as React.CSSProperties,

        productTitle: {
            margin: "0 0 0.4rem",
            fontSize: "1rem",
            fontWeight: 850,
            color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]),
        } as React.CSSProperties,

        productText: {
            margin: 0,
            color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
            fontSize: "0.82rem",
            lineHeight: 1.55,
        } as React.CSSProperties,

        input: {
            width: "100%",
            boxSizing: "border-box",
            borderRadius: radius,
            border: `1px solid ${hsl(currentTheme["--input"], currentTheme["--border"])}`,
            backgroundColor: hsl(currentTheme["--background"]),
            color: hsl(currentTheme["--foreground"]),
            padding: "0.8rem 0.9rem",
            outline: `3px solid ${hslAlpha(currentTheme["--ring"], 0.16)}`,
            fontSize: "0.85rem",
        } as React.CSSProperties,

        statusGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.6rem",
            marginTop: "0.8rem",
        } as React.CSSProperties,

        statusBadgePrimary: {
            padding: "0.6rem",
            borderRadius: radius,
            backgroundColor: hslAlpha(currentTheme["--primary"], 0.1),
            color: hsl(currentTheme["--primary"]),
            border: `1px solid ${hslAlpha(currentTheme["--primary"], 0.18)}`,
            fontSize: "0.72rem",
            fontWeight: 800,
            textAlign: "center",
        } as React.CSSProperties,

        statusAlert: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.7rem 0.75rem",
            borderRadius: radius,
            fontSize: "0.76rem",
            fontWeight: 800,
        } as React.CSSProperties,

        richPreview: {
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: radius,
            backgroundColor: hsl(currentTheme["--background"]),
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
            fontSize: "0.82rem",
            lineHeight: 1.65,
        } as React.CSSProperties,

        inversePanel: {
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: radiusXl,
            backgroundColor: hsl(currentTheme["--surface-inverse"]),
            color: hsl(currentTheme["--surface-inverse-foreground"]),
        } as React.CSSProperties,

        statusBadgeSecondary: {
            padding: "0.6rem",
            borderRadius: radius,
            backgroundColor: hsl(currentTheme["--secondary"], currentTheme["--muted"]),
            color: hsl(currentTheme["--secondary-foreground"], currentTheme["--foreground"]),
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            fontSize: "0.72rem",
            fontWeight: 800,
            textAlign: "center",
        } as React.CSSProperties,

        lowerArea: {
            padding: "0 1.5rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 0.7fr)",
            gap: "1.25rem",
        } as React.CSSProperties,

        radiusGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "0.75rem",
        } as React.CSSProperties,

        radiusBoxBase: {
            minHeight: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: hsl(currentTheme["--surface-muted"], currentTheme["--muted"]),
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
            fontSize: "0.7rem",
            fontWeight: 800,
            textAlign: "center",
            padding: "0.5rem",
        } as React.CSSProperties,

        tokenGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "1rem",
        } as React.CSSProperties,

        tokenGroup: {
            borderRadius: radiusXl,
            border: `1px solid ${hsl(currentTheme["--border"])}`,
            overflow: "hidden",
            backgroundColor: hsl(currentTheme["--surface"]),
        } as React.CSSProperties,

        tokenGroupTitle: {
            padding: "0.75rem 0.9rem",
            backgroundColor: hsl(currentTheme["--surface-muted"], currentTheme["--muted"]),
            color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]),
            fontSize: "0.78rem",
            fontWeight: 850,
            borderBottom: `1px solid ${hsl(currentTheme["--border"])}`,
        } as React.CSSProperties,

        tokenRow: {
            display: "grid",
            gridTemplateColumns: "32px minmax(0, 1fr)",
            gap: "0.65rem",
            alignItems: "center",
            padding: "0.55rem 0.9rem",
            borderBottom: `1px solid ${hslAlpha(currentTheme["--border"], 0.6)}`,
        } as React.CSSProperties,

        tokenSwatch: {
            width: "32px",
            height: "32px",
            borderRadius: radius,
            border: `1px solid ${hsl(currentTheme["--border"])}`,
        } as React.CSSProperties,

        tokenName: {
            margin: 0,
            color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]),
            fontSize: "0.72rem",
            fontWeight: 800,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        } as React.CSSProperties,

        tokenValue: {
            margin: "0.15rem 0 0",
            color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
            fontSize: "0.68rem",
            fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        } as React.CSSProperties,
    };

    const statusItems = [
        { label: "Başarılı", token: "--success" },
        { label: "Hata", token: "--error" },
        { label: "Uyarı", token: "--warning" },
        { label: "Bilgi", token: "--info" },
    ] as const;

    return (
        <div style={styles.wrapper}>
            <div style={styles.titleRow}>
                <h4 style={styles.title}>Canlı Tema Önizlemesi</h4>

                <div style={styles.adminBadge}>
                    <span>{themeLabels[colorPalette] || colorPalette}</span>
                    <span>•</span>
                    <span>{radiusLabels[borderRadius] || borderRadius}</span>
                </div>
            </div>

            <div style={styles.previewShell}>
                <div style={styles.topBar}>
                    <div style={styles.brand}>
                        <div style={styles.logoMark} />
                        <div>
                            <p style={styles.brandName}>Ertıp Medikal</p>
                            <p style={styles.brandSub}>Hair Transplant & Medical Instruments</p>
                        </div>
                    </div>

                    <div style={styles.nav}>
                        <span style={styles.navItem}>Ürünler</span>
                        <span style={styles.navItem}>Sertifikalar</span>
                        <span style={styles.navItem}>İletişim</span>
                    </div>
                </div>

                <div style={styles.content}>
                    <section style={styles.hero}>
                        <div>
                            <span style={styles.heroBadge}>Medikal Tema Önizlemesi</span>

                            <h2 style={styles.heroTitle}>
                                Klinik güven, modern tasarım ve kurumsal medikal görünüm.
                            </h2>

                            <p style={styles.heroText}>
                                Bu alan; arka plan, ana metin, muted metin, primary renk,
                                secondary renk, border, surface ve radius değerlerinin gerçek
                                sayfa düzeninde nasıl görüneceğini test eder.
                            </p>

                            <div style={styles.buttonRow}>
                                <button type="button" style={styles.primaryButton}>
                                    Ürünü İncele
                                </button>

                                <button type="button" style={styles.secondaryButton}>
                                    Katalog İste
                                </button>

                                <button type="button" style={styles.outlineButton}>
                                    İletişime Geç
                                </button>
                            </div>
                        </div>

                        <div style={styles.miniStats}>
                            <div style={styles.statCard}>
                                <p style={styles.statValue}>CE</p>
                                <p style={styles.statLabel}>Sertifikalı ürün yapısı</p>
                            </div>

                            <div style={styles.statCard}>
                                <p style={styles.statValue}>2A</p>
                                <p style={styles.statLabel}>Medikal sınıf algısı</p>
                            </div>

                            <div style={styles.statCard}>
                                <p style={styles.statValue}>ISO</p>
                                <p style={styles.statLabel}>Kurumsal güven hissi</p>
                            </div>
                        </div>
                    </section>

                    <aside style={styles.sideColumn}>
                        <div style={styles.panel}>
                            <div style={styles.productImage} />

                            <h3 style={styles.productTitle}>Serrated FUE Punch</h3>

                            <p style={styles.productText}>
                                Ürün kartlarında surface, border, primary, muted ve text
                                renklerinin uyumunu test etmek için örnek kart.
                            </p>

                            <div style={{ ...styles.buttonRow, marginTop: "1rem" }}>
                                <button type="button" style={styles.primaryButton}>
                                    Detay
                                </button>
                            </div>
                        </div>

                        <div style={styles.panel}>
                            <h3 style={styles.panelTitle}>Form / Input Testi</h3>

                            <input
                                readOnly
                                value="info@ertipmedical.com"
                                style={styles.input}
                            />

                            <div style={styles.statusGrid}>
                                <div style={styles.statusBadgePrimary}>Primary Badge</div>
                                <div style={styles.statusBadgeSecondary}>Secondary Badge</div>
                            </div>

                            <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.85rem" }}>
                                {statusItems.map((item) => (
                                    <div
                                        key={item.token}
                                        style={{
                                            ...styles.statusAlert,
                                            backgroundColor: hslAlpha(currentTheme[item.token], 0.1),
                                            color: hsl(currentTheme[item.token]),
                                            border: `1px solid ${hslAlpha(currentTheme[item.token], 0.22)}`,
                                        }}
                                    >
                                        <span>{item.label}</span>
                                        <span
                                            style={{
                                                width: "0.65rem",
                                                height: "0.65rem",
                                                borderRadius: "999px",
                                                backgroundColor: hsl(currentTheme[item.token]),
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                <div style={styles.lowerArea}>
                    <section style={styles.panel}>
                        <h3 style={styles.panelTitle}>Border Radius Testi</h3>

                        <div style={styles.radiusGrid}>
                            <div style={{ ...styles.radiusBoxBase, borderRadius: radius }}>
                                --radius
                                <br />
                                {radius}
                            </div>

                            <div style={{ ...styles.radiusBoxBase, borderRadius: radiusXl }}>
                                --radius-xl
                                <br />
                                {radiusXl}
                            </div>

                            <div style={{ ...styles.radiusBoxBase, borderRadius: radius2xl }}>
                                --radius-2xl
                                <br />
                                {radius2xl}
                            </div>

                            <div style={{ ...styles.radiusBoxBase, borderRadius: radius3xl }}>
                                --radius-3xl
                                <br />
                                {radius3xl}
                            </div>
                        </div>
                    </section>

                    <section style={styles.panel}>
                        <h3 style={styles.panelTitle}>Tema Özeti</h3>

                        <div
                            style={{
                                display: "grid",
                                gap: "0.6rem",
                                color: hsl(currentTheme["--text-muted"], currentTheme["--muted-foreground"]),
                                fontSize: "0.82rem",
                                lineHeight: 1.5,
                            }}
                        >
                            <div>
                                <strong style={{ color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]) }}>
                                    Seçili tema:
                                </strong>{" "}
                                {themeLabels[colorPalette] || colorPalette}
                            </div>

                            <div>
                                <strong style={{ color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]) }}>
                                    Seçili radius:
                                </strong>{" "}
                                {radiusLabels[borderRadius] || borderRadius}
                            </div>

                            <div>
                                <strong style={{ color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]) }}>
                                    Primary:
                                </strong>{" "}
                                {currentTheme["--primary"]}
                            </div>

                            <div>
                                <strong style={{ color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]) }}>
                                    Background:
                                </strong>{" "}
                                {currentTheme["--background"]}
                            </div>
                        </div>

                        <div style={styles.richPreview}>
                            <strong style={{ color: hsl(currentTheme["--text-main"], currentTheme["--foreground"]) }}>
                                Rich text:
                            </strong>{" "}
                            Başlıklar, paragraflar, bağlantılar ve listeler muted/text-main
                            tokenlarıyla okunabilir kalmalıdır.{" "}
                            <span style={{ color: hsl(currentTheme["--primary"]), fontWeight: 800 }}>
                                Link rengi
                            </span>{" "}
                            primary tokenını takip eder.
                        </div>

                        <div style={styles.inversePanel}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 850, marginBottom: "0.35rem" }}>
                                Footer / Inverse Section
                            </div>
                            <div style={{ fontSize: "0.78rem", lineHeight: 1.5, opacity: 0.78 }}>
                                surface-inverse ve surface-inverse-foreground tokenları koyu
                                bantlar, footer ve modal overlay algısını test eder.
                            </div>
                        </div>
                    </section>
                </div>

                <div style={{ padding: "0 1.5rem 1.5rem" }}>
                    <section style={styles.panel}>
                        <h3 style={styles.panelTitle}>Renk Token Önizlemesi</h3>

                        <div style={styles.tokenGrid}>
                            {tokenGroups.map((group) => (
                                <div key={group.title} style={styles.tokenGroup}>
                                    <div style={styles.tokenGroupTitle}>{group.title}</div>

                                    {group.tokens.map((token) => {
                                        const value = currentTheme[token as keyof typeof currentTheme];

                                        return (
                                            <div key={token} style={styles.tokenRow}>
                                                <div
                                                    style={{
                                                        ...styles.tokenSwatch,
                                                        backgroundColor: hsl(value),
                                                    }}
                                                />

                                                <div style={{ minWidth: 0 }}>
                                                    <p style={styles.tokenName}>{token}</p>
                                                    <p style={styles.tokenValue}>{value || "Tanımlı değil"}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
