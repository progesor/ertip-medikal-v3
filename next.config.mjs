import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        reactCompiler: false, // Next 15 RC ve Payload Beta uyumu için şimdilik kapalı
    },
};

export default withPayload(nextConfig);