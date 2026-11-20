// Next may build request.url from an internal hostname behind a reverse proxy.
// Compare the browser Origin to the actual Host and forwarded protocol instead.
export function validExportOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser API clients still need auth + custom header.
  try {
    const source = new URL(origin),
      target = new URL(request.url);
    const host = request.headers.get("host") || target.host;
    const protocol =
      request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ||
      target.protocol.slice(0, -1);
    return (
      ["http:", "https:"].includes(source.protocol) &&
      source.host === host &&
      source.protocol === protocol + ":"
    );
  } catch {
    return false;
  }
}
