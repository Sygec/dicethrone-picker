import { db } from './db.js';

export function renderAdminBuildInfo() {
    const infoDiv = document.getElementById("admin-build-info");
    if (!infoDiv) return;

    const host = window.location.hostname;
    let platform = "Localhost";
    if (host.includes("github.io")) platform = "GitHub Pages";
    else if (host.includes("workers.dev")) platform = "Cloudflare Workers";

    const env = window.isProd ? "Production" : "Development";
    const dbName = window.isProd ? "Supabase PROD" : "Supabase DEV";
    const branchHint = window.isProd ? "main" : "dev/local";

    infoDiv.innerHTML = `
        <div><b>Platform:</b> ${platform} (${host})</div>
        <div><b>Environment:</b> ${env} (Targeting: ${branchHint})</div>
        <div><b>Database:</b> ${dbName}</div>
        ${!window.isProd ? '<div style="margin-top:5px; color:var(--danger); font-style:italic;">Note: Dev heroes are prefixed with "DEV-" in this database.</div>' : ""}
    `;
}
window.renderAdminBuildInfo = renderAdminBuildInfo;

export function openChangelog() {
    if (!window.cachedChangelog) return;

    const container = document.getElementById("changelog-container");
    container.innerHTML = window.cachedChangelog
        .map(
            (entry) => `
        <div>
            <h3>v${entry.version}</h3>
            <ul>
                ${entry.changes.map((change) => `<li>${change}</li>`).join("")}
            </ul>
        </div>
    `,
        )
        .join("");

    const modal = document.getElementById("changelog-modal");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}
window.openChangelog = openChangelog;

export function closeChangelog() {
    const modal = document.getElementById("changelog-modal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "auto";
}
window.closeChangelog = closeChangelog;

export function showWhatsNew(entry) {
    const whatsNewContainer = document.getElementById("whats-new-container");
    whatsNewContainer.innerHTML = `
        <div>
            <h3>v${entry.version}</h3>
            <ul style="text-align: left;">
                ${entry.changes.map((change) => `<li>${change}</li>`).join("")}
            </ul>
        </div>
    `;
    const whatsNewModal = document.getElementById("whats-new-modal");
    whatsNewModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    localStorage.setItem("lastSeenVersion", entry.version);
}
window.showWhatsNew = showWhatsNew;

export function closeWhatsNew() {
    const whatsNewModal = document.getElementById("whats-new-modal");
    if (whatsNewModal) whatsNewModal.style.display = "none";
    document.body.style.overflow = "auto";
}
window.closeWhatsNew = closeWhatsNew;

export function showSection(sectionName) {
    if (sectionName === "admin" && !window.isAdmin()) return;

    const sections = {
        roll: "rollSection",
        database: "dbSection",
        history: "gamesSection",
        collection: "collectionSection",
        admin: "adminSection"
    };

    const targetId = sections[sectionName];
    if (!targetId) return;

    Object.values(sections).forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            if (id === targetId) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        }
    });

    if (sectionName === "database") {
        if (typeof window.updateSegmentedHighlights === "function") {
            setTimeout(window.updateSegmentedHighlights, 50);
        }
    } else if (sectionName === "history") {
        renderGamesList();
    } else if (sectionName === "collection") {
        renderCollectionView();
    }
}
window.showSection = showSection;

export function toggleAdminPanel(event, panelId) {
    const panel = document.getElementById(panelId);
    const header =
        event.currentTarget.closest(".panel-header") || event.currentTarget;
    const button = header.querySelector(".panel-toggle");
    if (!panel || !button) return;

    const isHidden = panel.classList.toggle("hidden");
    button.classList.toggle("open", !isHidden);
    button.setAttribute("aria-expanded", String(!isHidden));
}
window.toggleAdminPanel = toggleAdminPanel;

export function toggleHeroPanel(header) {
    const item = header.closest(".hero-item");
    const button = header.querySelector(".panel-toggle");
    const isNowCollapsed = item.classList.toggle("collapsed");
    button.classList.toggle("open", !isNowCollapsed);
    button.setAttribute("aria-expanded", String(!isNowCollapsed));
}
window.toggleHeroPanel = toggleHeroPanel;

export function toggleCollectionGroup(groupId, event) {
    if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "LABEL" ||
        event.target.closest("label")
    ) {
        return;
    }
    if (window.expandedCollectionGroups.has(groupId)) {
        window.expandedCollectionGroups.delete(groupId);
    } else {
        window.expandedCollectionGroups.add(groupId);
    }
    renderCollectionView();
}
window.toggleCollectionGroup = toggleCollectionGroup;

export function setOwnershipFilter(filterState) {
    const showOwnedCheckbox = document.getElementById("db-show-owned");
    const showNotOwnedCheckbox = document.getElementById("db-show-not-owned");

    if (showOwnedCheckbox && showNotOwnedCheckbox) {
        if (filterState === "owned") {
            showOwnedCheckbox.checked = true;
            showNotOwnedCheckbox.checked = false;
        } else if (filterState === "unowned") {
            showOwnedCheckbox.checked = false;
            showNotOwnedCheckbox.checked = true;
        } else {
            showOwnedCheckbox.checked = true;
            showNotOwnedCheckbox.checked = true;
        }
    }

    // Update segmented pill active class
    const pills = {
        owned: document.getElementById("pill-show-owned"),
        unowned: document.getElementById("pill-show-not-owned"),
        all: document.getElementById("pill-show-all"),
    };

    Object.keys(pills).forEach((key) => {
        const pill = pills[key];
        if (pill) {
            pill.classList.toggle("active", key === filterState);
        }
    });

    if (typeof window.updateSegmentedHighlights === "function") {
        window.updateSegmentedHighlights();
    }
    if (typeof window.renderList === "function") {
        window.renderList();
    }
}
window.setOwnershipFilter = setOwnershipFilter;

