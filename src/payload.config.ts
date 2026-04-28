import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

// Koleksiyon Importları
import { Users } from '@/collections/Users';
import { Media } from '@/collections/Media';
import { Products } from '@/collections/Products';
import { Categories } from '@/collections/Categories';
import { Inquiries } from '@/collections/Inquiries';
import { News } from '@/collections/News';
import { Pages } from '@/collections/Pages';
import { NewsCategories } from '@/collections/NewsCategories';
import {QuoteRequests} from "@/collections/QuoteRequests";
import {DownloadLogs} from "@/collections/DownloadLogs";

// Global Importları
import { SiteSettings } from '@/globals/SiteSettings';
import { MainMenu } from '@/globals/MainMenu';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    // Yeni koleksiyonları buraya ekledik
    collections: [Users, Media, Products, Categories, Inquiries, News, Pages, NewsCategories,QuoteRequests, DownloadLogs],
    // Globals dizisini buraya ekledik
    globals: [SiteSettings, MainMenu],
    editor: lexicalEditor({}),
    secret: process.env.PAYLOAD_SECRET || 'SECRET_KEY_MISSING',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URI || '',
        },
    }),
    sharp,
});