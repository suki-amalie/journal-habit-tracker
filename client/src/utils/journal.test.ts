import { describe, expect, it } from "vitest";

import { getExcerpt } from "./journal";

describe("getExcerpt", () => {
  it("strips markdown syntax and collapses whitespace", () => {
    expect(getExcerpt("# Title\n\n**bold**  and *italic*")).toBe(
      "Title bold and italic",
    );
  });

  it("keeps the text of links and image alt text", () => {
    expect(getExcerpt("see [docs](https://x.dev) ![cat](https://x.dev/c.png)")).toBe(
      "see docs cat",
    );
  });

  it("truncates long content with an ellipsis", () => {
    const excerpt = getExcerpt("a".repeat(200), 10);

    expect(excerpt).toBe(`${"a".repeat(10)}…`);
  });

  it("leaves short content untouched", () => {
    expect(getExcerpt("hello")).toBe("hello");
  });
});