export function renderCollectionView() {
    const container = document.getElementById("collectionContainer");
    const countLabel = document.getElementById("collection-count-stats");
    if (!container) return;

    const totalHeroes = window.characters.length;
    const ownedHeroes = window.characters.filter(window.isHeroOwned).length;

    if (countLabel) {
        countLabel.innerText = `Owned ${ownedHeroes} of ${totalHeroes} heroes`;
    }

    const sortedGroups = [...window.groups].sort((a, b) => {
        const orderA = a.order_index ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order_index ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        return a.name.localeCompare(b.name);
    });

    const isDisabled = window.currentUser ? "" : "disabled";

    container.innerHTML = sortedGroups
        .map((group) => {
            const groupHeroes = window.characters
                .filter((c) => c.group_id === group.id)
                .sort((a, b) => a.name.localeCompare(b.name));

            if (groupHeroes.length === 0) return "";

            const allOwned = groupHeroes.every(window.isHeroOwned);

            const heroesHtml = groupHeroes
                .map((h) => {
                    const isSelected = window.isHeroOwned(h);
                    return `
            <div class="collection-hero-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}" onclick="toggleHeroOwned('${h.id}', ${!isSelected})">
                <img src="${window.getImgUrl(h.slug)}" class="collection-hero-card-img" alt="${h.name}">
                <div class="collection-hero-card-name">${h.name}</div>
            </div>
        `;
                })
                .join("");

            const isExpanded = window.expandedCollectionGroups.has(group.id);
            const totalGroup = groupHeroes.length;
            const ownedGroup = groupHeroes.filter(window.isHeroOwned).length;

            return `
            <div class="collection-group${isExpanded ? "" : " collapsed"}">
                <div class="collection-group-header" onclick="toggleCollectionGroup('${group.id}', event)" style="cursor: pointer;">
                    <input type="checkbox" id="owned-group-${group.id}" ${allOwned ? "checked" : ""} ${isDisabled} onchange="toggleGroupOwned('${group.id}', this.checked)" onclick="event.stopPropagation();">
                    <label for="owned-group-${group.id}" onclick="event.stopPropagation();">
                        <strong>${group.name}</strong>
                        ${group.year ? ` <span style="opacity: 0.6; font-size: 0.85em;">(${group.year})</span>` : ""}
                        <span class="stats-divider" style="margin: 0 8px;">|</span>
                        <span style="opacity: 0.6; font-size: 0.85em;">Owned: <strong style="color: #fff;">${ownedGroup}</strong>/<strong style="color: #fff;">${totalGroup}</strong></span>
                    </label>
                    <button type="button" class="panel-toggle${isExpanded ? " open" : ""}" aria-expanded="${isExpanded}">V</button>
                </div>
                <div class="collection-heroes-list">
                    ${heroesHtml}
                </div>
            </div>
        `;
        })
        .join("");
}
window.renderCollectionView = renderCollectionView;

export async function toggleHeroOwned(heroId, isOwned) {
    if (!window.currentUser) {
        alert("Please log in to manage your collection.");
        return;
    }

    const hero = window.characters.find((h) => h.id === heroId);
    if (hero) hero.is_owned = isOwned;
    renderCollectionView();
    if (typeof window.renderList === "function") window.renderList();
    if (typeof window.updateDropdownSort === "function") window.updateDropdownSort();

    const adminCheckbox = document.getElementById(
        `admin-owned-${window.currentUser.id}-${heroId}`,
    );
    if (adminCheckbox) {
        adminCheckbox.checked = isOwned;
    }

    const { error } = await db.from("user_heroes").upsert({
        user_id: window.currentUser.id,
        hero_id: heroId,
        is_owned: isOwned,
    });

    if (error) {
        alert("Error updating ownership: " + error.message);
        if (hero) hero.is_owned = !isOwned;
        renderCollectionView();
        if (typeof window.updateDropdownSort === "function") window.updateDropdownSort();
        if (typeof window.renderList === "function") window.renderList();

        if (adminCheckbox) {
            adminCheckbox.checked = !isOwned;
        }
    }
}
window.toggleHeroOwned = toggleHeroOwned;

export async function toggleGroupOwned(groupId, isOwned) {
    if (!window.currentUser) {
        alert("Please log in to manage your collection.");
        return;
    }

    window.characters.forEach((h) => {
        if (h.group_id === groupId) {
            h.is_owned = isOwned;
            const adminCheckbox = document.getElementById(
                `admin-owned-${window.currentUser.id}-${h.id}`,
            );
            if (adminCheckbox) {
                adminCheckbox.checked = isOwned;
            }
        }
    });
    renderCollectionView();
    if (typeof window.renderList === "function") window.renderList();
    if (typeof window.updateDropdownSort === "function") window.updateDropdownSort();

    const groupHeroIds = window.characters
        .filter((h) => h.group_id === groupId)
        .map((h) => ({
            user_id: window.currentUser.id,
            hero_id: h.id,
            is_owned: isOwned,
        }));

    const { error } = await db.from("user_heroes").upsert(groupHeroIds);

    if (error) {
        alert("Error updating group ownership: " + error.message);
        window.characters.forEach((h) => {
            if (h.group_id === groupId) h.is_owned = !isOwned;
        });
        renderCollectionView();
        if (typeof window.updateDropdownSort === "function") window.updateDropdownSort();
        if (typeof window.renderList === "function") window.renderList();
    }
}
window.toggleGroupOwned = toggleGroupOwned;

export async function saveCharacter() {
    const name = document.getElementById("charName").value.trim();
    const groupId = document.getElementById("charGroup").value;
    const slug = document.getElementById("charSlug").value.trim();
    const complexity = document.getElementById("charComplexity").value.trim();

    if (!name) return alert("Name is required");
    if (!groupId) return alert("Group is required");

    const charData = {
        name,
        slug,
        complexity: complexity ? parseInt(complexity) : null,
        group_id: groupId,
        last_updated_by: window.currentUser.id,
    };

    const { error } = await db
        .from("heroes")
        .insert(charData)
        .select()
        .single();

    if (error) return alert("Error saving: " + error.message);

    if (typeof window.init === "function") await window.init();
    resetForm();
}
window.saveCharacter = saveCharacter;

export function editChar(idx) {
    window.editIndex = idx;
    renderHeroesList();

    const adminSection = document.getElementById("adminSection");
    if (adminSection.classList.contains("hidden")) showSection("admin");

    const editPanel = document.getElementById(
        `heroEditPanel-${window.characters[idx]?.id}`,
    );
    if (editPanel && !isElementFullyVisible(editPanel)) {
        editPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}
window.editChar = editChar;

export function isElementFullyVisible(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight)
    );
}
window.isElementFullyVisible = isElementFullyVisible;

