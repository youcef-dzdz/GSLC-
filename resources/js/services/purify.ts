import DOMPurify from 'dompurify';

/**
 * Sanitize untrusted HTML before rendering with dangerouslySetInnerHTML.
 * Strips all scripts, event handlers, and dangerous attributes.
 * Usage: <div dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
 */
export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Strip ALL HTML — returns plain text only.
 * Use for values that should never contain markup (names, addresses, etc.)
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
