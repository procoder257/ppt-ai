/**
 * Renders a schema.org JSON-LD block.
 *
 * `<` is escaped as `<` so a string value containing `</script>` cannot
 * close the tag early and inject markup.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined; serializeJsonLd escapes "<".
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