export function resetForm() {
    window.editIndex = -1;

    document.getElementById("charName").value = "";
    document.getElementById("charSlug").value = "";
    document.getElementById("charGroup").value = "";
    document.getElementById("charComplexity").value = "";

    document.getElementById("formTitle").innerText = "Add New Hero";

    const form = document.getElementById("heroForm");
    const button = document.getElementById("addHeroBtn");
    if (form && button) {
        form.classList.add("hidden");
        button.innerText = "Add Hero";
    }
}
window.resetForm = resetForm;

export function toggleHeroForm() {
    const form = document.getElementById("heroForm");
    const button = document.getElementById("addHeroBtn");
    if (!form || !button) return;

    const isHidden = form.classList.toggle("hidden");
    button.innerText = isHidden ? "Add Hero" : "Hide Hero Form";

    if (!isHidden) {
        document.getElementById("charName")?.focus();
    }
}
window.toggleHeroForm = toggleHeroForm;

export function populateGroupDropdown() {
    const select = document.getElementById("charGroup");
    if (!select) return;
    const options = window.groups
        .map((g) => `<option value="${g.id}">${g.name}</option>`)
        .join("");
    select.innerHTML = '<option value="">-- Select Group --</option>' + options;
}
window.populateGroupDropdown = populateGroupDropdown;

export function renderGroupsList() {
    const container = document.getElementById("groupsListContainer");
    if (!container) return;

    if (window.groups.length === 0) {
        container.innerHTML =
            '<p style="opacity: 0.6; font-style: italic;">No groups yet. Create one above.</p>';
        return;
    }

    const html = window.groups
        .map(
            (g) => `
        <div id="groupRow-${g.id}" class="group-row" style="margin: 5px 0; background: rgba(255,255,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                <div>
                    <strong>${window.escapeHtml(g.name)}</strong>
                    ${g.year ? ` <span style="opacity: 0.6;">(${g.year})</span>` : ""}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-save btn-inline" onclick="editGroup('${g.id}')">Edit</button>
                    <button type="button" class="btn-cancel btn-inline" onclick="deleteGroup('${g.id}')">Delete</button>
                </div>
            </div>
            <div id="groupEditPanel-${g.id}" class="group-edit-panel hidden">
                <div class="form-grid">
                    <input type="text" id="groupName-${g.id}" placeholder="Group Name" value="${window.escapeHtml(g.name)}">
                    <input type="number" id="groupOrder-${g.id}" placeholder="Order Index" value="${g.order_index ?? ""}">
                    <input type="number" id="groupYear-${g.id}" placeholder="Release Year" value="${g.year ?? ""}">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn-save" onclick="saveGroupInline('${g.id}')">Save</button>
                    <button type="button" class="btn-cancel" onclick="cancelGroupEdit('${g.id}')">Cancel</button>
                </div>
            </div>
        </div>
    `,
        )
        .join("");

    container.innerHTML = html;
}
window.renderGroupsList = renderGroupsList;

export function renderHeroesList() {
    const container = document.getElementById("heroesListContainer");
    if (!container) return;

    if (window.characters.length === 0) {
        container.innerHTML =
            '<p style="opacity: 0.6; font-style: italic;">No heroes yet. Add one above.</p>';
        return;
    }

    const html = window.characters
        .map((c, idx) => {
            const isEditing = window.editIndex === idx;
            const editBtn = window.isAdmin()
                ? `<button class="btn-save btn-inline" onclick="editChar(${idx})">Edit</button>`
                : "";
            const deleteBtn = window.isAdmin()
                ? `<button class="btn-cancel btn-inline" onclick="deleteHero('${c.id}')">Delete</button>`
                : "";
            const groupOptions = window.groups
                .map(
                    (g) =>
                        `<option value="${g.id}" ${g.id === c.group_id ? "selected" : ""}>${window.escapeHtml(g.name)}</option>`,
                )
                .join("");

            return `
            <div id="heroRow-${c.id}" class="group-row hero-admin-row${isEditing ? " editing" : ""}">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div>
                        <strong>${window.escapeHtml(c.name)}</strong>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${editBtn}
                        ${deleteBtn}
                    </div>
                </div>
                <div id="heroEditPanel-${c.id}" class="group-edit-panel${isEditing ? "" : " hidden"}">
                    <div class="form-grid">
                        <input type="text" id="heroName-${idx}" placeholder="Hero Name" value="${window.escapeHtml(c.name)}">
                        <select id="heroGroup-${idx}">
                            <option value="">-- Select Group --</option>
                            ${groupOptions}
                        </select>
                    </div>
                    <div class="form-grid">
                        <input type="text" id="heroSlug-${idx}" placeholder="Slug (for image)" value="${window.escapeHtml(c.slug)}">
                        <select id="heroComplexity-${idx}">
                            <option value="">-- Complexity --</option>
                            ${[1, 2, 3, 4, 5, 6].map((value) => `<option value="${value}" ${c.complexity == value ? "selected" : ""}>${value}</option>`).join("")}
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-save" onclick="saveHeroInline('${c.id}', ${idx})">Save</button>
                        <button class="btn-cancel" onclick="cancelHeroEdit()">Cancel</button>
                    </div>
                </div>
            </div>`;
        })
        .join("");

    container.innerHTML = html;
    if (window.editIndex !== -1) {
        container.classList.add("group-edit-active");
    } else {
        container.classList.remove("group-edit-active");
    }
}
window.renderHeroesList = renderHeroesList;

export function cancelHeroEdit() {
    window.editIndex = -1;
    renderHeroesList();
}
window.cancelHeroEdit = cancelHeroEdit;

export async function saveHeroInline(heroId, idx) {
    const name = document.getElementById(`heroName-${idx}`).value.trim();
    const groupId = document.getElementById(`heroGroup-${idx}`).value;
    const slug = document.getElementById(`heroSlug-${idx}`).value.trim();
    const complexity = document
        .getElementById(`heroComplexity-${idx}`)
        .value.trim();

    if (!name) return alert("Name is required");
    if (!groupId) return alert("Group is required");

    const charData = {
        id: heroId,
        name,
        slug,
        complexity: complexity ? parseInt(complexity) : null,
        group_id: groupId,
        last_updated_by: window.currentUser.id,
    };

    const { error } = await db
        .from("heroes")
        .upsert(charData)
        .select()
        .single();

    if (error) return alert("Error saving: " + error.message);

    window.editIndex = -1;
    if (typeof window.init === "function") await window.init();
}
window.saveHeroInline = saveHeroInline;

