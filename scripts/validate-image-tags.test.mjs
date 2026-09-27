import { expect, test } from "bun:test";
import { unsafeImageTagOutputs } from "./validate-image-tags.mjs";

test("rejects escaping rendered image HTML and accepts an escaped alt value", () => {
  const invalid = "{{ product.featured_image | image_url: width: 400 | image_tag: alt: title | escape }}";
  const valid = "{% assign alt = title | escape %}{{ product.featured_image | image_url: width: 400 | image_tag: alt: alt }}";
  expect(unsafeImageTagOutputs(invalid)).toHaveLength(1);
  expect(unsafeImageTagOutputs(valid)).toHaveLength(0);
});
