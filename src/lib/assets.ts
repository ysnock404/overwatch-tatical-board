export function assetUrl(url: string | undefined) {
  if (!url) return "";
  if (url.startsWith("/")) return url;
  return `/api/image?url=${encodeURIComponent(url)}`;
}
