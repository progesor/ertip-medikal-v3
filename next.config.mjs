import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  images: {
    // Keep encoding CPU cost predictable on the self-hosted instance while
    // still serving a modern format for supported browsers.
    formats: ["image/webp"],
    qualities: [70, 75, 85],
    // Payload media URLs are immutable for a given filename. A longer cache
    // lifetime prevents the same derivatives from being regenerated often.
    minimumCacheTTL: 86_400,
  },
};

export default withPayload(nextConfig);
