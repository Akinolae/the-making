/**
 * Generate a URL-safe slug from a name string.
 * e.g. "Sophia Adeleke" -> "sophia-adeleke"
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
