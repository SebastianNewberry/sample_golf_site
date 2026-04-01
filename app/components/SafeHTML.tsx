import DOMPurify from 'isomorphic-dompurify';

interface SafeHTMLProps {
  html: string;
}

export function SafeHTML({ html }: SafeHTMLProps) {
  // This now works on both Server and Client side automatically
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["strong", "em", "b", "i", "br", "p", "span", "ul", "ol", "li", "h2", "h3", "h4", "h5", "h6"],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      className="safe-html-content"
    />
  );
}
