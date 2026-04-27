import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'postgresql',
    out: './drizzle', // Migrasyon dosyalarının tutulacağı geçici klasör
    dbCredentials: {
        // .env dosyasından DATABASE_URI'yi alır, bulamazsa Docker varsayılanını kullanır
        url: process.env.DATABASE_URI || 'postgres://ertip_user:ertip_password@127.0.0.1:5432/ertip_medikal_v3',
    },
    // Payload şemayı bellekte oluşturduğu için buraya statik bir schema.ts yolu vermiyoruz
});