(function () {
  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (text !== undefined && text !== null) {
      el.textContent = text;
    }
    return el;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function showStatus(target, message, type) {
    if (!target) {
      return;
    }
    target.className = `status ${type || ""}`.trim();
    target.textContent = message || "";
  }

  function renderBadges(items, className) {
    const wrap = createEl("div", className || "badges");
    items.forEach((item) => {
      wrap.appendChild(createEl("span", "badge", item));
    });
    return wrap;
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const text = payload.error || `HTTP ${response.status}`;
      throw new Error(text);
    }
    return response.json();
  }

  window.HSR = {
    createEl,
    normalize,
    showStatus,
    renderBadges,
    fetchJson,
  };
})();
