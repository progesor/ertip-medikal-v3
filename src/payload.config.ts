import { buildConfig, type CollectionConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";

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
import { Subscribers } from "@/collections/Subscribers";

import { SiteSettings } from "@/globals/SiteSettings";
import { MainMenu } from "@/globals/MainMenu";
import { EmailSettings } from "@/globals/EmailSettings";
import { ThemeSettings } from "@/globals/ThemeSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const ProductsWithProtectedPublicApi: CollectionConfig = {
  ...Products,
  access: {
    ...Products.access,
    // The website uses Payload's server-side Local API. Anonymous REST/GraphQL
    // reads stay closed until protected fields have dedicated field access.
    read: ({ req }) => Boolean(req.user),
  },
};

export default buildConfig({
  admin: {
    user: Users.slug,
    dateFormat: "dd.MM.yyyy HH:mm",
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ["/components/admin/AdminDashboard#default"],
      afterNavLinks: ["/components/admin/AdminBrand#AdminNavFooter"],
      graphics: {
        Icon: "/components/admin/AdminBrand#AdminIcon",
        Logo: "/components/admin/AdminBrand#AdminLogo",
      },
    },
  },
  collections: [
    Users,
    Media,
    ProductsWithProtectedPublicApi,
    Categories,
    Inquiries,
    News,
    Pages,
    NewsCategories,
    QuoteRequests,
    DownloadLogs,
    Subscribers,
  ],
  globals: [SiteSettings, MainMenu, EmailSettings, ThemeSettings],
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
  email: nodemailerAdapter({
    defaultFromName: process.env.SMTP_FROM_NAME || "Ertıp Medikal",
    defaultFromAddress:
      process.env.SMTP_FROM_ADDRESS || "iletisim@ertip.com.tr",
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
});
