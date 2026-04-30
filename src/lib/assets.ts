export function assetUrl(url: string | undefined) {
  if (!url) return "";
  if (url.startsWith("/")) return url;
  return `/api/image/${encodeUrl(url)}`;
}

function encodeUrl(url: string) {
  return Array.from(url)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}
