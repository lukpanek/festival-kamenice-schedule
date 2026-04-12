import DOMPurify from "isomorphic-dompurify";

const CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "i", "u", "span"],
  ALLOWED_ATTR: ["class"],
  FORBID_ATTR: ["style"],
};

export function sanitizeArtistDescriptionHtml(html: string): string {
  return DOMPurify.sanitize(html, CONFIG);
}
