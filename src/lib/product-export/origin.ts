// The configured public URL is the same origin trusted by Payload's CORS/CSRF
// settings. Proxy Host/protocol headers can describe an internal HTTP hop.
export function validExportOrigin(request: Request, publicSiteUrl: string) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser API clients still need auth + custom header.
  try {
    const source = new URL(origin);
    return (
      ["http:", "https:"].includes(source.protocol) &&
      source.origin === origin &&
      source.origin === new URL(publicSiteUrl).origin
    );
  } catch {
    return false;
  }
}
