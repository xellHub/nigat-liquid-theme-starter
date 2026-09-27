/* ==========================================================================
   nigat — theme.js
   Vanilla, dependency-free interactivity built on Web Components.
   Uses the Shopify AJAX Cart API and Predictive Search API.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Small helpers --------------------------------------------------- */
  const nigat = {
    routes: window.Shopify && window.Shopify.routes ? window.Shopify.routes : { root: "/" },
    money(cents) {
      return (cents / 100).toLocaleString(undefined, {
        style: "currency",
        currency:
          (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || "USD",
      });
    },
    debounce(fn, wait) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    },
    ImageBreakpoints: Object.freeze(
      (window.nigat && window.nigat.ImageBreakpoints) || {
        SHOPIFY: Object.freeze([
          64, 128, 165, 192, 360, 533, 720, 940, 1066, 1200, 1500, 1780, 2000, 2400, 3000, 3840,
        ]),
        THUMBNAIL: Object.freeze({
          visualSize: 64,
          sizes: "64px",
          widths: Object.freeze([64, 128, 192]),
          widthsString: "64, 128, 192",
          defaultWidth: 192,
          aspectRatio: "1:1",
          crop: "center",
        }),
        MAIN: Object.freeze({
          sizes: "(min-width: 990px) 50vw, 100vw",
          widths: Object.freeze([360, 533, 720, 940, 1066, 1200, 1500, 1780, 2000]),
          widthsString: "360, 533, 720, 940, 1066, 1200, 1500, 1780, 2000",
          defaultWidth: 2000,
          maxWidth: 2000,
        }),
        PORTAL: Object.freeze({
          sizes: "100vw",
          widths: Object.freeze([750, 1100, 1500, 1780, 2000, 2400, 3000, 3840]),
          widthsString: "750, 1100, 1500, 1780, 2000, 2400, 3000, 3840",
          defaultWidth: 3840,
          maxWidth: 3840,
        }),
      }
    ),
  };

  // Each mounted controller owns its listeners, timers, observers, and requests.
  function createLifecycleScope() {
    const events = new AbortController();
    const timeouts = new Set();
    const intervals = new Set();
    const observers = new Set();
    const requests = new Set();
    return {
      listen(target, type, handler, options = {}) {
        if (!target) return;
        const config = typeof options === "boolean" ? { capture: options } : options;
        target.addEventListener(type, handler, { ...config, signal: events.signal });
      },
      timeout(handler, delay) {
        const id = window.setTimeout(() => {
          timeouts.delete(id);
          handler();
        }, delay);
        timeouts.add(id);
        return id;
      },
      clearTimeout(id) {
        window.clearTimeout(id);
        timeouts.delete(id);
      },
      interval(handler, delay) {
        const id = window.setInterval(handler, delay);
        intervals.add(id);
        return id;
      },
      clearInterval(id) {
        window.clearInterval(id);
        intervals.delete(id);
      },
      trackObserver(observer) {
        observers.add(observer);
        return observer;
      },
      trackRequest(controller) {
        requests.add(controller);
        return controller;
      },
      untrackRequest(controller) {
        requests.delete(controller);
      },
      destroy() {
        events.abort();
        timeouts.forEach((id) => window.clearTimeout(id));
        intervals.forEach((id) => window.clearInterval(id));
        observers.forEach((observer) => observer.disconnect());
        requests.forEach((controller) => controller.abort());
        timeouts.clear();
        intervals.clear();
        observers.clear();
        requests.clear();
      },
    };
  }
  nigat.ImageConfig = nigat.ImageBreakpoints;

  /* --- Shared Recent Searches Storage --------------------------------- */
  const RECENT_SEARCHES_STORAGE_KEY = "lumen_recent_searches";

  function getRecentSearches() {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function addRecentSearch(term) {
    if (!term || typeof term !== "string") return;
    const clean = term.replace(/\*+$/, "").trim();
    if (!clean) return;
    try {
      let list = getRecentSearches();
      list = [clean, ...list.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(list));
      if (window.SearchBanner && typeof window.SearchBanner.renderRecentSearches === "function") {
        window.SearchBanner.renderRecentSearches();
        if (window.SearchBanner.banner && !window.SearchBanner.banner.hidden) {
          window.SearchBanner.resetToDefaultState();
        }
      }
    } catch (e) {}
  }

  function removeRecentSearch(term) {
    if (!term) return;
    try {
      let list = getRecentSearches();
      list = list.filter((t) => t.toLowerCase() !== term.toLowerCase());
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(list));
      if (window.SearchBanner && typeof window.SearchBanner.renderRecentSearches === "function") {
        window.SearchBanner.renderRecentSearches();
        if (window.SearchBanner.banner && !window.SearchBanner.banner.hidden) {
          window.SearchBanner.resetToDefaultState();
        }
      }
    } catch (e) {}
  }

  function clearRecentSearches() {
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
      if (window.SearchBanner && typeof window.SearchBanner.renderRecentSearches === "function") {
        window.SearchBanner.renderRecentSearches();
        if (window.SearchBanner.banner && !window.SearchBanner.banner.hidden) {
          window.SearchBanner.resetToDefaultState();
        }
      }
    } catch (e) {}
  }

  nigat.RECENT_SEARCHES_STORAGE_KEY = RECENT_SEARCHES_STORAGE_KEY;
  nigat.getRecentSearches = getRecentSearches;
  nigat.addRecentSearch = addRecentSearch;
  nigat.removeRecentSearch = removeRecentSearch;
  nigat.clearRecentSearches = clearRecentSearches;

  window.nigat = Object.assign(window.nigat || {}, nigat);

  /* --- Visitor appearance controls ------------------------------------ */
  const COLOR_MODE_KEY = "nigat-color-mode";
  const PALETTE_KEY = "nigat-palette";

  function getPaletteOption(palette = document.documentElement.dataset.palette) {
    return document.querySelector(`[data-palette-option][data-palette="${palette}"]`);
  }

  function syncAppearanceControls() {
    const root = document.documentElement;
    const isDark = root.dataset.colorMode === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? toggle.dataset.lightModeLabel : toggle.dataset.darkModeLabel);
      toggle.querySelector('[data-theme-icon="moon"]')?.toggleAttribute("hidden", isDark);
      toggle.querySelector('[data-theme-icon="sun"]')?.toggleAttribute("hidden", !isDark);
    });
    document.querySelectorAll("[data-palette-option]").forEach((option) => {
      option.setAttribute("aria-checked", String(option.dataset.palette === root.dataset.palette));
    });
    const themeColor = getComputedStyle(root).getPropertyValue("--color-background").trim();
    document.querySelector("[data-theme-color]")?.setAttribute("content", themeColor);
    syncDesignControls();
  }

  function setAppearance({
    palette = document.documentElement.dataset.palette,
    mode = document.documentElement.dataset.colorMode,
    persist = true,
  } = {}) {
    const option = getPaletteOption(palette);
    if (!option || !["light", "dark"].includes(mode)) return;
    const root = document.documentElement;
    root.dataset.palette = palette;
    root.dataset.colorMode = mode;
    root.dataset.colorScheme =
      mode === "dark" ? option.dataset.darkScheme : option.dataset.lightScheme;
    if (persist) {
      try {
        localStorage.setItem(PALETTE_KEY, palette);
        localStorage.setItem(COLOR_MODE_KEY, mode);
      } catch (_) {}
    }
    syncAppearanceControls();
  }

  function closePaletteMenu({ restoreFocus = false } = {}) {
    const menu = document.querySelector("[data-palette-menu]");
    const toggle = document.querySelector("[data-palette-toggle]");
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle?.focus();
  }

  function openPaletteMenu({ focusActive = false } = {}) {
    const menu = document.querySelector("[data-palette-menu]");
    const toggle = document.querySelector("[data-palette-toggle]");
    if (!menu) return;
    menu.hidden = false;
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (focusActive) (getPaletteOption() || menu.querySelector("[data-palette-option]"))?.focus();
  }

  document.addEventListener("click", (event) => {
    const themeToggle = event.target.closest("[data-theme-toggle]");
    if (themeToggle) {
      setAppearance({
        mode: document.documentElement.dataset.colorMode === "dark" ? "light" : "dark",
      });
      return;
    }

    const paletteToggle = event.target.closest("[data-palette-toggle]");
    if (paletteToggle) {
      const menu = document.querySelector("[data-palette-menu]");
      if (menu?.hidden) openPaletteMenu();
      else closePaletteMenu();
      return;
    }

    const paletteOption = event.target.closest("[data-palette-option]");
    if (paletteOption) {
      setAppearance({ palette: paletteOption.dataset.palette });
      closePaletteMenu({ restoreFocus: true });
      return;
    }

    if (!event.target.closest("[data-palette-picker]")) closePaletteMenu();
  });

  document.addEventListener("keydown", (event) => {
    const toggle = event.target.closest("[data-palette-toggle]");
    if (toggle && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      openPaletteMenu({ focusActive: true });
      return;
    }

    const option = event.target.closest("[data-palette-option]");
    if (!option) return;
    const options = [...document.querySelectorAll("[data-palette-option]")];
    const index = options.indexOf(option);
    if (event.key === "Escape") {
      event.preventDefault();
      closePaletteMenu({ restoreFocus: true });
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      options[
        (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length
      ]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      options[event.key === "Home" ? 0 : options.length - 1]?.focus();
    }
  });

  syncAppearanceControls();

  /* --- Live design controls (tab-only preview) ------------------------ */
  const DESIGN_PREVIEW_KEY = "nigat-design-preview";
  const designPreviewProperties = [
    "--color-background",
    "--color-surface",
    "--color-surface-raised",
    "--color-text",
    "--color-muted",
    "--color-border",
    "--color-accent",
    "--color-accent-text",
    "--color-button",
    "--color-button-text",
    "--color-secondary-button-text",
    "--grid-gap",
    "--corner-radius",
    "--radius-card",
    "--radius-button",
    "--shadow-opacity",
    "--heading-case",
    "--button-case",
    "--label-case",
    "--shadow-card",
    "--shadow-button",
    "--font-body-scale",
    "--font-heading-scale",
    "--motion-duration",
    "--motion-duration-fast",
  ];

  function saveDesignPreview() {
    try {
      const properties = [
        ...new Set([
          ...designPreviewProperties,
          ...[...document.documentElement.style].filter((property) =>
            property.startsWith("--foundation-")
          ),
        ]),
      ];
      const values = Object.fromEntries(
        properties
          .map((property) => [property, document.documentElement.style.getPropertyValue(property)])
          .filter(([, value]) => value)
      );
      sessionStorage.setItem(DESIGN_PREVIEW_KEY, JSON.stringify(values));
    } catch (_) {}
  }

  function restoreDesignPreview() {
    try {
      const values = JSON.parse(sessionStorage.getItem(DESIGN_PREVIEW_KEY) || "{}");
      Object.entries(values).forEach(([property, value]) =>
        document.documentElement.style.setProperty(property, value)
      );
      if (values["--foundation-toast-position"]) {
        document.documentElement.dataset.toastPosition = values["--foundation-toast-position"];
      }
      if (values["--foundation-show-color-mode-switcher"]) {
        document.documentElement.dataset.showColorModeSwitcher = values["--foundation-show-color-mode-switcher"] === "1" ? "true" : "false";
      }
      if (values["--foundation-show-palette-switcher"]) {
        document.documentElement.dataset.showPaletteSwitcher = values["--foundation-show-palette-switcher"] === "1" ? "true" : "false";
      }
      if (values["--foundation-surface-treatment"]) {
        document.documentElement.dataset.surfaceTreatment = values["--foundation-surface-treatment"];
      }
    } catch (_) {}
  }

  function clearDesignPreview() {
    const root = document.documentElement;
    [
      ...designPreviewProperties,
      ...[...root.style].filter((property) => property.startsWith("--foundation-")),
    ].forEach((property) => root.style.removeProperty(property));
    root.dataset.toastPosition = root.dataset.toastPositionDefault;
    root.dataset.showColorModeSwitcher = root.dataset.showColorModeSwitcherDefault;
    root.dataset.showPaletteSwitcher = root.dataset.showPaletteSwitcherDefault;
    root.dataset.surfaceTreatment = root.dataset.surfaceTreatmentDefault;
    try {
      sessionStorage.removeItem(DESIGN_PREVIEW_KEY);
    } catch (_) {}
  }

  function foundationProperty(id) {
    return `--${id.replaceAll("_", "-")}`;
  }

  function setFoundationPreview(control) {
    const property = foundationProperty(control.dataset.designFoundation);
    const unit = control.dataset.designUnit || "";
    let value =
      control.type === "checkbox" ? String(Number(control.checked)) : `${control.value}${unit}`;
    if (control.dataset.designFoundation === "foundation_display_scale") {
      value = String(Number(control.value) / 100);
    }
    document.documentElement.style.setProperty(property, value);
    if (control.dataset.designFoundation === "foundation_toast_position") {
      document.documentElement.dataset.toastPosition = control.value;
    }
    if (control.dataset.designFoundation === "foundation_show_color_mode_switcher") {
      document.documentElement.dataset.showColorModeSwitcher = String(control.checked);
    }
    if (control.dataset.designFoundation === "foundation_show_palette_switcher") {
      document.documentElement.dataset.showPaletteSwitcher = String(control.checked);
    }
    if (control.dataset.designFoundation === "foundation_surface_treatment") {
      document.documentElement.dataset.surfaceTreatment = control.value;
    }
    const output = document.querySelector(
      `[data-design-output="${control.dataset.designFoundation}"]`
    );
    if (output) output.value = `${control.value}${unit}`;
    saveDesignPreview();
  }

  function rgbToHex(value) {
    const channels = value.match(/\d+(?:\.\d+)?/g);
    if (!channels || channels.length < 3) return "#000000";
    return `#${channels
      .slice(0, 3)
      .map((channel) => Math.round(Number(channel)).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  function contrastForeground(hex) {
    const rgb = hex
      .slice(1)
      .match(/.{2}/g)
      ?.map((value) => Number.parseInt(value, 16) / 255);
    if (!rgb || rgb.length !== 3) return "#ffffff";
    const [red, green, blue] = rgb.map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue > 0.179 ? "#000000" : "#ffffff";
  }

  function syncDesignControls() {
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    document.querySelectorAll("[data-design-mode]").forEach((control) => {
      control.setAttribute(
        "aria-pressed",
        String(control.dataset.designMode === root.dataset.colorMode)
      );
    });
    document.querySelectorAll("[data-design-palette]").forEach((control) => {
      control.setAttribute(
        "aria-pressed",
        String(control.dataset.designPalette === root.dataset.palette)
      );
    });
    document.querySelectorAll("[data-design-color]").forEach((control) => {
      control.value = rgbToHex(
        computed.getPropertyValue(`--color-${control.dataset.designColor}`).trim()
      );
    });
    document.querySelectorAll("[data-design-foundation]").forEach((control) => {
      const value = root.style
        .getPropertyValue(foundationProperty(control.dataset.designFoundation))
        .trim();
      if (!value) return;
      if (control.type === "checkbox") {
        control.checked = value === "1";
      } else if (control.tagName === "SELECT") {
        control.value = value;
      } else {
        control.value = Number.parseFloat(value);
      }
      const output = document.querySelector(
        `[data-design-output="${control.dataset.designFoundation}"]`
      );
      if (output)
        output.value = control.type === "checkbox" ? String(Number(control.checked)) : value;
    });
    document.querySelectorAll("[data-design-token]").forEach((control) => {
      const value = root.style.getPropertyValue(control.dataset.designToken).trim();
      if (!value) return;
      if (control.tagName === "SELECT") {
        control.value = value;
      }
    });
  }

  function applyPreviewColor(name, value) {
    const root = document.documentElement;
    const property = `--color-${name}`;
    root.style.setProperty(property, value);
    if (name === "background") {
      root.style.setProperty(
        "--color-surface",
        `color-mix(in srgb, ${value} 94%, var(--color-text))`
      );
      root.style.setProperty(
        "--color-surface-raised",
        `color-mix(in srgb, ${value} 98%, var(--color-text))`
      );
      root.style.setProperty(
        "--color-border",
        `color-mix(in srgb, ${value} 84%, var(--color-text))`
      );
    }
    if (name === "text") {
      root.style.setProperty(
        "--color-muted",
        `color-mix(in srgb, ${value} 66%, var(--color-background))`
      );
      root.style.setProperty("--color-secondary-button-text", value);
    }
    if (name === "accent") {
      const foreground = contrastForeground(value);
      root.style.setProperty("--color-button", value);
      root.style.setProperty("--color-accent-text", foreground);
      root.style.setProperty("--color-button-text", foreground);
    }
    saveDesignPreview();
  }

  function handleTokenControl(control) {
    if (control.dataset.designColor) {
      applyPreviewColor(control.dataset.designColor, control.value);
      return;
    }
    const { designToken: property, designUnit: unit = "", designLabel: label } = control.dataset;
    const value = unit === "ratio" ? Number(control.value) / 100 : `${control.value}${unit}`;
    document.documentElement.style.setProperty(property, value);
    if (label) {
      const output = document.querySelector(`[data-design-output="${label}"]`);
      if (output) output.value = unit === "ratio" ? `${control.value}%` : `${control.value}${unit}`;
    }
    saveDesignPreview();
  }

  restoreDesignPreview();
  syncDesignControls();

  document.addEventListener("click", (event) => {
    const dialog = document.querySelector("[data-design-controls-dialog]");
    const toggle = event.target.closest("[data-design-controls-toggle]");
    if (toggle && dialog) {
      if (dialog.open) dialog.close();
      else {
        dialog.showModal();
        syncDesignControls();
      }
      return;
    }
    if (event.target.closest("[data-design-controls-close]")) {
      dialog?.close();
      document.querySelector("[data-design-controls-toggle]")?.focus();
      return;
    }
    const mode = event.target.closest("[data-design-mode]");
    if (mode) {
      setAppearance({ mode: mode.dataset.designMode });
      syncDesignControls();
      return;
    }
    const palette = event.target.closest("[data-design-palette]");
    if (palette) {
      setAppearance({ palette: palette.dataset.designPalette });
      syncDesignControls();
      return;
    }
    if (event.target.closest("[data-design-reset]")) {
      clearDesignPreview();
      syncDesignControls();
    }
  });

  document.addEventListener("input", (event) => {
    const foundationControl = event.target.closest("[data-design-foundation]");
    if (foundationControl) {
      setFoundationPreview(foundationControl);
      return;
    }
    const control = event.target.closest("[data-design-token], [data-design-color]");
    if (!control) return;
    handleTokenControl(control);
  });

  document.addEventListener("change", (event) => {
    const foundationControl = event.target.closest("[data-design-foundation]");
    if (foundationControl) {
      setFoundationPreview(foundationControl);
      return;
    }
    const tokenControl = event.target.closest("[data-design-token]");
    if (tokenControl) {
      handleTokenControl(tokenControl);
      return;
    }
    const control = event.target.closest("[data-design-motion]");
    if (!control) return;
    const duration = Number(control.value);
    document.documentElement.style.setProperty("--motion-duration", `${duration}ms`);
    document.documentElement.style.setProperty(
      "--motion-duration-fast",
      `${Math.round((duration * 2) / 3)}ms`
    );
    saveDesignPreview();
  });

  const trapFocusables =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function fetchConfig(type = "json") {
    return {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: `application/${type}` },
    };
  }

  /* --- Cart store (pub/sub) -------------------------------------------- */
  const CartEvents = new EventTarget();

  async function refreshCart(signal) {
    const res = await fetch(`${nigat.routes.root}cart.js`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) throw new Error(`cart refresh failed (${res.status})`);
    const cart = await res.json();
    if (signal?.aborted) return cart;
    CartEvents.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
    return cart;
  }

  function updateCartCount(count) {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.classList.toggle("is-empty", count === 0);
    });
    const drawer = getDrawer();
    if (drawer) {
      drawer.classList.toggle("cart-drawer--empty", count === 0);
    }
  }

  CartEvents.addEventListener("cart:updated", (e) => updateCartCount(e.detail.item_count));

  /* Resolve the Shopify section id that wraps an element. Shopify wraps every
     rendered section in <div id="shopify-section-{id}">. The Section Rendering
     API expects that {id}, NOT the section type. */
  function sectionIdFor(el) {
    if (!el) return null;
    const wrapper = el.closest('[id^="shopify-section-"]');
    return wrapper ? wrapper.id.replace("shopify-section-", "") : null;
  }

  /* Re-render the drawer + cart page line items via the Section Rendering API. */
  async function renderCartSections(signal) {
    const drawerBody = document.querySelector("[data-cart-items]");
    const page = document.querySelector("[data-cart-page]");

    const targets = [];
    const drawerSectionId = sectionIdFor(drawerBody) || (drawerBody ? "cart-drawer" : null);
    const pageSectionId = sectionIdFor(page);
    if (drawerSectionId)
      targets.push({ id: drawerSectionId, host: drawerBody, sel: "[data-cart-items]" });
    if (pageSectionId) targets.push({ id: pageSectionId, host: page, sel: "[data-cart-page]" });
    if (targets.length === 0) return true;

    try {
      const active = document.activeElement;
      const activeKey = active?.closest?.("[data-cart-item]")?.dataset.lineKey;
      const activeIsQuantity = active?.matches?.("[data-quantity-input]");
      const activeIsRemove = active?.matches?.("[data-cart-remove]");
      const activeIsNote = active?.matches?.("[data-cart-note-input]");
      const noteSelection = activeIsNote
        ? { start: active.selectionStart, end: active.selectionEnd }
        : null;
      const noteHost = active?.closest?.("[data-cart-page]") ? page : drawerBody;
      const drawerScroll = drawerBody?.querySelector(".cart-drawer__main")?.scrollTop || 0;
      const pageScroll = page?.querySelector("[data-cart-line-items]")?.scrollTop || 0;
      const ids = [...new Set(targets.map((t) => t.id))].join(",");
      const res = await fetch(`${nigat.routes.root}?sections=${ids}`, { signal });
      if (!res.ok) throw new Error(`cart sections failed (${res.status})`);
      const data = await res.json();
      if (signal?.aborted) return false;

      let rendered = true;
      targets.forEach((t) => {
        if (!t.host.isConnected) return;
        const markup = data[t.id];
        if (!markup) {
          rendered = false;
          return;
        }
        const parsed = new DOMParser().parseFromString(markup, "text/html");
        const fresh = parsed.querySelector(t.sel);
        if (!fresh) {
          rendered = false;
          return;
        }
        t.host.innerHTML = fresh.innerHTML;
      });
      if (!signal?.aborted) {
        syncDiscountUI();
        syncWishlistUI();
        syncCartNoteUI();
        syncShippingProgressAnnouncement();
        const main = drawerBody?.querySelector(".cart-drawer__main");
        if (main) main.scrollTop = drawerScroll;
        const pageItems = page?.querySelector("[data-cart-line-items]");
        if (pageItems) pageItems.scrollTop = pageScroll;
        if (activeIsNote && !active?.isConnected) {
          const replacement = noteHost?.querySelector("[data-cart-note-input]");
          replacement?.focus();
          if (replacement && noteSelection) {
            replacement.setSelectionRange(noteSelection.start, noteSelection.end);
          }
        }
        if (activeKey && !active?.isConnected) {
          const line = [...document.querySelectorAll("[data-cart-item]")].find(
            (item) => item.dataset.lineKey === activeKey
          );
          const replacement = line?.querySelector(
            activeIsQuantity ? "[data-quantity-input]" : activeIsRemove ? "[data-cart-remove]" : "a, button, input"
          );
          (replacement || document.querySelector(".cart-drawer__close"))?.focus?.();
        }
      }
      return rendered;
    } catch (err) {
      console.warn("[nigat] cart section render failed", err);
      return false;
    }
  }

  /* --- Wishlist System -------------------------------------------------- */
  function getWishlist() {
    try {
      const stored = localStorage.getItem("nigat_wishlist");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (_) {
      return [];
    }
  }

  function setWishlist(list) {
    try {
      localStorage.setItem("nigat_wishlist", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("wishlist:updated", { detail: { wishlist: list } }));
      document.dispatchEvent(
        new CustomEvent("shopify:wishlist:updated", { detail: { wishlist: list } })
      );
    } catch (_) {}
  }

  function toggleWishlist(variantId, metadata = {}) {
    if (!variantId) return false;
    const strId = String(variantId);
    let wishlist = getWishlist();
    const exists = wishlist.includes(strId);
    if (exists) {
      wishlist = wishlist.filter((id) => id !== strId);
      setWishlist(wishlist);
      window.dispatchEvent(
        new CustomEvent("wishlist:remove", { detail: { variantId: strId, ...metadata } })
      );
      return false;
    } else {
      wishlist.push(strId);
      setWishlist(wishlist);
      window.dispatchEvent(
        new CustomEvent("wishlist:add", { detail: { variantId: strId, ...metadata } })
      );
      return true;
    }
  }

  /* Global Portal Toast on document.body */
  function showSiteToast(msg, options = {}) {
    const duration = options.duration || 2600;
    let toast = document.querySelector("[data-site-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "site-toast";
      toast.setAttribute("data-site-toast", "");
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.innerHTML = `
        <span class="site-toast__icon" data-site-toast-icon>
          <svg class="icon icon-heart" viewBox="0 0 24 24" fill="var(--color-danger)" stroke="var(--color-danger)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </span>
        <span class="site-toast__msg" data-site-toast-msg></span>
      `;
      document.body.appendChild(toast);
    } else if (toast.parentElement !== document.body) {
      document.body.appendChild(toast);
    }

    const msgEl = toast.querySelector("[data-site-toast-msg]");
    if (msgEl) msgEl.textContent = msg;

    const iconEl = toast.querySelector("[data-site-toast-icon]");
    if (iconEl) {
      if (options.icon === "check") {
        iconEl.innerHTML =
          '<svg class="icon icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';
      } else if (options.icon === "unheart") {
        iconEl.innerHTML =
          '<svg class="icon icon-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
      } else if (options.icon === "none") {
        iconEl.innerHTML = "";
      } else {
        iconEl.innerHTML =
          '<svg class="icon icon-heart" viewBox="0 0 24 24" fill="var(--color-danger)" stroke="var(--color-danger)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
      }
    }

    toast.hidden = false;
    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    clearTimeout(toast._toastTimer);
    toast._toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => {
        if (!toast.classList.contains("is-visible")) toast.hidden = true;
      }, 250);
    }, duration);
  }

  function syncWishlistUI() {
    const wishlist = getWishlist();

    document.querySelectorAll("[data-cart-wishlist]").forEach((btn) => {
      const vId = btn.dataset.variantId || btn.closest("[data-variant-id]")?.dataset.variantId;
      const isSaved = vId && wishlist.includes(String(vId));
      btn.classList.toggle("is-active", Boolean(isSaved));
      btn.setAttribute("aria-pressed", isSaved ? "true" : "false");
      const label = isSaved ? btn.dataset.wishlistSavedLabel : btn.dataset.wishlistAddLabel;
      btn.setAttribute("title", label);
      btn.setAttribute("aria-label", label);
      const svg = btn.querySelector("svg");
      if (svg) {
        svg.setAttribute("fill", isSaved ? "currentColor" : "none");
      }
    });

    document.querySelectorAll("[data-floating-wishlist]").forEach((btn) => {
      const activeId =
        btn.dataset.variantId ||
        btn.closest("[data-product-section]")?.querySelector("[data-variant-id]")?.value;
      const isSaved = activeId && wishlist.includes(String(activeId));
      btn.classList.toggle("is-wishlisted", Boolean(isSaved));
      btn.setAttribute("aria-pressed", isSaved ? "true" : "false");
      const label = isSaved ? btn.dataset.wishlistSavedLabel : btn.dataset.wishlistAddLabel;
      btn.setAttribute("title", label);
      btn.setAttribute("aria-label", label);
      const svg = btn.querySelector("svg") || btn.querySelector(".icon");
      if (svg) {
        svg.style.fill = isSaved ? "var(--color-danger)" : "none";
        svg.style.stroke = isSaved ? "var(--color-danger)" : "currentColor";
        svg.style.color = isSaved ? "var(--color-danger)" : "currentColor";
      }
    });
  }

  /* --- Cart note: one draft shared by page and drawer instances ---------- */
  let lastShippingComplete = null;

  function syncShippingProgressAnnouncement() {
    const progress = document.querySelector("[data-cart-shipping-progress]");
    if (!progress) {
      lastShippingComplete = null;
      return;
    }
    const complete = progress.dataset.shippingComplete === "true";
    if (lastShippingComplete === false && complete) {
      let announcer = document.querySelector("[data-cart-shipping-announcer]");
      if (!announcer) {
        announcer = document.createElement("div");
        announcer.className = "visually-hidden";
        announcer.dataset.cartShippingAnnouncer = "";
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", "polite");
        document.body.appendChild(announcer);
      }
      announcer.textContent = progress.dataset.unlockedMessage || "";
    }
    lastShippingComplete = complete;
  }

  syncShippingProgressAnnouncement();

  const cartNoteState = {
    draft: null,
    saved: null,
    status: "idle",
    timer: null,
    request: null,
  };

  function initializeCartNote() {
    if (cartNoteState.draft !== null) return;
    const input = document.querySelector("[data-cart-note-input]");
    cartNoteState.draft = input?.defaultValue || "";
    cartNoteState.saved = cartNoteState.draft;
  }

  function syncCartNoteUI() {
    if (cartNoteState.draft === null) return;
    document.querySelectorAll("[data-cart-note]").forEach((root) => {
      const input = root.querySelector("[data-cart-note-input]");
      if (input && input.value !== cartNoteState.draft) input.value = cartNoteState.draft;
      root.dataset.noteState = cartNoteState.status;
      const status = root.querySelector("[data-cart-note-status]");
      const retry = root.querySelector("[data-cart-note-retry]");
      const labels = {
        saving: "noteSaving",
        saved: "noteSaved",
        error: "noteError",
      };
      if (status) status.textContent = root.dataset[labels[cartNoteState.status]] || "";
      if (retry) retry.hidden = cartNoteState.status !== "error";
    });
  }

  async function saveCartNote() {
    initializeCartNote();
    if (cartNoteState.timer) clearTimeout(cartNoteState.timer);
    cartNoteState.timer = null;
    if (cartNoteState.request) {
      await cartNoteState.request;
      if (cartNoteState.status === "error") return false;
      return cartNoteState.draft === cartNoteState.saved ? true : saveCartNote();
    }
    if (cartNoteState.draft === cartNoteState.saved) return true;

    cartNoteState.request = (async () => {
      while (cartNoteState.draft !== cartNoteState.saved) {
        const next = cartNoteState.draft;
        cartNoteState.status = "saving";
        syncCartNoteUI();
        try {
          const res = await fetch(`${nigat.routes.root}cart/update.js`, {
            ...fetchConfig(),
            body: JSON.stringify({ note: next }),
          });
          if (!res.ok) throw new Error(`cart note save failed (${res.status})`);
          const cart = await res.json();
          cartNoteState.saved = next;
          CartEvents.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
        } catch (err) {
          console.warn("[nigat] cart note save failed", err);
          cartNoteState.status = "error";
          syncCartNoteUI();
          return false;
        }
      }
      cartNoteState.status = "saved";
      syncCartNoteUI();
      return true;
    })();
    try {
      return await cartNoteState.request;
    } finally {
      cartNoteState.request = null;
    }
  }

  function scheduleCartNoteSave() {
    if (cartNoteState.timer) clearTimeout(cartNoteState.timer);
    cartNoteState.timer = setTimeout(() => {
      cartNoteState.timer = null;
      saveCartNote();
    }, 600);
  }

  document.addEventListener("input", (e) => {
    if (!e.target.matches?.("[data-cart-note-input]")) return;
    initializeCartNote();
    cartNoteState.draft = e.target.value;
    cartNoteState.status = "idle";
    syncCartNoteUI();
    scheduleCartNoteSave();
  });

  document.addEventListener("focusout", (e) => {
    if (e.target.matches?.("[data-cart-note-input]")) saveCartNote();
  });

  document.addEventListener("click", (e) => {
    const save = e.target.closest?.("[data-cart-note-save], [data-cart-note-retry]");
    if (!save) return;
    e.preventDefault();
    saveCartNote();
  });

  async function awaitCartNoteBeforeCheckout(e, resume) {
    initializeCartNote();
    if (
      cartNoteState.draft === cartNoteState.saved &&
      !cartNoteState.request &&
      !cartNoteState.timer
    ) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (await saveCartNote()) resume();
    else {
      const context = e.target.closest?.("[data-cart-page], [data-drawer]") || document;
      context.querySelector("[data-cart-note-retry]:not([hidden])")?.focus();
    }
  }

  document.addEventListener(
    "click",
    (e) => {
      const checkout = e.target.closest?.("[data-checkout-btn]");
      if (checkout) awaitCartNoteBeforeCheckout(e, () => checkout.click());
    },
    true
  );

  document.addEventListener(
    "submit",
    (e) => {
      const form = e.target;
      if (form?.id !== "cart-drawer-form" && !form?.classList?.contains("cart__form")) return;
      awaitCartNoteBeforeCheckout(e, () => form.requestSubmit(e.submitter || undefined));
    },
    true
  );

  /* --- Cart Drawer Coupon / Discount Helper ----------------------------- */
  function syncDiscountUI() {
    const savedCode = sessionStorage.getItem("cart_discount_code") || "";
    const discountInputs = document.querySelectorAll("[data-discount-input]");
    const discountTags = document.querySelectorAll("[data-discount-tag]");
    const discountNames = document.querySelectorAll("[data-discount-name]");
    const discountDetails = document.querySelectorAll("[data-discount-details]");

    discountTags.forEach((tag) => {
      tag.hidden = !savedCode;
    });
    discountNames.forEach((name) => {
      name.textContent = savedCode;
    });
    discountDetails.forEach((details) => {
      if (savedCode) {
        details.removeAttribute("open");
      }
    });
    discountInputs.forEach((input) => {
      if (!savedCode) input.value = "";
    });
  }

  document.addEventListener("click", (e) => {
    const applyBtn = e.target.closest("[data-discount-apply]");
    if (applyBtn) {
      e.preventDefault();
      const container = applyBtn.closest("[data-cart-discount]");
      const input = container ? container.querySelector("[data-discount-input]") : null;
      if (input && input.value.trim()) {
        sessionStorage.setItem("cart_discount_code", input.value.trim().toUpperCase());
        syncDiscountUI();
      }
      return;
    }

    const removeBtn = e.target.closest("[data-discount-remove]");
    if (removeBtn) {
      e.preventDefault();
      sessionStorage.removeItem("cart_discount_code");
      syncDiscountUI();
      return;
    }

    const checkoutBtn = e.target.closest("[data-checkout-btn]");
    if (checkoutBtn) {
      if (checkoutBtn.classList.contains("is-loading") || checkoutBtn.disabled) {
        e.preventDefault();
        return;
      }
      checkoutBtn.classList.add("is-loading");
      checkoutBtn.setAttribute("aria-busy", "true");
      const spinner = checkoutBtn.querySelector(".cart__checkout-spinner");
      if (spinner) spinner.hidden = false;
      setTimeout(() => {
        checkoutBtn.disabled = true;
      }, 0);

      const savedCode = sessionStorage.getItem("cart_discount_code");
      if (savedCode) {
        e.preventDefault();
        window.location.href = `${nigat.routes.root}checkout?discount=${encodeURIComponent(savedCode)}`;
      }
    }
  });

  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (form && (form.id === "cart-drawer-form" || form.classList.contains("cart__form"))) {
      const checkoutBtn = form.querySelector("[data-checkout-btn]");
      if (checkoutBtn && !checkoutBtn.classList.contains("is-loading")) {
        checkoutBtn.classList.add("is-loading");
        checkoutBtn.setAttribute("aria-busy", "true");
        const spinner = checkoutBtn.querySelector(".cart__checkout-spinner");
        if (spinner) spinner.hidden = false;
        setTimeout(() => {
          checkoutBtn.disabled = true;
        }, 0);
      }
    }
  });

  window.addEventListener("pageshow", () => {
    document.querySelectorAll("[data-checkout-btn]").forEach((btn) => {
      btn.classList.remove("is-loading");
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      const spinner = btn.querySelector(".cart__checkout-spinner");
      if (spinner) spinner.hidden = true;
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const input = e.target.closest("[data-discount-input]");
      if (input && input.value.trim()) {
        e.preventDefault();
        sessionStorage.setItem("cart_discount_code", input.value.trim().toUpperCase());
        syncDiscountUI();
      }
    }
  });

  /* --- Unified Body Scroll Lock Manager --------------------------------- */
  let scrollLockCount = 0;
  let scrollbarWidth = 0;

  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  function lockBodyScroll() {
    if (scrollLockCount === 0) {
      scrollbarWidth = getScrollbarWidth();
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("has-overlay-locked");
      document.body.classList.add("scroll-locked");
    }
    scrollLockCount++;
  }

  function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.documentElement.classList.remove("has-overlay-locked");
      document.body.classList.remove("scroll-locked");
    }
  }

  window.nigat.lockBodyScroll = lockBodyScroll;
  window.nigat.unlockBodyScroll = unlockBodyScroll;

  /* --- Reusable drawer controller ------------------------------------- */
  class Drawer {
    constructor(element, options = {}) {
      this.element = element;
      this.openClass = options.openClass || "is-open";
      this.closeSelector = options.closeSelector || "[data-drawer-close]";
      this.panel = element.querySelector(options.panelSelector || "[data-drawer-panel]") || element;
      this.triggerSelector = options.triggerSelector || null;
      this.onOpen = options.onOpen || null;
      this.onClose = options.onClose || null;
      this.activeTrigger = null;
      this.lifecycle = createLifecycleScope();

      this.lifecycle.listen(this.element, "click", (event) => {
        if (event.target.closest(this.closeSelector)) this.close();
      });
      this.lifecycle.listen(document, "keydown", (event) => {
        if (event.key === "Escape" && this.isOpen()) this.close();
      });
    }

    isOpen() {
      return this.element.classList.contains(this.openClass);
    }

    open(trigger = null) {
      if (this.isOpen()) return false;
      this.activeTrigger = trigger;
      this.element.classList.add(this.openClass);
      if (this.triggerSelector && trigger?.matches(this.triggerSelector)) {
        trigger.setAttribute("aria-expanded", "true");
      }
      lockBodyScroll();
      this.onOpen?.();
      const focusable = this.panel.querySelector(trapFocusables);
      if (focusable) requestAnimationFrame(() => focusable.focus());
      return true;
    }

    close() {
      if (!this.isOpen()) return false;
      this.element.classList.remove(this.openClass);
      unlockBodyScroll();
      const trigger = this.activeTrigger;
      this.activeTrigger = null;
      if (this.triggerSelector && trigger?.matches(this.triggerSelector)) {
        trigger.setAttribute("aria-expanded", "false");
      }
      this.onClose?.();
      trigger?.focus();
      return true;
    }

    destroy() {
      this.close();
      this.lifecycle.destroy();
    }
  }
  window.nigat.Drawer = Drawer;

  /* --- Reusable Composable Overlay Primitive (<theme-overlay>) ---------
     Supports 4 primitives: popover, drawer, modal, dropdown.
     All have accessible backdrops, dismiss-on-backdrop-click, escape dismiss,
     and support overriding backdrop behavior or accepting custom backdrops.
     ---------------------------------------------------------------------- */
  class ThemeOverlay extends HTMLElement {
    constructor() {
      super();
      this._onBackdropClick = this._onBackdropClick.bind(this);
      this._onTriggerClick = this._onTriggerClick.bind(this);
      this._onKeydown = this._onKeydown.bind(this);
      this._onOutsidePointer = this._onOutsidePointer.bind(this);
      this._activeTrigger = null;
    }

    get type() {
      return this.getAttribute("data-overlay-type") || this.getAttribute("type") || "popover";
    }

    get position() {
      return (
        this.getAttribute("data-overlay-position") || this.getAttribute("position") || "bottom-end"
      );
    }

    get backdropDismiss() {
      const attr = this.getAttribute("data-backdrop-dismiss");
      return attr !== "false";
    }

    set backdropDismiss(value) {
      this.setAttribute("data-backdrop-dismiss", value ? "true" : "false");
    }

    get panel() {
      return (
        this.querySelector("[data-overlay-panel]") || this.querySelector(".theme-overlay__panel")
      );
    }

    get trigger() {
      return (
        this.querySelector("[data-overlay-trigger]") ||
        this.querySelector(".theme-overlay__trigger")
      );
    }

    get backdrop() {
      return (
        this.querySelector("[data-overlay-backdrop]") ||
        this.querySelector(".theme-overlay__backdrop") ||
        this.querySelector("[data-overlay-custom-backdrop]")
      );
    }

    isOpen() {
      return this.classList.contains("is-open") || this.hasAttribute("open");
    }

    connectedCallback() {
      if (this.lifecycle) return;
      this.lifecycle = createLifecycleScope();
      const trigger = this.trigger;
      if (trigger) {
        this.lifecycle.listen(trigger, "click", this._onTriggerClick);
      }

      this.lifecycle.listen(this, "click", (e) => {
        const closeBtn = e.target.closest("[data-overlay-close]");
        if (closeBtn) {
          e.preventDefault();
          this.close();
          return;
        }

        const backdropEl = e.target.closest(
          "[data-overlay-backdrop], .theme-overlay__backdrop, [data-overlay-custom-backdrop]"
        );
        if (backdropEl && !e.target.closest("[data-overlay-panel]")) {
          this._onBackdropClick(e);
        }
      });

      this.lifecycle.listen(this, "keydown", this._onKeydown);
    }

    disconnectedCallback() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
      window.cancelAnimationFrame(this._focusFrame);
      this._restoreBodyScroll();
      document.removeEventListener("pointerdown", this._onOutsidePointer);
      this.classList.remove("is-open");
      this.removeAttribute("open");
      this.panel?.setAttribute("hidden", "");
      this.trigger?.setAttribute("aria-expanded", "false");
      const parentHeader = this.closest(".header-section");
      if (
        parentHeader &&
        !parentHeader.querySelector("theme-overlay.is-open, theme-overlay[open]")
      ) {
        parentHeader.classList.remove("header-section--overlay-open");
      }
    }

    _onTriggerClick(e) {
      e.preventDefault();
      this.toggle(this.trigger);
    }

    _onBackdropClick(e) {
      e.stopPropagation();

      const event = new CustomEvent("overlay:backdrop-click", {
        bubbles: true,
        cancelable: true,
        detail: { overlay: this, type: this.type },
      });
      const allowed = this.dispatchEvent(event);

      if (!this.backdropDismiss || !allowed) {
        this._rejectAnimation();
        return;
      }

      this.close();
    }

    _rejectAnimation() {
      const panel = this.panel;
      if (!panel) return;
      this.classList.remove("theme-overlay--reject");
      void panel.offsetWidth;
      this.classList.add("theme-overlay--reject");
      this.lifecycle?.timeout(() => this.classList.remove("theme-overlay--reject"), 320);
    }

    _onKeydown(e) {
      if (e.key === "Escape" && this.isOpen()) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
        return;
      }

      if ((this.type === "modal" || this.type === "drawer") && e.key === "Tab" && this.isOpen()) {
        const focusables = this.panel?.querySelectorAll(trapFocusables) || [];
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    _onOutsidePointer(e) {
      if (!this.isOpen()) return;
      if (this.contains(e.target)) return;

      const event = new CustomEvent("overlay:backdrop-click", {
        bubbles: true,
        cancelable: true,
        detail: { overlay: this, type: this.type },
      });
      const allowed = this.dispatchEvent(event);

      if (!this.backdropDismiss || !allowed) {
        this._rejectAnimation();
        return;
      }
      this.close();
    }

    _lockBodyScroll() {
      if (!this._hasScrollLock && (this.type === "modal" || this.type === "drawer")) {
        lockBodyScroll();
        this._hasScrollLock = true;
      }
    }

    _restoreBodyScroll() {
      if (this._hasScrollLock) {
        unlockBodyScroll();
        this._hasScrollLock = false;
      }
    }

    open(trigger = null) {
      if (this.isOpen()) {
        if (trigger) this._activeTrigger = trigger;
        return false;
      }
      this._activeTrigger = trigger || this.trigger;

      this.classList.add("is-open");
      this.setAttribute("open", "");

      const parentHeader = this.closest(".header-section");
      if (parentHeader) {
        parentHeader.classList.add("header-section--overlay-open");
      }

      if (this.trigger) {
        this.trigger.setAttribute("aria-expanded", "true");
      }

      if (this.panel) {
        this.panel.removeAttribute("hidden");
      }

      this._lockBodyScroll();

      this._outsidePointerTimer = this.lifecycle?.timeout(() => {
        this._outsidePointerTimer = null;
        if (!this.isOpen()) return;
        document.addEventListener("pointerdown", this._onOutsidePointer);
      }, 0);

      const panel = this.panel;
      if (panel) {
        this._focusFrame = requestAnimationFrame(() => {
          if (!this.isConnected || !this.isOpen()) return;
          const focusable = panel.querySelector(trapFocusables);
          if (focusable) {
            focusable.focus();
          } else {
            panel.setAttribute("tabindex", "-1");
            panel.focus();
          }
        });
      }

      this.dispatchEvent(
        new CustomEvent("overlay:open", {
          bubbles: true,
          detail: { overlay: this, type: this.type },
        })
      );
      return true;
    }

    close() {
      if (!this.isOpen()) return false;
      this.classList.remove("is-open");
      this.removeAttribute("open");

      const parentHeader = this.closest(".header-section");
      if (
        parentHeader &&
        !parentHeader.querySelector("theme-overlay.is-open, theme-overlay[open]")
      ) {
        parentHeader.classList.remove("header-section--overlay-open");
      }

      if (this.trigger) {
        this.trigger.setAttribute("aria-expanded", "false");
      }

      document.removeEventListener("pointerdown", this._onOutsidePointer);
      if (this._outsidePointerTimer) {
        this.lifecycle?.clearTimeout(this._outsidePointerTimer);
        this._outsidePointerTimer = null;
      }
      window.cancelAnimationFrame(this._focusFrame);
      this._restoreBodyScroll();

      if (this.panel) {
        this.panel.setAttribute("hidden", "");
      }

      const triggerToRestore = this._activeTrigger || this.trigger;
      if (triggerToRestore && typeof triggerToRestore.focus === "function") {
        triggerToRestore.focus();
      }
      this._activeTrigger = null;

      this.dispatchEvent(
        new CustomEvent("overlay:close", {
          bubbles: true,
          detail: { overlay: this, type: this.type },
        })
      );
      return true;
    }

    toggle(trigger = null) {
      return this.isOpen() ? this.close() : this.open(trigger);
    }
  }

  if (!customElements.get("theme-overlay")) {
    customElements.define("theme-overlay", ThemeOverlay);
  }
  window.nigat.ThemeOverlay = ThemeOverlay;

  /* --- <cart-drawer> --------------------------------------------------- */
  class CartDrawer extends HTMLElement {
    get overlay() {
      return this.querySelector("theme-overlay");
    }

    connectedCallback() {
      if (this.lifecycle) return;
      this.lifecycle = createLifecycleScope();
      const overlay = this.overlay;
      if (overlay) {
        this.lifecycle.listen(overlay, "overlay:open", () => {
          this.classList.add("is-open");
          syncDiscountUI();
          syncWishlistUI();
        });
        this.lifecycle.listen(overlay, "overlay:close", () => {
          this.classList.remove("is-open");
        });
      }

      this.drawer = new Drawer(this, {
        triggerSelector: "[data-cart-toggle]",
        onOpen: () => {
          if (this.overlay && !this.overlay.isOpen()) {
            this.overlay.open();
          }
          syncDiscountUI();
          syncWishlistUI();
        },
        onClose: () => {
          if (this.overlay && this.overlay.isOpen()) {
            this.overlay.close();
          }
        },
      });
      syncDiscountUI();
      syncWishlistUI();
    }

    disconnectedCallback() {
      this.drawer?.destroy();
      this.drawer = null;
      this.lifecycle?.destroy();
      this.lifecycle = null;
    }

    isOpen() {
      return this.overlay ? this.overlay.isOpen() : this.classList.contains("is-open");
    }

    open(trigger = null) {
      this.classList.add("is-open");
      if (this.overlay) {
        return this.overlay.open(trigger);
      }
      return this.drawer?.open(trigger);
    }

    close() {
      this.classList.remove("is-open");
      if (this.overlay) {
        return this.overlay.close();
      }
      return this.drawer?.close();
    }
  }
  customElements.define("cart-drawer", CartDrawer);

  function getDrawer() {
    return document.querySelector("cart-drawer");
  }

  /* --- Add to cart (<product-form>) ------------------------------------ */
  class ProductForm extends HTMLElement {
    connectedCallback() {
      if (this.lifecycle) return;
      this.form = this.querySelector("form");
      if (!this.form) return;
      this.lifecycle = createLifecycleScope();
      this.button = this.querySelector("[data-add-to-cart]");
      this.errorEl = this.querySelector("[data-cart-error]");
      this.lifecycle.listen(this.form, "submit", (e) => this.onSubmit(e));
    }

    disconnectedCallback() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
    }

    async onSubmit(e) {
      e.preventDefault();
      if (!this.button || this.button.getAttribute("aria-disabled") === "true") return;

      this.setLoading(true);
      this.hideError();

      const formData = new FormData(this.form);
      formData.append("sections_url", window.location.pathname);

      const request = this.lifecycle.trackRequest(new AbortController());
      try {
        const config = fetchConfig("javascript");
        delete config.headers["Content-Type"];
        config.body = formData;
        config.signal = request.signal;

        const res = await fetch(`${nigat.routes.root}cart/add.js`, config);
        const data = await res.json();
        if (!this.isConnected || request.signal.aborted) return;

        if (!res.ok || data.status) {
          this.showError(data.description || data.message || this.dataset.errorMessage);
          this.setLoading(false);
          return;
        }

        await refreshCart(request.signal);
        if (!this.isConnected) return;
        await renderCartSections(request.signal);
        if (!this.isConnected) return;

        const addedEvent = new CustomEvent("product:added", {
          bubbles: true,
          cancelable: true,
          detail: {
            productId: this.closest("[data-product-section]")?.dataset.productId,
            instanceId: this.closest("[data-product-section]")?.dataset.productInstance,
          },
        });
        if (!this.dispatchEvent(addedEvent)) return;

        const drawer = getDrawer();
        if (drawer) {
          drawer.open(this.button);
        } else {
          window.location.href = `${nigat.routes.root}cart`;
        }
      } catch (err) {
        if (err.name === "AbortError" || !this.isConnected) return;
        this.showError(this.dataset.errorMessage);
        console.error("[nigat] add to cart failed", err);
      } finally {
        this.lifecycle?.untrackRequest(request);
        if (this.isConnected) this.setLoading(false);
      }
    }

    setLoading(state) {
      this.button.classList.toggle("is-loading", state);
      this.button.setAttribute("aria-disabled", state ? "true" : "false");
      const spinner = this.button.querySelector(".product-form__spinner");
      if (spinner) spinner.hidden = !state;
    }

    showError(message) {
      if (!this.errorEl) return;
      this.errorEl.textContent = message;
      this.errorEl.hidden = false;
    }

    hideError() {
      if (this.errorEl) this.errorEl.hidden = true;
    }
  }
  customElements.define("product-form", ProductForm);

  /* --- Product quick view and simple quick add -------------------------- */
  class QuickViewController extends HTMLElement {
    connectedCallback() {
      if (this.lifecycle) return;
      this.overlay = this.querySelector("theme-overlay");
      this.content = this.querySelector("[data-quick-view-content]");
      this.status = this.querySelector("[data-quick-view-status]");
      this.error = this.querySelector("[data-quick-view-error]");
      this.fallback = this.querySelector("[data-quick-view-fallback]");
      if (!this.overlay || !this.content) return;
      this.lifecycle = createLifecycleScope();
      this.sequence = 0;
      this.lifecycle.listen(document, "click", (event) => {
        const trigger = event.target.closest("a[data-quick-view]");
        if (!trigger || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (new URL(trigger.href, window.location.href).origin !== window.location.origin) return;
        event.preventDefault();
        this.open(trigger);
      });
      this.lifecycle.listen(document, "submit", (event) => {
        const form = event.target.closest("form[data-quick-add-form]");
        if (!form) return;
        event.preventDefault();
        this.quickAdd(form);
      });
      this.lifecycle.listen(this.overlay, "overlay:close", () => this.reset());
      this.lifecycle.listen(this, "product:added", (event) => {
        if (!event.target.closest("[data-quick-view-content]")) return;
        event.preventDefault();
        const returnTrigger = this.trigger;
        this.overlay.close();
        const drawer = getDrawer();
        if (drawer) drawer.open(returnTrigger);
        else window.location.href = `${nigat.routes.root}cart`;
      });
    }

    disconnectedCallback() {
      this.reset();
      this.lifecycle?.destroy();
      this.lifecycle = null;
    }

    reset() {
      this.sequence += 1;
      this.request?.abort();
      this.request = null;
      this.content?.querySelectorAll(".product-modal[open]").forEach(closeModal);
      if (this.content) this.content.replaceChildren();
      if (this.status) this.status.hidden = true;
      if (this.error) this.error.hidden = true;
      if (this.fallback) this.fallback.hidden = true;
    }

    rekey(fragment, prefix) {
      const ids = new Map();
      fragment.querySelectorAll("[id]").forEach((node) => {
        const original = node.id;
        const next = `${prefix}-${original}`;
        ids.set(original, next);
        node.id = next;
      });
      fragment.querySelectorAll("[for], [form], [aria-labelledby], [aria-describedby], [aria-controls], [data-modal-open], a[href^='#']").forEach((node) => {
        for (const attribute of ["for", "form", "data-modal-open"]) {
          const value = node.getAttribute(attribute);
          if (ids.has(value)) node.setAttribute(attribute, ids.get(value));
        }
        for (const attribute of ["aria-labelledby", "aria-describedby", "aria-controls"]) {
          const value = node.getAttribute(attribute);
          if (value) node.setAttribute(attribute, value.split(/\s+/).map((part) => ids.get(part) || part).join(" "));
        }
        const href = node.getAttribute("href");
        if (href?.startsWith("#") && ids.has(href.slice(1))) node.setAttribute("href", `#${ids.get(href.slice(1))}`);
      });
      fragment.querySelectorAll("variant-picker input[type='radio']").forEach((input) => {
        input.name = `${prefix}-${input.name}`;
      });
      fragment.dataset.productInstance = prefix;
      fragment.querySelectorAll("product-form, variant-picker").forEach((node) => {
        node.dataset.sectionId = prefix;
      });
    }

    async open(trigger) {
      this.reset();
      this.trigger = trigger;
      const current = this.sequence;
      const url = new URL(trigger.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      url.searchParams.set("view", "quick-view");
      if (this.status) this.status.hidden = false;
      this.overlay.open(trigger);
      const request = this.lifecycle.trackRequest(new AbortController());
      this.request = request;
      try {
        const response = await fetch(url, { signal: request.signal, headers: { Accept: "text/html" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        if (request.signal.aborted || current !== this.sequence || !this.isConnected) return;
        const parsed = new DOMParser().parseFromString(html, "text/html");
        const product = parsed.querySelector("[data-product-section]");
        if (!product || product.dataset.productId !== trigger.dataset.productId) throw new Error("Product fragment missing or mismatched");
        product.querySelectorAll("script:not([type='application/json'])").forEach((script) => script.remove());
        const fragment = document.importNode(product, true);
        this.rekey(fragment, `quick-view-${current}`);
        this.content.replaceChildren(fragment);
        this.status.hidden = true;
      } catch (error) {
        if (error.name === "AbortError" || current !== this.sequence || !this.isConnected) return;
        this.status.hidden = true;
        this.error.textContent = this.dataset.loadError;
        this.error.hidden = false;
        this.fallback.href = trigger.href;
        this.fallback.hidden = false;
      } finally {
        this.lifecycle?.untrackRequest(request);
        if (this.request === request) this.request = null;
      }
    }

    async quickAdd(form) {
      if (form.dataset.loading === "true") return;
      const button = form.querySelector("button[type='submit']");
      const error = form.closest(".theme-product-card")?.querySelector("[data-quick-add-error]");
      if (error) error.hidden = true;
      form.dataset.loading = "true";
      if (button) button.disabled = true;
      const request = this.lifecycle.trackRequest(new AbortController());
      const observer = new MutationObserver(() => {
        if (!form.isConnected) request.abort();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      try {
        const response = await fetch(`${nigat.routes.root}cart/add.js`, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
          signal: request.signal,
        });
        const data = await response.json();
        if (!response.ok || data.status) {
          const reason = new Error(data.description || data.message || this.dataset.addError);
          reason.shopifyResponse = true;
          throw reason;
        }
        if (!form.isConnected || request.signal.aborted) return;
        await refreshCart(request.signal);
        if (!form.isConnected || request.signal.aborted) return;
        await renderCartSections(request.signal);
        if (!form.isConnected || request.signal.aborted) return;
        const drawer = getDrawer();
        if (drawer) drawer.open(button);
        else window.location.href = `${nigat.routes.root}cart`;
      } catch (cause) {
        if (cause.name !== "AbortError" && form.isConnected && error) {
          error.textContent = cause.shopifyResponse ? cause.message : this.dataset.addError;
          error.hidden = false;
        }
      } finally {
        observer.disconnect();
        this.lifecycle?.untrackRequest(request);
        if (form.isConnected) {
          form.dataset.loading = "false";
          if (button) button.disabled = false;
        }
      }
    }
  }
  if (!customElements.get("quick-view-controller")) {
    customElements.define("quick-view-controller", QuickViewController);
  }

  /* --- Quantity stepper (<quantity-input>) ----------------------------- */
  class QuantityInput extends HTMLElement {
    connectedCallback() {
      if (this.lifecycle) return;
      this.lifecycle = createLifecycleScope();
      this.input = this.querySelector("input");
      this.querySelectorAll("button").forEach((btn) => {
        this.lifecycle.listen(btn, "click", (e) => {
          e.preventDefault();
          if (!this.input) return;
          const step = parseInt(this.input.step, 10) || 1;
          const current = parseInt(this.input.value, 10) || 0;
          const min = parseInt(this.input.min, 10) || 0;
          const max = parseInt(this.input.max, 10);
          const next = Math.min(Number.isFinite(max) ? max : Infinity, Math.max(min, current + (btn.name === "plus" ? step : -step)));
          this.input.value = next;
          this.input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
    }

    disconnectedCallback() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
    }
  }
  customElements.define("quantity-input", QuantityInput);

  /* --- Cart line item updates (event-delegated on document) ------------ */
  const pendingLineChanges = new Map();
  let cartMutationQueue = Promise.resolve();
  let cartRenderRetryTimer = null;

  async function renderCartAfterMutation() {
    if (cartRenderRetryTimer) clearTimeout(cartRenderRetryTimer);
    cartRenderRetryTimer = null;
    if (await renderCartSections()) return;
    cartRenderRetryTimer = setTimeout(() => {
      cartRenderRetryTimer = null;
      renderCartSections();
    }, 1000);
  }

  function changeLine(key, quantity, triggerEl) {
    if (!key) return Promise.resolve();
    const existing = pendingLineChanges.get(key);
    if (existing) {
      existing.quantity = quantity;
      return existing.promise;
    }

    const state = { quantity, promise: null };
    pendingLineChanges.set(key, state);
    const itemEl = triggerEl?.closest("[data-cart-item]");
    itemEl?.classList.add("is-loading");
    state.promise = cartMutationQueue
      .then(async () => {
        while (state.quantity !== null) {
          const nextQuantity = state.quantity;
          state.quantity = null;
          const res = await fetch(`${nigat.routes.root}cart/change.js`, {
            ...fetchConfig(),
            body: JSON.stringify({ id: key, quantity: nextQuantity }),
          });
          if (!res.ok) throw new Error(`cart change failed (${res.status})`);
          const cart = await res.json();
          CartEvents.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
          await renderCartAfterMutation();
          if (nextQuantity === 0) state.quantity = null;
        }
      })
      .catch(async (err) => {
        console.error("[nigat] cart change failed", err);
        try {
          await refreshCart();
          await renderCartSections();
        } catch (refreshError) {
          console.warn("[nigat] cart recovery failed", refreshError);
        }
      })
      .finally(() => {
        pendingLineChanges.delete(key);
        if (itemEl?.isConnected) itemEl.classList.remove("is-loading");
      });
    cartMutationQueue = state.promise;
    return state.promise;
  }

  document.addEventListener("change", (e) => {
    const input = e.target.closest("[data-quantity-input]");
    if (!input) return;
    const key = input.dataset.lineKey || input.closest("[data-cart-item]")?.dataset.lineKey;
    const qty = Math.max(0, parseInt(input.value, 10) || 0);
    changeLine(key, qty, input);
  });

  document.addEventListener("click", (e) => {
    const remove = e.target.closest("[data-cart-remove]");
    if (remove) {
      e.preventDefault();
      const key = remove.dataset.lineKey || remove.closest("[data-cart-item]")?.dataset.lineKey;
      changeLine(key, 0, remove);
      return;
    }

    const wishlistBtn = e.target.closest("[data-cart-wishlist]");
    if (wishlistBtn) {
      e.preventDefault();
      const itemEl = wishlistBtn.closest("[data-cart-item]");
      const variantId = wishlistBtn.dataset.variantId || itemEl?.dataset.variantId;
      const productId = wishlistBtn.dataset.productId || itemEl?.dataset.productId;
      const productTitle =
        itemEl?.querySelector(".cart__item-title")?.textContent?.trim() || "Item";

      const isNowSaved = toggleWishlist(variantId, { productId, title: productTitle });
      syncWishlistUI();

      if (isNowSaved) {
        showSiteToast(`${productTitle} added to wishlist`, { icon: "heart" });
      } else {
        showSiteToast(`${productTitle} removed from wishlist`, { icon: "unheart" });
      }
      return;
    }
  });

  /* --- Cart / search / menu toggles ------------------------------------ */
  document.addEventListener("click", (e) => {
    const cartToggle = e.target.closest("[data-cart-toggle]");
    if (cartToggle) {
      const drawer = getDrawer();
      if (drawer) {
        e.preventDefault();
        drawer.open(cartToggle);
      }
      return;
    }

    const searchToggle = e.target.closest("[data-search-toggle]");
    if (searchToggle) {
      e.preventDefault();
      if (window.SearchBanner) {
        window.SearchBanner.open(searchToggle);
      } else {
        const banner = document.querySelector("[data-search-banner], [data-search-panel]");
        if (banner) {
          banner.hidden = false;
          const input = banner.querySelector('input[type="search"]');
          if (input) input.focus();
        }
      }
      return;
    }

    const menuToggle = e.target.closest("[data-menu-toggle]");
    if (menuToggle) {
      const menu = document.querySelector("[data-mobile-menu]");
      if (menu) {
        const willOpen = menu.hidden;
        menu.hidden = !willOpen;
        menuToggle.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) {
          lockBodyScroll();
        } else {
          unlockBodyScroll();
        }
      }
    }
  });

  /* --- <variant-picker> ------------------------------------------------ */
  class VariantPicker extends HTMLElement {
    connectedCallback() {
      if (this.lifecycle) return;
      this.lifecycle = createLifecycleScope();
      const json = this.querySelector("[data-variant-json]");
      try {
        this.variants = json ? JSON.parse(json.textContent) : [];
      } catch {
        this.variants = [];
      }
      try {
        this.quantityRules = JSON.parse(this.querySelector("[data-quantity-rules]")?.textContent || "[]");
      } catch {
        this.quantityRules = [];
      }
      try {
        this.variantMedia = JSON.parse(this.querySelector("[data-variant-media]")?.textContent || "[]");
      } catch {
        this.variantMedia = [];
      }
      this.productRoot = this.closest("[data-product-section]");
      this.lifecycle.listen(this, "change", () => this.onChange());
      this.updateOptionsAvailability();
    }

    disconnectedCallback() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
      this.productRoot = null;
    }

    getSelectedOptions() {
      const inputs = Array.from(
        this.querySelectorAll("input.variant-picker__input:checked, select.variant-picker__input")
      );
      inputs.sort((a, b) => Number(a.dataset.optionIndex) - Number(b.dataset.optionIndex));
      return inputs.map((i) => i.value);
    }

    updateOptionsAvailability() {
      const selected = this.getSelectedOptions();
      if (!this.variants.length) return;

      this.querySelectorAll(".variant-picker__option").forEach((fieldset, optIndex) => {
        fieldset.querySelectorAll("input.variant-picker__input").forEach((input) => {
          const val = input.value;
          const matchingVariants = this.variants.filter((v) => {
            return (
              v.options[optIndex] === val &&
              v.options.every((opt, i) => i === optIndex || opt === selected[i])
            );
          });
          const isAvailable = matchingVariants.some((v) => v.available);
          const label = fieldset.querySelector(`label[for="${input.id}"]`);
          if (label) {
            label.classList.toggle("is-sold-out", matchingVariants.length > 0 && !isAvailable);
            label.classList.toggle("is-unavailable", matchingVariants.length === 0);
          }
        });

        fieldset.querySelectorAll("select.variant-picker__input option").forEach((opt) => {
          const val = opt.value;
          const matchingVariants = this.variants.filter((v) => {
            return (
              v.options[optIndex] === val &&
              v.options.every((o, i) => i === optIndex || o === selected[i])
            );
          });
          const isAvailable = matchingVariants.some((v) => v.available);
          const unavailableText = this.dataset.unavailableText;
          const soldOutText = this.dataset.soldOutText;
          let baseText = opt.textContent.trim();
          for (const suffix of [unavailableText, soldOutText]) {
            if (suffix && baseText.endsWith(` (${suffix})`)) {
              baseText = baseText.slice(0, -suffix.length - 3).trim();
            }
          }
          if (matchingVariants.length === 0) {
            opt.textContent = `${baseText} (${unavailableText})`;
            opt.disabled = true;
          } else if (!isAvailable) {
            opt.textContent = `${baseText} (${soldOutText})`;
            opt.disabled = false;
          } else {
            opt.textContent = baseText;
            opt.disabled = false;
          }
        });
      });
    }

    onChange() {
      const selected = this.getSelectedOptions();
      this.querySelectorAll("[data-selected-value]").forEach((el, i) => {
        if (selected[i] !== undefined) el.textContent = selected[i];
      });

      this.updateOptionsAvailability();

      const match = this.variants.find((v) => v.options.every((opt, i) => opt === selected[i]));
      const idInput = this.productRoot?.querySelector("[data-variant-id]");
      if (idInput) {
        idInput.value = match?.id || "";
        idInput.disabled = !match?.available;
      }
      this.updateButton(match);
      this.updateStickyBar(match);
      this.updateQuantity(match);
      if (!match) {
        this.updatePrice(null);
        return;
      }

      // Only the product represented by the current page owns its variant URL.
      if (!this.closest("[data-quick-view-content]") && this.dataset.url && new URL(this.dataset.url, window.location.origin).pathname === window.location.pathname) {
        const url = new URL(window.location.href);
        url.searchParams.set("variant", match.id);
        window.history.replaceState({}, "", url);
      }

      // Update price + button availability
      this.updatePrice(match);
      syncWishlistUI();
      // Switch active media if variant has featured_media
      const selectedMedia = this.variantMedia.find((candidate) => String(candidate.id) === String(match.id));
      if (selectedMedia?.mediaId) {
        const mediaId = String(selectedMedia.mediaId);
        const gallery = this.productRoot?.querySelector("[data-product-gallery]");
        if (gallery) {
          gallery.querySelectorAll(".product__media-item").forEach((item) => {
            item.classList.toggle("is-active", item.dataset.mediaId === mediaId);
          });
          gallery.querySelectorAll("[data-thumbnail]").forEach((t) => {
            t.classList.toggle("is-active", t.dataset.mediaId === mediaId);
          });
        }
      }
      this.productRoot?.dispatchEvent(
        new CustomEvent("product:variant-changed", {
          bubbles: true,
          detail: {
            productId: this.productRoot.dataset.productId,
            instanceId: this.productRoot.dataset.productInstance,
            variant: match,
          },
        })
      );
    }

    updatePrice(variant) {
      const priceWrap = this.productRoot?.querySelector("[data-product-price]");
      if (!priceWrap) return;
      const price = priceWrap.querySelector(".price");
      const container = price?.querySelector(".price__container");
      if (!price || !container) return;
      let regular = container.querySelector(".price-item--regular");
      if (!variant) {
        price.classList.remove("price--on-sale");
        if (regular) regular.textContent = this.dataset.unavailableText;
        container.querySelector(".price-item--sale")?.remove();
        price.querySelector(".price__unit")?.remove();
        return;
      }
      const onSale = Number(variant.compare_at_price) > Number(variant.price);
      if (regular && regular.tagName.toLowerCase() !== (onSale ? "s" : "span")) {
        const replacement = document.createElement(onSale ? "s" : "span");
        replacement.className = regular.className;
        regular.replaceWith(replacement);
        regular = replacement;
      }
      price.classList.toggle("price--on-sale", onSale);
      price.classList.toggle("price--sold-out", !variant.available);
      if (regular) {
        regular.textContent = nigat.money(onSale ? variant.compare_at_price : variant.price);
        regular.hidden = false;
      }
      let sale = container.querySelector(".price-item--sale");
      if (onSale) {
        if (!sale) {
          sale = document.createElement("span");
          sale.className = "price-item price-item--sale";
          container.appendChild(sale);
        }
        sale.textContent = nigat.money(variant.price);
      } else sale?.remove();
      let unit = price.querySelector(".price__unit");
      if (variant.unit_price && variant.unit_price_measurement) {
        if (!unit) {
          unit = document.createElement("div");
          unit.className = "price__unit";
          price.appendChild(unit);
        }
        const measure = variant.unit_price_measurement;
        unit.textContent = `${nigat.money(variant.unit_price)} / ${measure.reference_value === 1 ? "" : measure.reference_value}${measure.reference_unit}`;
      } else unit?.remove();
    }

    updateStickyBar(variant) {
      const sticky = this.productRoot?.querySelector("[data-sticky-add-to-cart]");
      if (!sticky) return;
      const variantEl = sticky.querySelector("[data-sticky-variant]");
      if (variantEl) {
        variantEl.textContent = variant && variant.title !== "Default Title" ? variant.title : "";
      }
      const priceEl = sticky.querySelector("[data-sticky-price]");
      if (priceEl) {
        priceEl.textContent = variant ? nigat.money(variant.price) : this.dataset.unavailableText;
      }
      const btn = sticky.querySelector("[data-sticky-submit]");
      const btnText = sticky.querySelector("[data-sticky-btn-text]");
      if (btn) {
        btn.disabled = !variant?.available;
      }
      if (btnText) {
        btnText.textContent = !variant ? this.dataset.unavailableText : variant.available ? this.dataset.addText : this.dataset.soldOutText;
      }
      if (variant?.featured_image?.src) {
        const img = sticky.querySelector("[data-sticky-image]");
        if (img) img.src = variant.featured_image.src;
      }
    }

    updateButton(variant) {
      const form = this.productRoot?.querySelector("product-form");
      if (!form) return;
      const btn = form.querySelector("[data-add-to-cart]");

      if (btn) {
        const text = btn.querySelector("[data-add-to-cart-text]");
        btn.disabled = !variant?.available;
        if (text) {
          text.textContent = !variant ? this.dataset.unavailableText : variant.available ? this.dataset.addText : this.dataset.soldOutText;
        }
      }

    }

    updateQuantity(variant) {
      const rule = this.quantityRules.find((candidate) => String(candidate.id) === String(variant?.id));
      this.productRoot?.querySelectorAll("[data-product-quantity]").forEach((control) => {
        const input = control.querySelector('input[name="quantity"]');
        if (input) {
          const min = Math.max(1, Number(rule?.min) || 1);
          const increment = Math.max(1, Number(rule?.increment) || 1);
          input.min = String(min);
          input.step = String(increment);
          if (rule?.max != null) input.max = String(rule.max);
          else input.removeAttribute("max");
          const current = Number(input.value);
          const aligned = min + Math.max(0, Math.round((current - min) / increment)) * increment;
          input.value = String(Math.min(rule?.max ?? Infinity, aligned));
        }
        control.querySelectorAll("button, input").forEach((element) => {
          element.disabled = !variant?.available;
        });
      });
    }
  }
  customElements.define("variant-picker", VariantPicker);

  /* --- Product gallery thumbnails -------------------------------------- */
  document.addEventListener("click", (e) => {
    const thumb = e.target.closest("[data-thumbnail]");
    if (!thumb) return;
    const gallery = thumb.closest("[data-product-gallery]");
    if (!gallery) return;
    const mediaId = thumb.dataset.mediaId;

    gallery.querySelectorAll(".product__media-item").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.mediaId === mediaId);
    });
    gallery.querySelectorAll("[data-thumbnail]").forEach((t) => {
      t.classList.toggle("is-active", t === thumb);
    });
    gallery.querySelectorAll(".product__image").forEach((img) => {
      img.style.transform = "scale(1)";
      img.style.transformOrigin = "center center";
    });
  });

  /* --- Product media magnifier & Picasa-style zoomer portal ----------- */
  const zoomControllers = new Map();
  function initProductZoom(productRoot) {
    const mainMedia = productRoot.querySelector("[data-product-media-main]");
    const zoomer = productRoot.querySelector("[data-product-zoomer]");
    if (!mainMedia || !zoomer) return null;
    const lifecycle = createLifecycleScope();
    let hasScrollLock = false;

    // Move zoomer dialog to body so it acts as a true portal without CSS clipping
    if (zoomer.parentElement !== document.body) {
      document.body.appendChild(zoomer);
    }

    const viewport = zoomer.querySelector("[data-zoomer-viewport]");
    const slides = Array.from(zoomer.querySelectorAll("[data-zoomer-slide]"));
    const counterEl = zoomer.querySelector("[data-zoomer-counter]");
    const zoomInBtn = zoomer.querySelector("[data-zoom-in]");
    const zoomOutBtn = zoomer.querySelector("[data-zoom-out]");
    const resetBtn = zoomer.querySelector("[data-zoom-reset]");
    const pctEl = zoomer.querySelector("[data-zoom-pct]");
    const prevBtn = zoomer.querySelector("[data-zoomer-prev]");
    const nextBtn = zoomer.querySelector("[data-zoomer-next]");

    let currentIndex = 0;
    let zoomTrigger = null;
    let zoom = 1;
    let position = { x: 0, y: 0 };
    let dragStart = null;
    let isDragging = false;
    let pointerDownTime = 0;
    let pointerDownPos = { x: 0, y: 0 };
    let initialPinchDistance = 0;
    let initialPinchZoom = 1;
    let swipeStartX = 0;
    let swipeStartY = 0;

    function getActiveImg() {
      const activeSlide = slides[currentIndex];
      return activeSlide ? activeSlide.querySelector(".product-zoomer__img") : null;
    }

    function applyTransform(immediate = false) {
      const img = getActiveImg();
      if (!img) return;

      if (immediate) {
        img.style.transition = "none";
      } else {
        img.style.transition = "transform 0.15s ease-out";
      }

      img.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`;

      if (viewport) {
        if (zoom > 1) {
          viewport.style.cursor = isDragging ? "grabbing" : "grab";
        } else {
          viewport.style.cursor = "zoom-in";
        }
      }

      if (immediate) {
        requestAnimationFrame(() => {
          if (img.isConnected) img.style.transition = "transform 0.15s ease-out";
        });
      }
    }

    function updateUI() {
      if (pctEl) pctEl.textContent = `${Math.round(zoom * 100)}%`;
      if (zoomInBtn) zoomInBtn.disabled = zoom >= 4;
      if (zoomOutBtn) zoomOutBtn.disabled = zoom <= 1;
      if (resetBtn) resetBtn.disabled = zoom === 1 && position.x === 0 && position.y === 0;

      if (counterEl) {
        if (slides.length > 1) {
          counterEl.style.display = "";
          counterEl.textContent = `${currentIndex + 1} / ${slides.length}`;
        } else {
          counterEl.style.display = "none";
        }
      }
    }

    function resetView() {
      zoom = 1;
      position = { x: 0, y: 0 };
      applyTransform();
      updateUI();
    }

    function changeZoom(amount, originX, originY) {
      const oldZoom = zoom;
      const nextZoom = Math.min(4, Math.max(1, Number((oldZoom + amount).toFixed(2))));
      if (nextZoom === oldZoom) return;

      if (originX !== undefined && originY !== undefined && nextZoom > 1) {
        const rect = viewport
          ? viewport.getBoundingClientRect()
          : { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 };
        const cx = originX - (rect.left + rect.width / 2);
        const cy = originY - (rect.top + rect.height / 2);
        const factor = nextZoom / oldZoom;
        position.x = cx - (cx - position.x) * factor;
        position.y = cy - (cy - position.y) * factor;
      }

      zoom = nextZoom;
      if (zoom === 1) {
        position = { x: 0, y: 0 };
      }
      applyTransform();
      updateUI();
    }

    function checkImageLoaded(slide) {
      if (!slide) return;
      const img = slide.querySelector(".product-zoomer__img");
      const skeleton = slide.querySelector("[data-zoomer-skeleton]");
      if (!img) return;

      const markLoaded = () => {
        if (skeleton) skeleton.classList.add("is-hidden");
        img.classList.remove("is-loading");
      };

      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else {
        if (skeleton) skeleton.classList.remove("is-hidden");
        img.classList.add("is-loading");
        lifecycle.listen(img, "load", markLoaded, { once: true });
        lifecycle.listen(img, "error", markLoaded, { once: true });
      }
    }

    function goToSlide(index) {
      if (slides.length === 0) return;
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      currentIndex = index;
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === currentIndex);
      });

      resetView();
      checkImageLoaded(slides[currentIndex]);

      // Sync product page main gallery and thumbnails
      const targetMediaId = slides[currentIndex].dataset.mediaId;
      if (targetMediaId) {
        const gallery = productRoot.querySelector("[data-product-gallery]");
        if (gallery) {
          gallery.querySelectorAll(".product__media-item").forEach((item) => {
            item.classList.toggle("is-active", item.dataset.mediaId === targetMediaId);
          });
          gallery.querySelectorAll("[data-thumbnail]").forEach((t) => {
            t.classList.toggle("is-active", t.dataset.mediaId === targetMediaId);
          });
        }
      }
    }

    function openZoomer(mediaId) {
      zoomTrigger = document.activeElement;
      if (mediaId) {
        const idx = slides.findIndex((s) => s.dataset.mediaId === mediaId);
        if (idx !== -1) currentIndex = idx;
      } else {
        const activeMain = mainMedia.querySelector(".product__media-item.is-active");
        if (activeMain) {
          const idx = slides.findIndex((s) => s.dataset.mediaId === activeMain.dataset.mediaId);
          if (idx !== -1) currentIndex = idx;
        }
      }

      if (typeof zoomer.showModal === "function") {
        zoomer.showModal();
      } else {
        zoomer.setAttribute("open", "");
      }
      if (!hasScrollLock) {
        lockBodyScroll();
        hasScrollLock = true;
      }

      goToSlide(currentIndex);
    }

    function closeZoomer() {
      if (typeof zoomer.close === "function") {
        zoomer.close();
      } else {
        zoomer.removeAttribute("open");
      }
      if (hasScrollLock) {
        unlockBodyScroll();
        hasScrollLock = false;
      }
      resetView();
      if (zoomTrigger?.isConnected) zoomTrigger.focus();
      zoomTrigger = null;
    }

    // Clicking on the main photo area opens the portal zoomer (ignoring action buttons)
    lifecycle.listen(mainMedia, "click", (e) => {
      if (
        e.target.closest(
          ".product__image-actions, .product__floating-btn, [data-floating-wishlist], [data-floating-share]"
        )
      ) {
        return;
      }
      const activeItem = mainMedia.querySelector(".product__media-item.is-active");
      if (activeItem?.dataset.mediaType !== "image") return;
      openZoomer(activeItem ? activeItem.dataset.mediaId : null);
    });
    lifecycle.listen(mainMedia, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const item = e.target.closest(".product__media-item.is-active[role='button']");
      if (!item) return;
      e.preventDefault();
      openZoomer(item.dataset.mediaId);
    });

    // Close buttons and backdrop
    zoomer.querySelectorAll("[data-product-zoomer-close]").forEach((btn) => {
      lifecycle.listen(btn, "click", (e) => {
        e.stopPropagation();
        closeZoomer();
      });
    });

    lifecycle.listen(zoomer, "close", () => {
      if (hasScrollLock) {
        unlockBodyScroll();
        hasScrollLock = false;
      }
      resetView();
    });

    // Toolbar controls
    lifecycle.listen(zoomInBtn, "click", () => changeZoom(0.3));
    lifecycle.listen(zoomOutBtn, "click", () => changeZoom(-0.3));
    lifecycle.listen(resetBtn, "click", resetView);

    // Prev / Next navigation
    if (prevBtn)
      lifecycle.listen(prevBtn, "click", (e) => {
        e.stopPropagation();
        goToSlide(currentIndex - 1);
      });
    if (nextBtn)
      lifecycle.listen(nextBtn, "click", (e) => {
        e.stopPropagation();
        goToSlide(currentIndex + 1);
      });

    // Mouse wheel zoom
    if (viewport) {
      lifecycle.listen(
        viewport,
        "wheel",
        (e) => {
          e.preventDefault();
          changeZoom(e.deltaY < 0 ? 0.25 : -0.25, e.clientX, e.clientY);
        },
        { passive: false }
      );

      // Pointer drag & click handling
      lifecycle.listen(viewport, "pointerdown", (e) => {
        if (!e.isPrimary) return;
        pointerDownTime = Date.now();
        pointerDownPos = { x: e.clientX, y: e.clientY };

        if (zoom > 1) {
          isDragging = true;
          viewport.setPointerCapture(e.pointerId);
          dragStart = {
            x: e.clientX,
            y: e.clientY,
            posX: position.x,
            posY: position.y,
          };
          applyTransform(true);
        }
      });

      lifecycle.listen(viewport, "pointermove", (e) => {
        if (isDragging && dragStart && zoom > 1) {
          position.x = dragStart.posX + (e.clientX - dragStart.x);
          position.y = dragStart.posY + (e.clientY - dragStart.y);
          applyTransform(true);
        }
      });

      const handlePointerEnd = (e) => {
        const wasDragging = isDragging;
        isDragging = false;
        dragStart = null;
        applyTransform();

        // Check if this was a quick click/tap without dragging
        const movedDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        const elapsed = Date.now() - pointerDownTime;
        if (!wasDragging && movedDist < 8 && elapsed < 350) {
          if (
            e.target.closest(
              "[data-zoomer-toolbar], .product-zoomer__nav, .product-zoomer__close, .product-zoomer__counter"
            )
          )
            return;
          if (zoom === 1) {
            changeZoom(1, e.clientX, e.clientY);
          } else {
            resetView();
          }
        }
      };

      lifecycle.listen(viewport, "pointerup", handlePointerEnd);
      lifecycle.listen(viewport, "pointercancel", handlePointerEnd);

      // Mobile Touch: Pinch-to-zoom & Swipe
      lifecycle.listen(
        viewport,
        "touchstart",
        (e) => {
          if (e.touches.length === 2) {
            initialPinchDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            initialPinchZoom = zoom;
          } else if (e.touches.length === 1) {
            swipeStartX = e.touches[0].clientX;
            swipeStartY = e.touches[0].clientY;
          }
        },
        { passive: true }
      );

      lifecycle.listen(
        viewport,
        "touchmove",
        (e) => {
          if (e.touches.length === 2 && initialPinchDistance > 0) {
            e.preventDefault();
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            const ratio = dist / initialPinchDistance;
            const nextZoom = Math.min(
              4,
              Math.max(1, Number((initialPinchZoom * ratio).toFixed(2)))
            );
            zoom = nextZoom;
            if (zoom === 1) position = { x: 0, y: 0 };
            applyTransform(true);
            updateUI();
          }
        },
        { passive: false }
      );

      lifecycle.listen(
        viewport,
        "touchend",
        (e) => {
          if (initialPinchDistance > 0 && e.touches.length < 2) {
            initialPinchDistance = 0;
            applyTransform();
          } else if (e.touches.length === 0 && zoom === 1 && slides.length > 1) {
            const touch = e.changedTouches[0];
            const diffX = touch.clientX - swipeStartX;
            const diffY = touch.clientY - swipeStartY;
            if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
              if (diffX < 0) {
                goToSlide(currentIndex + 1);
              } else {
                goToSlide(currentIndex - 1);
              }
            }
          }
        },
        { passive: true }
      );
    }

    // Keyboard navigation when zoomer is open
    lifecycle.listen(document, "keydown", (e) => {
      const isOpen =
        zoomer.hasAttribute("open") || (typeof zoomer.open === "boolean" && zoomer.open);
      if (!isOpen) return;

      if (e.key === "Escape") {
        closeZoomer();
      } else if (e.key === "ArrowRight") {
        goToSlide(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        goToSlide(currentIndex - 1);
      } else if (e.key === "+" || e.key === "=") {
        changeZoom(0.25);
      } else if (e.key === "-" || e.key === "_") {
        changeZoom(-0.25);
      } else if (e.key === "0" || e.key === "r" || e.key === "R") {
        resetView();
      }
    });
    return {
      destroy() {
        lifecycle.destroy();
        if (hasScrollLock) unlockBodyScroll();
        if (zoomer.open) zoomer.close();
        productRoot.appendChild(zoomer);
      },
    };
  }

  function syncProductZoomControllers() {
    for (const [root, controller] of zoomControllers) {
      if (!root.isConnected) {
        controller.destroy();
        zoomControllers.delete(root);
      }
    }
    document.querySelectorAll("[data-product-section]").forEach((root) => {
      if (zoomControllers.has(root)) return;
      const controller = initProductZoom(root);
      if (controller) zoomControllers.set(root, controller);
    });
  }

  /* --- <predictive-search> --------------------------------------------- */
  class PredictiveSearch extends HTMLElement {
    connectedCallback() {
      if (this.lifecycle) return;
      this.input = this.querySelector("[data-search-input]");
      this.results = this.querySelector("[data-search-results]");
      if (!this.input || !this.results) return;
      this.lifecycle = createLifecycleScope();
      this.lifecycle.listen(this.input, "input", () => {
        if (this.searchTimer) this.lifecycle.clearTimeout(this.searchTimer);
        this.searchTimer = this.lifecycle.timeout(() => this.search(), 250);
      });
      this.lifecycle.listen(document, "click", (e) => {
        if (!this.contains(e.target)) this.hide();
      });
    }

    disconnectedCallback() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
      this.request = null;
      this.searchTimer = null;
    }

    async search() {
      this.request?.abort();
      const term = this.input.value.trim();
      if (term.length < 2) {
        this.hide();
        return;
      }
      const request = this.lifecycle.trackRequest(new AbortController());
      this.request = request;
      try {
        const res = await fetch(
          `${nigat.routes.root}search/suggest.json?q=${encodeURIComponent(term)}&resources[type]=product,page&resources[options][prefix]=last&resources[limit]=6`,
          { signal: request.signal }
        );
        const data = await res.json();
        if (request.signal.aborted || !this.isConnected) return;
        this.render(data.resources.results, term);
      } catch (err) {
        if (err.name !== "AbortError") console.warn("[nigat] predictive search failed", err);
      } finally {
        this.lifecycle?.untrackRequest(request);
        if (this.request === request) this.request = null;
      }
    }

    render(results, term) {
      const products = results.products || [];
      const pages = results.pages || [];
      if (products.length === 0 && pages.length === 0) {
        this.results.innerHTML = `<p class="search-result__empty caption">No quick results. Press Enter to search.</p>`;
        this.show();
        return;
      }

      let html = '<ul class="search-result-list" role="list">';
      products.forEach((p) => {
        const img = p.image
          ? `<img class="search-result__image" src="${p.image}" alt="" width="48" height="48" loading="lazy">`
          : "";
        const price = p.price
          ? `<span class="caption">${nigat.money(Math.round(parseFloat(p.price) * 100))}</span>`
          : "";
        html += `<li><a class="search-result" href="${p.url}" role="option">${img}<span class="search-result__title">${p.title}</span>${price}</a></li>`;
      });
      pages.forEach((pg) => {
        html += `<li><a class="search-result" href="${pg.url}" role="option"><span class="search-result__title">${pg.title}</span></a></li>`;
      });
      html += "</ul>";
      this.results.innerHTML = html;
      this.show();
    }

    show() {
      this.results.hidden = false;
      this.input.setAttribute("aria-expanded", "true");
    }
    hide() {
      this.results.hidden = true;
      this.input.setAttribute("aria-expanded", "false");
    }
  }
  if (!customElements.get("predictive-search")) {
    customElements.define("predictive-search", PredictiveSearch);
  }

  /* --- Modern Search Banner Expansion (search-banner.png) --------------- */
  class SearchBannerController {
    constructor() {
      this.banner = document.querySelector("[data-search-banner]");
      if (!this.banner) return;

      // Ensure banner is a direct child of <body> to escape any ancestor stacking context/transforms
      if (this.banner.parentElement && this.banner.parentElement !== document.body) {
        document.body.appendChild(this.banner);
      }

      this.form = this.banner.querySelector("[data-search-banner-form]");
      this.input = this.banner.querySelector("[data-search-banner-input]");
      this.clearBtn = this.banner.querySelector("[data-search-banner-clear]");
      this.loading = this.banner.querySelector("[data-search-banner-loading]");
      this.recentBox = this.banner.querySelector("[data-search-recent]");
      this.recentHeader = this.banner.querySelector("[data-search-recent-header]");
      this.recentList = this.banner.querySelector("[data-search-recent-list]");
      this.clearRecentBtn = this.banner.querySelector("[data-search-clear-recent]");
      this.suggestionsBox = this.banner.querySelector("[data-search-suggestions]");
      this.suggestionsList = this.banner.querySelector("[data-search-suggestions-list]");
      this.mainTitle = this.banner.querySelector("[data-search-main-title]");
      this.mainHeader = this.banner.querySelector("[data-search-main-header]");
      this.defaultGrid = this.banner.querySelector("[data-search-default-grid]");
      this.liveResults = this.banner.querySelector("[data-search-live-results]");
      this.liveGrid = this.banner.querySelector("[data-search-live-grid]");
      this.emptyState = this.banner.querySelector("[data-search-banner-empty]");
      this.emptyTitle = this.banner.querySelector("[data-search-empty-title]");
      this.footerLabel = this.banner.querySelector("[data-search-footer-label]");
      this.viewAll = this.banner.querySelector("[data-search-view-all]");
      this.labels = {
        popularProducts: this.banner.dataset.popularProductsLabel,
        search: this.banner.dataset.searchLabel,
        recentSearch: this.banner.dataset.recentSearchLabel,
        keepShoppingFor: this.banner.dataset.keepShoppingTitle,
        resultsFor: this.banner.dataset.resultsTitle,
        noResultsFor: this.banner.dataset.noResultsTitle,
        viewAll: this.banner.dataset.viewAllLabel,
        removeRecent: this.banner.dataset.removeRecentLabel,
        viewAllProducts: this.banner.dataset.viewAllProductsLabel,
        viewAllFor: this.banner.dataset.viewAllForLabel,
        searchFor: this.banner.dataset.searchForLabel,
        salePercentage: this.banner.dataset.salePercentageLabel,
      };

      this.storageKey = "lumen_recent_searches";
      this.activeTrigger = null;
      this.currentSearchTerm = "";

      this.initEvents();
    }

    initEvents() {
      // Close buttons & backdrop
      this.banner.querySelectorAll("[data-search-close]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.close();
        });
      });

      // Escape key to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !this.banner.hidden) {
          this.close();
        }
      });

      // Input changes (live debounced search)
      if (this.input) {
        this.onInputDebounced = nigat.debounce(this.handleSearch.bind(this), 250);
        this.input.addEventListener("input", () => {
          const val = this.input.value.trim();
          if (this.clearBtn) this.clearBtn.hidden = val.length === 0;
          this.onInputDebounced();
        });

        // Form submit
        if (this.form) {
          this.form.addEventListener("submit", () => {
            const term = this.input.value.trim();
            if (term) {
              this.addRecentSearch(term);
            }
          });
        }
      }

      // Input clear button
      if (this.clearBtn) {
        this.clearBtn.addEventListener("click", () => {
          if (this.input) {
            this.input.value = "";
            this.clearBtn.hidden = true;
            this.handleSearch();
            this.input.focus();
          }
        });
      }

      // Clear all recent searches
      if (this.clearRecentBtn) {
        this.clearRecentBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.clearRecentSearches();
        });
      }

      // Delegated clicks for recent searches and suggestions
      this.banner.addEventListener("click", (e) => {
        const tagBtn = e.target.closest("[data-search-term]");
        if (tagBtn) {
          e.preventDefault();
          const term = tagBtn.dataset.searchTerm || tagBtn.textContent.trim();
          if (term) {
            this.addRecentSearch(term);
            window.location.href = `${nigat.routes.root}search?q=${encodeURIComponent(term)}&type=product`;
          }
          return;
        }

        const delRecentBtn = e.target.closest("[data-search-del-recent]");
        if (delRecentBtn) {
          e.preventDefault();
          const term = delRecentBtn.dataset.searchDelRecent;
          if (term) {
            this.removeRecentSearch(term);
          }
          return;
        }
      });
    }

    open(trigger = null) {
      if (this.banner && this.banner.parentElement && this.banner.parentElement !== document.body) {
        document.body.appendChild(this.banner);
      }
      this.activeTrigger = trigger;
      this.banner.hidden = false;
      lockBodyScroll();
      document.documentElement.classList.add("has-search-banner-open");
      this.resetToDefaultState();
      if (trigger) trigger.setAttribute("aria-expanded", "true");
      setTimeout(() => {
        if (this.input) {
          this.input.focus();
          this.input.select();
        }
      }, 60);
    }

    close() {
      this.banner.hidden = true;
      unlockBodyScroll();
      document.documentElement.classList.remove("has-search-banner-open");
      if (this.activeTrigger) {
        this.activeTrigger.setAttribute("aria-expanded", "false");
        this.activeTrigger.focus();
      }
    }

    getRecentSearches() {
      return getRecentSearches();
    }

    addRecentSearch(term) {
      addRecentSearch(term);
    }

    removeRecentSearch(term) {
      removeRecentSearch(term);
    }

    clearRecentSearches() {
      clearRecentSearches();
    }

    renderRecentSearches() {
      if (!this.recentBox || !this.recentList) return;
      const list = this.getRecentSearches();
      if (list.length === 0) {
        if (this.clearRecentBtn) this.clearRecentBtn.hidden = true;
        if (this.recentHeader) this.recentHeader.hidden = true;
        this.recentBox.hidden = false;
        const emptyTitle = this.recentList.dataset.emptyTitle;
        const emptyDescription = this.recentList.dataset.emptyDescription;
        this.recentList.innerHTML = `
          <li class="search-banner__recent-empty" data-search-recent-empty>
            <span class="search-banner__empty-icon" aria-hidden="true">
              <svg class="icon icon-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </span>
            <p class="search-banner__recent-empty-title">${this.escapeHtml(emptyTitle)}</p>
            <p class="search-banner__recent-empty-text">${this.escapeHtml(emptyDescription)}</p>
          </li>
        `;
        return;
      }

      if (this.clearRecentBtn) this.clearRecentBtn.hidden = false;
      if (this.recentHeader) this.recentHeader.hidden = false;
      this.recentBox.hidden = false;
      this.recentList.innerHTML = list
        .map(
          (term) => `
        <li class="search-banner__recent-item">
          <button type="button" class="search-banner__recent-btn" data-search-term="${this.escapeHtml(term)}">
            <svg class="icon icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:1.4rem;height:1.4rem;opacity:0.6;"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <span>${this.escapeHtml(term)}</span>
          </button>
          <button type="button" class="search-banner__recent-del" data-search-del-recent="${this.escapeHtml(term)}" aria-label="${this.escapeHtml(this.labels.removeRecent.replace("[term]", term))}">
            <svg class="icon icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:1.2rem;height:1.2rem;"><path d="M18 6 6 18M6 6l12 12"></path></svg>
          </button>
        </li>
      `
        )
        .join("");
    }

    resetToDefaultState() {
      if (this.loading) this.loading.hidden = true;
      if (this.defaultGrid) this.defaultGrid.hidden = false;
      if (this.liveResults) this.liveResults.hidden = true;
      if (this.emptyState) this.emptyState.hidden = true;
      if (this.suggestionsBox) this.suggestionsBox.hidden = true;
      if (this.recentBox) this.recentBox.hidden = false;
      this.renderRecentSearches();

      if (this.mainHeader) {
        this.mainHeader.hidden = !this.defaultGrid?.querySelector(".search-banner__product-item");
      }

      const list = this.getRecentSearches();
      if (list.length > 0) {
        const topRecent = list[0];
        if (this.mainTitle)
          this.mainTitle.textContent = this.formatLabel(
            this.labels.keepShoppingFor,
            topRecent.toUpperCase()
          );
        if (this.footerLabel) this.footerLabel.textContent = this.labels.recentSearch;
        if (this.viewAll) {
          this.viewAll.href = `${nigat.routes.root}search?q=${encodeURIComponent(topRecent)}&type=product`;
          this.viewAll.textContent = this.labels.viewAllFor.replace("[term]", topRecent);
        }
      } else {
        if (this.mainTitle) this.mainTitle.textContent = this.labels.popularProducts;
        if (this.footerLabel) this.footerLabel.textContent = this.labels.search;
        if (this.viewAll) {
          this.viewAll.href = `${nigat.routes.root}search`;
          this.viewAll.textContent = this.labels.viewAllProducts;
        }
      }
    }

    async handleSearch() {
      if (!this.input) return;
      const term = this.input.value.trim();
      this.currentSearchTerm = term;

      if (term.length === 0) {
        this.resetToDefaultState();
        return;
      }

      if (term.length < 2) return;

      if (this.loading) this.loading.hidden = false;

      try {
        const url = `${nigat.routes.root}search/suggest.json?q=${encodeURIComponent(term)}&resources[type]=product,collection,query&resources[options][prefix]=last&resources[limit]=8`;
        const res = await fetch(url);
        const data = await res.json();

        // Check if query is still current
        if (this.currentSearchTerm !== term) return;

        if (this.loading) this.loading.hidden = true;
        this.renderResults(data.resources ? data.resources.results : {}, term);
      } catch (err) {
        if (this.loading) this.loading.hidden = true;
        console.warn("[nigat] predictive search error", err);
      }
    }

    renderResults(results, term) {
      const products = results.products || [];
      const queries = results.queries || [];
      const collections = results.collections || [];

      if (this.mainHeader) this.mainHeader.hidden = false;

      // Suggestions column
      if (this.suggestionsBox && this.suggestionsList) {
        const suggestions = [...queries, ...collections];
        if (suggestions.length > 0) {
          this.suggestionsBox.hidden = false;
          if (this.recentBox) this.recentBox.hidden = true;
          this.suggestionsList.innerHTML = suggestions
            .map(
              (s) => `
            <li>
              <button type="button" class="search-banner__suggestion-btn" data-search-term="${this.escapeHtml(s.text || s.title)}">
                <svg class="icon icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:1.4rem;height:1.4rem;opacity:0.6;"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <span>${this.escapeHtml(s.text || s.title)}</span>
              </button>
            </li>
          `
            )
            .join("");
        } else {
          this.suggestionsBox.hidden = true;
          if (this.recentBox) this.recentBox.hidden = false;
        }
      }

      // Products grid
      if (products.length > 0) {
        if (this.defaultGrid) this.defaultGrid.hidden = true;
        if (this.emptyState) this.emptyState.hidden = true;
        if (this.liveResults) this.liveResults.hidden = false;

        if (this.mainTitle) {
          this.mainTitle.textContent = this.formatLabel(this.labels.resultsFor, term.toUpperCase());
        }

        if (this.liveGrid) {
          this.liveGrid.innerHTML = products
            .map((p) => {
              const imgSrc = p.image || (p.featured_image ? p.featured_image.url : "");
              const imgHtml = imgSrc
                ? `<img class="search-banner__live-img" src="${imgSrc}" alt="${this.escapeHtml(p.title)}" width="300" height="400" loading="lazy">`
                : `<div class="search-banner__live-placeholder"></div>`;

              const priceNum = parseFloat(p.price) || 0;
              const priceFormatted =
                priceNum > 0 ? `${nigat.money(Math.round(priceNum * 100))}` : "Br 0.00";

              const compareNum = parseFloat(p.compare_at_price_max || p.compare_at_price) || 0;
              const onSale = compareNum > priceNum && priceNum > 0;
              const compareFormatted = onSale ? `${nigat.money(Math.round(compareNum * 100))}` : "";

              let badgeHtml = "";
              if (onSale) {
                const pct = Math.round(((compareNum - priceNum) / compareNum) * 100);
                badgeHtml = `<span class="search-banner__live-badge">${this.escapeHtml(this.labels.salePercentage.replace("[percent]", String(pct)))}</span>`;
              }

              const subtitle = p.vendor || p.type || "";

              return `
              <li class="search-banner__product-item">
                <a href="${p.url}" class="search-banner__live-card">
                  <div class="search-banner__live-media">
                    ${imgHtml}
                    ${badgeHtml}
                  </div>
                  <div class="search-banner__live-info">
                    <h4 class="search-banner__live-title">${this.escapeHtml(p.title)}</h4>
                    ${subtitle ? `<p class="search-banner__live-subtitle">${this.escapeHtml(subtitle)}</p>` : ""}
                    <div class="search-banner__live-price">
                      <span>${priceFormatted}</span>
                      ${onSale ? `<span class="search-banner__live-compare">${compareFormatted}</span>` : ""}
                    </div>
                  </div>
                </a>
              </li>
            `;
            })
            .join("");
        }
      } else {
        // Empty state
        if (this.defaultGrid) this.defaultGrid.hidden = true;
        if (this.liveResults) this.liveResults.hidden = true;
        if (this.emptyState) {
          this.emptyState.hidden = false;
          if (this.emptyTitle) {
            this.emptyTitle.textContent = this.formatLabel(this.labels.noResultsFor, term);
          }
        }
        if (this.mainTitle) {
          this.mainTitle.textContent = this.formatLabel(this.labels.resultsFor, term.toUpperCase());
        }
      }

      // Footer
      if (this.footerLabel) {
        this.footerLabel.textContent = this.labels.searchFor.replace("[term]", term);
      }
      if (this.viewAll) {
        this.viewAll.href = `${nigat.routes.root}search?q=${encodeURIComponent(term)}&type=product`;
        this.viewAll.textContent = this.labels.viewAllFor.replace("[term]", term);
      }
    }

    formatLabel(template, term) {
      return template.replace("[term]", term);
    }

    escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
  }

  window.SearchBanner = new SearchBannerController();

  /* --- Collection sort (auto-submit) ----------------------------------- */
  document.addEventListener("change", (e) => {
    const select = e.target.closest("[data-sort-select]");
    if (!select) return;
    const url = new URL(window.location.href);
    url.searchParams.set("sort_by", select.value);
    url.searchParams.delete("page");
    window.location.href = url.toString();
  });

  /* --- Filter form (auto-submit on change for search and collections) -- */
  document.addEventListener("change", (e) => {
    if (e.target.closest("facet-filters-form")) return;
    const form = e.target.closest("[data-filter-form]");
    if (!form) return;
    if (e.target.type === "number" || e.target.type === "range") return; // price handled on button or enter
    const params = new URLSearchParams(new FormData(form));
    const sortSelect = document.querySelector("[data-sort-select]");
    if (sortSelect) params.set("sort_by", sortSelect.value);
    for (const [k, v] of [...params.entries()]) {
      if (!v) params.delete(k);
    }
    const targetUrl = new URL(form.action || window.location.href, window.location.origin);
    targetUrl.search = params.toString();
    window.location.href = targetUrl.toString();
  });

  // Price range enter key
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const priceInput = e.target.closest('[data-filter-form] input[type="number"]');
    if (!priceInput) return;
    e.preventDefault();
    const form = priceInput.closest("[data-filter-form]");
    const params = new URLSearchParams(new FormData(form));
    for (const [k, v] of [...params.entries()]) {
      if (!v) params.delete(k);
    }
    const targetUrl = new URL(form.action || window.location.href, window.location.origin);
    targetUrl.search = params.toString();
    window.location.href = targetUrl.toString();
  });

  // Price range search button click
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".price-range__btn");
    if (!btn) return;
    const form = btn.closest("[data-filter-form]");
    if (!form) return;
    e.preventDefault();
    const params = new URLSearchParams(new FormData(form));
    for (const [k, v] of [...params.entries()]) {
      if (!v) params.delete(k);
    }
    const targetUrl = new URL(form.action || window.location.href, window.location.origin);
    targetUrl.search = params.toString();
    window.location.href = targetUrl.toString();
  });

  /* --- Modern Dual Range Price Component (price-range-2.webp) ---------- */
  class PriceRange extends HTMLElement {
    connectedCallback() {
      if (this.lifecycle) return;
      this.lifecycle = createLifecycleScope();
      this.minLimit = parseFloat(this.dataset.minLimit) || 0;
      this.maxLimit = parseFloat(this.dataset.maxLimit) || 100;
      this.currency = this.dataset.currency || "$";

      this.rangeMin = this.querySelector("[data-range-min]");
      this.rangeMax = this.querySelector("[data-range-max]");
      this.bar = this.querySelector("[data-range-bar]");
      this.tooltipMin = this.querySelector("[data-tooltip-min]");
      this.tooltipMax = this.querySelector("[data-tooltip-max]");
      this.tooltipTextMin = this.querySelector("[data-tooltip-text-min]");
      this.tooltipTextMax = this.querySelector("[data-tooltip-text-max]");
      this.inputMin = this.querySelector("[data-input-min]");
      this.inputMax = this.querySelector("[data-input-max]");
      this.bars = this.querySelectorAll("[data-bar]");

      if (!this.rangeMin || !this.rangeMax) {
        this.lifecycle.destroy();
        this.lifecycle = null;
        return;
      }

      this.initRealHistogram();

      this.lifecycle.listen(this.rangeMin, "input", () => this.onRangeMinChange());
      this.lifecycle.listen(this.rangeMax, "input", () => this.onRangeMaxChange());

      if (this.inputMin) {
        this.lifecycle.listen(this.inputMin, "input", () => this.onInputMinChange());
      }
      if (this.inputMax) {
        this.lifecycle.listen(this.inputMax, "input", () => this.onInputMaxChange());
      }

      this.updateUI();
    }

    disconnectedCallback() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
    }

    initRealHistogram() {
      if (!this.bars || this.bars.length === 0) return;

      // Extract real prices from data-prices attribute or from rendered product cards in DOM
      let prices = [];
      if (this.dataset.prices) {
        prices = this.dataset.prices
          .split(",")
          .map((p) => parseFloat(p.trim()))
          .filter((p) => !isNaN(p) && p >= this.minLimit && p <= this.maxLimit);
      }

      if (prices.length === 0) {
        // Fallback: examine all product cards on the page
        document.querySelectorAll(".product-card").forEach((card) => {
          const priceEl = card.querySelector(
            ".price__sale, .price__regular, .price-item--regular, .price-item--sale, .price"
          );
          if (priceEl) {
            const num = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ""));
            if (!isNaN(num) && num >= this.minLimit && num <= this.maxLimit) prices.push(num);
          }
        });
      }

      const numBars = this.bars.length;
      const counts = new Array(numBars).fill(0);
      const span = this.maxLimit - this.minLimit > 0 ? this.maxLimit - this.minLimit : 1;

      if (prices.length > 0) {
        prices.forEach((price) => {
          const clamped = Math.max(this.minLimit, Math.min(this.maxLimit, price));
          let index = Math.floor(((clamped - this.minLimit) / span) * numBars);
          if (index >= numBars) index = numBars - 1;
          if (index < 0) index = 0;
          counts[index]++;
        });

        const maxCount = Math.max(...counts);
        this.bars.forEach((bar, i) => {
          const count = counts[i];
          if (count > 0 && maxCount > 0) {
            const heightPercent = Math.max(25, Math.round((count / maxCount) * 100));
            bar.style.setProperty("--bar-h", `${heightPercent}%`);
            bar.classList.add("has-products");
            bar.setAttribute("title", `${count} product${count === 1 ? "" : "s"}`);
          } else {
            bar.style.setProperty("--bar-h", "0%");
            bar.classList.remove("has-products");
            bar.removeAttribute("title");
          }
        });
      } else {
        // No products in catalog: reset all bars to zero height
        this.bars.forEach((bar) => {
          bar.style.setProperty("--bar-h", "0%");
          bar.classList.remove("has-products");
          bar.removeAttribute("title");
        });
      }

      this.updateUI();
    }

    formatPrice(val) {
      const num = Math.round(Number(val)) || 0;
      return `${this.currency} ${num.toLocaleString("en-US").replace(/,/g, " ")}`;
    }

    onRangeMinChange() {
      let minVal = parseFloat(this.rangeMin.value);
      let maxVal = parseFloat(this.rangeMax.value);
      if (minVal > maxVal) {
        this.rangeMin.value = maxVal;
        minVal = maxVal;
      }
      this.rangeMin.style.zIndex = "3";
      this.rangeMax.style.zIndex = "2";
      if (this.inputMin) {
        this.inputMin.value = minVal > this.minLimit ? minVal : "";
      }
      this.updateUI();
    }

    onRangeMaxChange() {
      let minVal = parseFloat(this.rangeMin.value);
      let maxVal = parseFloat(this.rangeMax.value);
      if (maxVal < minVal) {
        this.rangeMax.value = minVal;
        maxVal = minVal;
      }
      this.rangeMax.style.zIndex = "3";
      this.rangeMin.style.zIndex = "2";
      if (this.inputMax) {
        this.inputMax.value = maxVal < this.maxLimit ? maxVal : "";
      }
      this.updateUI();
    }

    onInputMinChange() {
      let val = parseFloat(this.inputMin.value);
      if (isNaN(val)) return;
      if (val < this.minLimit) val = this.minLimit;
      const maxVal = parseFloat(this.rangeMax.value);
      if (val > maxVal) val = maxVal;
      this.rangeMin.value = val;
      this.updateUI();
    }

    onInputMaxChange() {
      let val = parseFloat(this.inputMax.value);
      if (isNaN(val)) return;
      if (val > this.maxLimit) val = this.maxLimit;
      const minVal = parseFloat(this.rangeMin.value);
      if (val < minVal) val = minVal;
      this.rangeMax.value = val;
      this.updateUI();
    }

    updateUI() {
      const minVal = parseFloat(this.rangeMin.value) || 0;
      const maxVal = parseFloat(this.rangeMax.value) || this.maxLimit;
      const rangeSpan = this.maxLimit - this.minLimit || 1;

      const leftPercent = Math.max(0, Math.min(100, ((minVal - this.minLimit) / rangeSpan) * 100));
      const rightPercent = Math.max(0, Math.min(100, ((maxVal - this.minLimit) / rangeSpan) * 100));

      if (this.bar) {
        this.bar.style.left = `${leftPercent}%`;
        this.bar.style.width = `${Math.max(0, rightPercent - leftPercent)}%`;
      }

      if (this.tooltipMin) {
        if (leftPercent < 14) {
          this.tooltipMin.style.left = "0%";
          this.tooltipMin.style.transform = "translateX(0)";
          this.tooltipMin.style.setProperty("--arrow-left", "1.4rem");
        } else if (leftPercent > 86) {
          this.tooltipMin.style.left = "100%";
          this.tooltipMin.style.transform = "translateX(-100%)";
          this.tooltipMin.style.setProperty("--arrow-left", "calc(100% - 1.4rem)");
        } else {
          this.tooltipMin.style.left = `${leftPercent}%`;
          this.tooltipMin.style.transform = "translateX(-50%)";
          this.tooltipMin.style.setProperty("--arrow-left", "50%");
        }
        if (this.tooltipTextMin) {
          this.tooltipTextMin.textContent = this.formatPrice(minVal);
        }
      }

      if (this.tooltipMax) {
        if (rightPercent > 86) {
          this.tooltipMax.style.left = "100%";
          this.tooltipMax.style.transform = "translateX(-100%)";
          this.tooltipMax.style.setProperty("--arrow-left", "calc(100% - 1.4rem)");
        } else if (rightPercent < 14) {
          this.tooltipMax.style.left = "0%";
          this.tooltipMax.style.transform = "translateX(0)";
          this.tooltipMax.style.setProperty("--arrow-left", "1.4rem");
        } else {
          this.tooltipMax.style.left = `${rightPercent}%`;
          this.tooltipMax.style.transform = "translateX(-50%)";
          this.tooltipMax.style.setProperty("--arrow-left", "50%");
        }
        if (this.tooltipTextMax) {
          this.tooltipTextMax.textContent = this.formatPrice(maxVal);
        }
      }

      if (this.bars && this.bars.length > 0) {
        const numBars = this.bars.length;
        this.bars.forEach((bar, index) => {
          const barMidpointPercent = ((index + 0.5) / numBars) * 100;
          const isInRange = barMidpointPercent >= leftPercent && barMidpointPercent <= rightPercent;
          const hasProducts = bar.classList.contains("has-products");
          bar.classList.toggle("is-active", hasProducts && isInRange);
        });
      }
    }
  }

  if (!customElements.get("price-range")) {
    customElements.define("price-range", PriceRange);
  }

  /* --- Unified Filter Sheet Controller (Mobile Bottom Sheet & Desktop Sidebar) --- */
  const filterSheet = document.querySelector("[data-filter-sheet], [data-search-drawer]");
  if (filterSheet) {
    const openBtns = document.querySelectorAll(
      "[data-filter-sheet-open], [data-search-drawer-open]"
    );
    const filterForm = filterSheet.querySelector("[data-filter-form]");

    const openSheet = () => {
      filterSheet.classList.add("is-open");
      filterSheet.setAttribute("aria-hidden", "false");
      lockBodyScroll();
    };

    const closeSheet = () => {
      filterSheet.classList.remove("is-open");
      filterSheet.setAttribute("aria-hidden", "true");
      unlockBodyScroll();
    };

    openBtns.forEach((btn) => {
      btn.addEventListener("click", openSheet);
    });

    filterSheet.addEventListener("click", (e) => {
      if (
        e.target.closest("[data-filter-sheet-close]") ||
        e.target.closest("[data-search-drawer-close]") ||
        e.target.matches("[data-filter-sheet-close]") ||
        e.target.matches("[data-search-drawer-close]")
      ) {
        closeSheet();
      }
      if (e.target.closest("[data-filter-sheet-apply]")) {
        closeSheet();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && filterSheet.classList.contains("is-open")) {
        closeSheet();
      }
    });

    // Search by product name input handling
    const sidebarSearchInput = filterSheet.querySelector("[data-sidebar-search-input]");
    const sidebarSearchClear = filterSheet.querySelector("[data-sidebar-search-clear]");
    const headerSearchInput = document.querySelector(
      '[data-search-banner-input], [data-search-panel] input[type="search"]'
    );

    if (sidebarSearchInput) {
      sidebarSearchInput.addEventListener("input", () => {
        const val = sidebarSearchInput.value.trim();
        if (sidebarSearchClear) {
          sidebarSearchClear.classList.toggle("is-hidden", val.length === 0);
        }
        if (headerSearchInput) {
          headerSearchInput.value = sidebarSearchInput.value;
        }
      });

      if (sidebarSearchClear) {
        sidebarSearchClear.addEventListener("click", () => {
          sidebarSearchInput.value = "";
          sidebarSearchClear.classList.add("is-hidden");
          sidebarSearchInput.focus();
          if (headerSearchInput) {
            headerSearchInput.value = "";
          }
          const facetForm = sidebarSearchInput.closest("facet-filters-form");
          if (facetForm) {
            if (typeof facetForm.filterProductsByKeyword === "function") {
              facetForm.filterProductsByKeyword("");
            }
            if (typeof facetForm.dispatchFilterRequest === "function") {
              facetForm.dispatchFilterRequest();
            }
          }
        });
      }

      sidebarSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const val = sidebarSearchInput.value.trim();
          if (val === "") {
            return;
          }
          nigat.addRecentSearch(val);
          const isCollection = window.location.pathname.includes("/collections");
          if (isCollection) {
            window.location.href = `${window.Shopify?.routes?.root || "/"}search?q=${encodeURIComponent(val)}*&type=product`;
            return;
          }
          const facetForm = sidebarSearchInput.closest("facet-filters-form");
          if (facetForm && typeof facetForm.dispatchFilterRequest === "function") {
            facetForm.debouncedFilterRequest.cancel();
            facetForm.dispatchFilterRequest();
          } else if (filterForm) {
            filterForm.submit();
          }
        }
      });

      if (headerSearchInput) {
        headerSearchInput.addEventListener("input", () => {
          sidebarSearchInput.value = headerSearchInput.value;
          if (sidebarSearchClear) {
            sidebarSearchClear.classList.toggle(
              "is-hidden",
              headerSearchInput.value.trim().length === 0
            );
          }
        });
      }
    }
  }

  /* --- Reusable Debounce Utility --------------------------------------- */
  function debounce(fn, wait = 300) {
    let timer;
    const debounced = function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
  }
  window.debounce = debounce;

  /* --- Reusable AJAX Facet & Filter Controller (MIT License) ------------ */
  /**
   * MIT License
   *
   * Copyright (c) 2026 Cart-Et / Lumen Theme
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */
  class FacetFiltersForm extends HTMLElement {
    constructor() {
      super();
      this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
      this.onFormInput = this.onFormInput.bind(this);
      this.onFormChange = this.onFormChange.bind(this);
      this.onFormSubmit = this.onFormSubmit.bind(this);
      this.onHistoryChange = this.onHistoryChange.bind(this);
      this.debouncedFilterRequest = debounce(() => this.dispatchFilterRequest(), 350);
      this.abortController = null;
    }

    connectedCallback() {
      if (this.forms) return;
      this.sectionId =
        this.dataset.sectionId ||
        (this.closest('[id^="shopify-section-"]')
          ? this.closest('[id^="shopify-section-"]').id.replace("shopify-section-", "")
          : null);
      this.forms = this.querySelectorAll("form");

      this.forms.forEach((form) => {
        form.addEventListener("input", this.onFormInput);
        form.addEventListener("change", this.onFormChange);
        form.addEventListener("submit", this.onFormSubmit);
      });

      this.addEventListener("click", this.onActiveFilterClick);
      window.addEventListener("popstate", this.onHistoryChange);
      this.expandActiveFilterSections();
    }

    disconnectedCallback() {
      this.abortController?.abort();
      this.abortController = null;
      if (this.forms) {
        this.forms.forEach((form) => {
          form.removeEventListener("input", this.onFormInput);
          form.removeEventListener("change", this.onFormChange);
          form.removeEventListener("submit", this.onFormSubmit);
        });
      }
      if (this.debouncedFilterRequest) this.debouncedFilterRequest.cancel();
      this.removeEventListener("click", this.onActiveFilterClick);
      window.removeEventListener("popstate", this.onHistoryChange);
      this.forms = null;
    }

    onFormInput(event) {
      const target = event.target;
      if (target.type === "checkbox" || target.type === "radio") {
        this.debouncedFilterRequest.cancel();
        this.dispatchFilterRequest();
      } else if (target.type === "number") {
        this.debouncedFilterRequest();
      } else if (
        target.matches("[data-sidebar-search-input]") &&
        window.location.pathname.includes("/collections")
      ) {
        this.filterProductsByKeyword(target.value);
      }
    }

    onFormChange(event) {
      const target = event.target;
      if (target.matches("[data-sidebar-search-input]")) {
        const val = target.value.trim();
        if (val) {
          nigat.addRecentSearch(val);
        }
      }
      if (
        target.type === "range" ||
        target.tagName === "SELECT" ||
        target.matches("[data-sidebar-search-input]")
      ) {
        this.debouncedFilterRequest.cancel();
        this.dispatchFilterRequest();
      }
    }

    onFormSubmit(event) {
      event.preventDefault();
      const isSearchPage = window.location.pathname.includes("/search");
      const searchInput = this.querySelector("[data-sidebar-search-input]");
      if (searchInput && searchInput.value.trim() !== "") {
        nigat.addRecentSearch(searchInput.value.trim());
      } else if (isSearchPage && searchInput && searchInput.value.trim() === "") {
        return;
      }
      this.debouncedFilterRequest.cancel();
      this.dispatchFilterRequest();
    }

    onActiveFilterClick(event) {
      const link = event.target.closest(
        "[data-ajax-filter-pill], [data-ajax-clear-all], .search-active-pill, .search-active-clear, .search-filter-sheet__clear, .collection-filters__clear, .pagination__item, a.pagination__item--prev, a.pagination__item--next"
      );
      if (!link || !link.href) return;

      event.preventDefault();
      const isClearAll =
        link.hasAttribute("data-ajax-clear-all") ||
        link.classList.contains("search-filter-sheet__clear") ||
        link.classList.contains("collection-filters__clear") ||
        link.classList.contains("search-active-clear");

      if (isClearAll) {
        const isSearchPage = window.location.pathname.includes("/search");
        if (!isSearchPage) {
          const nameInput = this.querySelector("[data-sidebar-search-input]");
          if (nameInput) nameInput.value = "";
          const clearBtn = this.querySelector("[data-sidebar-search-clear]");
          if (clearBtn) clearBtn.classList.add("is-hidden");

          const headerSearchInput = document.querySelector(
            '[data-search-panel] input[type="search"]'
          );
          if (headerSearchInput) headerSearchInput.value = "";
        }

        this.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          cb.checked = false;
        });

        this.querySelectorAll('input[type="radio"][name="sort_by"]').forEach((radio) => {
          radio.checked = radio.value === (isSearchPage ? "relevance" : "manual");
        });

        const sortSelect = this.querySelector("[data-sort-select]");
        if (sortSelect) sortSelect.value = isSearchPage ? "relevance" : "manual";

        const priceRange = this.querySelector("price-range");
        if (priceRange) {
          const defaultMin =
            priceRange.minLimit != null
              ? priceRange.minLimit
              : parseFloat(priceRange.dataset.minLimit) || 0;
          const defaultMax =
            priceRange.maxLimit != null
              ? priceRange.maxLimit
              : parseFloat(priceRange.dataset.maxLimit) || 2000;
          const rangeMin = priceRange.querySelector("[data-range-min]");
          const rangeMax = priceRange.querySelector("[data-range-max]");
          const inputMin = priceRange.querySelector("[data-input-min]");
          const inputMax = priceRange.querySelector("[data-input-max]");
          if (rangeMin) rangeMin.value = defaultMin;
          if (rangeMax) rangeMax.value = defaultMax;
          if (inputMin) inputMin.value = "";
          if (inputMax) inputMax.value = "";
          if (typeof priceRange.updateUI === "function") priceRange.updateUI();
        }

        if (!isSearchPage && typeof this.filterProductsByKeyword === "function") {
          this.filterProductsByKeyword("");
        }
      }

      const url = new URL(link.href, window.location.origin);
      const isPagination =
        link.classList.contains("pagination__item") || Boolean(link.closest(".pagination"));
      this.fetchAndUpdate(url.searchParams, link.href, true, isPagination);
    }

    onHistoryChange() {
      const searchParams = new URLSearchParams(window.location.search);
      this.fetchAndUpdate(searchParams, window.location.href, false, false);
    }

    dispatchFilterRequest() {
      const forms = this.querySelectorAll("form");
      if (forms.length === 0) return;
      const searchParams = new URLSearchParams();
      const isSearchPage = window.location.pathname.includes("/search");

      forms.forEach((form) => {
        const formData = new FormData(form);
        for (const [key, val] of formData.entries()) {
          const trimmed = typeof val === "string" ? val.trim() : val;
          if (trimmed !== "" && trimmed != null) {
            if (key === "sort_by" && trimmed === "relevance") continue;
            if (key === "q") {
              const cleanQ = trimmed.replace(/\*+$/, "").trim();
              if (cleanQ === "") continue;
              nigat.addRecentSearch(cleanQ);
              const wildcardQ = cleanQ
                .split(/\s+/)
                .map((w) => (w.endsWith("*") ? w : w + "*"))
                .join(" ");
              searchParams.append("q", wildcardQ);
            } else {
              searchParams.append(key, trimmed);
            }
          }
        }
      });

      if (isSearchPage && !searchParams.has("type")) {
        searchParams.set("type", "product");
      }

      const currentUrl = new URL(window.location.href);
      const queryString = searchParams.toString();
      const targetUrl = queryString ? `${currentUrl.pathname}?${queryString}` : currentUrl.pathname;
      this.fetchAndUpdate(searchParams, targetUrl, true, false);
    }

    renderSkeletonGrid() {
      const count = 8;
      let cards = "";
      for (let i = 0; i < count; i++) {
        cards += `
          <li class="product-grid__item skeleton-card">
            <div class="skeleton-card__media skeleton-shimmer"></div>
            <div class="skeleton-card__info">
              <div class="skeleton-card__line skeleton-card__line--sub skeleton-shimmer"></div>
              <div class="skeleton-card__line skeleton-card__line--title skeleton-shimmer"></div>
              <div class="skeleton-card__line skeleton-card__line--price skeleton-shimmer"></div>
            </div>
          </li>
        `;
      }
      return `<ul class="search-results product-grid product-grid--4-col skeleton-product-grid" role="list" aria-busy="true">${cards}</ul>`;
    }

    setLoading(isLoading) {
      const resultsContainer = this.querySelector("[data-ajax-results-container]");
      const loadingBar = this.querySelector("[data-ajax-loading-bar]");
      const applyBtn = this.querySelector("[data-filter-sheet-apply]");

      if (isLoading) {
        this.classList.add("is-loading");
        if (loadingBar) loadingBar.classList.add("is-loading");
        if (resultsContainer) {
          resultsContainer.classList.add("is-loading");
          resultsContainer.setAttribute("aria-busy", "true");
        }
        if (applyBtn && !applyBtn.querySelector(".search-spinner")) {
          const spinner = document.createElement("span");
          spinner.className = "search-spinner";
          spinner.style.marginRight = "0.8rem";
          applyBtn.prepend(spinner);
        }
      } else {
        this.classList.remove("is-loading");
        if (loadingBar) loadingBar.classList.remove("is-loading");
        if (resultsContainer) {
          resultsContainer.classList.remove("is-loading");
          resultsContainer.removeAttribute("aria-busy");
        }
        if (applyBtn) {
          const spinner = applyBtn.querySelector(".search-spinner");
          if (spinner) spinner.remove();
        }
      }
    }

    async fetchAndUpdate(searchParams, newUrl, pushState = true, isPagination = false) {
      if (this.abortController) {
        this.abortController.abort();
      }
      const request = new AbortController();
      this.abortController = request;

      this.setLoading(true);

      try {
        const queryStr = searchParams.toString();
        const sep = queryStr ? "&" : "";
        const sectionUrl = `${window.location.pathname}?${queryStr}${sep}section_id=${this.sectionId}`;

        const res = await fetch(sectionUrl, { signal: request.signal });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const html = await res.text();
        if (request.signal.aborted || !this.isConnected) return;
        const parsed = new DOMParser().parseFromString(html, "text/html");

        if (pushState && window.location.href !== newUrl) {
          window.history.pushState({ path: newUrl }, "", newUrl);
        }

        const priorFocus = document.activeElement;
        this.updateDOM(parsed, searchParams);
        if (priorFocus && priorFocus !== document.body && !priorFocus.isConnected) {
          this.querySelector("[data-ajax-results-container]")?.focus();
        }

        if (isPagination) {
          const resultsEl = this.querySelector("[data-ajax-results-container]");
          if (resultsEl) {
            const y = resultsEl.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("[nigat] facet filter fetch failed", err);
        }
      } finally {
        if (this.abortController === request) {
          this.abortController = null;
          if (this.isConnected) this.setLoading(false);
        }
      }
    }

    updateDOM(parsed, searchParams) {
      // 1. Update Results Container (product grid, pagination, empty state)
      const freshResults = parsed.querySelector("[data-ajax-results-container]");
      const currentResults = this.querySelector("[data-ajax-results-container]");
      if (freshResults && currentResults) {
        currentResults.innerHTML = freshResults.innerHTML;
      }

      // 2. Update Active Filter Pills Container
      const freshActiveFilters = parsed.querySelector("[data-ajax-active-filters-container]");
      const currentActiveFilters = this.querySelector("[data-ajax-active-filters-container]");
      if (freshActiveFilters && currentActiveFilters) {
        currentActiveFilters.innerHTML = freshActiveFilters.innerHTML;
      }

      // 3. Update Results Meta (count caption)
      const freshMeta = parsed.querySelector("[data-ajax-meta-container]");
      const currentMeta = this.querySelector("[data-ajax-meta-container]");
      if (freshMeta && currentMeta) {
        currentMeta.innerHTML = freshMeta.innerHTML;
      }

      // 4. Update Mobile Sticky Bar (Count and Badge)
      const freshMobileCount = parsed.querySelector("[data-ajax-mobile-count]");
      const currentMobileCount = this.querySelector("[data-ajax-mobile-count]");
      if (freshMobileCount && currentMobileCount) {
        currentMobileCount.innerHTML = freshMobileCount.innerHTML;
      }

      const freshMobileBadge = parsed.querySelector("[data-ajax-mobile-badge]");
      const currentMobileBadge = this.querySelector("[data-ajax-mobile-badge]");
      if (freshMobileBadge && currentMobileBadge) {
        currentMobileBadge.innerHTML = freshMobileBadge.innerHTML;
        currentMobileBadge.className = freshMobileBadge.className;
      }

      const freshMobileTitle = parsed.querySelector("[data-ajax-filter-title]");
      const currentMobileTitle = this.querySelector("[data-ajax-filter-title]");
      if (freshMobileTitle && currentMobileTitle) {
        currentMobileTitle.innerHTML = freshMobileTitle.innerHTML;
      }

      // 5. Update Mobile Bottom Sheet Header Actions & Footer Apply Button
      const freshSheetHeader = parsed.querySelector("[data-ajax-sheet-header-actions]");
      const currentSheetHeader = this.querySelector("[data-ajax-sheet-header-actions]");
      if (freshSheetHeader && currentSheetHeader) {
        currentSheetHeader.innerHTML = freshSheetHeader.innerHTML;
      }

      const freshSheetTitle = parsed.querySelector("[data-ajax-sheet-title]");
      const currentSheetTitle = this.querySelector("[data-ajax-sheet-title]");
      if (freshSheetTitle && currentSheetTitle) {
        currentSheetTitle.innerHTML = freshSheetTitle.innerHTML;
      }

      const freshApplyCount = parsed.querySelector("[data-ajax-apply-count]");
      const currentApplyCount = this.querySelector("[data-ajax-apply-count]");
      if (freshApplyCount && currentApplyCount) {
        currentApplyCount.innerHTML = freshApplyCount.innerHTML;
      }

      // 6. Update Collection Toolbar Count if present
      const freshToolbarCount = parsed.querySelector("[data-product-count]");
      const currentToolbarCount = this.querySelector("[data-product-count]");
      if (freshToolbarCount && currentToolbarCount) {
        currentToolbarCount.innerHTML = freshToolbarCount.innerHTML;
      }

      // 7. Synchronize Filter Form Inputs (counts, disabled status, checked states)
      this.syncFormInputs(parsed, searchParams);

      // 8. Update Price Range Graph & Availability
      const freshPriceRange = parsed.querySelector("price-range");
      const currentPriceRange = this.querySelector("price-range");
      if (freshPriceRange && currentPriceRange) {
        if (freshPriceRange.dataset.prices) {
          currentPriceRange.dataset.prices = freshPriceRange.dataset.prices;
        }
        if (typeof currentPriceRange.initRealHistogram === "function") {
          currentPriceRange.initRealHistogram();
        }
      }

      // 9. Re-sync Wishlist & Discount UI
      if (typeof syncWishlistUI === "function") syncWishlistUI();
      if (typeof syncDiscountUI === "function") syncDiscountUI();
    }

    syncFormInputs(parsed, searchParams) {
      parsed
        .querySelectorAll(".search-filter__label, .collection-filter__value label")
        .forEach((freshLabel) => {
          const freshInput = freshLabel.querySelector(
            'input[type="checkbox"], input[type="radio"]'
          );
          if (!freshInput) return;
          const currentInput = this.querySelector(
            `input[name="${freshInput.name}"][value="${CSS.escape(freshInput.value)}"]`
          );
          if (!currentInput) return;

          const currentLabel = currentInput.closest("label");
          if (!currentLabel) return;

          const freshCount = freshLabel.querySelector(".search-filter__value-count");
          let currentCount = currentLabel.querySelector(".search-filter__value-count");
          if (freshCount) {
            if (!currentCount) {
              currentCount = document.createElement("span");
              currentCount.className = "search-filter__value-count";
              currentLabel.appendChild(currentCount);
            }
            currentCount.textContent = freshCount.textContent;
          } else if (currentCount) {
            currentCount.remove();
          }

          currentInput.disabled = freshInput.disabled;
          currentLabel.classList.toggle("is-disabled", freshInput.disabled);
        });

      this.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        const activeVals = searchParams.getAll(cb.name);
        cb.checked = activeVals.includes(cb.value);
      });

      const currentSort = searchParams.get("sort_by") || "relevance";
      this.querySelectorAll('input[type="radio"][name="sort_by"]').forEach((radio) => {
        radio.checked = radio.value === currentSort;
      });

      const sortSelect = this.querySelector("[data-sort-select]");
      if (sortSelect) {
        sortSelect.value = currentSort;
      }

      const nameInput = this.querySelector("[data-sidebar-search-input]");
      const rawQ = searchParams.get("q") || "";
      const cleanQ = rawQ.replace(/\*+$/, "").trim();
      if (nameInput) {
        if (nameInput.value !== cleanQ) {
          nameInput.value = cleanQ;
        }
        const clearBtn = this.querySelector("[data-sidebar-search-clear]");
        if (clearBtn) {
          clearBtn.classList.toggle("is-hidden", cleanQ.length === 0);
        }
      }
      const headerSearchInput = document.querySelector(
        '[data-search-banner-input], [data-search-panel] input[type="search"]'
      );
      if (headerSearchInput && headerSearchInput.value !== cleanQ) {
        headerSearchInput.value = cleanQ;
      }

      // Reset or synchronize price range slider & inputs
      const priceRange = this.querySelector("price-range");
      if (priceRange) {
        const minVal = searchParams.get("filter.v.price.gte");
        const maxVal = searchParams.get("filter.v.price.lte");

        const rangeMin = priceRange.querySelector("[data-range-min]");
        const rangeMax = priceRange.querySelector("[data-range-max]");
        const inputMin = priceRange.querySelector("[data-input-min]");
        const inputMax = priceRange.querySelector("[data-input-max]");

        const defaultMin =
          priceRange.minLimit != null
            ? priceRange.minLimit
            : parseFloat(priceRange.dataset.minLimit) || 0;
        const defaultMax =
          priceRange.maxLimit != null
            ? priceRange.maxLimit
            : parseFloat(priceRange.dataset.maxLimit) || 2000;

        const newMin = minVal !== null ? parseFloat(minVal) : defaultMin;
        const newMax = maxVal !== null ? parseFloat(maxVal) : defaultMax;

        if (rangeMin) rangeMin.value = newMin;
        if (rangeMax) rangeMax.value = newMax;
        if (inputMin) inputMin.value = minVal !== null ? newMin : "";
        if (inputMax) inputMax.value = maxVal !== null ? newMax : "";

        if (typeof priceRange.updateUI === "function") {
          priceRange.updateUI();
        }
      }

      this.expandActiveFilterSections(searchParams);

      if (window.location.pathname.includes("/collections")) {
        this.filterProductsByKeyword(qVal);
      }
    }

    expandActiveFilterSections(searchParams) {
      const params = searchParams || new URLSearchParams(window.location.search);
      this.querySelectorAll("details.search-filter").forEach((details) => {
        if (details.classList.contains("search-filter--sort")) return;
        const hasCheckedInput = Boolean(details.querySelector('input[type="checkbox"]:checked'));
        const hasPriceValue = Boolean(
          details.querySelector("price-range") &&
          (params.has("filter.v.price.gte") || params.has("filter.v.price.lte"))
        );
        if (hasCheckedInput || hasPriceValue) {
          details.open = true;
        }
      });
    }

    filterProductsByKeyword(keyword) {
      const q = (keyword || "").toLowerCase().trim();
      const grid = this.querySelector("[data-product-grid], .product-grid");
      if (!grid) return;
      const items = grid.querySelectorAll(".product-grid__item");
      let visible = 0;
      items.forEach((item) => {
        const titleEl = item.querySelector(".product-card__title, .search-card__title");
        const title = titleEl ? titleEl.textContent.toLowerCase() : "";
        const matches = !q || title.includes(q);
        item.style.display = matches ? "" : "none";
        if (matches) visible++;
      });
      const countEl = this.querySelector("[data-ajax-mobile-count], [data-product-count]");
      if (countEl) {
        const countTemplate = visible === 1 ? this.dataset.countOne : this.dataset.countOther;
        countEl.textContent = countTemplate.replace("[count]", String(visible));
      }
      const applyCount = this.querySelector("[data-ajax-apply-count]");
      if (applyCount) {
        applyCount.textContent = this.dataset.viewAllCount.replace("[count]", String(visible));
      }
    }
  }

  if (!customElements.get("facet-filters-form")) {
    customElements.define("facet-filters-form", FacetFiltersForm);
  }

  /* --- Announcement lifecycle proof ----------------------------------- */
  class AnnouncementRotator extends HTMLElement {
    connectedCallback() {
      this.mount();
    }

    disconnectedCallback() {
      this.destroy();
    }

    mount() {
      if (this.lifecycle) return;
      this.lifecycle = createLifecycleScope();
      this.messageList = this.querySelector("[data-announcement-messages]");
      this.messages = Array.from(this.messageList?.children || []);
      this.index = Math.max(0, this.messages.findIndex((message) => !message.hidden));
      this.editorPaused = false;
      this.userPaused = false;
      this.hoverPaused = false;
      this.focusPaused = false;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.pauseButton = this.querySelector("[data-announcement-pause]");
      if (this.pauseButton && this.messages.length < 2) this.pauseButton.hidden = true;
      const isEditor = Boolean(window.Shopify?.designMode);
      try {
        if (!isEditor && sessionStorage.getItem(this.dataset.dismissKey) === "dismissed") {
          this.closest(".announcement-bar-section, .announcement-layout")?.setAttribute("hidden", "");
          updateHeaderDimensions();
          return;
        }
      } catch { /* Storage may be unavailable. */ }
      this.classList.add("is-ready");
      this.messageList?.classList.add("is-ready");
      this.show(this.index);

      this.lifecycle.listen(this, "mouseenter", () => { this.hoverPaused = true; this.syncAutoplay(); });
      this.lifecycle.listen(this, "mouseleave", () => { this.hoverPaused = false; this.syncAutoplay(); });
      this.lifecycle.listen(this, "focusin", () => { this.focusPaused = true; this.syncAutoplay(); });
      this.lifecycle.listen(this, "focusout", (event) => {
        if (this.contains(event.relatedTarget)) return;
        this.focusPaused = false;
        this.syncAutoplay();
      });
      this.lifecycle.listen(this.pauseButton, "click", () => {
        this.userPaused = !this.userPaused;
        this.pauseButton.setAttribute("aria-pressed", String(this.userPaused));
        this.pauseButton.setAttribute("aria-label", this.userPaused ? this.dataset.playLabel : this.dataset.pauseLabel);
        this.syncAutoplay();
      });
      this.lifecycle.listen(this.querySelector("[data-announcement-dismiss]"), "click", () => {
        try { sessionStorage.setItem(this.dataset.dismissKey, "dismissed"); } catch { /* Storage may be unavailable. */ }
        this.closest(".announcement-bar-section, .announcement-layout")?.setAttribute("hidden", "");
        this.destroy();
        updateHeaderDimensions();
      });

      this.lifecycle.listen(document, "visibilitychange", () => this.syncAutoplay());
      this.lifecycle.listen(this.reducedMotion, "change", () => this.syncAutoplay());
      this.lifecycle.listen(document, "shopify:block:select", (event) => {
        const selected = this.messages.findIndex(
          (message) => message === event.target || message.contains(event.target)
        );
        if (selected < 0) return;
        this.editorPaused = true;
        this.show(selected);
        this.syncAutoplay();
      });
      this.lifecycle.listen(document, "shopify:block:deselect", (event) => {
        if (!this.contains(event.target)) return;
        this.editorPaused = false;
        this.syncAutoplay();
      });
      this.lifecycle.listen(document, "shopify:section:unload", (event) => {
        if (event.target?.contains(this)) this.destroy();
      });
      this.syncAutoplay();
    }

    show(index) {
      this.index = index;
      this.messages.forEach((message, position) => {
        message.hidden = position !== index;
      });
      updateHeaderDimensions();
    }

    syncAutoplay() {
      if (!this.lifecycle) return;
      if (this.timer) {
        this.lifecycle.clearInterval(this.timer);
        this.timer = null;
      }
      if (
        this.dataset.autoplay !== "true" ||
        this.messages.length < 2 ||
        this.editorPaused ||
        this.userPaused ||
        this.hoverPaused ||
        this.focusPaused ||
        document.hidden ||
        this.reducedMotion.matches
      ) return;
      const speed = Math.max(3000, Number(this.dataset.speed) || 5000);
      this.timer = this.lifecycle.interval(() => {
        this.show((this.index + 1) % this.messages.length);
      }, speed);
    }

    destroy() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
      this.timer = null;
    }
  }
  if (!customElements.get("announcement-rotator")) {
    customElements.define("announcement-rotator", AnnouncementRotator);
  }

  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true" || this.observer) return;
      this.observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.observer.disconnect();
        this.observer = null;
        this.load();
      }, { rootMargin: "300px" });
      this.observer.observe(this);
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.observer = null;
      this.request?.abort();
      this.request = null;
    }

    async load() {
      if (!this.dataset.productId || !this.dataset.sectionId || !this.dataset.url) return;
      this.request?.abort();
      const request = new AbortController();
      this.request = request;
      const url = new URL(this.dataset.url, location.origin);
      url.searchParams.set("product_id", this.dataset.productId);
      url.searchParams.set("section_id", this.dataset.sectionId);
      url.searchParams.set("limit", this.dataset.limit || "4");
      url.searchParams.set("intent", this.dataset.intent || "related");
      try {
        const response = await fetch(url, { signal: request.signal });
        if (!response.ok) throw new Error(`Recommendations: ${response.status}`);
        const html = new DOMParser().parseFromString(await response.text(), "text/html");
        const returned = html.querySelector("product-recommendations[data-ready='true']");
        if (!returned || !this.isConnected || request.signal.aborted) return;
        this.replaceChildren(...Array.from(returned.children));
        this.dataset.ready = "true";
      } catch (error) {
        if (error.name !== "AbortError") this.dataset.loadError = "true";
      } finally {
        if (this.request === request) this.request = null;
      }
    }
  }
  if (!customElements.get("product-recommendations")) {
    customElements.define("product-recommendations", ProductRecommendations);
  }

  class ProductBundle extends HTMLElement {
    connectedCallback() {
      if (this.lifecycle) return;
      this.lifecycle = createLifecycleScope();
      this.button = this.querySelector("[data-bundle-submit]");
      this.error = this.querySelector("[data-bundle-error]");
      this.total = this.querySelector("[data-bundle-total]");
      if (!this.button) return;
      this.button.hidden = false;
      this.lifecycle.listen(this, "change", (event) => {
        if (event.target.matches("[data-bundle-variant]")) this.syncVariant(event.target.closest("[data-bundle-item]"));
        this.updateTotal();
      });
      this.lifecycle.listen(this, "input", (event) => {
        if (event.target.matches("[data-bundle-quantity]")) this.updateTotal();
      });
      this.lifecycle.listen(this.button, "click", () => this.submit());
      this.updateTotal();
    }

    disconnectedCallback() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
      this.request?.abort();
      this.request = null;
    }

    syncVariant(row) {
      const option = row?.querySelector("[data-bundle-variant]")?.selectedOptions[0];
      const quantity = row?.querySelector("[data-bundle-quantity]");
      if (!option || !quantity) return;
      row.dataset.variantId = option.value;
      row.dataset.price = option.dataset.price;
      const min = Math.max(1, Number(option.dataset.min) || 1);
      const step = Math.max(1, Number(option.dataset.step) || 1);
      quantity.min = String(min);
      quantity.step = String(step);
      if (option.dataset.max) quantity.max = option.dataset.max;
      else quantity.removeAttribute("max");
      quantity.value = String(min);
    }

    selectedItems({ validate = true } = {}) {
      const items = [];
      let valid = true;
      this.querySelectorAll("[data-bundle-item]").forEach((row) => {
        if (!row.querySelector("[data-bundle-select]")?.checked) return;
        const quantity = row.querySelector("[data-bundle-quantity]");
        const id = Number(row.dataset.variantId);
        const count = Number(quantity?.value);
        if (!id || !Number.isInteger(count) || count < 1 || !quantity?.checkValidity()) {
          valid = false;
          if (validate) quantity?.reportValidity();
          return;
        }
        items.push({ id, quantity: count, price: Number(row.dataset.price) || 0 });
      });
      return valid ? items : null;
    }

    updateTotal() {
      const items = this.selectedItems({ validate: false });
      if (this.total) this.total.textContent = nigat.money((items || []).reduce((sum, item) => sum + item.price * item.quantity, 0));
      if (this.error) this.error.hidden = true;
    }

    async submit() {
      if (this.button.disabled) return;
      const items = this.selectedItems();
      if (!items) return;
      if (!items.length) {
        if (this.error) { this.error.textContent = this.dataset.emptyMessage; this.error.hidden = false; }
        return;
      }
      this.button.disabled = true;
      if (this.error) this.error.hidden = true;
      const request = this.lifecycle.trackRequest(new AbortController());
      this.request = request;
      try {
        const response = await fetch(`${nigat.routes.root}cart/add.js`, {
          ...fetchConfig("javascript"),
          body: JSON.stringify({ items: items.map(({ id, quantity }) => ({ id, quantity })) }),
          signal: request.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!this.isConnected || request.signal.aborted) return;
        if (!response.ok || data.status) {
          try {
            await refreshCart(request.signal);
            await renderCartSections(request.signal);
          } catch (refreshError) {
            if (refreshError.name === "AbortError") return;
          }
          if (this.error) {
            this.error.textContent = data.description || data.message || this.dataset.errorMessage;
            this.error.hidden = false;
          }
          return;
        }
        try {
          await refreshCart(request.signal);
          await renderCartSections(request.signal);
        } catch (refreshError) {
          if (refreshError.name === "AbortError") return;
          location.href = `${nigat.routes.root}cart`;
          return;
        }
        if (!this.isConnected) return;
        const drawer = getDrawer();
        if (drawer) drawer.open(this.button);
        else location.href = `${nigat.routes.root}cart`;
      } catch (error) {
        if (error.name !== "AbortError" && this.isConnected && this.error) {
          this.error.textContent = this.dataset.errorMessage;
          this.error.hidden = false;
        }
      } finally {
        this.lifecycle?.untrackRequest(request);
        if (this.request === request) this.request = null;
        if (this.isConnected) this.button.disabled = false;
      }
    }
  }
  if (!customElements.get("product-bundle")) customElements.define("product-bundle", ProductBundle);

  const recentStorageKey = "nigat:recently-viewed:v1";
  const recentMaxAge = 30 * 24 * 60 * 60 * 1000;
  let privacyReady;
  function loadPrivacyApi() {
    if (!privacyReady) {
      privacyReady = new Promise((resolve) => {
        if (!window.Shopify?.loadFeatures) return resolve(false);
        window.Shopify.loadFeatures(
          [{ name: "consent-tracking-api", version: "0.1" }],
          (error) => resolve(!error && Boolean(window.Shopify.customerPrivacy))
        );
      });
    }
    return privacyReady;
  }

  class RecentlyViewed extends HTMLElement {
    connectedCallback() {
      if (this.lifecycle) return;
      this.lifecycle = createLifecycleScope();
      this.lifecycle.listen(document, "visitorConsentCollected", () => this.start());
      this.start();
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.observer = null;
      this.lifecycle?.destroy();
      this.lifecycle = null;
      this.request?.abort();
      this.request = null;
    }

    readHistory() {
      try {
        const parsed = JSON.parse(localStorage.getItem(recentStorageKey) || "[]");
        return (Array.isArray(parsed) ? parsed : [])
          .filter((entry) => entry && /^[a-z0-9-]+$/.test(entry.handle) && Date.now() - entry.at < recentMaxAge && entry.at <= Date.now())
          .slice(0, 12);
      } catch { return []; }
    }

    async start() {
      const loaded = await loadPrivacyApi();
      if (!this.isConnected || !loaded) return;
      if (!window.Shopify.customerPrivacy.preferencesProcessingAllowed()) {
        this.request?.abort();
        this.observer?.disconnect();
        this.observer = null;
        this.querySelector("[data-recently-content]")?.setAttribute("hidden", "");
        this.querySelector("[data-recently-grid]")?.replaceChildren();
        try { localStorage.removeItem(recentStorageKey); } catch { /* Storage may be unavailable. */ }
        this.dataset.loaded = "false";
        return;
      }
      const current = this.dataset.currentHandle;
      if (!current || !/^[a-z0-9-]+$/.test(current)) return;
      const history = this.readHistory().filter((entry) => entry.handle !== current);
      try {
        localStorage.setItem(recentStorageKey, JSON.stringify([{ handle: current, at: Date.now() }, ...history].slice(0, 12)));
      } catch { return; }
      if (!history.length || this.observer || this.dataset.loaded === "true") return;
      this.observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.observer.disconnect();
        this.observer = null;
        this.load(history.slice(0, Math.max(1, Number(this.dataset.limit) || 4)));
      }, { rootMargin: "300px" });
      this.observer.observe(this);
    }

    async load(history) {
      this.request?.abort();
      const request = new AbortController();
      this.request = request;
      const results = new Array(history.length);
      let next = 0;
      const worker = async () => {
        while (next < history.length && !request.signal.aborted) {
          const index = next++;
          const path = `${this.dataset.rootUrl || "/"}products/${encodeURIComponent(history[index].handle)}`;
          const url = new URL(path, location.origin);
          url.searchParams.set("section_id", this.dataset.sectionId);
          try {
            const response = await fetch(url, { signal: request.signal });
            if (!response.ok) continue;
            const html = new DOMParser().parseFromString(await response.text(), "text/html");
            const template = html.querySelector("recently-viewed template[data-recently-card]");
            results[index] = template?.content.firstElementChild?.cloneNode(true) || null;
          } catch (error) {
            if (error.name === "AbortError") return;
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(3, history.length) }, worker));
      if (!this.isConnected || request.signal.aborted) return;
      const cards = results.filter(Boolean);
      if (cards.length) {
        this.querySelector("[data-recently-grid]")?.replaceChildren(...cards);
        this.querySelector("[data-recently-content]")?.removeAttribute("hidden");
      }
      this.dataset.loaded = "true";
      if (this.request === request) this.request = null;
    }
  }
  if (!customElements.get("recently-viewed")) {
    customElements.define("recently-viewed", RecentlyViewed);
  }

  class ThemeVideo extends HTMLElement {
    connectedCallback() {
      this.video = this.querySelector("video");
      if (!this.video) return;
      this.motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.observer = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        this.sync();
      }, { threshold: 0.15 });
      this.observer.observe(this);
      this.lifecycle = createLifecycleScope();
      this.lifecycle.listen(document, "visibilitychange", () => this.sync());
      this.lifecycle.listen(this.motion, "change", () => this.sync());
    }

    disconnectedCallback() {
      this.video?.pause();
      this.observer?.disconnect();
      this.lifecycle?.destroy();
      this.lifecycle = null;
    }

    sync() {
      if (!this.video) return;
      const slide = this.closest("[data-slide-index]");
      const active = !slide || slide.getAttribute("aria-hidden") !== "true";
      if (!this.visible || document.hidden || !active || this.motion.matches) {
        this.video.pause();
      } else if (this.dataset.autoplay === "true" && this.video.muted) {
        this.video.play().catch(() => {});
      }
    }
  }
  if (!customElements.get("theme-video")) customElements.define("theme-video", ThemeVideo);

  class ThemeCountdown extends HTMLElement {
    connectedCallback() {
      const value = this.dataset.end || "";
      if (!/(Z|[+-]\d{2}:\d{2})$/.test(value)) { this.hidden = true; return; }
      this.end = Date.parse(value);
      if (!Number.isFinite(this.end)) { this.hidden = true; return; }
      this.output = this.querySelector("[data-countdown-value]");
      this.lifecycle = createLifecycleScope();
      this.update();
      if (this.end > Date.now()) this.timer = this.lifecycle.interval(() => this.update(), 60000);
    }

    disconnectedCallback() {
      this.lifecycle?.destroy();
      this.lifecycle = null;
      this.timer = null;
    }

    update() {
      const remaining = Math.max(0, this.end - Date.now());
      if (!remaining) {
        if (this.dataset.expiredBehavior === "hide") this.hidden = true;
        else if (this.output) this.output.textContent = this.dataset.expiredText || "Ended";
        if (this.timer) this.lifecycle.clearInterval(this.timer);
        this.timer = null;
        return;
      }
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      if (this.output) this.output.textContent = `${days}d ${hours}h ${minutes}m`;
    }
  }
  if (!customElements.get("theme-countdown")) customElements.define("theme-countdown", ThemeCountdown);

  /* --- Product modals (size chart / delivery terms) -------------------- */
  function openModal(id) {
    const dlg = document.getElementById(id);
    if (!dlg) return;
    if (typeof dlg.showModal === "function") {
      dlg.showModal();
    } else {
      dlg.setAttribute("open", "");
    }
    lockBodyScroll();
  }

  function closeModal(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function") {
      dlg.close();
    } else {
      dlg.removeAttribute("open");
    }
    unlockBodyScroll();
  }

  // Open triggers
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-modal-open]");
    if (trigger) {
      e.preventDefault();
      openModal(trigger.dataset.modalOpen);
    }
  });

  // Close triggers (button or backdrop)
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) {
      const dlg = e.target.closest(".product-modal");
      if (dlg) closeModal(dlg);
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".product-modal[open]").forEach(closeModal);
    }
  });

  /* --- Product media navigation arrows --------------------------------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-media-nav]");
    if (!btn) return;
    const gallery = btn.closest("[data-product-gallery]");
    if (!gallery) return;
    const items = Array.from(gallery.querySelectorAll(".product__media-item"));
    const thumbs = Array.from(gallery.querySelectorAll("[data-thumbnail]"));
    if (!items.length) return;

    const activeIdx = items.findIndex((i) => i.classList.contains("is-active"));
    let nextIdx;
    if (btn.dataset.mediaNav === "prev") {
      nextIdx = (activeIdx - 1 + items.length) % items.length;
    } else {
      nextIdx = (activeIdx + 1) % items.length;
    }

    items.forEach((item, i) => item.classList.toggle("is-active", i === nextIdx));
    thumbs.forEach((t, i) => t.classList.toggle("is-active", i === nextIdx));
  });

  /* --- Toast helper ----------------------------------------------------- */
  function showProductToast(msg, duration) {
    const toast = document.querySelector("[data-product-toast]");
    const msgEl = toast && toast.querySelector("[data-toast-msg]");
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.hidden = false;
    clearTimeout(toast._toastTimer);
    toast._toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, duration || 2400);
  }

  /* --- Floating share button → opens share bottom sheet --------------- */
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-floating-share]")) return;
    // Find the share sheet within the same product section
    const section = e.target.closest("[data-product-section]");
    const sheet = section
      ? section.querySelector('.share-sheet[id^="share-sheet-"]')
      : document.querySelector('.share-sheet[id^="share-sheet-"]');
    if (!sheet) return;
    openModal(sheet.id);
  });

  /* --- Share sheet copy/native actions --------------------------------- */
  function fallbackCopy(text, callback) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      if (callback) callback();
    } catch (err) {}
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-share-action]");
    if (!btn) return;
    const action = btn.dataset.shareAction;
    const shareUrl = btn.dataset.shareUrl || window.location.href;

    if (action === "copy") {
      const markCopied = () => {
        btn.classList.add("is-copied");
        if (typeof showSiteToast === "function") {
          showSiteToast("Link copied to clipboard!", { icon: "check" });
        } else {
          showProductToast("Link copied to clipboard!");
        }
        setTimeout(() => {
          btn.classList.remove("is-copied");
          const sheet = btn.closest(".share-sheet");
          if (sheet) closeModal(sheet);
        }, 1200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(shareUrl)
          .then(markCopied)
          .catch(() => {
            fallbackCopy(shareUrl, markCopied);
          });
      } else {
        fallbackCopy(shareUrl, markCopied);
      }
    } else if (action === "native") {
      if (navigator.share) {
        navigator
          .share({ title: document.title, url: shareUrl })
          .then(() => {
            const sheet = btn.closest(".share-sheet");
            if (sheet) closeModal(sheet);
          })
          .catch(() => {});
      } else {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            if (typeof showSiteToast === "function") {
              showSiteToast("Link copied to clipboard!", { icon: "check" });
            } else {
              showProductToast("Link copied to clipboard!");
            }
          })
          .catch(() => {});
      }
    }
  });

  /* --- Floating wishlist button → opens wishlist popover -------------- */
  function openWishlistPopover(btn) {
    const section = btn.closest("[data-product-section]");
    const popover = section
      ? section.querySelector(".wishlist-popover")
      : document.querySelector(".wishlist-popover");
    if (!popover) return;

    // Sync currently selected variant
    const variantInput = section && section.querySelector("[data-variant-id]");
    if (variantInput) {
      const activeId = variantInput.value;
      popover.querySelectorAll("[data-wishlist-variant]").forEach((vBtn) => {
        vBtn.classList.toggle("is-selected", vBtn.dataset.wishlistVariant === activeId);
      });
    }

    // Reset saved state
    const saveBtn = popover.querySelector("[data-wishlist-save]");
    const savedMsg = popover.querySelector(".wishlist-popover__saved-msg");
    if (saveBtn) {
      saveBtn.hidden = false;
      saveBtn.classList.remove("is-saved");
    }
    if (savedMsg) {
      savedMsg.hidden = true;
    }

    popover.hidden = false;
    lockBodyScroll();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-floating-wishlist]");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();

      const variantId =
        btn.dataset.variantId ||
        btn.closest("[data-product-section]")?.querySelector("[data-variant-id]")?.value;
      if (!variantId) return;

      const wishlist = getWishlist();
      const strId = String(variantId);
      const idx = wishlist.indexOf(strId);
      const isCurrentlySaved = idx > -1;

      if (isCurrentlySaved) {
        wishlist.splice(idx, 1);
        setWishlist(wishlist);
        syncWishlistUI();
        showSiteToast("Removed from wishlist", { icon: "unheart" });
      } else {
        wishlist.push(strId);
        setWishlist(wishlist);
        syncWishlistUI();
        showSiteToast("Added to wishlist", { icon: "heart" });
      }
      return;
    }
  });

  /* Close wishlist popover */
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-wishlist-close]")) {
      const popover = e.target.closest(".wishlist-popover");
      if (popover) {
        popover.hidden = true;
        unlockBodyScroll();
      }
    }
  });

  /* Variant selection inside popover */
  document.addEventListener("click", (e) => {
    const vBtn = e.target.closest("[data-wishlist-variant]");
    if (!vBtn) return;
    vBtn
      .closest(".wishlist-popover__variants")
      .querySelectorAll("[data-wishlist-variant]")
      .forEach((b) => b.classList.remove("is-selected"));
    vBtn.classList.add("is-selected");
  });

  /* Save to wishlist */
  document.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("[data-wishlist-save]");
    if (!saveBtn) return;

    const popover = saveBtn.closest(".wishlist-popover");
    const selected = popover && popover.querySelector("[data-wishlist-variant].is-selected");
    const variantId = selected ? selected.dataset.wishlistVariant : null;

    if (variantId) {
      const wishlist = getWishlist();
      if (!wishlist.includes(String(variantId))) {
        wishlist.push(String(variantId));
        setWishlist(wishlist);
      }
      syncWishlistUI();
    }

    // Show saved state inside popover
    saveBtn.classList.add("is-saved");
    saveBtn.hidden = true;
    const savedMsg = popover.querySelector(".wishlist-popover__saved-msg");
    if (savedMsg) savedMsg.hidden = false;

    // Auto-close after 1.4s
    setTimeout(() => {
      popover.hidden = true;
      unlockBodyScroll();
    }, 1400);
  });

  /* Escape closes wishlist popover */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".wishlist-popover:not([hidden])").forEach((p) => {
      p.hidden = true;
      unlockBodyScroll();
    });
  });

  /* --- Product description clamp toggle -------------------------------- */
  function initDescriptionClamps() {
    document.querySelectorAll(".product__description-block").forEach((block) => {
      const desc = block.querySelector("[data-product-description]");
      const toggle = block.querySelector("[data-description-toggle]");
      if (!desc || !toggle) return;
      // If description fits within clamp height (or is empty), hide toggle and unclamp
      if (desc.scrollHeight <= desc.clientHeight + 6) {
        toggle.hidden = true;
        desc.classList.remove("product__description--clamped");
      }
    });
  }

  initDescriptionClamps();
  window.addEventListener("load", initDescriptionClamps);

  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-description-toggle]");
    if (!toggle) return;
    const block = toggle.closest(".product__description-block");
    if (!block) return;
    const desc = block.querySelector("[data-product-description]");
    if (!desc) return;
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", !isExpanded);
    desc.classList.toggle("product__description--clamped", isExpanded);
    const moreText = toggle.querySelector("[data-toggle-text-more]");
    const lessText = toggle.querySelector("[data-toggle-text-less]");
    if (moreText && lessText) {
      moreText.hidden = !isExpanded;
      lessText.hidden = isExpanded;
    }
  });

  /* --- Sticky Add to Cart (bottom floating bar) ------------------------ */
  const stickyControllers = new Map();

  function initStickyAddToCart(scopeRoot = document) {
    const roots = [
      ...(scopeRoot.matches?.("[data-product-section]") ? [scopeRoot] : []),
      ...scopeRoot.querySelectorAll("[data-product-section]"),
    ];
    roots.forEach((productRoot) => {
      if (stickyControllers.has(productRoot)) return;
      const stickyBar = productRoot.querySelector("[data-sticky-add-to-cart]");
      if (!stickyBar) return;
      const lifecycle = createLifecycleScope();
      const productGrid = productRoot.querySelector(".product") || productRoot;
      const observer = lifecycle.trackObserver(new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const isPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          stickyBar.classList.toggle("is-visible", isPast);
          stickyBar.setAttribute("aria-hidden", isPast ? "false" : "true");
          stickyBar.inert = !isPast;
          const button = stickyBar.querySelector("[data-sticky-submit]");
          if (button) button.tabIndex = isPast ? 0 : -1;
        });
      }));
      observer.observe(productGrid);

      const submitBtn = stickyBar.querySelector("[data-sticky-submit]");
      lifecycle.listen(submitBtn, "click", (event) => {
        event.preventDefault();
        const form = productRoot.querySelector("product-form form");
        if (form) form.requestSubmit(form.querySelector("[data-add-to-cart]"));
      });
      stickyControllers.set(productRoot, lifecycle);
    });
  }

  function syncStickyControllers() {
    for (const [root, lifecycle] of stickyControllers) {
      if (!root.isConnected) {
        lifecycle.destroy();
        stickyControllers.delete(root);
      }
    }
    initStickyAddToCart();
  }

  /* --- Slideshow Component (Embla-style carousel) ----------------------- */
  class SlideshowComponent extends HTMLElement {
    constructor() {
      super();
      this.currentIndex = 0;
      this.autoplayTimer = null;
      this.isDragging = false;
    }

    connectedCallback() {
      if (this.lifecycle) return;
      this.viewport = this.querySelector("[data-slideshow-viewport]");
      this.track = this.querySelector("[data-slideshow-track]");
      this.slides = Array.from(this.querySelectorAll("[data-slide-index]"));
      this.prevBtns = Array.from(this.querySelectorAll("[data-slideshow-prev]"));
      this.nextBtns = Array.from(this.querySelectorAll("[data-slideshow-next]"));
      this.dots = Array.from(this.querySelectorAll("[data-slide-dot]"));
      this.counterCurrent = this.querySelector("[data-counter-current]");
      this.progressPillFill = this.querySelector("[data-progress-pill-fill]");
      this.progressEdgeFill = this.querySelector("[data-progress-edge]");

      this.slideCount = this.slides.length;
      if (this.slideCount <= 1) return;

      this.autoplay = this.dataset.autoplay === "true";
      this.autoplayInterval = parseInt(this.dataset.autoplayInterval, 10) || 5000;
      this.loop = this.dataset.loop !== "false";
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.dragCurrentX = 0;
      this.dragStartTime = 0;
      this.hasMoved = false;

      this.lifecycle = createLifecycleScope();
      this.init();
    }

    init() {
      this.prevBtns.forEach((btn) => {
        this.lifecycle.listen(btn, "click", () => {
          this.prev();
          this.resetAutoplay();
        });
      });

      this.nextBtns.forEach((btn) => {
        this.lifecycle.listen(btn, "click", () => {
          this.next();
          this.resetAutoplay();
        });
      });

      this.dots.forEach((dot, idx) => {
        this.lifecycle.listen(dot, "click", () => {
          this.goTo(idx);
          this.resetAutoplay();
        });
      });

      this.lifecycle.listen(this, "keydown", (e) => {
        if (e.key === "ArrowLeft") {
          this.prev();
          this.resetAutoplay();
        } else if (e.key === "ArrowRight") {
          this.next();
          this.resetAutoplay();
        }
      });

      if (this.viewport) {
        this.lifecycle.listen(this.viewport, "pointerdown", this.onPointerDown.bind(this));
        this.lifecycle.listen(this.viewport, "pointermove", this.onPointerMove.bind(this));
        this.lifecycle.listen(this.viewport, "pointerup", this.onPointerUp.bind(this));
        this.lifecycle.listen(this.viewport, "pointercancel", this.onPointerUp.bind(this));
        this.lifecycle.listen(this.viewport, "pointerleave", (e) => {
          if (this.isDragging) this.onPointerUp(e);
        });

        this.lifecycle.listen(this.viewport, "dragstart", (e) => e.preventDefault());
        this.lifecycle.listen(
          this.viewport,
          "click",
          (e) => {
            if (this.hasMoved) {
              e.preventDefault();
              e.stopPropagation();
            }
          },
          true
        );

        this.lifecycle.listen(this, "pointerenter", () => this.stopAutoplay());
        this.lifecycle.listen(this, "pointerleave", () => {
          if (!this.isDragging) this.startAutoplay();
        });
        this.lifecycle.listen(this, "focusin", () => this.stopAutoplay());
        this.lifecycle.listen(this, "focusout", () => this.startAutoplay());

        // Horizontal wheel / trackpad gesture support
        let wheelCooldown = false;
        let wheelAccumulator = 0;
        let wheelResetTimer = null;

        this.lifecycle.listen(
          this,
          "wheel",
          (e) => {
            let dx = e.deltaX;
            let dy = e.deltaY;

            if (e.deltaMode === 1) {
              dx *= 26;
              dy *= 26;
            } else if (e.deltaMode === 2) {
              dx *= 400;
              dy *= 400;
            }

            if (e.shiftKey && Math.abs(dx) < Math.abs(dy)) {
              dx = dy;
              dy = 0;
            }

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 2) {
              e.preventDefault();
              if (wheelCooldown) return;

              wheelAccumulator += dx;

              this.lifecycle.clearTimeout(wheelResetTimer);
              wheelResetTimer = this.lifecycle.timeout(() => {
                wheelAccumulator = 0;
              }, 180);

              if (Math.abs(wheelAccumulator) >= 16) {
                wheelCooldown = true;
                if (wheelAccumulator > 0) {
                  this.next();
                } else {
                  this.prev();
                }
                this.resetAutoplay();
                wheelAccumulator = 0;
                this.lifecycle.timeout(() => {
                  wheelCooldown = false;
                }, 350);
              }
            }
          },
          { passive: false }
        );
      }

      this.onBlockSelect = this.onBlockSelect.bind(this);
      this.onBlockDeselect = this.onBlockDeselect.bind(this);
      this.lifecycle.listen(document, "shopify:block:select", this.onBlockSelect);
      this.lifecycle.listen(document, "shopify:block:deselect", this.onBlockDeselect);

      this.lifecycle.listen(document, "visibilitychange", () => {
        if (document.hidden) {
          this.stopAutoplay();
        } else {
          this.startAutoplay();
        }
      });

      this.updateUI(false);
      this.startAutoplay();
    }

    disconnectedCallback() {
      this.stopAutoplay();
      this.lifecycle?.destroy();
      this.lifecycle = null;
      this.isDragging = false;
    }

    onPointerDown(e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      this.isDragging = true;
      this.hasMoved = false;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.dragCurrentX = e.clientX;
      this.dragStartTime = Date.now();

      this.stopAutoplay();
      this.viewport.classList.add("is-dragging");
      this.track.style.transition = "none";
    }

    onPointerMove(e) {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.dragStartX;
      const deltaY = e.clientY - this.dragStartY;

      if (!this.hasMoved && Math.abs(deltaY) > Math.abs(deltaX)) {
        this.isDragging = false;
        this.viewport.classList.remove("is-dragging");
        this.track.style.transition = "";
        return;
      }

      if (Math.abs(deltaX) > 4) {
        this.hasMoved = true;
      }

      this.dragCurrentX = e.clientX;
      const viewportWidth = this.viewport.offsetWidth || 1;
      let translatePercent = -this.currentIndex * 100 + (deltaX / viewportWidth) * 100;

      if (!this.loop) {
        if (translatePercent > 0) {
          translatePercent = translatePercent * 0.3;
        } else if (translatePercent < -(this.slideCount - 1) * 100) {
          const over = translatePercent + (this.slideCount - 1) * 100;
          translatePercent = -(this.slideCount - 1) * 100 + over * 0.3;
        }
      }

      this.track.style.transform = `translate3d(${translatePercent}%, 0, 0)`;
    }

    onPointerUp(e) {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.viewport.classList.remove("is-dragging");
      this.track.style.transition = "";

      const deltaX = this.dragCurrentX - this.dragStartX;
      const deltaTime = Date.now() - this.dragStartTime;
      const velocity = Math.abs(deltaX) / (deltaTime || 1);
      const viewportWidth = this.viewport.offsetWidth || 1;
      const threshold = viewportWidth * 0.15;

      if (deltaX < -threshold || (deltaX < -30 && velocity > 0.3)) {
        this.next();
      } else if (deltaX > threshold || (deltaX > 30 && velocity > 0.3)) {
        this.prev();
      } else {
        this.goTo(this.currentIndex);
      }

      this.lifecycle.timeout(() => {
        this.hasMoved = false;
      }, 50);

      this.resetAutoplay();
    }

    goTo(index, smooth = true) {
      const prev = this.currentIndex;
      if (this.loop) {
        this.currentIndex = (index + this.slideCount) % this.slideCount;
      } else {
        this.currentIndex = Math.max(0, Math.min(index, this.slideCount - 1));
      }
      const isWrapping =
        (prev === 0 && this.currentIndex === this.slideCount - 1) ||
        (prev === this.slideCount - 1 && this.currentIndex === 0);
      this.updateUI(smooth && !isWrapping);
    }

    prev() {
      if (this.currentIndex > 0) {
        this.goTo(this.currentIndex - 1);
      } else if (this.loop) {
        this.goTo(this.slideCount - 1);
      }
    }

    next() {
      if (this.currentIndex < this.slideCount - 1) {
        this.goTo(this.currentIndex + 1);
      } else if (this.loop) {
        this.goTo(0);
      }
    }

    updateUI(smooth = true) {
      if (this.track) {
        if (!smooth) {
          this.track.style.transition = "none";
        } else {
          this.track.style.transition = "";
        }
        this.track.style.transform = `translate3d(-${this.currentIndex * 100}%, 0, 0)`;
        if (!smooth) {
          void this.track.offsetHeight;
          this.track.style.transition = "";
        }
      }

      this.slides.forEach((slide, idx) => {
        const isActive = idx === this.currentIndex;
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
        slide.classList.toggle("is-active", isActive);
        slide.querySelectorAll("theme-video").forEach((video) => video.sync());
      });

      this.dots.forEach((dot, idx) => {
        const isActive = idx === this.currentIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
        dot.tabIndex = isActive ? 0 : -1;
      });

      if (this.counterCurrent) {
        this.counterCurrent.textContent = String(this.currentIndex + 1).padStart(2, "0");
      }

      const progressPercent = ((this.currentIndex + 1) / this.slideCount) * 100;
      if (this.progressPillFill) {
        this.progressPillFill.style.width = `${progressPercent}%`;
      }
      if (this.progressEdgeFill) {
        this.progressEdgeFill.style.width = `${progressPercent}%`;
      }

      if (!this.loop) {
        this.prevBtns.forEach((btn) => {
          btn.disabled = this.currentIndex === 0;
        });
        this.nextBtns.forEach((btn) => {
          btn.disabled = this.currentIndex === this.slideCount - 1;
        });
      }
    }

    startAutoplay() {
      if (!this.lifecycle || !this.autoplay || this.autoplayTimer || this.slideCount <= 1 || document.hidden) return;
      this.autoplayTimer = this.lifecycle.interval(() => {
        this.next();
      }, this.autoplayInterval);
    }

    stopAutoplay() {
      if (this.autoplayTimer) {
        this.lifecycle?.clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    resetAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    }

    onBlockSelect(e) {
      if (!e.target || !this.contains(e.target)) return;
      const slide = e.target.closest("[data-slide-index]");
      if (!slide) return;
      const idx = parseInt(slide.dataset.slideIndex, 10);
      if (!isNaN(idx)) {
        this.stopAutoplay();
        this.goTo(idx);
      }
    }

    onBlockDeselect(e) {
      if (!e.target || !this.contains(e.target)) return;
      this.startAutoplay();
    }
  }
  customElements.define("slideshow-component", SlideshowComponent);

  /* --- Header & Announcement Dimensions --------------------------------- */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openMenu = event.target.closest(".header__dropdown[open], .mobile-menu__details[open]");
    if (!openMenu) return;
    openMenu.open = false;
    openMenu.querySelector("summary")?.focus();
  });
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".header__dropdown[open]").forEach((menu) => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });

  function updateHeaderDimensions() {
    const announcement = document.querySelector(".announcement-bar-section, .announcement-layout");
    const header = document.querySelector("[data-header], .header-section, .header-layout");

    const hasAnnouncement = Boolean(
      announcement &&
      announcement.offsetHeight > 0 &&
      !announcement.hasAttribute("hidden") &&
      announcement.offsetParent !== null
    );
    const announcementHeight = hasAnnouncement ? announcement.offsetHeight : 0;
    const headerHeight =
      header && header.offsetHeight > 0
        ? header.offsetHeight
        : parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--foundation-header-height"
            )
          ) || 64;

    document.documentElement.style.setProperty("--announcement-height", `${announcementHeight}px`);
    document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
    document.documentElement.style.setProperty(
      "--header-total-height",
      `${headerHeight + announcementHeight}px`
    );
  }

  /* --- Sticky Header (Reveal on scroll up) ----------------------------- */
  function initStickyHeader() {
    const header = document.querySelector("[data-header].header--sticky");
    if (!header || header.dataset.stickyInitialized) return;
    header.dataset.stickyInitialized = "true";

    const headerSection = header.closest(".header-section") || header;
    headerSection.classList.add("header-section--sticky");

    function updateHeaderHeight() {
      updateHeaderDimensions();
    }
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight, { passive: true });

    let lastScrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop);
    let ticking = false;
    const threshold = 6;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop);
        const headerHeight = header.offsetHeight || 52;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Prevent iOS overscroll bounce at the bottom from triggering reveal/hide
        if (scrollTop >= maxScroll - 15) {
          ticking = false;
          return;
        }

        // Keep header visible if search panel or mobile menu is open
        const mobileMenu = document.querySelector("[data-mobile-menu]");
        const searchPanel = document.querySelector("[data-search-panel]");
        const isMenuOpen = mobileMenu && !mobileMenu.hidden;
        const isSearchOpen = searchPanel && !searchPanel.hidden;

        if (isMenuOpen || isSearchOpen) {
          header.classList.remove("header--hidden");
          headerSection.classList.remove("header--hidden");
          lastScrollTop = scrollTop;
          ticking = false;
          return;
        }

        if (scrollTop <= headerHeight) {
          header.classList.remove("header--hidden");
          header.classList.remove("header--scrolled");
          headerSection.classList.remove("header--hidden");
          headerSection.classList.remove("header--scrolled");
        } else {
          header.classList.add("header--scrolled");
          headerSection.classList.add("header--scrolled");
          const scrollDelta = scrollTop - lastScrollTop;

          if (scrollDelta > threshold && scrollTop > headerHeight + 20) {
            // Scrolling DOWN -> hide header
            header.classList.add("header--hidden");
            headerSection.classList.add("header--hidden");
            header
              .querySelectorAll(".header__dropdown[open]")
              .forEach((d) => d.removeAttribute("open"));
          } else if (scrollDelta < -threshold) {
            // Scrolling UP -> reveal header
            header.classList.remove("header--hidden");
            headerSection.classList.remove("header--hidden");
          }
        }

        lastScrollTop = scrollTop;
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  updateHeaderDimensions();
  window.addEventListener("load", updateHeaderDimensions);
  window.addEventListener("resize", updateHeaderDimensions, { passive: true });
  document.addEventListener("shopify:section:load", updateHeaderDimensions);
  document.addEventListener("shopify:section:unload", updateHeaderDimensions);

  initStickyHeader();
  window.addEventListener("load", initStickyHeader);
  syncStickyControllers();
  syncProductZoomControllers();
  function syncReviewSummary() {
    document.querySelectorAll("[data-product-section]").forEach((root) => {
      const summary = root.querySelector("[data-review-summary]");
      const region = root.querySelector("[data-product-reviews]");
      if (!summary) return;
      const linked = Boolean(region && region.children.length > 0);
      if (linked === (summary.tagName === "A")) return;
      const replacement = document.createElement(linked ? "a" : "div");
      replacement.className = summary.className;
      replacement.dataset.reviewSummary = "";
      replacement.setAttribute("aria-label", summary.getAttribute("aria-label") || "");
      if (linked) replacement.href = `#${region.id}`;
      while (summary.firstChild) replacement.appendChild(summary.firstChild);
      summary.replaceWith(replacement);
    });
  }
  function syncProductControllers() {
    syncStickyControllers();
    syncProductZoomControllers();
    syncReviewSummary();
  }
  const productRootObserver = new MutationObserver(syncProductControllers);
  productRootObserver.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("shopify:section:load", syncProductControllers);
  document.addEventListener("shopify:section:unload", () => queueMicrotask(syncProductControllers));
  syncReviewSummary();
  syncWishlistUI();

  if (window.nigat && window.nigat.initThemeImageLoaders) {
    window.nigat.initThemeImageLoaders();
    window.addEventListener("load", () => window.nigat.initThemeImageLoaders());
    document.addEventListener("shopify:section:load", (e) => {
      if (e.target) window.nigat.initThemeImageLoaders(e.target);
    });
    document.addEventListener("shopify:block:select", (e) => {
      if (e.target) window.nigat.initThemeImageLoaders(e.target);
    });
  }

  // Auto-register search query term on /search page load if present in URL
  if (window.location.pathname.includes("/search")) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get("q");
      if (q) {
        const cleanTerm = q.replace(/\*+$/, "").trim();
        if (cleanTerm) {
          nigat.addRecentSearch(cleanTerm);
        }
      }
    } catch (e) {}
  }
})();
