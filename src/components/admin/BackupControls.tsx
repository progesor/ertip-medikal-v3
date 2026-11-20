"use client";

import {
  ArchiveDeleteButton,
  deleteArchive,
} from "@/components/admin/ArchiveDeleteButton";

import { useCallback, useEffect, useRef, useState } from "react";
import { backupAction, uploadBackup } from "@/lib/backup/uploadClient";
import { Archive, Database, Images, Download, Upload } from "lucide-react";

const scopes = {
  full: {
    label: "Tam yedek",
    detail:
      "Tüm kayıtlar ve medya dosyaları. Siteyi yeni sunucuya taşımak için seçin.",
    icon: Archive,
  },
  sql: {
    label: "Veritabanı (SQL)",
    detail: "Ürünler, kullanıcılar, talepler ve site ayarları.",
    icon: Database,
  },
  media: {
    label: "Medya dosyaları",
    detail: "Yüklenen görseller, belgeler ve oluşturulan görsel boyutları.",
    icon: Images,
  },
};
type Kind = keyof typeof scopes;
type Item = {
  id: string;
  kind?: Kind;
  action: "import" | "restore" | "create";
  date: string;
  size?: number;
  status: "running" | "done" | "failed";
  message?: string;
};
const api = "/api/site-backups";
const button = "ertip-module__button";
const dateLabel = (date: string) =>
  new Date(date).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
const sizeLabel = (size: number) =>
  size < 1024 ** 2
    ? Math.ceil(size / 1024) + " KB"
    : (size / 1024 ** 2).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) +
      " MB";
const activity = {
  create: "Yedek oluşturma",
  import: "Paket doğrulama",
  restore: "Geri yükleme",
};
export function BackupControls() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const refresh = useCallback(async () => {
    const response = await fetch(api, { cache: "no-store" });
    if (!response.ok)
      throw Error(
        response.status === 401
          ? "Oturumu yenilemek için yeniden giriş yapın."
          : "Yedek listesi alınamadı.",
      );
    setItems(await response.json());
  }, []);
  useEffect(() => {
    const load = () => refresh().catch((e) => setError(e.message));
    void load();
    const interval = setInterval(load, 3500);
    return () => clearInterval(interval);
  }, [refresh]);
  async function submit(body: File | object) {
    setSending(true);
    setError("");
    try {
      if (body instanceof File) {
        setProgress(0);
        await uploadBackup(body, setProgress);
      } else {
        await backupAction(body);
      }
      setSelected(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bağlantıyı kontrol edin.");
    } finally {
      setProgress(null);
      setSending(false);
      if (input.current) input.current.value = "";
    }
  }
  const busy =
    sending || items === null || items.some((i) => i.status === "running");
  return (
    <>
      <section aria-label="Yedek oluştur" className="ertip-backup-grid">
        {(Object.keys(scopes) as Kind[]).map((kind) => {
          const { label, detail, icon: Icon } = scopes[kind];
          return (
            <article className="ertip-module" key={kind}>
              <Icon aria-hidden="true" size={22} />
              <h2>{label}</h2>
              <p>{detail}</p>
              <button
                className={button}
                disabled={busy}
                onClick={() => submit({ action: "create", kind })}
                aria-label={label + " oluştur"}
              >
                Yedek oluştur
              </button>
            </article>
          );
        })}
      </section>
      <section className="ertip-module">
        <div className="ertip-backup-heading">
          <div>
            <h2>Kayıtlı yedekler</h2>
            <p>
              Buradan indirdiğiniz paketi başka bir sunucuda da açabilirsiniz.
            </p>
          </div>
          <input
            ref={input}
            type="file"
            hidden
            accept=".ertip"
            aria-label="Yedek paketi seçin"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void submit(f);
            }}
          />
          <button
            className={button}
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            <Upload size={16} /> Paket yükle
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="ertip-module__notice ertip-module__notice--error"
          >
            {error}
          </p>
        )}
        {sending && (
          <p role="status">
            {progress === null
              ? "İstek iletiliyor…"
              : progress === 100
                ? "Paket doğrulamaya alınıyor…"
                : "Paket yükleniyor · %" + progress}
          </p>
        )}
        {selected?.kind && (
          <div
            role="alert"
            className="ertip-module__notice ertip-module__notice--warning"
          >
            <h3>{scopes[selected.kind].label} geri yüklensin mi?</h3>
            <p>
              {dateLabel(selected.date)} tarihli paket,{" "}
              {selected.kind === "sql"
                ? "mevcut veritabanının"
                : selected.kind === "media"
                  ? "mevcut medya dosyalarının"
                  : "mevcut veritabanının ve medya dosyalarının"}{" "}
              yerini alacak. İşlem sırasında site kısa süreliğine kapanır.
            </p>
            <div className="ertip-backup-actions">
              <button className={button} onClick={() => setSelected(null)}>
                Vazgeç
              </button>
              <button
                className={button}
                disabled={busy}
                onClick={() =>
                  submit({ action: "restore", id: selected.id, confirm: true })
                }
              >
                Onayla ve geri yükle
              </button>
            </div>
          </div>
        )}
        {items === null ? (
          <p role="status">Yedekler yükleniyor…</p>
        ) : items.length === 0 ? (
          <p>Henüz yedek yok.</p>
        ) : (
          <ul className="ertip-backup-list">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>
                    {item.kind ? scopes[item.kind].label : "Yedek paketi"}
                  </strong>
                  <p>
                    {dateLabel(item.date)}
                    {item.size !== undefined && " · " + sizeLabel(item.size)}
                  </p>
                  {item.status !== "done" || item.action !== "create" ? (
                    <p role="status">
                      {activity[item.action]} ·{" "}
                      {item.status === "running"
                        ? "Devam ediyor…"
                        : item.status === "failed"
                          ? item.message
                          : "Tamamlandı"}
                    </p>
                  ) : null}
                </div>
                <div className="ertip-backup-actions">
                  {item.status === "done" && item.action !== "restore" && (
                    <>
                      <a
                        className={button}
                        href={api + "?download=" + item.id}
                        download
                      >
                        <Download size={16} /> İndir
                      </a>
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() => setSelected(item)}
                      >
                        Geri yükle
                      </button>
                    </>
                  )}
                  <ArchiveDeleteButton
                    label={
                      (item.kind ? scopes[item.kind].label : "Yedek kaydı") +
                      " · " +
                      dateLabel(item.date)
                    }
                    disabled={busy}
                    onDelete={async () => {
                      setSending(true);
                      try {
                        await deleteArchive(api, "x-ertip-backup", item.id);
                        setItems(
                          (current) =>
                            current?.filter(
                              (record) => record.id !== item.id,
                            ) || [],
                        );
                        setSelected((current) =>
                          current?.id === item.id ? null : current,
                        );
                      } finally {
                        setSending(false);
                      }
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
