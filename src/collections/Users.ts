import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
    slug: 'users',
    admin: {
        useAsTitle: 'email',
    },
    auth: true,
    fields: [
        // Email ve Password alanları "auth: true" ile otomatik gelir.
        {
            name: 'name',
            type: 'text',
        },
    ],
};