export async function deleteHero(heroId) {
    if (!confirm("Delete this hero? This action cannot be undone.")) return;

    const { error } = await db.from("heroes").delete().eq("id", heroId);
    if (error) return alert("Error deleting hero: " + error.message);

    if (typeof window.init === "function") await window.init();
}
window.deleteHero = deleteHero;

export async function saveGroup() {
    const name = document.getElementById("groupName").value.trim();
    const order_index = document.getElementById("groupOrder").value.trim();
    const year = document.getElementById("groupYear").value.trim();

    if (!name) return alert("Group name is required");

    const groupData = {
        name,
        order_index: order_index ? parseInt(order_index) : null,
        year: year ? parseInt(year) : null,
        is_active: true,
    };

    const { error } = await db
        .from("groups")
        .upsert(groupData)
        .select()
        .single();

    if (error) return alert("Error saving group: " + error.message);

    resetGroupForm();
    if (typeof window.init === "function") window.init();
}
window.saveGroup = saveGroup;

export function editGroup(groupId) {
    const group = window.groups.find((g) => g.id === groupId);
    if (!group) return;

    const listContainer = document.getElementById("groupsListContainer");
    if (listContainer) {
        listContainer.classList.add("group-edit-active");
        listContainer
            .querySelectorAll(".group-row")
            .forEach((row) => row.classList.remove("editing"));
    }

    const panel = document.getElementById(`groupEditPanel-${groupId}`);
    const activeRow = document.getElementById(`groupRow-${groupId}`);
    if (!panel || !activeRow) return;

    activeRow.classList.add("editing");
    document.getElementById(`groupName-${groupId}`).value = group.name;
    document.getElementById(`groupOrder-${groupId}`).value =
        group.order_index || "";
    document.getElementById(`groupYear-${groupId}`).value = group.year || "";
    panel.classList.remove("hidden");
}
window.editGroup = editGroup;

export function cancelGroupEdit(groupId) {
    const panel = document.getElementById(`groupEditPanel-${groupId}`);
    const activeRow = document.getElementById(`groupRow-${groupId}`);
    const listContainer = document.getElementById("groupsListContainer");

    if (panel) panel.classList.add("hidden");
    if (activeRow) activeRow.classList.remove("editing");
    if (listContainer) listContainer.classList.remove("group-edit-active");
}
window.cancelGroupEdit = cancelGroupEdit;

export async function saveGroupInline(groupId) {
    const name = document.getElementById(`groupName-${groupId}`).value.trim();
    const order_index = document
        .getElementById(`groupOrder-${groupId}`)
        .value.trim();
    const year = document.getElementById(`groupYear-${groupId}`).value.trim();

    if (!name) return alert("Group name is required");

    const { error } = await db
        .from("groups")
        .upsert({
            id: groupId,
            name,
            order_index: order_index ? parseInt(order_index) : null,
            year: year ? parseInt(year) : null,
            is_active: true,
        })
        .select()
        .single();

    if (error) return alert("Error saving group: " + error.message);

    if (typeof window.init === "function") window.init();
}
window.saveGroupInline = saveGroupInline;

export function resetGroupForm() {
    document.getElementById("groupName").value = "";
    document.getElementById("groupOrder").value = "";
    document.getElementById("groupYear").value = "";

    const form = document.getElementById("groupForm");
    const button = document.getElementById("addGroupBtn");
    if (form && button) {
        form.classList.add("hidden");
        button.innerText = "Add Group";
    }
}
window.resetGroupForm = resetGroupForm;

export function renderPlayersList() {
    const container = document.getElementById("playersListContainer");
    if (!container) return;

    container.innerHTML = "";

    window.players.forEach((player) => {
        const row = document.createElement("div");
        row.className = "player-admin-row";
        row.id = `playerRow-${player.id}`;

        const displayDiv = document.createElement("div");
        displayDiv.className = "player-display";
        displayDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="player-color-dot" style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: var(--${player.id}); border: 1px solid rgba(255,255,255,0.2);"></span>
                <strong>${window.escapeHtml(player.name)}</strong>
            </div>
            <div class="player-actions">
                <label class="color-picker-button" title="Choose player color">
                    <span>🎨</span>
                    <input type="color" id="playerColor-${player.id}" value="${window.escapeHtml(window.getPlayerColor(player))}" onchange="handlePlayerColorChange('${player.id}', this)">
                </label>
                <button type="button" class="btn-save btn-inline" onclick="editPlayer('${player.id}')">Edit</button>
            </div>
        `;

        const editPanel = document.createElement("div");
        editPanel.className = "player-edit-panel hidden";
        editPanel.id = `playerEditPanel-${player.id}`;
        editPanel.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="playerName-${player.id}" value="${player.name}" style="flex: 1;">
                <button type="button" class="btn-save" onclick="savePlayerInline('${player.id}')">Save</button>
                <button type="button" class="btn-cancel" onclick="cancelPlayerEdit('${player.id}')">Cancel</button>
            </div>
        `;

        row.appendChild(displayDiv);
        row.appendChild(editPanel);
        container.appendChild(row);
    });
}
window.renderPlayersList = renderPlayersList;

export function editPlayer(playerId) {
    const player = window.players.find((p) => p.id === playerId);
    if (!player) return;

    const listContainer = document.getElementById("playersListContainer");
    if (listContainer) {
        listContainer.classList.add("player-edit-active");
        listContainer
            .querySelectorAll(".player-admin-row")
            .forEach((row) => row.classList.remove("editing"));
    }

    const panel = document.getElementById(`playerEditPanel-${playerId}`);
    const activeRow = document.getElementById(`playerRow-${playerId}`);
    if (!panel || !activeRow) return;

    activeRow.classList.add("editing");
    document.getElementById(`playerName-${playerId}`).value = player.name;
    panel.classList.remove("hidden");
}
window.editPlayer = editPlayer;

