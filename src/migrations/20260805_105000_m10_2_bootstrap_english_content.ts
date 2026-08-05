import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import {
  bootstrapCollectionEnglishLocale,
  bootstrapGlobalEnglishLocale,
  type LocaleBootstrapSpec,
} from '../lib/i18n/localeBootstrap'

type CollectionBootstrap = LocaleBootstrapSpec & {
  slug: string
}

type GlobalBootstrap = LocaleBootstrapSpec & {
  slug: string
}

const collectionBootstraps: CollectionBootstrap[] = [
  {
    slug: 'products',
    fields: ['title', 'shortDescription', 'description', 'specs', 'meta', 'slug'],
    stripNestedIds: ['specs'],
  },
  {
    slug: 'categories',
    fields: ['title', 'description', 'slug'],
  },
  {
    slug: 'news',
    fields: ['title', 'excerpt', 'content', 'meta', 'slug'],
  },
  {
    slug: 'pages',
    fields: ['title', 'layout', 'meta', 'slug'],
    stripNestedIds: ['layout'],
  },
  {
    slug: 'news-categories',
    fields: ['title', 'slug'],
  },
]

const globalBootstraps: GlobalBootstrap[] = [
  {
    slug: 'site-settings',
    fields: ['header', 'floatingAction', 'footer'],
    stripNestedIds: ['header', 'floatingAction', 'footer'],
  },
  {
    slug: 'main-menu',
    fields: ['items'],
    stripNestedIds: ['items'],
  },
]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const bootstrap of collectionBootstraps) {
    const result = await payload.find({
      collection: bootstrap.slug as never,
      locale: 'tr',
      fallbackLocale: false,
      pagination: false,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })

    for (const doc of result.docs) {
      await bootstrapCollectionEnglishLocale({
        req,
        collection: bootstrap.slug,
        id: doc.id,
        spec: bootstrap,
        sourceDoc: doc as Record<string, unknown> & { id: number | string },
      })
    }
  }

  for (const bootstrap of globalBootstraps) {
    await bootstrapGlobalEnglishLocale({
      req,
      slug: bootstrap.slug,
      spec: bootstrap,
    })
  }
}

export async function down({}: MigrateDownArgs): Promise<void> {
  throw new Error(
    'M10.2 English locale bootstrap is intentionally irreversible. Restore a verified pre-migration database backup instead of deleting locale content.',
  )
}
