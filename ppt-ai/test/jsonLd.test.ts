import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/components/seo/JsonLd";

describe("serializeJsonLd", () => {
  it("escapes < so values cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
  });

  it("round-trips to the same data", () => {
    const data = { "@type": "FAQPage", q: "a < b?", n: 1 };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
