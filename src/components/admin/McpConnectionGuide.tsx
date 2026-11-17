import {
  BookOpen,
  Boxes,
  ChartColumn,
  ChevronDown,
  PanelsTopLeft,
} from "lucide-react";
import type { ServerProps } from "payload";

const capabilities = [
  {
    icon: Boxes,
    title: "Katalog ve medya",
    description:
      "Ürünleri kodla bulun, varyantları kontrol edin ve görsel ekleyin.",
  },
  {
    icon: BookOpen,
    title: "İçerik ve çeviri",
    description:
      "Sayfaları ve haberleri düzenleyin, ürün metinlerini iki dilde kontrol edin.",
  },
  {
    icon: PanelsTopLeft,
    title: "Site yönetimi",
    description: "Ana menüyü, site ayarlarını ve temayı yönetin.",
  },
  {
    icon: ChartColumn,
    title: "Raporlar",
    description:
      "İçerik sayılarını ve durumlarına göre bekleyen talepleri görün.",
  },
];

export function McpConnectionGuide({ payload }: ServerProps) {
  const endpoint = new URL(
    `${payload.config.routes.api}/mcp`,
    payload.config.serverURL,
  ).href;
  return (
    <section
      className="ertip-module ertip-mcp"
      aria-label="MCP kullanım alanları"
    >
      <ul>
        {capabilities.map(({ title, description, icon: Icon }) => (
          <li key={title}>
            <Icon size={20} aria-hidden="true" />
            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ul>
      <details>
        <summary>
          Bir uygulama nasıl bağlanır?{" "}
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <ol>
          <li>
            Yeni bir MCP bağlantısı oluşturun. Uygulamaya bir ad verin ve
            kullanacağı işlemleri seçin.
          </li>
          <li>
            API anahtarını etkinleştirip kaydedin. Anahtarı istemcinizin gizli
            anahtar alanına kopyalayın.
          </li>
          <li>
            İstemcide Streamable HTTP bağlantısını seçin. Sunucu adresi{" "}
            <code>{endpoint}</code>, kimlik doğrulama başlığı{" "}
            <code>Authorization: Bearer &lt;anahtar&gt;</code>.
          </li>
          <li>
            Bağlantıyı açın. İzinleri değiştirdiğinizde istemcinin araç
            listesini yenileyin.
          </li>
        </ol>
      </details>
    </section>
  );
}
