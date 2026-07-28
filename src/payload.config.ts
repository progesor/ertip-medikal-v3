import {
  buildConfig,
  type CollectionConfig,
  type GlobalConfig,
} from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";

import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Products } from "@/collections/ProductsWithSkuEngine";
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
import { ImageOptimizationSettings } from "@/globals/ImageOptimizationSettings";
import { invalidateProtectedMediaCache } from "@/lib/security/protectedMedia";
import { imageOptimizationEndpoints } from "@/lib/imageOptimization/endpoints";
import { serverEnv } from "@/lib/config/env";
import {
  adminsOnly,
  contentManagers,
} from "@/access/roles";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function withContentAccess(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    access: {
      ...collection.access,
      create: contentManagers,
      read: contentManagers,
      update: contentManagers,
      delete: adminsOnly,
    },
  };
}

function withAdminAccess(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    access: {
      ...collection.access,
      create: adminsOnly,
      read: adminsOnly,
      update: adminsOnly,
      delete: adminsOnly,
    },
  };
}

function withGlobalUpdateAccess(
  global: GlobalConfig,
  update: typeof adminsOnly | typeof contentManagers,
): GlobalConfig {
  return {
    ...global,
    access: {
      ...global.access,
      update,
    },
  };
}

const MediaWithRBAC: CollectionConfig = {
  ...Media,
  access: {
    ...Media.access,
    create: contentManagers,
    update: contentManagers,
    delete: adminsOnly,
  },
};

const ProductsWithProtectedPublicApi: CollectionConfig = {
  ...Products,
  access: {
    ...Products.access,
    create: contentManagers,
    // The website uses Payload's server-side Local API. Anonymous REST/GraphQL
    // reads stay closed until protected fields have dedicated field access.
    read: ({ req }) => Boolean(req.user),
    update: contentManagers,
    delete: adminsOnly,
  },
  hooks: {
    ...Products.hooks,
    afterChange: [
      ...(Products.hooks?.afterChange ?? []),
      ({ doc }) => {
        invalidateProtectedMediaCache();
        return doc;
      },
    ],
    afterDelete: [
      ...(Products.hooks?.afterDelete ?? []),
      ({ doc }) => {
        invalidateProtectedMediaCache();
        return doc;
      },
    ],
  },
};

const SiteSettingsWithRBAC = withGlobalUpdateAccess(
  SiteSettings,
  contentManagers,
);
const MainMenuWithRBAC = withGlobalUpdateAccess(MainMenu, contentManagers);
const EmailSettingsWithRBAC: GlobalConfig = {
  ...EmailSettings,
  access: {
    ...EmailSettings.access,
    read: adminsOnly,
    update: adminsOnly,
  },
};
const ThemeSettingsWithRBAC = withGlobalUpdateAccess(
  ThemeSettings,
  adminsOnly,
);

const smtpAuth =
  serverEnv.smtp.user && serverEnv.smtp.pass
    ? {
        user: serverEnv.smtp.user,
        pass: serverEnv.smtp.pass,
      }
    : undefined;

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
  endpoints: imageOptimizationEndpoints,
  collections: [
    Users,
    MediaWithRBAC,
    ProductsWithProtectedPublicApi,
    withContentAccess(Categories),
    withAdminAccess(Inquiries),
    withContentAccess(News),
    withContentAccess(Pages),
    withContentAccess(NewsCategories),
    withAdminAccess(QuoteRequests),
    DownloadLogs,
    withAdminAccess(Subscribers),
  ],
  globals: [
    SiteSettingsWithRBAC,
    MainMenuWithRBAC,
    EmailSettingsWithRBAC,
    ThemeSettingsWithRBAC,
    ImageOptimizationSettings,
  ],
  editor: lexicalEditor({}),
  secret: serverEnv.payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, "migrations"),
    pool: {
      connectionString: serverEnv.databaseUri,
    },
  }),
  sharp,
  email: nodemailerAdapter({
    defaultFromName: serverEnv.smtp.fromName,
    defaultFromAddress: serverEnv.smtp.fromAddress,
    transportOptions: {
      host: serverEnv.smtp.host,
      port: serverEnv.smtp.port,
      ...(smtpAuth ? { auth: smtpAuth } : {}),
    },
  }),
});
