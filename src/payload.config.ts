import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

// Koleksiyon Importları
import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Products } from "@/collections/Products";
import { Categories } from "@/collections/Categories";
import { Inquiries } from "@/collections/Inquiries";
import { News } from "@/collections/News";
import { Pages } from "@/collections/Pages";
import { NewsCategories } from "@/collections/NewsCategories";
import { QuoteRequests } from "@/collections/QuoteRequests";
import { DownloadLogs } from "@/collections/DownloadLogs";

// Global Importları
import { SiteSettings } from "@/globals/SiteSettings";
import { MainMenu } from "@/globals/MainMenu";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    avatar: "default",
    dateFormat: "dd.MM.yyyy HH:mm",
    meta: {
      titleSuffix: "- Ertip Medikal Admin",
    },
    theme: "all",
    components: {
      actions: [
        "/components/admin/AdminSurfaceEnhancer#AdminSurfaceEnhancer",
        "/components/admin/ErtipAdminBrand#AdminHeaderBadge",
      ],
      beforeDashboard: [
        "/components/admin/ErtipAdminBrand#AdminDashboardIntro",
      ],
      beforeLogin: ["/components/admin/ErtipAdminBrand#AdminLoginIntro"],
      beforeNavLinks: ["/components/admin/ErtipAdminBrand#AdminNavIntro"],
      graphics: {
        Icon: "/components/admin/ErtipAdminBrand#AdminIcon",
        Logo: "/components/admin/ErtipAdminBrand#AdminLogo",
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // Yeni koleksiyonları buraya ekledik
  collections: [
    Products,
    Categories,
    Pages,
    Media,
    News,
    NewsCategories,
    Inquiries,
    QuoteRequests,
    DownloadLogs,
    Users,
  ],
  // Globals dizisini buraya ekledik
  globals: [MainMenu, SiteSettings],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "SECRET_KEY_MISSING",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
});
