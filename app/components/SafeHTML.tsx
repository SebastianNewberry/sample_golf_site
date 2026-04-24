import DOMPurify from 'isomorphic-dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
  /** When true, strips HTML tags and renders as plain text (ideal for line-clamped previews) */
  stripToText?: boolean;
}

function extractText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function SafeHTML({ html, className, stripToText }: SafeHTMLProps) {
  if (stripToText) {
    return (
      <p className={className}>
        {extractText(html)}
      </p>
    );
  }

  // This now works on both Server and Client side automatically
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["strong", "em", "b", "i", "br", "p", "span", "ul", "ol", "li", "h2", "h3", "h4", "h5", "h6"],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      className={`safe-html-content ${className || ""}`.trim()}
    />
  );
}
