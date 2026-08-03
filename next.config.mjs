import { withPayload } from "@payloadcms/next/withPayload";

const ENV_SOURCE_PATTERN = /^(?:https|wss):\/\/[^\s;]+$/;

function readExtraSources(name) {
  const rawValue = process.env[name]?.trim();
  if (!rawValue) return [];

  return rawValue
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      if (!ENV_SOURCE_PATTERN.test(value)) {
        console.warn(`[security] Ignoring invalid ${name} CSP source: ${value}`);
        return false;
      }

      return true;
    });
}

function uniqueSources(...groups) {
  return [...new Set(groups.flat())];
}

const scriptSources = uniqueSources(
  [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://static.cloudflareinsights.com",
  ],
  readExtraSources("CSP_SCRIPT_SRC_EXTRA"),
);

const connectSources = uniqueSources(
  [
    "'self'",
    "https://cloudflareinsights.com",
    "https://*.cloudflareinsights.com",
    "https://*.google.com",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://*.youtube.com",
    "https://*.youtube-nocookie.com",
    "https://*.vimeo.com",
    "https://*.vimeocdn.com",
    "wss:",
  ],
  readExtraSources("CSP_CONNECT_SRC_EXTRA"),
);

const frameSources = uniqueSources(
  [
    "'self'",
    "https://www.google.com",
    "https://*.google.com",
    "https://www.youtube.com",
    "https://*.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://*.youtube-nocookie.com",
    "https://player.vimeo.com",
    "https://*.vimeo.com",
  ],
  readExtraSources("CSP_FRAME_SRC_EXTRA"),
);

const imgSources = uniqueSources(
  ["'self'", "data:", "blob:", "https:"],
  readExtraSources("CSP_IMG_SRC_EXTRA"),
);

const mediaSources = uniqueSources(
  ["'self'", "blob:"],
  readExtraSources("CSP_MEDIA_SRC_EXTRA"),
);

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `img-src ${imgSources.join(" ")}`,
  `media-src ${mediaSources.join(" ")}`,
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src ${scriptSources.join(" ")}`,
  `script-src-elem ${scriptSources.join(" ")}`,
  `connect-src ${connectSources.join(" ")}`,
  `frame-src ${frameSources.join(" ")}`,
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