export function cancelPlayerEdit(playerId) {
    const panel = document.getElementById(`playerEditPanel-${playerId}`);
    const activeRow = document.getElementById(`playerRow-${playerId}`);
    const listContainer = document.getElementById("playersListContainer");

    if (panel) panel.classList.add("hidden");
    if (activeRow) activeRow.classList.remove("editing");
    if (listContainer) listContainer.classList.remove("player-edit-active");
}
window.cancelPlayerEdit = cancelPlayerEdit;

export async function savePlayerInline(playerId) {
    const name = document.getElementById(`playerName-${playerId}`).value.trim();

    if (!name) return alert("Player name is required");

    const { error } = await db
        .from("players")
        .update({ name })
        .eq("id", playerId)
        .select()
        .single();

    if (error) return alert("Error saving player: " + error.message);

    const playerIndex = window.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
        window.players[playerIndex].name = name;
        window.NAMES[playerIndex] = name;
    }

    cancelPlayerEdit(playerId);
    renderPlayersList();
}
window.savePlayerInline = savePlayerInline;

export function renderUsersList() {
    const container = document.getElementById("usersListContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!window.authUsers.length) {
        container.innerHTML =
            '<p style="opacity: 0.7; font-style: italic;">No auth users available or permission denied.</p>';
        return;
    }

    window.authUsers.forEach((user) => {
        const linkedPlayer = window.players.find((p) => p.user_id === user.id);
        const row = document.createElement("div");
        row.className = "group-row user-admin-row";
        row.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; gap: 10px;">
                <div style="min-width: 0;">
                    <div><strong>${window.escapeHtml(user.email || "No email")}</strong></div>
                    <div style="opacity: 0.7; font-size: 0.85rem; word-break: break-all;">ID: ${window.escapeHtml(user.id)}</div>
                </div>
                <div style="text-align: right; min-width: 130px;">
                    ${linkedPlayer ? `<div style="opacity: 0.7; font-size: 0.85rem;">Linked Player</div><div><strong>${window.escapeHtml(linkedPlayer.name)}</strong></div>` : '<div style="opacity: 0.7; font-size: 0.85rem;">No linked player</div>'}
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}
window.renderUsersList = renderUsersList;

export async function renderCollectionsList() {
    const container = document.getElementById("collectionsListContainer");
    if (!container) return;

    container.innerHTML =
        '<p style="opacity: 0.7; font-style: italic; padding: 10px;">Loading collections...</p>';

    let allUserHeroes = [];
    try {
        const { data, error } = await db.from("user_heroes").select("*");

        if (error) {
            container.innerHTML = `<p style="color: var(--danger); padding: 10px;">Error loading collections: ${window.escapeHtml(error.message)}</p>`;
            return;
        }
        allUserHeroes = data || [];
    } catch (e) {
        container.innerHTML = `<p style="color: var(--danger); padding: 10px;">Error connecting to database: ${window.escapeHtml(e.message)}</p>`;
        return;
    }

    const userProfiles = [];

    window.players.forEach((p) => {
        if (p.user_id) {
            userProfiles.push({
                user_id: p.user_id,
                name: p.name,
                isLinked: true,
            });
        }
    });

    allUserHeroes.forEach((row) => {
        if (!userProfiles.some((up) => up.user_id === row.user_id)) {
            userProfiles.push({
                user_id: row.user_id,
                name: `User (${row.user_id.substring(0, 8)})`,
                isLinked: false,
            });
        }
    });

    if (
        window.currentUser &&
        !userProfiles.some((up) => up.user_id === window.currentUser.id)
    ) {
        const linkedPlayer = window.players.find((p) => p.user_id === window.currentUser.id);
        const name = linkedPlayer
            ? linkedPlayer.name
            : window.currentUser.email
              ? window.currentUser.email.split("@")[0]
              : "Admin";
        userProfiles.push({
            user_id: window.currentUser.id,
            name: name,
            isLinked: !!linkedPlayer,
        });
    }

    if (userProfiles.length === 0) {
        container.innerHTML =
            '<p style="opacity: 0.7; font-style: italic; padding: 10px;">No user profiles available.</p>';
        return;
    }

    const ownershipMap = {};
    allUserHeroes.forEach((row) => {
        ownershipMap[`${row.user_id}_${row.hero_id}`] = row.is_owned;
    });

    const tableWrapper = document.createElement("div");
    tableWrapper.style.overflowX = "auto";
    tableWrapper.style.marginTop = "10px";

    const headersHtml = userProfiles
        .map(
            (up) =>
                `<th style="padding: 10px; font-weight: 600; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">${window.escapeHtml(up.name)}</th>`,
        )
        .join("");

    const rowsHtml = window.characters
        .map((hero) => {
            const cellsHtml = userProfiles
                .map((up) => {
                    const key = `${up.user_id}_${hero.id}`;
                    const isOwned = ownershipMap[key] !== false;
                    return `
                        <td style="padding: 8px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <input 
                                type="checkbox" 
                                id="admin-owned-${up.user_id}-${hero.id}"
                                ${isOwned ? "checked" : ""} 
                                onchange="toggleUserHeroOwned('${up.user_id}', '${hero.id}', this.checked)"
                                style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--accent);"
                            >
                        </td>
                    `;
                })
                .join("");

            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 500; font-size: 0.9rem;">
                        ${window.escapeHtml(hero.name)}
                    </td>
                    ${cellsHtml}
                </tr>
            `;
        })
        .join("");

    tableWrapper.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr>
                    <th style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">Hero</th>
                    ${headersHtml}
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;

    container.innerHTML = "";
    container.appendChild(tableWrapper);
}
window.renderCollectionsList = renderCollectionsList;

export async function toggleUserHeroOwned(userId, heroId, isOwned) {
    if (userId === window.currentUser?.id) {
        const hero = window.characters.find((h) => h.id === heroId);
        if (hero) hero.is_owned = isOwned;
        renderCollectionView();
        if (typeof window.renderList === "function") window.renderList();
        if (typeof window.updateDropdownSort === "function") window.updateDropdownSort();
    }

    const { error } = await db.from("user_heroes").upsert({
        user_id: userId,
        hero_id: heroId,
        is_owned: isOwned,
    });

    if (error) {
        alert("Error updating user collection: " + error.message);
        if (userId === window.currentUser?.id) {
            const hero = window.characters.find((h) => h.id === heroId);
            if (hero) hero.is_owned = !isOwned;
            renderCollectionView();
            if (typeof window.renderList === "function") window.renderList();
            if (typeof window.updateDropdownSort === "function") window.updateDropdownSort();
        }
        renderCollectionsList();
    }
}
window.toggleUserHeroOwned = toggleUserHeroOwned;

export function toggleGroupForm() {
    const form = document.getElementById("groupForm");
    const button = document.getElementById("addGroupBtn");
    if (!form || !button) return;

    const isHidden = form.classList.toggle("hidden");
    button.innerText = isHidden ? "Add Group" : "Hide Group Form";

    if (!isHidden) {
        document.getElementById("groupName")?.focus();
    }
}
window.toggleGroupForm = toggleGroupForm;

export async function deleteGroup(groupId) {
    if (!confirm("Delete this group?")) return;

    const { error } = await db.from("groups").delete().eq("id", groupId);

    if (error) return alert("Error deleting group: " + error.message);

    resetGroupForm();
    if (typeof window.init === "function") window.init();
}
window.deleteGroup = deleteGroup;

export function renderGamesList() {
    const container = document.getElementById("gamesContainer");
    const countLabel = document.getElementById("game-count-stats");
    if (!container || !window.games) return;

    const showWinsOnly = window.gamesWinnerOnly;
    const searchTerm = (document.getElementById("games-search")?.value || "")
        .toLowerCase()
        .trim();

    const totalVisibleGames = window.games.filter((g) => !g.is_historical).length;

    window.games.forEach((game) => {
        const winners = game.game_players.filter((p) => p.is_winner === true);
        const explicitLosers = game.game_players.filter(
            (p) => p.is_winner === false,
        );
        const isDraw =
            winners.length === 0 &&
            explicitLosers.length > 0 &&
            explicitLosers.length === game.game_players.length;
        const isInProgress = winners.length === 0 && !isDraw;
        if (isInProgress) {
            window.expandedGameIds.add(game.id);
        }
    });

    const filteredGames = window.games.filter((game) => {
        if (game.is_historical) return false;

        let playerMatches = true;
        if (window.selectedGamePlayerIndex !== null) {
            playerMatches = game.game_players.some((gp) => {
                const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                let match = false;

                if (
                    window.selectedGamePlayerIndex >= 0 &&
                    window.selectedGamePlayerIndex <= 3
                ) {
                    match = pIdx === window.selectedGamePlayerIndex;
                } else if (window.selectedGamePlayerIndex === 4) {
                    match = pIdx === 4 || pIdx === 5;
                }

                if (match && showWinsOnly) return gp.is_winner === true;
                return match;
            });
        }
        if (!playerMatches) return false;

        if (searchTerm) {
            const heroes = (game.game_players || [])
                .map((gp) => gp.heroes?.name || "")
                .join(" ");
            const hay = heroes.toLowerCase();
            if (!hay.includes(searchTerm)) return false;
        }

        return true;
    });

    if (countLabel) {
        countLabel.innerText = `Showing ${filteredGames.length} of ${totalVisibleGames} games`;
    }

    container.innerHTML = filteredGames
        .map((game) => {
            let rawDate = game.played_at || "";
            if (rawDate && !rawDate.includes("T"))
                rawDate = rawDate.replace(" ", "T");
            if (rawDate && !rawDate.includes("Z") && !rawDate.includes("+"))
                rawDate += "Z";

            const dateStr = new Date(rawDate).toLocaleString("en-CA", {
                timeZone: "America/Montreal",
                dateStyle: "medium",
                timeStyle: "short",
            });

            const winners = game.game_players.filter(
                (p) => p.is_winner === true,
            );
            const explicitLosers = game.game_players.filter(
                (p) => p.is_winner === false,
            );
            const isDraw =
                winners.length === 0 &&
                explicitLosers.length > 0 &&
                explicitLosers.length === game.game_players.length;

            const isInProgress = winners.length === 0 && !isDraw;
            const isExpanded = window.expandedGameIds.has(game.id);
            const expandedClass = isExpanded ? "expanded" : "";

            let bgImgHtml = "";
            if (winners.length > 0 && winners[0].heroes?.slug) {
                bgImgHtml = `<img src="${window.getImgUrl(winners[0].heroes.slug)}" class="game-card-bg-img" alt="">`;
            }

            const playerNamesMap = {};
            game.game_players.forEach((gp) => {
                const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                let rawName = window.NAMES[pIdx] || "Unknown";
                if (
                    rawName.toLowerCase().startsWith("player ") &&
                    rawName.length > 7
                ) {
                    rawName = "P" + rawName.substring(7);
                }
                playerNamesMap[gp.player_id] = rawName;
            });

            const firstLetters = Object.values(playerNamesMap).map((name) =>
                name.charAt(0).toUpperCase(),
            );

            const playerLabelsMap = {};
            game.game_players.forEach((gp) => {
                const name = playerNamesMap[gp.player_id];
                const firstChar = name.charAt(0).toUpperCase();
                const count = firstLetters.filter(
                    (l) => l === firstChar,
                ).length;
                let label = firstChar;
                if (count > 1 && name.length > 1) {
                    label = firstChar + name.charAt(1).toLowerCase();
                }
                playerLabelsMap[gp.player_id] = label;
            });

            const sortedPlayersForSummary = [...game.game_players].sort(
                (a, b) => {
                    if (a.is_winner && !b.is_winner) return -1;
                    if (!a.is_winner && b.is_winner) return 1;
                    return 0;
                },
            );

            const portraitStrip = sortedPlayersForSummary
                .map((gp) => {
                    const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                    const heroSlug = gp.heroes?.slug || "";
                    const heroName = gp.heroes?.name || "Unknown";
                    const isHeroWinner = gp.is_winner === true;
                    const winnerClass = isHeroWinner ? "winner-highlight" : "";
                    const trophyHtml = isHeroWinner
                        ? '<span class="mini-winner-trophy">🏆</span>'
                        : "";
                    const playerLabel = playerLabelsMap[gp.player_id];
                    return `
                        <a href="${window.getHeroLink(heroSlug)}" target="_blank" class="mini-portrait-wrapper ${winnerClass}" title="${heroName}" onclick="event.stopPropagation()">
                            ${trophyHtml}
                            <img src="${window.getImgUrl(heroSlug)}" class="mini-portrait-img" alt="${heroName}">
                            <div class="mini-portrait-pill" style="background-color: var(--p${pIdx + 1});">${playerLabel}</div>
                        </a>
                    `;
                })
                .join("");

            const statusLabel = isInProgress
                ? '<span class="game-card-status-badge">In Progress</span>'
                : "";
            const drawStampHtml = isDraw
                ? '<div class="player-plate-draw-badge">DRAW</div>'
                : "";
            const headerHtml = `
            <div class="game-card-header" onclick="toggleGameExpansion('${game.id}')">
                <div class="game-card-title-group">
                    <span class="game-card-date">${dateStr}</span>
                    ${statusLabel}
                </div>
                <div class="game-card-collapsed-summary">
                    <div class="mini-portrait-strip">
                        ${portraitStrip}
                        ${drawStampHtml}
                    </div>
                    <span class="chevron-icon">▼</span>
                </div>
            </div>`;

            const canManage =
                window.isAdmin() || game.last_updated_by === window.currentUser?.id;
            const gameActions = canManage
                ? `
                <div class="game-card-actions">
                    <button class="btn-game-action" onclick="selectWinner('${game.id}')" title="Select Winner">🏆</button>
                    <!-- <button class="btn-game-action delete" onclick="deleteGame('${game.id}')" title="Delete Game">🗑️</button> -->
                </div>
            `
                : "";

            const platesArray = game.game_players.map((gp) => {
                const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                const heroName = gp.heroes?.name || "Unknown";
                const heroSlug = gp.heroes?.slug || "";
                const isSearchMatch = Boolean(
                    searchTerm && heroName.toLowerCase().includes(searchTerm),
                );

                let isPlayerFilterMatch = false;
                if (window.selectedGamePlayerIndex !== null) {
                    if (
                        window.selectedGamePlayerIndex >= 0 &&
                        window.selectedGamePlayerIndex <= 3
                    ) {
                        isPlayerFilterMatch = pIdx === window.selectedGamePlayerIndex;
                    } else if (window.selectedGamePlayerIndex === 4) {
                        isPlayerFilterMatch = pIdx === 4 || pIdx === 5;
                    }
                }

                let plateClass = "draw";
                if (winners.length > 0) {
                    plateClass = gp.is_winner ? "winner" : "loser";
                } else if (isDraw) {
                    plateClass = "draw";
                } else if (isInProgress) {
                    plateClass = "in-progress";
                } else {
                    plateClass = gp.is_winner === false ? "loser" : "draw";
                }

                let borderStyle = "";
                if (isSearchMatch || isPlayerFilterMatch) {
                    borderStyle =
                        "box-shadow: 0 0 8px var(--accent), 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);";
                }

                const trophyHtml = gp.is_winner
                    ? '<div class="player-plate-trophy">🏆</div>'
                    : "";
                const drawBadgeHtml = isDraw
                    ? '<div class="player-plate-draw-badge">DRAW</div>'
                    : "";

                let statsHtml = "";
                if (gp.is_winner) {
                    let heroPlayCount = 0;
                    let heroWinCount = 0;
                    const useHistorical = window.gamesUseHistorical;
                    window.games.forEach((g) => {
                        if (!useHistorical && g.is_historical) return;
                        g.game_players.forEach((otherGp) => {
                            if (
                                otherGp.player_id === gp.player_id &&
                                otherGp.hero_id === gp.hero_id
                            ) {
                                heroPlayCount++;
                                if (otherGp.is_winner) {
                                    heroWinCount++;
                                }
                            }
                        });
                    });
                    const pct =
                        heroPlayCount > 0
                            ? (heroWinCount / heroPlayCount).toFixed(3)
                            : ".000";
                    const pctStr = pct.startsWith("0") ? pct.substring(1) : pct;
                    statsHtml = `
                            <div class="player-plate-winner-stats">${heroWinCount}🏆 / ${heroPlayCount}🎲</div>
                            <div class="player-plate-winner-pct">( ${pctStr})</div>
                        `;
                }

                return `
                    <a href="${window.getHeroLink(heroSlug)}" target="_blank" class="player-plate ${plateClass}" style="${borderStyle}">
                        <img src="${window.getImgUrl(heroSlug)}" class="player-plate-bg-art" alt="${heroName}">
                        <div class="player-plate-overlay"></div>
                        ${trophyHtml}
                        ${drawBadgeHtml}
                        <div class="player-plate-tag" style="background-color: var(--p${pIdx + 1});">${window.NAMES[pIdx]}</div>
                        <div class="player-plate-info">
                            <div class="player-plate-hero-name">${heroName}</div>
                            ${statsHtml}
                        </div>
                    </a>`;
            });

            const playerPlatesHtml = platesArray.join("");

            return `
            <div class="game-history-card ${expandedClass}">
                ${bgImgHtml}
                ${headerHtml}
                <div class="game-card-body">
                    <div class="player-responsive-grid">
                        ${playerPlatesHtml}
                    </div>
                    ${gameActions}
                </div>
            </div>`;
        })
        .join("");

    if (window.games.length === 0) {
        container.innerHTML =
            '<p style="text-align:center; opacity:0.6;">No games recorded yet.</p>';
    }
}
window.renderGamesList = renderGamesList;

export function toggleGameExpansion(gameId) {
    if (window.expandedGameIds.has(gameId)) {
        window.expandedGameIds.delete(gameId);
    } else {
        window.expandedGameIds.add(gameId);
    }
    renderGamesList();
}
window.toggleGameExpansion = toggleGameExpansion;

export async function selectWinner(gameId) {
    const game = window.games.find((g) => g.id == gameId);
    if (!game) return;

    const container = document.getElementById("winner-selection-container");
    const confirmBtn = document.getElementById("confirm-winner-btn");

    const winners = game.game_players.filter((p) => p.is_winner === true);
    const explicitLosers = game.game_players.filter(
        (p) => p.is_winner === false,
    );
    const isDraw =
        winners.length === 0 &&
        explicitLosers.length > 0 &&
        explicitLosers.length === game.game_players.length;

    const isTwoRows =
        game.game_players.length === 4 || game.game_players.length === 2;
    const gridClass = isTwoRows
        ? "winner-select-grid two-rows"
        : "winner-select-grid";
    let optionsHtml = `<div class="${gridClass}">`;

    optionsHtml += game.game_players
        .map((gp) => {
            const pIdx = parseInt(gp.player_id.substring(1)) - 1;
            const heroName = gp.heroes?.name || "Unknown";
            const heroSlug = gp.heroes?.slug || "";
            const isSelected = gp.is_winner === true;
            const isChecked = isSelected ? "checked" : "";
            const selectedClass = isSelected ? "selected" : "";
            return `
            <div class="winner-card ${selectedClass}" onclick="handleWinnerSelect('${gp.player_id}')">
                <input type="radio" name="winner-choice" value="${gp.player_id}" ${isChecked} style="display: none;">
                <img src="${window.getImgUrl(heroSlug)}" class="winner-card-img" alt="${heroName}">
                <div class="winner-card-player-name">${window.NAMES[pIdx]}</div>
                <div class="winner-card-hero-name">${heroName}</div>
            </div>
        `;
        })
        .join("");

    const isDrawChecked = isDraw ? "checked" : "";
    const drawSelectedClass = isDraw ? "selected" : "";
    optionsHtml += `
            <div class="winner-draw-card ${drawSelectedClass}" onclick="handleWinnerSelect('draw')">
                <input type="radio" name="winner-choice" value="draw" ${isDrawChecked} style="display: none;">
                <span style="font-size: 1.5rem; line-height: 1;">🤝</span>
                <div style="text-align: left;">
                    <div class="winner-card-player-name" style="font-size: 0.9rem;">Select a Draw</div>
                    <div class="winner-card-hero-name" style="font-size: 0.7rem; opacity: 0.7;">No winner for this match</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = optionsHtml;
    confirmBtn.onclick = () => submitWinner(gameId);

    document.getElementById("winner-modal").style.display = "flex";
    document.body.style.overflow = "hidden";
}
window.selectWinner = selectWinner;

export function handleWinnerSelect(value) {
    const cards = document.querySelectorAll(".winner-card, .winner-draw-card");
    cards.forEach((card) => {
        const radio = card.querySelector('input[name="winner-choice"]');
        if (radio) {
            if (radio.value === value) {
                radio.checked = true;
                card.classList.add("selected");
            } else {
                card.classList.remove("selected");
            }
        }
    });
}
window.handleWinnerSelect = handleWinnerSelect;

export function closeWinnerModal() {
    document.getElementById("winner-modal").style.display = "none";
    document.body.style.overflow = "auto";
}
window.closeWinnerModal = closeWinnerModal;

export async function submitWinner(gameId) {
    const selectedRadio = document.querySelector(
        'input[name="winner-choice"]:checked',
    );
    if (!selectedRadio) return alert("Please select a winner.");

    const winnerPlayerId = selectedRadio.value;
    const btn = document.getElementById("confirm-winner-btn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    try {
        if (winnerPlayerId === "draw") {
            const { error } = await db
                .from("game_players")
                .update({ is_winner: false, last_updated_by: window.currentUser.id })
                .eq("game_id", gameId);
            if (error) throw error;
        } else {
            const { error: winErr } = await db
                .from("game_players")
                .update({ is_winner: true, last_updated_by: window.currentUser.id })
                .eq("game_id", gameId)
                .eq("player_id", winnerPlayerId);
            if (winErr) throw winErr;

            const { error: loseErr } = await db
                .from("game_players")
                .update({ is_winner: false, last_updated_by: window.currentUser.id })
                .eq("game_id", gameId)
                .neq("player_id", winnerPlayerId);
            if (loseErr) throw loseErr;
        }

        closeWinnerModal();
        if (typeof window.init === "function") await window.init();
    } catch (err) {
        alert("Error updating winner: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Save Result";
    }
}
window.submitWinner = submitWinner;

export async function deleteGame(gameId) {
    if (
        !confirm(
            "Are you sure you want to delete this game record? This cannot be undone.",
        )
    )
        return;

    const { error } = await db.from("games").delete().eq("id", gameId);

    if (error) {
        console.error("Error deleting game:", error);
        return alert("Failed to delete game: " + error.message);
    }

    if (typeof window.init === "function") await window.init();
}
window.deleteGame = deleteGame;

export function updateHeroStatsFromHistory() {
    let showNormal = true;
    let showHistorical = true;
    
    const hasNormalOnly = window.activeFilterDataHistories.has("Normal only");
    const hasHistoricalOnly = window.activeFilterDataHistories.has("Historical only");
    
    if (hasNormalOnly && !hasHistoricalOnly) {
        showNormal = true;
        showHistorical = false;
    } else if (hasHistoricalOnly && !hasNormalOnly) {
        showNormal = false;
        showHistorical = true;
    }

    window.characters.forEach((char) => {
        char.playCount = [0, 0, 0, 0];
        char.lastPlayed = ["Never", "Never", "Never", "Never"];
        char.winCount = [0, 0, 0, 0];
    });

    if (!window.games) return;

    window.games.forEach((game) => {
        const isGameHistorical = !!game.is_historical;
        if (isGameHistorical && !showHistorical) return;
        if (!isGameHistorical && !showNormal) return;

        game.game_players.forEach((gp) => {
            const pIdx = parseInt(gp.player_id?.substring(1) || "0", 10) - 1;
            if (pIdx >= 0 && pIdx < 4) {
                const char = window.characters.find((c) => c.id === gp.hero_id);
                if (!char) return;

                char.playCount[pIdx]++;
                if (gp.is_winner) {
                    char.winCount[pIdx]++;
                }
                if (char.lastPlayed[pIdx] === "Never") {
                    let d = game.played_at || "";
                    if (d && !d.includes("T")) d = d.replace(" ", "T");
                    if (d && !d.includes("Z") && !d.includes("+")) d += "Z";
                    const dateObj = new Date(d);
                    char.lastPlayed[pIdx] =
                        dateObj.getFullYear() < 2026
                            ? "Unknown"
                            : dateObj.toLocaleDateString("en-CA");
                }
            }
        });
    });
}
window.updateHeroStatsFromHistory = updateHeroStatsFromHistory;
