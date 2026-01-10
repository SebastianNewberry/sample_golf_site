import DOMPurify from 'isomorphic-dompurify';

interface SafeHTMLProps {
  html: string;
}

export function SafeHTML({ html }: SafeHTMLProps) {
  // This now works on both Server and Client side automatically
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["strong", "em", "b", "i", "br", "p", "span"],
    ALLOWED_ATTR: [],
  });

  return (
    <span
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
