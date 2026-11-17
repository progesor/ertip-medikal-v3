import { notFound } from "next/navigation";
import Link from "next/link";
import { ArchiveRestore, ArrowLeft } from "lucide-react";
import type { AdminViewServerProps } from "payload";
import { isAdmin } from "@/access/roles";
import { BackupControls } from "./BackupControls";

export function BackupCenter({ initPageResult }: AdminViewServerProps) {
  if (!isAdmin(initPageResult.req.user)) notFound();
  return (
    <main className="ertip-review ertip-backup">
      <Link className="ertip-review-back" href="/admin">
        <ArrowLeft size={15} /> Ana sayfa
      </Link>
      <header className="ertip-module ertip-review-header">
        <ArchiveRestore size={25} aria-hidden="true" />
        <div>
          <h1>Yedekleme ve taşıma</h1>
          <p>Sitenin bir kopyasını saklayın veya kayıtlı bir yedeğe dönün.</p>
        </div>
      </header>
      <BackupControls />
      <details className="ertip-module ertip-backup-guide">
        <summary>Yeni sunucuya nasıl taşırım?</summary>
        <ol>
          <li>
            Kaynak sitede düzenlemeler tamamlandığında tam yedek alın ve
            indirin.
          </li>
          <li>
            Hedefte aynı uygulama sürümünü kurun. Yeni veritabanını, medya ve
            yedek disklerini bağlayın. Paketi açabilmek için kaynaktaki{" "}
            <code>PAYLOAD_SECRET</code> değerini kullanın.
          </li>
          <li>
            Hedef panelde <strong>Paket yükle</strong> ile dosyayı seçip geri
            yükleyin. Henüz yönetici hesabı yoksa sunucuda{" "}
            <code>pnpm backup restore /transfer/site.ertip --confirm</code>{" "}
            komutunu çalıştırın.
          </li>
          <li>
            Ürünleri, görselleri ve yönetici girişini kontrol ettikten sonra
            alan adını yeni sunucuya yönlendirin.
          </li>
        </ol>
      </details>
    </main>
  );
}
