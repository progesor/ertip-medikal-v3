import type { MCPPluginConfig } from "@payloadcms/plugin-mcp";
import { UnauthorizedError } from "payload";
import { z } from "zod";
import { adminsOnly } from "@/access/roles";
import { portalTools } from "./portalTools";

const editable = {
  enabled: { find: true, create: true, update: true, delete: false },
};
const settings = { enabled: { find: true, update: true } };
const sectionNames: Record<string, string> = {
  products: "Ürünler",
  categories: "Ürün kategorileri",
  pages: "Sayfalar",
  news: "Haberler",
  newsCategories: "Haber kategorileri",
  media: "Medya",
  mainMenu: "Ana menü",
  siteSettings: "Site ayarları",
  themeSettings: "Tema ayarları",
  "payload-mcp-tool": "Özel araçlar",
  "payload-mcp-resource": "Başvuru kaynakları",
  "payload-mcp-prompt": "Çalışma şablonları",
};
const actionNames: Record<string, string> = {
  find: "Görüntüleme",
  create: "Oluşturma",
  update: "Düzenleme",
  uploadProductImage: "Ürün görseli yükleme",
  findCatalogItem: "Katalog koduyla arama",
  listProductContentIssues: "Eksik ürün listesini görüntüleme",
  reviewProductContent: "İki dilde ürün kontrolü",
  getContentOverview: "İçerik sayıları",
  getInboxSummary: "Talep ve mesaj özeti",
  editorialGuide: "İçerik rehberi",
  translateProduct: "Ürün çevirisi hazırlama",
};

export const portalMcp: MCPPluginConfig = {
  userCollection: "users",
  collections: {
    products: editable,
    categories: editable,
    news: editable,
    "news-categories": editable,
    pages: editable,
    media: {
      enabled: { find: true, update: true, create: false, delete: false },
    },
  },
  globals: {
    "main-menu": settings,
    "site-settings": settings,
    themeSettings: settings,
  },
  overrideAuth: async (_req, resolve) => {
    const access = await resolve();
    if (access.enableAPIKey !== true) throw new UnauthorizedError();
    return access;
  },
  mcp: {
    serverOptions: {
      serverInfo: { name: "ertip-medikal", version: "2.0.0" },
      instructions:
        "Bu bağlantıda sunulan araçları tools/list ile keşfedin. İçerik işlemlerinde hedef dili belirtin.",
    },
    tools: portalTools,
    resources: [
      {
        name: "editorialGuide",
        title: "İçerik rehberi",
        uri: "ertip://portal/icerik-rehberi",
        mimeType: "text/plain",
        description:
          "Portalın içerik dilleri, katalog alanları ve sayfa türleri.",
        handler: (uri: URL) => ({
          contents: [
            {
              uri: uri.href,
              text: [
                "Portalın içerik dilleri Türkçe (tr) ve İngilizcedir (en). Çeviri kontrolünde diğer dilden yedek içerik kullanmayın.",
                "Ürün ve varyant kodları sku alanında tutulur. Katalog koduyla arama için findCatalogItem aracını kullanabilirsiniz.",
                "Ürün açıklamalarında title, shortDescription ve description alanlarını kontrol edin. mainImage medya kaydına bağlanır.",
                "Ürün ve varyant görselleri ortak medya kütüphanesinden seçilir. uploadProductImage medya kimliğini döndürür.",
                "İçerik sayfaları pages koleksiyonundadır. /urunler ve /teklif-sepeti uygulamanın sabit sayfalarıdır.",
              ].join("\n"),
            },
          ],
        }),
      },
    ],
    prompts: [
      {
        name: "translateProduct",
        title: "Ürün çevirisi hazırla",
        description:
          "Seçili ürün için teknik değerleri koruyan bir çeviri taslağı hazırlar.",
        argsSchema: {
          productId: z.string().regex(/^\d+$/),
          targetLocale: z.enum(["tr", "en"]),
        },
        handler: ({ productId, targetLocale }) => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Ürün ${productId} için hedef dil ${targetLocale}. Diğer dildeki ürün kaydını oku. Başlık, kısa açıklama ve açıklama için çeviri öner. SKU, ölçü, birim ve model adlarını koru. Kaynakta bulunmayan tıbbi iddialar ekleme. Öneriyi alanlara göre sun.`,
              },
            },
          ],
        }),
      },
    ],
  },
  overrideApiKeyCollection: (collection) => {
    const names: Record<string, string> = {
      user: "Bağlı kullanıcı",
      label: "Bağlantı adı",
      description: "Kullanım amacı",
    };
    for (const field of collection.fields) {
      if (
        (field.type === "text" || field.type === "relationship") &&
        names[field.name]
      ) {
        field.label = names[field.name];
        field.admin = { ...field.admin, description: undefined };
      }
      if (field.type !== "collapsible") continue;
      for (const group of field.fields) {
        if (
          group.type !== "group" ||
          !("name" in group) ||
          !sectionNames[group.name]
        )
          continue;
        field.label = sectionNames[group.name];
        field.admin = {
          ...field.admin,
          initCollapsed: true,
          description: undefined,
        };
        delete field.admin.position;
        group.label = false;
        for (const option of group.fields) {
          if (option.type !== "checkbox") continue;
          option.defaultValue = false;
          option.label = actionNames[option.name] ?? option.label;
          option.admin = { ...option.admin, description: undefined };
        }
      }
    }
    return {
      ...collection,
      access: {
        ...collection.access,
        create: adminsOnly,
        read: adminsOnly,
        update: adminsOnly,
        delete: adminsOnly,
      },
      labels: { singular: "MCP bağlantısı", plural: "MCP bağlantıları" },
      admin: {
        ...collection.admin,
        group: "Entegrasyonlar",
        defaultColumns: ["label", "user", "updatedAt"],
        description:
          "Uygulamaların hangi içeriklere erişebileceğini her bağlantı için ayrı seçin.",
        components: {
          ...collection.admin?.components,
          Description:
            "/components/admin/McpConnectionGuide#McpConnectionGuide",
          beforeListTable: [
            ...(collection.admin?.components?.beforeListTable ?? []),
            "/components/admin/CollectionViewControls#CollectionViewControls",
          ],
        },
      },
    };
  },
};
