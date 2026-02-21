document.addEventListener("DOMContentLoaded", () => {
  const { createEl, normalize, showStatus, renderBadges, fetchJson } = window.HSR;

  const grid = document.getElementById("characters-grid");
  const status = document.getElementById("status");
  const countEl = document.getElementById("results-count");

  const controls = {
    q: document.getElementById("q"),
    path: document.getElementById("path"),
    element: document.getElementById("element"),
    rarity: document.getElementById("rarity"),
    sort: document.getElementById("sort"),
    reset: document.getElementById("reset-filters"),
  };

  let characters = [];

  function getStateFromInputs() {
    return {
      q: controls.q.value,
      path: controls.path.value,
      element: controls.element.value,
      rarity: controls.rarity.value,
      sort: controls.sort.value,
    };
  }

  function setInputsFromSearch() {
    const params = new URLSearchParams(window.location.search);
    controls.q.value = params.get("q") || "";
    controls.path.value = params.get("path") || "all";
    controls.element.value = params.get("element") || "all";
    controls.rarity.value = params.get("rarity") || "all";
    controls.sort.value = params.get("sort") || "rarity_desc_name_asc";
  }

  function syncSearchParams(state) {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "rarity_desc_name_asc") {
        params.set(key, value);
      }
      if (key === "sort" && value && value !== "rarity_desc_name_asc") {
        params.set(key, value);
      }
    });

    const query = params.toString();
    const url = query ? `/characters?${query}` : "/characters";
    history.replaceState({}, "", url);
  }

  function populateOptions() {
    const paths = [...new Set(characters.map((c) => c.path))].sort();
    const elements = [...new Set(characters.map((c) => c.element))].sort();

    paths.forEach((path) => {
      controls.path.appendChild(createEl("option", "", path)).value = path;
    });
    elements.forEach((element) => {
      controls.element.appendChild(createEl("option", "", element)).value = element;
    });
  }

  function applyFilters(list, state) {
    const q = normalize(state.q);
    return list.filter((c) => {
      const searchHit =
        !q ||
        normalize(c.id).includes(q) ||
        normalize(c.name_ru).includes(q) ||
        normalize(c.name_en).includes(q);
      const pathHit = state.path === "all" || c.path === state.path;
      const elementHit = state.element === "all" || c.element === state.element;
      const rarityHit = state.rarity === "all" || String(c.rarity) === state.rarity;
      return searchHit && pathHit && elementHit && rarityHit;
    });
  }

  function sortCharacters(list, mode) {
    const copy = [...list];
    copy.sort((a, b) => {
      if (mode === "name_asc") {
        return a.name_ru.localeCompare(b.name_ru, "ru");
      }
      if (mode === "name_desc") {
        return b.name_ru.localeCompare(a.name_ru, "ru");
      }
      if (b.rarity !== a.rarity) {
        return b.rarity - a.rarity;
      }
      return a.name_ru.localeCompare(b.name_ru, "ru");
    });
    return copy;
  }

  function buildCard(character) {
    const link = createEl("a", "card");
    const search = window.location.search;
    link.href = `/characters/${character.id}${search}`;

    const imageWrap = createEl("div", "card-image-wrap");
    const image = createEl("img", "card-image");
    image.src = character.image;
    image.alt = `${character.name_ru} splash art`;
    image.loading = "lazy";

    const overlay = createEl("div", "card-overlay");
    overlay.appendChild(createEl("h3", "card-title", character.name_ru));
    overlay.appendChild(createEl("p", "card-subtitle", character.name_en));

    imageWrap.appendChild(image);
    imageWrap.appendChild(overlay);

    const body = createEl("div", "card-body");
    body.appendChild(
      renderBadges([
        `${character.rarity}★`,
        character.path,
        character.element,
      ])
    );

    link.appendChild(imageWrap);
    link.appendChild(body);
    return link;
  }

  function render() {
    const state = getStateFromInputs();
    syncSearchParams(state);

    const filtered = sortCharacters(applyFilters(characters, state), state.sort);
    grid.innerHTML = "";
    countEl.textContent = `Найдено: ${filtered.length}`;

    if (!filtered.length) {
      const empty = createEl("div", "empty");
      empty.appendChild(createEl("p", "", "Ничего не найдено по текущим условиям."));
      const resetBtn = createEl("button", "btn", "Сбросить фильтры");
      resetBtn.type = "button";
      resetBtn.addEventListener("click", resetFilters);
      empty.appendChild(resetBtn);
      grid.appendChild(empty);
      return;
    }

    filtered.forEach((character) => {
      grid.appendChild(buildCard(character));
    });
  }

  function resetFilters() {
    controls.q.value = "";
    controls.path.value = "all";
    controls.element.value = "all";
    controls.rarity.value = "all";
    controls.sort.value = "rarity_desc_name_asc";
    render();
  }

  async function init() {
    try {
      showStatus(status, "Загрузка...", "");
      characters = await fetchJson("/api/characters");
      populateOptions();
      setInputsFromSearch();
      showStatus(status, "", "");
      render();
    } catch (error) {
      showStatus(status, "Не удалось загрузить данные.", "error");
      console.error(error);
    }
  }

  [controls.q, controls.path, controls.element, controls.rarity, controls.sort].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });
  controls.reset.addEventListener("click", resetFilters);

  init();
});
