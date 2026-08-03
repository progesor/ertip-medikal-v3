import { withPayload } from "@payloadcms/next/withPayload";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
  "connect-src 'self' https://cloudflareinsights.com https://*.cloudflareinsights.com wss:",
  "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Next/Image still creates responsive srcsets, but the requested widths are
    // resolved by our manual, admin-controlled media delivery endpoint.
    loader: "custom",
    loaderFile: "./src/lib/imageOptimization/loader.ts",
    qualities: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
  },
};

export default withPayload(nextConfig);
