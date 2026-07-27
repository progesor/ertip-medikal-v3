import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  images: {
    // Next/Image still creates responsive srcsets, but the requested widths are
    // resolved by our manual, admin-controlled media delivery endpoint.
    loader: "custom",
    loaderFile: "./src/lib/imageOptimization/loader.ts",
    qualities: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
  },
};

export default withPayload(nextConfig);
