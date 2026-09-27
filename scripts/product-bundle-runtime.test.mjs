import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../assets/theme.js", import.meta.url), "utf8");
const start = source.indexOf("class ProductBundle extends HTMLElement {");
const end = source.indexOf('if (!customElements.get("product-bundle"))', start);
if (start < 0 || end < 0) throw new Error("ProductBundle controller was not found");
const classExpression = `(${source.slice(start, end).trim()})`;

function harness(fetch) {
  const calls = { refresh: 0, render: 0, open: 0, requests: [] };
  const context = {
    HTMLElement: class {},
    AbortController,
    fetch,
    fetchConfig: () => ({ method: "POST", headers: { "Content-Type": "application/json" } }),
    refreshCart: async () => { calls.refresh += 1; },
    renderCartSections: async () => { calls.render += 1; },
    getDrawer: () => ({ open: () => { calls.open += 1; } }),
    nigat: { routes: { root: "/en/" }, money: (minor) => `minor:${minor}` },
    location: { href: "" },
  };
  const ProductBundle = runInNewContext(classExpression, context);
  const bundle = new ProductBundle();
  bundle.button = { disabled: false };
  bundle.error = { hidden: true, textContent: "" };
  bundle.total = { textContent: "" };
  bundle.dataset = { emptyMessage: "Select an item", errorMessage: "Review cart" };
  bundle.isConnected = true;
  bundle.lifecycle = { trackRequest: (request) => request, untrackRequest: () => {} };
  bundle.querySelectorAll = () => calls.requests;
  return { bundle, calls, context };
}

function row(id, price, quantity, checked = true) {
  const choice = { checked };
  const count = { value: String(quantity), min: "1", step: "1", checkValidity: () => true, reportValidity: () => {} };
  const item = { dataset: { variantId: String(id), price: String(price) }, querySelector: (selector) => selector === "[data-bundle-select]" ? choice : selector === "[data-bundle-quantity]" ? count : null };
  return { item, choice, count };
}

describe("product bundle controller", () => {
  test("totals selected variants in minor units and rejects invalid quantity", () => {
    const { bundle, calls } = harness(async () => ({ ok: true, json: async () => ({}) }));
    const first = row(11, 125, 2);
    const second = row(22, 250, 3);
    calls.requests.push(first.item, second.item);
    bundle.updateTotal();
    expect(bundle.total.textContent).toBe("minor:1000");
    second.choice.checked = false;
    bundle.updateTotal();
    expect(bundle.total.textContent).toBe("minor:250");
    first.count.value = "1.5";
    expect(bundle.selectedItems()).toBeNull();
  });

  test("posts one locale-aware multi-item request and suppresses a rapid second click", async () => {
    let finish;
    const pending = new Promise((resolve) => { finish = resolve; });
    const requests = [];
    const { bundle, calls } = harness(async (url, options) => { requests.push({ url, options }); await pending; return { ok: true, json: async () => ({ items: [] }) }; });
    calls.requests.push(row(11, 125, 2).item, row(22, 250, 1).item);
    const first = bundle.submit();
    await bundle.submit();
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("/en/cart/add.js");
    expect(JSON.parse(requests[0].options.body).items).toEqual([{ id: 11, quantity: 2 }, { id: 22, quantity: 1 }]);
    finish();
    await first;
    expect(calls.refresh).toBe(1);
    expect(calls.render).toBe(1);
    expect(calls.open).toBe(1);
    expect(bundle.button.disabled).toBe(false);
  });

  test("shows a rejected add while refreshing the actual cart", async () => {
    const { bundle, calls } = harness(async () => ({ ok: false, json: async () => ({ description: "Unavailable now" }) }));
    calls.requests.push(row(11, 125, 1).item);
    await bundle.submit();
    expect(bundle.error.textContent).toBe("Unavailable now");
    expect(bundle.error.hidden).toBe(false);
    expect(calls.refresh).toBe(1);
    expect(calls.open).toBe(0);
  });
});
