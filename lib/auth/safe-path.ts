const BASE = "http://internal.invalid";

/**
 * Checks a "return to this page after login" value. Returns the path only
 * if it points inside this site; otherwise returns null. This stops a
 * crafted link from sending someone to another website after they log in.
 */
export function safeInternalPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) {
    return null;
  }
  // Must be a plain path like /author. Rejects full addresses (https://...),
  // protocol-relative ones (//other.site) and backslash tricks (/\other.site).
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  // No control characters (tabs, new lines), which browsers may strip.
  for (const char of value) {
    if (char.charCodeAt(0) < 32) return null;
  }
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
