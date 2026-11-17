"use client";

import { useAuth } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Images, Search, Trash2 } from "lucide-react";
import { isAdmin } from "@/access/roles";
import type { scanImages } from "@/lib/media/usage";
import styles from "./MediaUsagePanel.module.css";

type ImageUsage = Awaited<ReturnType<typeof scanImages>>[number];
const groups = { unused: "Kullanılmayan", history: "Yalnızca sürümlerde", current: "Kullanılan" };
const pageSize = 20;
const sizeLabel = (bytes: number) => bytes >= 1048576
  ? (bytes / 1048576).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + " MB"
  : Math.ceil(bytes / 1024) + " KB";

export function MediaUsagePanel() {
  const { user } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<ImageUsage[] | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<ImageUsage["status"]>("unused");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  if (!isAdmin(user)) return null;

  const filtered = (images || []).filter(image => image.status === filter && image.filename.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr").trim()));
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
  function resetSelection() {
    setPage(0); setSelected([]); setConfirming(false);
  }
  async function load() {
    const response = await fetch("/api/media-usage", { cache: "no-store" });
    if (!response.ok) throw Error("Kullanım bilgileri alınamadı. Oturumunuzu kontrol edip tekrar deneyin.");
    const data = await response.json();
    setImages(data.images);
    resetSelection();
  }
  async function scan() {
    setBusy(true); setOpen(true); setNotice("");
    try { await load(); }
    catch (err) { setNotice((err as Error).message); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setConfirming(false);
    let deleted = 0;
    let reason = "";
    try {
      for (const id of selected) {
        setNotice(`Siliniyor… ${deleted + 1} / ${selected.length}`);
        const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw Error(body.errors?.[0]?.message || "Silme işlemi tamamlanamadı.");
        }
        deleted++;
        setImages(current => current?.filter(image => image.id !== id) ?? null);
      }
    } catch (err) { reason = (err as Error).message; }
    try { await load(); }
    catch (err) { reason += " " + (err as Error).message; resetSelection(); }
    setNotice(`${deleted} görsel silindi. ${reason}`.trim());
    setBusy(false);
    if (deleted) router.refresh();
  }
  return (
    <section className={styles.panel} aria-label="Görsel kullanım denetimi">
      <div className={styles.heading}>
        <Images aria-hidden="true" size={24}/>
        <div><h2>Görsel kullanım denetimi</h2><p>Ürünlerde, site içeriğinde ve kayıtlı sürümlerde kullanılan görselleri kontrol edin.</p></div>
        <button type="button" disabled={busy} onClick={() => open ? setOpen(false) : void scan()}>{open ? "Kapat" : "Görselleri tara"}</button>
      </div>
      {open && <div className={styles.body} aria-busy={busy}>
        {images && <>
          <div className={styles.tools}>
            <div className={styles.filters}>{(Object.keys(groups) as Array<keyof typeof groups>).map(key =>
              <button key={key} type="button" disabled={busy} aria-pressed={filter === key} onClick={() => { setFilter(key); resetSelection(); }}>
                {groups[key]} <b>{images.filter(image => image.status === key).length}</b>
              </button>)}</div>
            <button type="button" disabled={busy} onClick={scan}>Yeniden tara</button>
          </div>
          <div className={styles.tools}>
            <label className={styles.search}><Search size={16}/><input aria-label="Dosya adında ara" placeholder="Dosya adında ara" value={search} disabled={busy} onChange={e => { setSearch(e.target.value); resetSelection(); }}/></label>
            {filter === "unused" && visible.length > 0 && <label>
              <input type="checkbox" disabled={busy || confirming} checked={visible.every(i => selected.includes(i.id))}
                onChange={e => setSelected(e.target.checked ? [...new Set([...selected, ...visible.map(i => i.id)])] : selected.filter(id => !visible.some(i => i.id === id)))}/> Bu sayfayı seç
            </label>}
          </div>
          {visible.length === 0 && <p>Bu filtreyle eşleşen görsel yok.</p>}
          <ul className={styles.list}>{visible.map(image => <li key={image.id}>
            {filter === "unused" && <input type="checkbox" disabled={busy || confirming} aria-label={image.filename + " seç"} checked={selected.includes(image.id)}
              onChange={e => setSelected(e.target.checked ? [...selected, image.id] : selected.filter(id => id !== image.id))}/>}
            <img loading="lazy" alt="" width="44" height="44" src={`/api/media/file/${encodeURIComponent(image.thumbnail)}`}/>
            <div className={styles.file}><a href={`/admin/collections/media/${image.id}`}>{image.filename}</a>
              <small>{new Date(image.createdAt).toLocaleDateString("tr-TR")} · {sizeLabel(image.bytes)}{image.sources.length > 0 && " · " + image.sources.join(", ")}</small>
            </div>
          </li>)}</ul>
          {filtered.length > pageSize && <div className={styles.pages}>
            <button type="button" disabled={busy || page === 0} onClick={() => setPage(page - 1)}>Önceki</button>
            <span>{page + 1} / {Math.ceil(filtered.length / pageSize)}</span>
            <button type="button" disabled={busy || (page + 1) * pageSize >= filtered.length} onClick={() => setPage(page + 1)}>Sonraki</button>
          </div>}
          {selected.length > 0 && <div className={styles.tools}>
            {confirming ? <><strong>{selected.length} görsel ve bu görsellerin boyutları kalıcı olarak silinsin mi?</strong>
              <button type="button" onClick={() => setConfirming(false)}>Vazgeç</button>
              <button type="button" className={styles.danger} onClick={remove}>Kalıcı olarak sil</button></> :
              <button type="button" className={styles.danger} disabled={busy} onClick={() => setConfirming(true)}><Trash2 size={15}/> Seçilenleri sil ({selected.length})</button>}
          </div>}
        </>}
        <div role="status">{notice || (busy ? "Görsel kullanımları kontrol ediliyor…" : "")}</div>
      </div>}
    </section>
  );
}