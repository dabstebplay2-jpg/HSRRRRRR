document.addEventListener("DOMContentLoaded", () => {
  const { createEl, showStatus, renderBadges, fetchJson } = window.HSR;

  const root = document.getElementById("character-root");
  const status = document.getElementById("status");
  const backLink = document.getElementById("back-link");

  function getCharacterIdFromPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }

  function renderCharacter(character) {
    root.innerHTML = "";

    const article = createEl("article", "detail-card");

    const banner = createEl("img", "detail-banner");
    banner.src = character.image;
    banner.alt = `${character.name_ru} splash art`;

    const body = createEl("div", "detail-body");
    body.appendChild(createEl("h2", "detail-title", character.name_ru));
    body.appendChild(createEl("p", "detail-subtitle", character.name_en));

    body.appendChild(
      renderBadges(
        [
          `${character.rarity}★`,
          character.path,
          character.element,
          `v${character.release_version}`,
        ],
        "badges"
      )
    );

    const rolesBlock = createEl("section", "detail-section");
    rolesBlock.appendChild(createEl("h3", "", "Роли"));
    rolesBlock.appendChild(renderBadges(character.roles || [], "chips"));

    const tagsBlock = createEl("section", "detail-section");
    tagsBlock.appendChild(createEl("h3", "", "Теги"));
    tagsBlock.appendChild(renderBadges(character.tags || [], "chips"));

    body.appendChild(rolesBlock);
    body.appendChild(tagsBlock);

    article.appendChild(banner);
    article.appendChild(body);

    root.appendChild(article);
  }

  async function init() {
    const id = getCharacterIdFromPath();
    const search = window.location.search || "";
    backLink.href = `/characters${search}`;

    try {
      showStatus(status, "Загрузка...", "");
      const character = await fetchJson(`/api/characters/${id}`);
      showStatus(status, "", "");
      renderCharacter(character);
    } catch (error) {
      if (error.message.includes("not found") || error.message.includes("404")) {
        showStatus(status, "Персонаж не найден.", "error");
      } else {
        showStatus(status, "Не удалось загрузить данные.", "error");
      }
      console.error(error);
    }
  }

  init();
});
