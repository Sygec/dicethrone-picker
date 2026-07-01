(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=window.location.hostname===`sygec.github.io`||window.location.hostname===`dicethrone-prod.sygec.workers.dev`,t=`https://ojqkkixtvdtccuixishh.supabase.co`,n=`sb_publishable_AT9BZrEkq1IDrZmP1Y_pDQ_Qwnh57ZH`,r=`https://wmxrzjmadvivvpzbslgj.supabase.co`,i=`sb_publishable_Hohs2ojpVd5nmRJoi0upNg_PJv8M7x6`,a=e?t:r,o=e?n:i,s=supabase.createClient(a,o);async function c({email:e,password:t}){return s.auth.signInWithPassword({email:e,password:t})}async function l(e){return s.auth.resetPasswordForEmail(e,{redirectTo:window.location.origin})}async function u({password:e}){return s.auth.updateUser({password:e})}async function d(){return s.auth.signOut()}async function f(){return s.auth.getSession()}function p(e){return s.auth.onAuthStateChange(e)}async function m(){return s.from(`groups`).select(`*`).eq(`is_active`,!0).order(`order_index`,{ascending:!0})}async function h(){return s.from(`players`).select(`*`).order(`id`,{ascending:!0})}async function g(){return s.from(`heroes`).select(`
            *,
            groups (name),
            player_hero_stats (*),
            user_heroes (*)
        `).order(`name`,{ascending:!0})}async function _(){return s.from(`games`).select(`
            id,
            played_at,
            last_updated_by,
            is_historical,
            game_players (
                hero_id,
                player_id,
                is_winner,
                heroes (
                    name,
                    slug,
                    complexity
                )
            )
        `).order(`played_at`,{ascending:!1}).order(`player_id`,{foreignTable:`game_players`,ascending:!0})}async function v(){return s.from(`user_heroes`).select(`*`)}async function ee(e,t){return s.from(`players`).update({player_color:t}).eq(`id`,e).select().single()}async function te(e,t){return s.from(`players`).update({name:t}).eq(`id`,e).select().single()}async function y(e,t,n){return s.from(`user_heroes`).upsert({user_id:e,hero_id:t,is_owned:n})}async function ne(e){return s.from(`user_heroes`).upsert(e)}async function re(e){return s.from(`heroes`).insert(e).select().single()}async function ie(e){return s.from(`heroes`).upsert(e).select().single()}async function b(e){return s.from(`heroes`).delete().eq(`id`,e)}async function x(e){return s.from(`groups`).upsert(e).select().single()}async function ae(e){return s.from(`groups`).delete().eq(`id`,e)}async function oe(e){return s.from(`games`).insert({last_updated_by:e}).select().single()}async function S(e){return s.from(`game_players`).insert(e)}async function se(e){return s.from(`player_hero_stats`).upsert(e)}async function ce(e,t,n){if(t===`draw`)return s.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e);{let r=await s.from(`game_players`).update({is_winner:!0,last_updated_by:n}).eq(`game_id`,e).eq(`player_id`,t);return r.error?r:s.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e).neq(`player_id`,t)}}async function le(e){return s.from(`games`).delete().eq(`id`,e)}function ue(e){return s.channel(`schema-db-changes`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`user_heroes`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`player_hero_stats`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`heroes`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`games`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`game_players`},e).subscribe()}var C={NAMES:[],characters:[],games:[],players:[],groups:[],authUsers:[],cachedChangelog:null,activeLevels:new Set([1,2,3,4,5,6]),activeGroups:new Set,selectedGamePlayerIndex:null,expandedGameIds:new Set,currentSort:`name`,sortAsc:!0,currentSortPlayerIndex:0,editIndex:-1,activePlayerIndices:[0,1,2,3],currentDrawerMode:`sort-filter`,stagedSort:``,stagedSortAsc:!0,stagedSortPlayerIndex:0,stagedLevels:new Set,stagedGroups:new Set,stagedPlayerIndices:[],stagedUseHistorical:!0,dbUseHistorical:!0,activeFilterDataHistories:new Set,activeFilterPlayers:new Set,activeFilterComplexities:new Set,activeFilterGroups:new Set,stagedFilterDataHistories:new Set,stagedFilterPlayers:new Set,stagedFilterComplexities:new Set,stagedFilterGroups:new Set,activeOwnershipFilter:`owned`,stagedOwnershipFilter:`owned`,gamesWinnerOnly:!1,gamesUseHistorical:!0,stagedSelectedGamePlayerIndex:null,stagedGamesWinnerOnly:!1,stagedGamesUseHistorical:!0,currentUser:null,loggedInPlayerIndex:-1,isRollActive:!1,expandedCollectionGroups:new Set,scrambleIntervals:{},activeSelectPlayerIdx:null,modalSortMode:`name`,draftModeEnabled:!1,draftCount:3,bannedHeroIds:new Set,stagedDraftModeEnabled:!1,stagedDraftCount:3,stagedBannedHeroIds:new Set,stagedBanSearchQuery:``,stagedRollSettingsTab:`draft`,activeDraftOrder:[],activeDraftStep:0,selectedDraftHeroes:{},activeDraftCandidates:{},draftWheelAngles:{},draftWheelFrontCardIndices:{},gamesHistoryStyle:`gorgeous`},de=new Set;function fe(e){return de.add(e),()=>{de.delete(e)}}function pe(e,t){de.forEach(n=>{try{n(e,t,C)}catch(e){console.error(`Error in stateStore listener:`,e)}})}function w(e){return C[e]}function T(e,t){C[e]=t,pe(e,t)}function E(e,t,n){let r=C[e];if(!(r instanceof Set)){console.warn(`stateStore: ${e} is not an instance of Set.`);return}t===`add`?r.add(n):t===`delete`?r.delete(n):t===`clear`?r.clear():t===`toggle`&&(r.has(n)?r.delete(n):r.add(n)),pe(e,r)}function me(e,t,n){let r=C[e];if(typeof r!=`object`||!r){console.warn(`stateStore: ${e} is not an object.`);return}n===void 0?delete r[t]:r[t]=n,pe(e,r)}function he(e,t=`info`){let n=document.getElementById(`toast-container`);n||(n=document.createElement(`div`),n.id=`toast-container`,document.body.appendChild(n));let r=document.createElement(`div`);r.className=`toast toast-${t}`,r.innerHTML=`
        <span class="toast-message"></span>
        <button class="toast-close" aria-label="Close">&times;</button>
    `,r.querySelector(`.toast-message`).textContent=e,n.appendChild(r),requestAnimationFrame(()=>{r.classList.add(`show`)});let i=()=>{r.parentNode&&(r.classList.remove(`show`),r.addEventListener(`transitionend`,()=>{r.parentNode&&r.parentNode.removeChild(r)}))},a=setTimeout(i,4e3);r.querySelector(`.toast-close`).addEventListener(`click`,()=>{clearTimeout(a),i()})}function D(e,t){return new Promise(n=>{let r=document.createElement(`div`);r.id=`confirm-modal-overlay`,r.innerHTML=`
            <div class="confirm-modal-content">
                <h3 class="confirm-modal-title"></h3>
                <p class="confirm-modal-message"></p>
                <div class="confirm-modal-actions">
                    <button class="confirm-btn confirm-btn-cancel" id="confirm-cancel-btn">Cancel</button>
                    <button class="confirm-btn confirm-btn-confirm" id="confirm-confirm-btn">Confirm</button>
                </div>
            </div>
        `,r.querySelector(`.confirm-modal-title`).textContent=e,r.querySelector(`.confirm-modal-message`).textContent=t,document.body.appendChild(r),requestAnimationFrame(()=>{r.classList.add(`show`)});let i=()=>{r.classList.remove(`show`),r.addEventListener(`transitionend`,()=>{r.parentNode&&r.parentNode.removeChild(r)})};r.querySelector(`#confirm-cancel-btn`).addEventListener(`click`,()=>{i(),n(!1)}),r.querySelector(`#confirm-confirm-btn`).addEventListener(`click`,()=>{i(),n(!0)}),r.addEventListener(`click`,e=>{e.target===r&&(i(),n(!1))})})}var ge=null,O=()=>(ge||={sortSection:document.getElementById(`sort-section`),sortToggleBtn:document.getElementById(`sort-panel-toggle`),filterSection:document.getElementById(`filter-section`),filterToggleBtn:document.getElementById(`filter-panel-toggle`),sortFilterDrawer:document.getElementById(`sort-filter-drawer`),drawerTitle:document.getElementById(`drawer-title-text`),drawerFooter:document.getElementById(`drawer-footer-content`),drawerBody:document.getElementById(`drawer-body-content`),leftFilterDrawer:document.getElementById(`filter-drawer-left`),leftPlayersContainer:document.getElementById(`filter-options-players`),leftGroupsContainer:document.getElementById(`filter-options-groups`),leftHeroCountLabel:document.getElementById(`filter-drawer-hero-count`),leftTitleDataHistory:document.getElementById(`title-data-history`),leftTitlePlayers:document.getElementById(`title-players`),leftTitleComplexity:document.getElementById(`title-complexity`),leftTitleGroups:document.getElementById(`title-groups`),filterActiveBadge:document.getElementById(`filter-active-badge`),gamesFilterActiveBadge:document.getElementById(`games-filter-active-badge`),sortTriggerBtn:document.getElementById(`btn-trigger-sort`),sortDropdownMenu:document.getElementById(`sort-dropdown-menu`),activeFiltersContainer:document.getElementById(`active-filters-container`),heroContainer:document.getElementById(`heroContainer`),countStatsLabel:document.getElementById(`count-stats`),heroSearchInput:document.getElementById(`hero-search`),dbShowOwnedCheckbox:document.getElementById(`db-show-owned`),dbShowNotOwnedCheckbox:document.getElementById(`db-show-not-owned`)},ge);function _e(){let e=O();e.sortFilterDrawer&&(e.drawerTitle&&(e.drawerTitle.innerText=`Filter History`),e.drawerFooter&&(e.drawerFooter.style.display=`flex`),Me(),e.sortFilterDrawer.classList.add(`open`),document.body.style.overflow=`hidden`)}function ve(){let e=w(`stagedOwnershipFilter`);Object.entries({owned:`pill-show-owned`,unowned:`pill-show-not-owned`,all:`pill-show-all`}).forEach(([t,n])=>{document.getElementById(n)?.classList.toggle(`active`,t===e)}),Te()}function ye(){Se(),ve(),k(),Ae();let e=O();e.leftFilterDrawer&&(e.leftFilterDrawer.classList.add(`open`),document.body.style.overflow=`hidden`)}function be(e=null,t=!1){if(e&&e.target!==e.currentTarget&&!t)return;let n=O();n.leftFilterDrawer&&(n.leftFilterDrawer.classList.remove(`open`),document.body.style.overflow=`auto`)}function xe(e=null,t=!1){if(e&&e.target!==e.currentTarget&&!t)return;let n=O();n.sortFilterDrawer&&(n.sortFilterDrawer.classList.remove(`open`),document.body.style.overflow=`auto`)}function Se(){let e=O(),t=w(`players`),n=w(`groups`),r=w(`stagedFilterPlayers`),i=w(`stagedFilterGroups`),a=w(`stagedFilterDataHistories`),o=w(`stagedFilterComplexities`);if(e.leftPlayersContainer&&t){let n=t.filter(e=>e.name&&!e.name.toLowerCase().includes(`invitee`)).slice().sort((e,t)=>e.name.localeCompare(t.name));e.leftPlayersContainer.innerHTML=n.map(e=>{let t=r.has(e.id)?`checked`:``;return`
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${e.id}" data-type="player" ${t} />
                    ${e.name}
                </label>
            `}).join(``)}if(e.leftGroupsContainer&&n){let t=n.slice().sort((e,t)=>(e.order_index??0)-(t.order_index??0));e.leftGroupsContainer.innerHTML=t.map(e=>{let t=i.has(e.id)?`checked`:``;return`
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${e.id}" data-type="group" ${t} />
                    ${e.name}
                </label>
            `}).join(``)}document.querySelectorAll(`#filter-drawer-left input[data-type="data-history"]`).forEach(e=>{e.checked=a.has(e.value)}),document.querySelectorAll(`#filter-drawer-left input[data-type="complexity"]`).forEach(e=>{e.checked=o.has(Number(e.value))})}function Ce(){let e=O();if(!e.filterActiveBadge)return;let t=w(`activeFilterDataHistories`),n=w(`activeFilterPlayers`),r=w(`activeFilterComplexities`),i=w(`activeFilterGroups`),a=w(`activeOwnershipFilter`),o=0;t&&(o+=t.size),n&&(o+=n.size),r&&(o+=r.size),i&&(o+=i.size),a&&a!==`all`&&o++,o>0?(e.filterActiveBadge.innerText=o,e.filterActiveBadge.style.display=`inline-block`):e.filterActiveBadge.style.display=`none`}function we(){let e=O();if(!e.gamesFilterActiveBadge)return;let t=w(`selectedGamePlayerIndex`),n=w(`gamesWinnerOnly`),r=w(`gamesUseHistorical`),i=0;t!==null&&i++,n&&i++,r||i++,i>0?(e.gamesFilterActiveBadge.innerText=i,e.gamesFilterActiveBadge.style.display=`inline-block`):e.gamesFilterActiveBadge.style.display=`none`}function Te(){document.querySelectorAll(`.ownership-segmented-control, .segmented-control`).forEach(e=>{let t=e.querySelector(`.segmented-pill.active`),n=e.querySelector(`.segmented-highlight`);n||(n=document.createElement(`div`),n.className=`segmented-highlight`,e.insertBefore(n,e.firstChild)),t&&(n.style.width=`${t.offsetWidth}px`,n.style.transform=`translateX(${t.offsetLeft}px)`,n.style.height=`${t.offsetHeight}px`)})}function Ee(){let e=O();if(!e.sortTriggerBtn)return;let t=w(`currentSort`),n=w(`sortAsc`),r=w(`currentSortPlayerIndex`),i=w(`NAMES`),a=`Hero (A-Z)`;if(t===`name`)a=n?`Hero (A-Z)`:`Hero (Z-A)`;else if(t===`complexity`)a=n?`Complexity (1-6)`:`Complexity (6-1)`;else if(t.startsWith(`w`)){let e=i[r]||`Player ${r+1}`;a=n?`${e} % (Low to High)`:`${e} % (High to Low)`}else if(t.startsWith(`d`)){let e=i[r]||`Player ${r+1}`;a=n?`${e} Played (Oldest)`:`${e} Played (Newest)`}else t===`group`&&(a=n?`Group (A-Z)`:`Group (Z-A)`);e.sortTriggerBtn.innerHTML=`<span class="action-icon">⇅</span> <strong style="font-weight: 700;">SORT:</strong> <span style="font-weight: 400; text-transform: none; margin-left: 2px;">${a}</span>`}function De(){let e=O();if(!e.sortDropdownMenu)return;let t=w(`currentSort`),n=w(`sortAsc`),r=w(`activePlayerIndices`),i=w(`NAMES`),a=`
        <div class="sort-dropdown-section-title">General</div>
        <button type="button" class="sort-dropdown-item ${t===`name`&&n?`active`:``}" data-action="select-sort" data-sort-key="name" data-sort-asc="true">
            Hero Name (A-Z)
        </button>
        <button type="button" class="sort-dropdown-item ${t===`name`&&!n?`active`:``}" data-action="select-sort" data-sort-key="name" data-sort-asc="false">
            Hero Name (Z-A)
        </button>
        <button type="button" class="sort-dropdown-item ${t===`complexity`&&n?`active`:``}" data-action="select-sort" data-sort-key="complexity" data-sort-asc="true">
            Complexity (1-6)
        </button>
        <button type="button" class="sort-dropdown-item ${t===`complexity`&&!n?`active`:``}" data-action="select-sort" data-sort-key="complexity" data-sort-asc="false">
            Complexity (6-1)
        </button>
    `;r&&r.length>0&&(a+=`<div class="sort-dropdown-divider"></div>`,r.forEach(e=>{let r=i[e]||`Player ${e+1}`;a+=`
                <div class="sort-dropdown-section-title" style="color: var(--p${e+1}, #fff);">${r}</div>
                <button type="button" class="sort-dropdown-item ${t===`w`+e&&!n?`active`:``}" data-action="select-sort" data-sort-key="w${e}" data-sort-asc="false">
                    Probability (High to Low)
                </button>
                <button type="button" class="sort-dropdown-item ${t===`w`+e&&n?`active`:``}" data-action="select-sort" data-sort-key="w${e}" data-sort-asc="true">
                    Probability (Low to High)
                </button>
                <button type="button" class="sort-dropdown-item ${t===`d`+e&&!n?`active`:``}" data-action="select-sort" data-sort-key="d${e}" data-sort-asc="false">
                    Last Played (Newest)
                </button>
                <button type="button" class="sort-dropdown-item ${t===`d`+e&&n?`active`:``}" data-action="select-sort" data-sort-key="d${e}" data-sort-asc="true">
                    Last Played (Oldest)
                </button>
            `})),e.sortDropdownMenu.innerHTML=a}function Oe(e){let t=O();t.sortDropdownMenu&&(e.stopPropagation(),t.sortDropdownMenu.classList.toggle(`show`)?(t.sortTriggerBtn&&t.sortTriggerBtn.classList.add(`active`),De()):t.sortTriggerBtn&&t.sortTriggerBtn.classList.remove(`active`))}function ke(){let e=O();e.sortDropdownMenu&&e.sortDropdownMenu.classList.remove(`show`),e.sortTriggerBtn&&e.sortTriggerBtn.classList.remove(`active`)}function k(){let e=O();if(!e.leftHeroCountLabel)return;let t=Pt();e.leftHeroCountLabel.innerText=`${t} heroes match`}function Ae(){let e=O(),t=w(`stagedFilterDataHistories`),n=w(`stagedFilterPlayers`),r=w(`stagedFilterComplexities`),i=w(`stagedFilterGroups`);if(e.leftTitleDataHistory){let n=t.size;e.leftTitleDataHistory.innerHTML=`Data Type ${n>0?`<span class="filter-count-bubble">${n}</span>`:``}`}if(e.leftTitlePlayers){let t=n.size;e.leftTitlePlayers.innerHTML=`Players ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}if(e.leftTitleComplexity){let t=r.size;e.leftTitleComplexity.innerHTML=`Complexity ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}if(e.leftTitleGroups){let t=i.size;e.leftTitleGroups.innerHTML=`Group / Season ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}}function je(e){let t=w(`players`),n=w(`games`);w(`NAMES`);let r=w(`stagedGamesUseHistorical`),i=w(`stagedSelectedGamePlayerIndex`),a=w(`stagedGamesWinnerOnly`),o=r,s=t.map(()=>({played:0,won:0})),c=0,l=0;n&&n.forEach(e=>{!o&&e.is_historical||e.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1;t>=0&&t<4?(s[t].played++,e.is_winner&&s[t].won++):(t===4||t===5)&&(c++,e.is_winner&&l++)})});let u=``;for(let e=0;e<4;e++){let n=t[e];n&&(u+=`
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1;">
                <button type="button" class="player-filter-btn ${i===e?`active`:``}" 
                        style="background-color: var(--p${e+1}); width: 100%; min-width: 60px; padding: 8px 4px; font-size: 0.8rem; font-weight: bold; border-radius: 6px;" 
                        data-action="toggle-staged-player-game-filter" data-player-idx="${e}">
                    ${n.name}
                </button>
                <div style="font-size: 0.75rem; opacity: 0.8; text-align: center; line-height: 1.2;">
                     P: ${s[e].played}<br>
                     W: ${s[e].won}
                </div>
            </div>
        `)}u+=`
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1;">
            <button type="button" class="player-filter-btn ${i===4?`active`:``}" 
                    style="background-color: var(--p5); width: 100%; min-width: 60px; padding: 8px 4px; font-size: 0.8rem; font-weight: bold; border-radius: 6px;" 
                    data-action="toggle-staged-player-game-filter" data-player-idx="4">
                Invitee
            </button>
            <div style="font-size: 0.75rem; opacity: 0.8; text-align: center; line-height: 1.2;">
                P: ${c}<br>
                W: ${l}
            </div>
        </div>
    `,e.innerHTML=`
        <div class="panel-row-new">
            <div class="dropdown-sort-options" style="margin: 0; justify-content: flex-start;">
                <label style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
                    <input
                        type="checkbox"
                        id="drawer-games-use-historical"
                        ${o?`checked`:``}
                        data-action="toggle-use-historical"
                        style="width: 18px; height: 18px;" />
                    Include Historical Data (before May 8th 2026)
                </label>
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 10px 0;">

        <div class="panel-row-new">
            <span class="panel-row-title" style="font-weight: 700; margin-bottom: 10px; display: block;">Filter by Player:</span>
            <div style="display: flex; justify-content: space-between; gap: 8px; width: 100%;">
                ${u}
            </div>
        </div>

        <div id="drawer-winner-filter-wrapper" class="panel-row-new ${i===null?`hidden`:``}" style="margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <input
                    type="checkbox"
                    id="drawer-games-winner-only"
                    ${a?`checked`:``}
                    data-action="toggle-staged-winner-only"
                    style="
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                        accent-color: var(--accent);
                    " />
                <label
                    for="drawer-games-winner-only"
                    style="cursor: pointer; user-select: none; font-size: 0.9rem;"
                    >Wins Only</label
                >
            </div>
        </div>
    `}function Me(){let e=O();if(!e.drawerBody)return;let t=w(`currentDrawerMode`),n=w(`stagedSort`);w(`stagedSortPlayerIndex`);let r=w(`stagedPlayerIndices`),i=w(`stagedUseHistorical`),a=w(`NAMES`);w(`activePlayerIndices`);let o=w(`stagedDraftModeEnabled`),s=w(`stagedDraftCount`),c=w(`stagedRollSettingsTab`),l=w(`stagedBanSearchQuery`);if(e.drawerBody.style.overflowY=`auto`,t===`sort-filter`){e.drawerBody.innerHTML=`
            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700;">Sort Visible Heroes:</span>
                <div class="sort-controls-new" style="margin-top: 10px;">
                    <select id="drawer-sort-type-select" class="sort-select-new" data-action="drawer-sort-type-change">
                        <option value="name">Hero Name</option>
                        <option value="group">Group (Season)</option>
                        <option value="probability">Roll Probability (%)</option>
                        <option value="lastPlayed">Last Played Date</option>
                    </select>
                    
                    <button type="button" id="drawer-sort-direction-btn" class="btn-direction-new" data-action="toggle-drawer-sort-direction">
                        <span id="drawer-sort-direction-text">Ascending</span>
                        <span id="drawer-sort-direction-arrow">▲</span>
                    </button>
                </div>
            </div>

            <div id="drawer-player-sort-sub-section" class="panel-row-new" style="display: none;">
                <span class="panel-row-title">For Player:</span>
                <div class="pill-group" id="drawer-player-sort-pills" style="margin-top: 10px;"></div>
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 10px 0;">

            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700;">Complexity Level:</span>
                <div class="filter-bar-track" id="drawer-complexity-filter-bar" style="margin-top: 10px; flex-wrap: wrap;"></div>
            </div>

            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700; margin-bottom: 8px; display: block;">Hero Group / Season:</span>
                <div class="group-filter-grid-container" id="drawer-group-filter-bar"></div>
            </div>
        `;let t=`name`;n===`group`?t=`group`:n.startsWith(`w`)?t=`probability`:n.startsWith(`d`)&&(t=`lastPlayed`);let r=document.getElementById(`drawer-sort-type-select`);r&&(r.value=t),Ne(),Pe(),Fe(),Re()}else if(t===`columns`){let t=a.slice(0,4).map((e,t)=>`
                <button type="button" class="pill-toggle ${r.includes(t)?`active p${t+1}-color`:`inactive`}" data-action="toggle-drawer-player-filter" data-player-idx="${t}">
                    ${e}
                </button>
            `).join(``);e.drawerBody.innerHTML=`
            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700; margin-bottom: 10px; display: block;">Show Player Stat Rows:</span>
                <div class="pill-group">
                    ${t}
                </div>
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 10px 0;">

            <div class="panel-row-new">
                <div class="dropdown-sort-options" style="margin: 0; justify-content: flex-start;">
                    <label style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                        <input
                            type="checkbox"
                            id="drawer-use-historical-data"
                            ${i?`checked`:``}
                            data-action="toggle-use-historical"
                            style="width: 18px; height: 18px;" />
                        Include Historical Data (before May 8th 2026)
                    </label>
                </div>
            </div>
        `}else if(t===`history-filter`)je(e.drawerBody);else if(t===`roll-settings`){e.drawerBody.style.overflowY=`hidden`;let t=o?`checked`:``,n=[2,3].map(e=>`
                    <button type="button" class="pill-toggle active-red ${s===e?`active`:``}" data-action="set-staged-draft-count" data-count="${e}">
                        ${e} Candidates
                    </button>
                `).join(``);e.drawerBody.innerHTML=`
            <div class="drawer-tabs-container" style="flex-shrink: 0;">
                <div class="drawer-tabs">
                    <button type="button" class="drawer-tab-btn ${c===`draft`?`active`:``}" data-action="switch-roll-settings-tab" data-tab="draft">Draft Mode</button>
                    <button type="button" class="drawer-tab-btn ${c===`ban`?`active`:``}" data-action="switch-roll-settings-tab" data-tab="ban">Ban List</button>
                    <div class="drawer-tab-underline" style="left: ${c===`draft`?`0%`:`50%`};"></div>
                </div>
            </div>

            <div id="roll-settings-draft-tab" style="display: ${c===`draft`?`block`:`none`};">
                <div class="panel-row-new">
                    <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                        <label class="toggle-switch">
                            <input type="checkbox" id="drawer-draft-mode-checkbox" data-action="toggle-staged-draft-mode" ${t}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span style="font-size: 0.9em; opacity: 0.8;">Enable Turn-Based Drafting</span>
                    </div>
                </div>

                <div id="drawer-draft-count-section" class="panel-row-new" style="display: ${o?`block`:`none`};">
                    <span class="panel-row-title" style="font-weight: 700;">Draft Candidates Count:</span>
                    <div class="pill-group" style="margin-top: 10px;">
                        ${n}
                    </div>
                </div>
            </div>

            <div id="roll-settings-ban-tab" style="display: ${c===`ban`?`flex`:`none`}; flex-direction: column; flex: 1; min-height: 0; font-size: 1rem;">
                <div class="panel-row-new" style="display: flex; flex-direction: column; flex: 1; min-height: 0; margin-top: 8px;">
                    <input type="text" id="ban-search-input" class="ban-search-input" placeholder="Search heroes to ban..." data-action="ban-search-input" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #fff; margin-bottom: 15px; flex-shrink: 0;" value="${l||``}">
                    <div id="drawer-ban-list-container" class="ban-list-container" style="flex: 1; min-height: 0; overflow-y: auto; padding-right: 4px; max-height: 350px;">
                    </div>
                </div>
            </div>
        `,Ze()}}function Ne(){let e=document.getElementById(`drawer-sort-direction-text`),t=document.getElementById(`drawer-sort-direction-arrow`),n=w(`stagedSortAsc`);e&&t&&(e.innerText=n?`Ascending`:`Descending`,t.innerText=n?`▲`:`▼`)}function Pe(){let e=document.getElementById(`drawer-player-sort-sub-section`),t=document.getElementById(`drawer-player-sort-pills`);if(!e||!t)return;let n=w(`stagedSort`),r=w(`stagedSortPlayerIndex`),i=w(`activePlayerIndices`),a=w(`NAMES`),o=n.startsWith(`w`)||n.startsWith(`d`);e.style.display=o?`block`:`none`,o&&(t.innerHTML=a.slice(0,4).map((e,t)=>`
                <button type="button" class="pill-toggle ${r===t?`active p${t+1}-color`:``}" style="${i.includes(t)?``:`opacity: 0.5;`}" data-action="drawer-sort-player-change" data-player-idx="${t}">
                    ${e}
                </button>
            `).join(``))}function Fe(){let e=document.getElementById(`drawer-complexity-filter-bar`);if(!e)return;let t=document.getElementById(`hero-search`),n=t?t.value.toLowerCase():``,r=document.getElementById(`db-show-owned`)?.checked??!0,i=document.getElementById(`db-show-not-owned`)?.checked??!1,a=w(`stagedGroups`),o=w(`stagedLevels`),s=w(`characters`),c=(e,t)=>t?e.name.toLowerCase().includes(t)||e.group&&e.group.toLowerCase().includes(t):!0,l=``;for(let e=1;e<=6;e++){let t=s.filter(t=>{if(Number(t.complexity)!==e)return!1;let o=a.has(t.group_id),s=J(t)&&r||!J(t)&&i;return c(t,n)&&o&&s}).length,u=t===0,d=o.has(e)&&!u?`active-die`:``;l+=`
            <div class="group-badge-card group-complexity ${d} ${u?`disabled`:``}" 
                 data-action="toggle-drawer-level" data-level="${e}" data-disabled="${u}"
                 title="Level ${e} (${t} heroes)">
                <img src="images/dice/d${e}.png" class="complexity-dice-img" alt="Level ${e}">
                <span class="group-badge-count">${t}</span>
            </div>`}let u=s.filter(e=>{let t=a.has(e.group_id),o=J(e)&&r||!J(e)&&i;return c(e,n)&&t&&o}).length,d=u===0,f=o.size===6&&!d?`active-die`:``;l+=`
        <div class="group-badge-card group-complexity group-complexity-all ${f} ${d?`disabled`:``}" 
             data-action="toggle-drawer-level" data-level="all" data-disabled="${d}"
             title="All Levels (${u} heroes)">
            <img src="images/dice/d_all.png" class="complexity-dice-img" alt="All">
            <span class="group-badge-count">${u}</span>
        </div>`,e.innerHTML=l}function Ie(e){let t=(e||``).toLowerCase();return t.includes(`season 1`)||t.includes(`s1`)?`group-s1`:t.includes(`season 2`)||t.includes(`s2`)?`group-s2`:t.includes(`marvel`)?`group-marvel`:t.includes(`x-men`)||t.includes(`xmen`)?`group-xmen`:t.includes(`adventures`)?`group-adventures`:t.includes(`solo`)?`group-solo`:t.includes(`outcast`)?`group-outcast`:t.includes(`santa`)||t.includes(`krampus`)||t.includes(`svk`)?`group-svk`:t.includes(`vanguard`)?`group-vanguard`:`group-default`}function Le(e){if(!e)return`?`;let t=e.trim().toLowerCase();if(t.includes(`season 1`))return`S1`;if(t.includes(`season 2`))return`S2`;if(t.includes(`marvel`))return`MRVL`;if(t.includes(`x-men`)||t.includes(`xmen`))return`XMEN`;if(t.includes(`adventure`))return`ADV`;if(t.includes(`santa`)&&t.includes(`krampus`))return`SvK`;if(t.includes(`solo`))return`SOLO`;if(t.includes(`outcast`))return`OUTC`;if(t.includes(`vanguard`))return`VNGD`;let n=e.split(/\s+/);return n.length>1?n.map(e=>e[0]).join(``).toUpperCase().substring(0,3):e.substring(0,3).toUpperCase()}function Re(){let e=document.getElementById(`drawer-group-filter-bar`);if(!e)return;let t=document.getElementById(`hero-search`),n=t?t.value.toLowerCase():``,r=document.getElementById(`db-show-owned`)?.checked??!0,i=document.getElementById(`db-show-not-owned`)?.checked??!1,a=w(`stagedLevels`),o=w(`stagedGroups`),s=w(`groups`),c=w(`characters`),l=(e,t)=>t?e.name.toLowerCase().includes(t)||e.group&&e.group.toLowerCase().includes(t):!0,u=s.map(e=>{let t=Le(e.name),s=o.has(e.id),u=Ie(e.name),d=c.filter(t=>{if(t.group_id!==e.id)return!1;let o=a.has(Number(t.complexity)),s=J(t)&&r||!J(t)&&i;return l(t,n)&&o&&s}).length,f=d===0;return`
                <div class="group-badge-card ${u} ${s&&!f?`active-die`:``} ${f?`disabled`:``}" 
                     data-action="toggle-drawer-group" data-group-id="${e.id}" data-disabled="${f}"
                     title="${Y(e.name)} (${d} heroes)">
                    <span class="group-badge-initials">${t}</span>
                    <span class="group-badge-count">${d}</span>
                </div>`}).join(``),d=c.filter(e=>{let t=a.has(Number(e.complexity)),o=J(e)&&r||!J(e)&&i;return l(e,n)&&t&&o}).length,f=d===0;e.innerHTML=`
        <div class="seasons-grid-left">
            ${u}
        </div>
        <div class="all-column-right">
            ${`
        <div class="group-badge-card group-all ${o.size===s.length&&!f?`active-die`:``} ${f?`disabled`:``}" 
             data-action="toggle-drawer-group" data-group-id="all" data-disabled="${f}"
             title="All Groups" style="height: 100%;">
            <span class="group-badge-initials">ALL</span>
            <span class="group-badge-count">${d}</span>
        </div>`}
        </div>
    `}function ze(){let e=O();if(!e.activeFiltersContainer)return;let t=e.heroSearchInput,n=t?t.value.trim():``,r=w(`activeOwnershipFilter`),i=w(`activeFilterDataHistories`),a=w(`activeFilterPlayers`),o=w(`activeFilterComplexities`),s=w(`activeFilterGroups`),c=w(`players`),l=w(`groups`),u=``;n&&(u+=`
            <div class="filter-chip" title="Active Search Filter">
                <span class="filter-chip-remove" data-action="clear-search-filter" title="Remove search filter">✖</span>
                <span class="filter-chip-label">Search: "${n}"</span>
            </div>
        `),r&&r!==`all`&&(u+=`
            <div class="filter-chip" title="Active Ownership Filter">
                <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="ownership" data-value="${r}" title="Remove filter">✖</span>
                <span class="filter-chip-label">${r===`owned`?`Owned`:`Unowned`}</span>
            </div>
        `),i&&Array.from(i).sort((e,t)=>{let n=[`Normal only`,`Historical only`];return n.indexOf(e)-n.indexOf(t)}).forEach(e=>{u+=`
                <div class="filter-chip" title="Active Data History Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="data-history" data-value="${e}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">Data: ${e}</span>
                </div>
            `}),a&&c&&Array.from(a).sort((e,t)=>{let n=c.find(t=>t.id===e),r=c.find(e=>e.id===t),i=n?n.name:``,a=r?r.name:``;return i.localeCompare(a)}).forEach(e=>{let t=c.find(t=>t.id===e),n=t?t.name:e;u+=`
                <div class="filter-chip" title="Active Player Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="player" data-value="${e}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">${n}</span>
                </div>
            `}),o&&Array.from(o).sort((e,t)=>e-t).forEach(e=>{u+=`
                <div class="filter-chip" title="Active Complexity Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="complexity" data-value="${e}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">Complexity: ${e}</span>
                </div>
            `}),s&&l&&Array.from(s).sort((e,t)=>{let n=l.find(t=>t.id===e),r=l.find(e=>e.id===t);return(n?n.order_index??0:0)-(r?r.order_index??0:0)}).forEach(e=>{let t=l.find(t=>t.id===e),n=t?t.name:e;u+=`
                <div class="filter-chip" title="Active Group Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="group" data-value="${e}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">${n}</span>
                </div>
            `}),e.activeFiltersContainer.innerHTML=u,e.activeFiltersContainer.classList.toggle(`has-chips`,!!u.trim())}function Be(){let e=O();if(!e.heroContainer)return;_r();let t=e.heroSearchInput?.value.toLowerCase()||``,n=e.dbShowOwnedCheckbox?.checked??!0,r=e.dbShowNotOwnedCheckbox?.checked??!1,i=w(`NAMES`),a=w(`characters`),o=w(`activeFilterComplexities`),s=w(`activeFilterGroups`),c=w(`activeFilterDataHistories`),l=w(`activeFilterPlayers`),u=w(`games`),d=w(`activePlayerIndices`),f=w(`currentSort`),p=w(`sortAsc`);w(`currentSortPlayerIndex`);let m=(e,t)=>{if(!t)return!0;let n=t.trim().toLowerCase();return(e.name||``).toLowerCase().includes(n)||(e.group||``).toLowerCase().includes(n)},h=[];t&&i.forEach((e,n)=>{e&&e.toLowerCase().includes(t)&&h.push(n)});let g=[,,,,].fill(0);a.filter(J).forEach(e=>{for(let t=0;t<4;t++)g[t]+=X(e,t)});let _=a.map((e,t)=>({...e,originalIndex:t})).filter(e=>{let i=!0;o.size>0&&(i=o.has(Number(e.complexity)));let a=!0;s.size>0&&(a=s.has(e.group_id));let d=!0,f=c.has(`Normal only`),p=c.has(`Historical only`);f&&!p?d=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(e=>!e.is_historical):p&&!f&&(d=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(e=>e.is_historical));let h=!0;l.size>0&&(h=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(t=>t.game_players.some(t=>t.hero_id===e.id&&l.has(t.player_id))));let g=J(e)&&n||!J(e)&&r;return m(e,t)&&i&&a&&d&&h&&g});e.countStatsLabel&&(e.countStatsLabel.innerText=`Showing ${_.length} of ${a.length} heroes`),_.sort((e,t)=>{let n,r;if(f.startsWith(`w`)){let i=parseInt(f[1]);n=X(e,i),r=X(t,i)}else if(f.startsWith(`d`)){let i=parseInt(f[1]);n=e.lastPlayed&&e.lastPlayed[i]||``,r=t.lastPlayed&&t.lastPlayed[i]||``,(n===`Never`||n===`Unknown`)&&(n=``),(r===`Never`||r===`Unknown`)&&(r=``)}else if(f===`group`){if(n=(e.group||``).toLowerCase(),r=(t.group||``).toLowerCase(),n===r){let n=(e.name||``).toLowerCase(),r=(t.name||``).toLowerCase();return p?n.localeCompare(r):r.localeCompare(n)}}else if(f===`complexity`){if(n=Number(e.complexity)||0,r=Number(t.complexity)||0,n===r){let n=(e.name||``).toLowerCase(),r=(t.name||``).toLowerCase();return n.localeCompare(r)}}else n=(e[f]||``).toLowerCase(),r=(t[f]||``).toLowerCase();if(n===r)return 0;let i=n<r?-1:1;return p?i:-i}),e.heroContainer.innerHTML=_.map(e=>{let t=d;l.size>0?t=Array.from(l).map(e=>parseInt(e.substring(1))-1).filter(e=>e>=0&&e<4):h.length>0&&(t=d.filter(e=>h.includes(e)));let n=t.map(t=>{let n=X(e,t),r=J(e)&&g[t]>0?(n/g[t]*100).toFixed(2):`0.00`,i=e.playCount&&e.playCount[t]||0,a=e.lastPlayed&&e.lastPlayed[t]||`Never`,o=e.winCount&&e.winCount[t]||0,s=i>0?(o/i*100).toFixed(1):`0.0`;return{p:t,percentage:parseFloat(r),percentageStr:r,playCount:i,lastPlayed:a,winCount:o,winRate:s}});n.sort((e,t)=>{let n=(i[e.p]||``).toLowerCase(),r=(i[t.p]||``).toLowerCase();return n.localeCompare(r)});let r=n.map(e=>{let t=Tr(e.lastPlayed);return`
                <div class="collapsed-player-row-simple">
                    <span class="collapsed-player-name" style="color: var(--p${e.p+1});">${i[e.p]}</span>
                    <span class="collapsed-player-prob">${e.percentageStr}%</span>
                    <span class="collapsed-player-plays">🎲 ${e.playCount}</span>
                    <span class="collapsed-player-wins">🏆 ${e.winCount} <span class="collapsed-player-rate">(${e.winRate}%)</span></span>
                    <span class="collapsed-player-recency" title="Last played: ${e.lastPlayed}">${t}</span>
                </div>`}).join(``),a=n.map(e=>{let t=wr(e.lastPlayed),n=Tr(e.lastPlayed),r=t?`<span class="expanded-player-relative">${t} ${n}</span>`:``;return`
                <div class="expanded-player-row">
                    <div class="expanded-player-main">
                        <span class="expanded-player-name" style="color: var(--p${e.p+1});">${i[e.p]}</span>
                        <span class="expanded-player-prob">${e.percentageStr}%</span>
                        <span class="collapsed-player-plays">🎲 ${e.playCount}</span>
                        <span class="collapsed-player-wins">🏆 ${e.winCount} <span class="collapsed-player-rate">(${e.winRate}%)</span></span>
                    </div>
                    <div class="expanded-player-date">
                        <span>📅 Last played: ${e.lastPlayed}</span>
                        ${r}
                    </div>
                </div>`}).join(``),o=Number(e.complexity)||1,s=[1,2,3,4,5,6].map(e=>`<img src="images/dice/d${e}.png" class="complexity-bar-dice ${e===o?`active`:``}" alt="Level ${e}">`).join(``);return`
            <div class="hero-item collapsed">
                <img src="${K(e.slug)}" class="char-bg-img" alt="${e.name}">
                
                <div class="hero-header" data-action="toggle-hero-panel">
                    <div class="header-title-collapsed">
                        <a href="${q(e.slug)}" target="_blank" class="hero-name-link">
                            <span class="hero-name">${e.name}</span>
                        </a>
                    </div>
                    
                    <div class="header-title-expanded">
                        <a href="${q(e.slug)}" target="_blank" class="hero-name-link">
                            <div class="expanded-name">${e.name}</div>
                        </a>
                        <div class="expanded-group">${e.group||`Season ?`}</div>
                    </div>
                    
                    <div class="complexity-dice-bar">
                        ${s}
                    </div>
                    
                    <button type="button" class="panel-toggle" aria-expanded="false">
                        <svg class="panel-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                
                <div class="hero-collapsed-info">
                    ${r}
                </div>
                
                <div class="hero-body">
                    <div class="expanded-players-list">
                        ${a}
                    </div>
                </div>
            </div>`}).join(``)}var A=()=>({resultsDiv:document.getElementById(`results`),rollBtnContainer:document.getElementById(`rollBtnContainer`),rollBtn:document.getElementById(`rollBtn`),actionButtons:document.getElementById(`action-buttons`),heroSelectModal:document.getElementById(`hero-select-modal`),heroSelectModalTitle:document.getElementById(`hero-select-modal-title`),heroSelectSearch:document.getElementById(`hero-select-search`),modalSortName:document.getElementById(`modal-sort-name`),modalSortWeight:document.getElementById(`modal-sort-weight`),heroSelectOptionsContainer:document.getElementById(`hero-select-options-container`),confirmBtn:document.getElementById(`confirmBtn`),errorMsg:document.getElementById(`error-msg`),rollSettingsBadge:document.getElementById(`roll-settings-badge`),rollSettingsBtn:document.getElementById(`rollSettingsBtn`),drawerBanListContainer:document.getElementById(`drawer-ban-list-container`)});function Ve(e){let t=A();if(!t.resultsDiv)return;let n=w(`NAMES`)[e]||`Player ${e+1}`;t.resultsDiv.innerHTML+=`
        <div class="player-row randomizing" id="player-row-${e}" style="--player-color: var(--p${e+1}); border-color: var(--p${e+1});">
            <img src="" class="char-bg-img scramble-img" id="bg-img-${e}" alt="Randomizing">
            
            <div class="player-row-content">
                <div class="hero-info-container" id="info-container-${e}">
                    <div class="hero-header-row">
                        <div class="hero-header-left">
                            <span class="player-name-caps" style="color: var(--player-color);">${n.toUpperCase()}</span>
                            <span class="hero-name-divider">:</span>
                            <a href="#" target="_blank" class="hero-name hero-name-link scramble-text" id="hero-name-title-${e}">ROLLING...</a>
                        </div>
                    </div>
                    
                    <span class="expanded-group scramble-hidden opacity-0" id="hero-group-${e}">Group</span>
                    
                    <div class="hero-stats-row scramble-hidden opacity-0" id="stats-row-${e}">
                        <span>Plays: --</span>
                        <span class="stats-divider">|</span>
                        <span>Last: --</span>
                        <span class="stats-divider">|</span>
                        <span id="hero-prob-${e}">Prob: --</span>
                    </div>
                </div>
                
                <div class="hero-select-container scramble-hidden opacity-0" id="select-container-${e}">
                    <input type="hidden" class="char-select" data-player="${e}" id="select-${e}">
                    <button class="edit-icon-btn" type="button" data-action="open-hero-select" data-player-idx="${e}" aria-label="Select hero">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `}function He(e){let t=A();if(!t.heroSelectModal)return;t.heroSelectModal.style.display=`flex`,document.body.style.overflow=`hidden`;let n=w(`NAMES`);t.heroSelectModalTitle&&n[e]&&(t.heroSelectModalTitle.innerText=`Select Hero for ${n[e]}`),t.heroSelectSearch&&(t.heroSelectSearch.value=``),T(`modalSortMode`,`name`),We(`name`),Ge(),setTimeout(Te,50)}function Ue(){let e=A();e.heroSelectModal&&(e.heroSelectModal.style.display=`none`),document.body.style.overflow=``}function We(e){let t=A();t.modalSortName&&t.modalSortName.classList.toggle(`active`,e===`name`),t.modalSortWeight&&t.modalSortWeight.classList.toggle(`active`,e===`weight`),Te()}function Ge(){let e=A();if(!e.heroSelectOptionsContainer)return;let t=w(`activeSelectPlayerIdx`),n=w(`modalSortMode`),r=e.heroSelectSearch,i=r?r.value.toLowerCase().trim():``,a=w(`characters`),o=w(`bannedHeroIds`);if(t===null)return;let s=a.filter(e=>J(e)&&!o.has(e.id));i&&(s=s.filter(e=>e.name.toLowerCase().includes(i)||e.group&&e.group.toLowerCase().includes(i))),n===`name`?s.sort((e,t)=>e.name.localeCompare(t.name)):n===`weight`&&s.sort((e,n)=>{let r=X(e,t),i=X(n,t);return r===i?e.name.localeCompare(n.name):i-r});let c=document.getElementById(`select-${t}`)?.value;if(s.length===0){e.heroSelectOptionsContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic; grid-column: 1 / -1; text-align: center; padding: 20px;">No available heroes found.</p>`;return}e.heroSelectOptionsContainer.innerHTML=s.map(e=>{let n=c===e.name,r=Z(e,t);return`
            <div class="hero-select-card ${n?`selected`:``}" data-action="select-hero-option" data-hero-name="${e.name.replace(/"/g,`&quot;`)}" data-hero-slug="${e.slug}" data-hero-id="${e.id}">
                <img src="${K(e.slug)}" class="hero-select-card-img" alt="${e.name}">
                <div class="hero-select-card-info">
                    <div class="hero-select-card-name">${e.name}</div>
                    <div class="hero-select-card-prob">${r}</div>
                </div>
            </div>`}).join(``)}function Ke(e,t){let n=document.getElementById(`player-row-${e}`),r=document.getElementById(`select-${e}`),i=document.getElementById(`bg-img-${e}`),a=document.getElementById(`hero-name-title-${e}`),o=document.getElementById(`hero-group-${e}`),s=document.getElementById(`stats-row-${e}`);if(w(`NAMES`),r&&(r.value=t.name),i&&(i.src=K(t.slug),i.style.opacity=`0.25`,i.classList.remove(`scramble-img`)),a&&(a.innerText=t.name,a.href=q(t.slug),a.classList.remove(`scramble-text`)),o&&(o.innerText=t.group||`Unknown`),s){let n=`Prob: <b>${Z(t,e)}</b>`;e<4?s.innerHTML=`
                <span>Plays: <b>${t.playCount[e]||0}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                <span class="stats-divider">|</span>
                <span>${n}</span>
            `:s.innerHTML=`<span>${n}</span>`}if(n){n.classList.remove(`randomizing`),n.classList.add(`revealed`),o&&(o.classList.remove(`scramble-hidden`,`opacity-0`),o.classList.add(`fade-in-resolve`)),s&&(s.classList.remove(`scramble-hidden`,`opacity-0`),s.classList.add(`fade-in-resolve`));let t=document.getElementById(`select-container-${e}`);t&&(t.classList.remove(`scramble-hidden`,`opacity-0`),t.classList.add(`fade-in-resolve`))}}function qe(e,t){let n=document.getElementById(`player-row-${e}`);if(!n)return;let r=w(`NAMES`)[e]||`Player ${e+1}`;n.className=`player-row revealed`,n.style.cssText=`--player-color: var(--p${e+1}); border-color: var(--p${e+1});`,n.innerHTML=`
        <img src="${K(t.slug)}" class="char-bg-img" id="bg-img-${e}" alt="${t.name}" style="opacity: 0.25;">
        <div class="player-row-content">
            <div class="hero-info-container" id="info-container-${e}">
                <div class="hero-header-row">
                    <div class="hero-header-left">
                        <span class="player-name-caps" style="color: var(--player-color);">${r.toUpperCase()}</span>
                        <span class="hero-name-divider">:</span>
                        <a href="${q(t.slug)}" target="_blank" class="hero-name hero-name-link resolved" id="hero-name-title-${e}">${t.name}</a>
                    </div>
                </div>
                <span class="expanded-group" id="hero-group-${e}">${t.group||`Unknown`}</span>
                <div class="hero-stats-row" id="stats-row-${e}">
                </div>
            </div>
            <div class="hero-select-container" id="select-container-${e}">
                <input type="hidden" class="char-select" data-player="${e}" id="select-${e}" value="${t.name}">
                <button class="edit-icon-btn" type="button" data-action="open-hero-select" data-player-idx="${e}" aria-label="Select hero">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;let i=document.getElementById(`stats-row-${e}`);if(i){let n=`Prob: <b>${Z(t,e)}</b>`;e<4?i.innerHTML=`
                <span>Plays: <b>${t.playCount[e]||0}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                <span class="stats-divider">|</span>
                <span>${n}</span>
            `:i.innerHTML=`<span>${n}</span>`}}function Je(e,t){let n=A();if(!n.resultsDiv)return;let r=document.getElementById(`player-row-${e}`);r||(r=document.createElement(`div`),r.id=`player-row-${e}`,n.resultsDiv.appendChild(r));let i=w(`NAMES`)[e]||`Player ${e+1}`;r.className=`player-row waiting-draft`,r.style.cssText=`--player-color: var(--p${e+1}); border-color: var(--p${e+1});`,r.innerHTML=`
        <div class="player-row-content">
            <span class="player-name-caps" style="color: var(--player-color);">${i.toUpperCase()}</span>
            <span class="draft-waiting-status">Waiting for ${t}...</span>
        </div>
    `}function Ye(e){let t=A();if(!t.resultsDiv)return;let n=document.getElementById(`player-row-${e}`);n||(n=document.createElement(`div`),n.id=`player-row-${e}`,t.resultsDiv.appendChild(n));let r=w(`NAMES`)[e]||`Player ${e+1}`,i=w(`draftCount`);n.className=`player-row active-draft`,n.style.cssText=`--player-color: var(--p${e+1}); border-color: var(--p${e+1});`,n.innerHTML=`
        <style>
            .btn-cancel-roll {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: rgba(255, 77, 77, 0.12);
                border: 1px solid rgba(255, 77, 77, 0.25);
                color: #ff4d4d;
                cursor: pointer;
                transition: all 0.2s ease;
                padding: 0;
            }
            @media (hover: hover) {
                .btn-cancel-roll:hover {
                    background: rgba(255, 77, 77, 0.25);
                    border-color: #ff4d4d;
                    color: #fff;
                    transform: scale(1.08);
                    box-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
                }
            }
            .btn-cancel-roll:active {
                transform: scale(0.95);
            }
        </style>
        <img src="" class="char-bg-img scramble-img" id="bg-img-${e}" style="opacity: 0; transition: opacity 0.5s ease;">
        <input type="hidden" class="char-select" data-player="${e}" id="select-${e}">
        <div class="player-row-content draft-flow-content">
            <div class="hero-header-row" style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <span class="player-name-caps" style="color: var(--player-color);">${r.toUpperCase()}</span>
                    <span class="hero-name-divider">:</span>
                    <span class="draft-title" style="font-weight: 700; color: #ffd700;">CHOOSE YOUR HERO</span>
                </div>
                <button class="btn-cancel-roll" type="button" data-action="cancel-roll" aria-label="Cancel roll">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="draft-wheel-container" id="draft-wheel-container-${e}">
                <button type="button" class="draft-arrow left-arrow" data-action="rotate-draft" data-player-idx="${e}" data-direction="-1" data-draft-count="${i}" aria-label="Previous hero">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div class="draft-wheel" id="draft-wheel-${e}">
                </div>

                <button type="button" class="draft-arrow right-arrow" data-action="rotate-draft" data-player-idx="${e}" data-direction="1" data-draft-count="${i}" aria-label="Next hero">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
            <div class="draft-actions">
                <button type="button" class="btn-confirm-draft" id="confirm-draft-btn-${e}" data-action="confirm-draft" data-player-idx="${e}" disabled>
                    CONFIRM PICK
                </button>
            </div>
        </div>
    `}function Xe(){let e=A();if(!e.rollSettingsBadge||!e.rollSettingsBtn)return;let t=w(`draftModeEnabled`),n=w(`bannedHeroIds`),r=0;t&&r++,n&&n.size>0&&(r+=n.size),r>0?(e.rollSettingsBadge.innerText=r,e.rollSettingsBadge.style.display=`inline-block`,e.rollSettingsBtn.classList.add(`has-settings`)):(e.rollSettingsBadge.style.display=`none`,e.rollSettingsBtn.classList.remove(`has-settings`))}function Ze(){let e=A();if(!e.drawerBanListContainer)return;let t=w(`characters`),n=w(`stagedBannedHeroIds`),r=w(`stagedBanSearchQuery`)||``,i=r.toLowerCase().trim(),a=t;i&&(a=t.filter(e=>e.name.toLowerCase().includes(i)||e.group&&e.group.toLowerCase().includes(i)));let o=[...a].sort((e,t)=>e.name.localeCompare(t.name));if(o.length===0){e.drawerBanListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic; text-align: center; padding: 20px;">No heroes found matching "${r}"</p>`;return}e.drawerBanListContainer.innerHTML=o.map(e=>{let t=n.has(e.id);return`
            <label class="ban-list-item ${t?`banned`:``}">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" ${t?`checked`:``} data-action="toggle-staged-ban" data-hero-id="${e.id}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--danger);">
                    <span>${e.name}</span>
                </div>
                <span class="ban-item-group">${e.group||`Unknown`}</span>
            </label>
        `}).join(``)}function Qe(){let e=w(`NAMES`),t=w(`characters`),n=w(`bannedHeroIds`),r=e.map((e,t)=>t).filter(e=>document.getElementById(`use${e}`)?.checked);if(console.log(`[randomizer] pickCharacters active players:`,r),console.log(`[randomizer] draftModeEnabled:`,w(`draftModeEnabled`)),r.length===0)return alert(`Select players!`);let i=[...r].sort(()=>Math.random()-.5),a=document.getElementById(`results`);a&&(a.innerHTML=``);let o=t.filter(e=>J(e)&&!n.has(e.id)).map(e=>structuredClone(e));if(console.log(`[randomizer] Owned/non-banned heroes pool count:`,o.length),o.length<r.length)return alert(`Not enough available (owned & non-banned) heroes (${o.length}) in your collection for ${r.length} players!`);if(w(`draftModeEnabled`)){let t=document.getElementById(`rollBtnContainer`);t&&(t.style.display=`none`);let n=document.getElementById(`action-buttons`);n&&(n.style.display=`none`),T(`activeDraftOrder`,i),T(`activeDraftStep`,0),T(`selectedDraftHeroes`,{}),T(`activeDraftCandidates`,{}),T(`draftWheelAngles`,{}),T(`draftWheelFrontCardIndices`,{}),[...r].sort((e,t)=>e-t).forEach(t=>{Je(t,e[i[0]])}),V(`roll`),a&&a.scrollIntoView({behavior:`smooth`,block:`start`}),gt();return}let s={};i.forEach(e=>{let t=null;if(e>=4){let e=Math.floor(Math.random()*o.length);t=o[e],o.splice(e,1)}else{let n=o.filter(t=>t.weights[e]>0);if(n.length===0){if(o.length>0){let e=Math.floor(Math.random()*o.length);t=o[e],o.splice(e,1)}}else{let r=n.reduce((t,n)=>t+X(n,e),0),i=Math.random()*r;for(let r of n){let n=X(r,e);if(i<n){t=r,o.splice(o.findIndex(e=>e.name===r.name),1);break}i-=n}}}s[e]=t});let c=document.getElementById(`rollBtnContainer`);c&&(c.style.display=`none`);let l=document.getElementById(`rollBtn`);l&&(l.disabled=!0,l.style.opacity=`0.6`,l.style.cursor=`not-allowed`);let u=document.getElementById(`rollDraftBtn`);u&&(u.disabled=!0,u.style.opacity=`0.6`,u.style.cursor=`not-allowed`);let d=document.getElementById(`action-buttons`);d&&(d.style.display=`none`),T(`isRollActive`,!1);let f=[...r].sort((e,t)=>e-t);f.forEach(e=>{Ve(e)}),V(`roll`),a&&a.scrollIntoView({behavior:`smooth`,block:`start`});let p=t.filter(e=>J(e)&&!n.has(e.id));f.forEach(e=>{at(e,p)});let m=0;function h(){if(m>=i.length){N(),vr()?(d&&(d.style.display=`flex`),c&&(c.style.display=`none`)):(c&&(c.style.display=`flex`),l&&(l.disabled=!1,l.style.opacity=`1`,l.style.cursor=`pointer`),u&&(u.disabled=!1,u.style.opacity=`1`,u.style.cursor=`pointer`)),T(`isRollActive`,!0);return}let e=i[m],t=s[e],n=500+Math.random()*500;setTimeout(()=>{ot(e,t),m++,setTimeout(h,400)},n)}h()}function $e(){console.log(`[randomizer] pickCharactersNormal called. Setting draftModeEnabled to false.`),T(`draftModeEnabled`,!1),Qe()}function et(){console.log(`[randomizer] pickCharactersDraft called. Setting draftModeEnabled to true, draftCount to 3.`),T(`draftModeEnabled`,!0),T(`draftCount`,3),Qe()}function j(){N()}function tt(e){T(`activeSelectPlayerIdx`,e),He(e)}function M(){Ue(),T(`activeSelectPlayerIdx`,null)}function nt(e){T(`modalSortMode`,e),We(e),rt()}function rt(){Ge()}function it(e){let t=w(`activeSelectPlayerIdx`);if(t===null)return;let n=w(`characters`).find(t=>t.name===e);n&&(w(`draftModeEnabled`)&&(w(`selectedDraftHeroes`)[t]=n),Ke(t,n),N(),M())}function at(e,t){if(t.length===0)return;let n=document.getElementById(`bg-img-${e}`),r=document.getElementById(`hero-name-title-${e}`);me(`scrambleIntervals`,e,setInterval(()=>{let e=t[Math.floor(Math.random()*t.length)];if(n&&(n.src=K(e.slug)),r){let e=``;for(let t=0;t<8;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*`[Math.floor(Math.random()*32)];r.innerText=e}},70))}function ot(e,t){let n=w(`scrambleIntervals`);n[e]&&(clearInterval(n[e]),me(`scrambleIntervals`,e,void 0)),t&&Ke(e,t)}function N(){let e=document.querySelectorAll(`.char-select`),t=Array.from(e).map(e=>e.value),n=t.reduce((e,t)=>(e[t]=(e[t]||0)+1,e),{}),r=Object.values(n).some(e=>e>1),i=w(`characters`),a=t.filter(e=>{let t=i.find(t=>t.name===e);return t&&!J(t)}),o=a.length>0,s=document.getElementById(`confirmBtn`),c=document.getElementById(`error-msg`);!s||!c||(s.classList.remove(`disabled`,`warning`),s.disabled=!1,s.innerHTML=`LOCK IN SESSION`,c.style.display=`none`,r?(s.classList.add(`disabled`),s.disabled=!0,c.style.display=`block`,c.innerText=`⚠ Duplicate hero selected! Each player must have a unique character.`):o&&(s.classList.add(`warning`),s.innerHTML=`⚠️ LOCK IN SESSION`,c.style.display=`block`,c.innerText=`⚠️ You have selected unowned heroes: ${a.join(`, `)}.`),e.forEach(e=>{let t=e.closest(`.player-row`);t&&t.classList.toggle(`error`,n[e.value]>1)}))}async function st(){let e=document.getElementById(`confirmBtn`),t=e?e.innerText:`Lock In`;e&&(e.disabled=!0,e.innerText=`Saving...`);let n=Array.from(document.querySelectorAll(`.char-select`)).map(e=>e.value),r=w(`characters`),i=n.filter(e=>{let t=r.find(t=>t.name===e);return t&&!J(t)});if(i.length>0&&!await D(`Unowned Heroes Selected`,`You have selected unowned heroes: ${i.join(`, `)}. Do you want to proceed?`)){e&&(e.disabled=!1,e.innerText=t);return}let a=document.querySelectorAll(`.char-select`),o=[],s=[],c=new Map(Array.from(a).map(e=>[parseInt(e.dataset.player),e.value])),{data:l,error:u}=await oe(w(`currentUser`).id);if(u)return e&&(e.disabled=!1,e.innerText=t),alert(`Error creating game: `+u.message);r.forEach(e=>{[0,1,2,3,4,5].forEach(t=>{let n=c.get(t);if(n===e.name&&s.push({game_id:l.id,player_id:`p${t+1}`,hero_id:e.id,is_winner:null,last_updated_by:w(`currentUser`).id}),t<4&&n!==void 0){let r=n===e.name?20:(e.weights[t]||250)+10;o.push({hero_id:e.id,player_id:`p${t+1}`,weight:r,last_updated_by:w(`currentUser`).id})}})});let{error:d}=await S(s);if(d)return e&&(e.disabled=!1,e.innerText=t),alert(`Error logging game participants: `+d.message);let{error:f}=await se(o);if(f)return e&&(e.disabled=!1,e.innerText=t),alert(`Error saving results: `+f.message);await $();let p=document.getElementById(`action-buttons`);p&&(p.style.display=`none`);let m=document.getElementById(`rollBtnContainer`);m&&(m.style.display=`flex`);let h=document.getElementById(`rollBtn`);h&&(h.style.display=`block`,h.disabled=!1,h.style.opacity=`1`,h.style.cursor=`pointer`);let g=document.getElementById(`rollDraftBtn`);g&&(g.style.display=`block`,g.disabled=!1,g.style.opacity=`1`,g.style.cursor=`pointer`);let _=document.getElementById(`results`);_&&(_.innerHTML=`
            <p style="color:#28a745; text-align:center; font-weight:bold;">
                Session Logged! Game record created and stats updated.
            </p>`),T(`isRollActive`,!1)}function ct(){let e=document.getElementById(`results`);e&&(e.innerHTML=`<p style="text-align: center; opacity: 0.6;">Select players and roll.</p>`);let t=document.getElementById(`action-buttons`);t&&(t.style.display=`none`);let n=w(`scrambleIntervals`);n&&(Object.keys(n).forEach(e=>{n[e]&&clearInterval(n[e])}),T(`scrambleIntervals`,{}));let r=document.getElementById(`rollBtnContainer`);r&&(r.style.display=`flex`);let i=document.getElementById(`rollBtn`);i&&(i.style.display=`block`,i.disabled=!1,i.style.opacity=`1`,i.style.cursor=`pointer`);let a=document.getElementById(`rollDraftBtn`);a&&(a.style.display=`block`,a.disabled=!1,a.style.opacity=`1`,a.style.cursor=`pointer`),T(`isRollActive`,!1)}function lt(){T(`currentDrawerMode`,`roll-settings`),T(`stagedDraftModeEnabled`,w(`draftModeEnabled`)),T(`stagedDraftCount`,w(`draftCount`)),T(`stagedBannedHeroIds`,new Set(w(`bannedHeroIds`))),T(`stagedBanSearchQuery`,``),T(`stagedRollSettingsTab`,`draft`);let e=document.getElementById(`sort-filter-drawer`),t=document.getElementById(`drawer-title-text`),n=document.getElementById(`drawer-footer-content`);t&&(t.innerText=`Roll Configuration`),n&&(n.style.display=`flex`),I(),e&&(e.classList.add(`open`),document.body.style.overflow=`hidden`)}function ut(e){T(`stagedRollSettingsTab`,e),I()}function dt(e){T(`stagedDraftModeEnabled`,e);let t=document.getElementById(`drawer-draft-count-section`);t&&(t.style.display=e?`block`:`none`)}function ft(e){T(`stagedDraftCount`,e),I()}function pt(e){E(`stagedBannedHeroIds`,`toggle`,e),Ze()}function mt(e){T(`stagedBanSearchQuery`,e),Ze()}function ht(){Xe()}function gt(){let e=w(`activeDraftStep`),t=w(`activeDraftOrder`),n=w(`NAMES`),r=w(`characters`),i=w(`bannedHeroIds`),a=w(`selectedDraftHeroes`);if(e>=t.length){N();let e=document.getElementById(`action-buttons`);e&&(e.style.display=`flex`);let t=document.getElementById(`rollBtnContainer`);t&&(t.style.display=`none`),T(`isRollActive`,!0);return}let o=t[e],s=n[o];t.forEach(n=>{let r=t.indexOf(n);r<e||(r===e?Ye(n):Je(n,s))});let c=Object.values(a).map(e=>e?.name),l=r.filter(e=>J(e)&&!i.has(e.id)&&!c.includes(e.name));vt(o,l),setTimeout(()=>{let e=_t(o,l);w(`activeDraftCandidates`)[o]=e,yt(o,e)},1e3)}function _t(e,t){let n=[],r=[...t],i=w(`draftCount`),a=Math.min(i,r.length);for(let t=0;t<a;t++){let t=null;if(e>=4){let e=Math.floor(Math.random()*r.length);t=r[e],r.splice(e,1)}else{let n=r.filter(t=>t.weights[e]>0);if(n.length===0){if(r.length>0){let e=Math.floor(Math.random()*r.length);t=r[e],r.splice(e,1)}}else{let i=n.reduce((t,n)=>t+X(n,e),0),a=Math.random()*i;for(let i of n){let n=X(i,e);if(a<n){t=i,r.splice(r.findIndex(e=>e.name===i.name),1);break}a-=n}}}t&&n.push(t)}return n}function vt(e,t){let n=document.getElementById(`draft-wheel-${e}`);if(!n)return;let r=``,i=w(`draftCount`),a=360/i;for(let t=0;t<i;t++){let n=t*a;r+=`
            <div class="draft-card-wrapper" id="draft-card-wrapper-${e}-${t}" style="transform: rotateY(${n}deg) translateZ(150px);">
                <div class="draft-card">
                    <img src="" class="char-bg-img scramble-img" id="draft-card-img-${e}-${t}" style="opacity: 0.08;">
                    <div class="draft-card-content">
                        <div class="draft-card-header">
                            <span class="draft-hero-name scramble-text" id="draft-card-name-${e}-${t}">ROLLING...</span>
                        </div>
                        <div class="draft-card-body">
                            <span class="draft-card-group" id="draft-card-group-${e}-${t}">Group</span>
                            <div class="hero-stats-row" id="draft-card-stats-${e}-${t}">
                                <span>Plays: --</span>
                                <span class="stats-divider">|</span>
                                <span>Last: --</span>
                                <span class="stats-divider">|</span>
                                <span>Prob: --</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `}n.innerHTML=r,me(`scrambleIntervals`,e,setInterval(()=>{for(let n=0;n<i;n++){let r=t[Math.floor(Math.random()*t.length)];if(!r)continue;let i=document.getElementById(`draft-card-img-${e}-${n}`),a=document.getElementById(`draft-card-name-${e}-${n}`),o=document.getElementById(`draft-card-group-${e}-${n}`);if(i&&(i.src=K(r.slug)),a){let e=``;for(let t=0;t<6;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZ`[Math.floor(Math.random()*26)];a.innerText=e}o&&(o.innerText=r.group||``)}},70))}function yt(e,t){let n=w(`scrambleIntervals`);n[e]&&(clearInterval(n[e]),me(`scrambleIntervals`,e,void 0));let r=document.getElementById(`draft-wheel-${e}`);if(!r)return;let i=``,a=t.length;r.style.transform=`rotateY(0deg)`,w(`draftWheelFrontCardIndices`)[e]=0,w(`draftWheelAngles`)[e]=0;let o=360/a;t.forEach((t,n)=>{let r=n*o,a=e<4?`
            <span>Plays: <b>${t.playCount[e]||0}</b></span>
            <span class="stats-divider">|</span>
            <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
            <span class="stats-divider">|</span>
            <span>Prob: <b>${Z(t,e)}</b></span>
        `:`
            <span>Prob: <b>${Z(t,e)}</b></span>
        `;i+=`
            <div class="draft-card-wrapper" id="draft-card-wrapper-${e}-${n}" style="transform: rotateY(${r}deg) translateZ(150px);" data-action="select-draft-hero" data-player-idx="${e}" data-hero-name="${t.name.replace(/"/g,`&quot;`)}" data-hero-slug="${t.slug}" data-hero-id="${t.id}" data-angle="${r}" data-card-idx="${n}">
                <div class="draft-card">
                    <img src="${K(t.slug)}" alt="${t.name}" class="char-bg-img" style="opacity: 0.25;">
                    <div class="draft-card-content">
                        <div class="draft-card-header">
                            <span class="draft-hero-name">${t.name}</span>
                        </div>
                        <div class="draft-card-body">
                            <span class="draft-card-group">${t.group||`Unknown`}</span>
                            <div class="hero-stats-row">
                                ${a}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `}),r.innerHTML=i;let s=document.getElementById(`draft-wheel-container-${e}`);s&&bt(e,s,a)}function bt(e,t,n){let r=0,i=!1,a=!1;t.addEventListener(`click`,e=>{a&&=(e.stopPropagation(),e.preventDefault(),!1)},!0),t.addEventListener(`touchstart`,e=>{r=e.touches[0].clientX,i=!0},{passive:!0}),t.addEventListener(`touchend`,t=>{if(!i)return;i=!1;let o=t.changedTouches[0].clientX-r;Math.abs(o)>10&&(a=!0),o>50?P(e,-1,n):o<-50&&P(e,1,n)},{passive:!0}),t.addEventListener(`mousedown`,t=>{r=t.clientX,i=!0;let o=()=>{},s=t=>{if(i){i=!1;let c=t.clientX-r;Math.abs(c)>10&&(a=!0),c>50?P(e,-1,n):c<-50&&P(e,1,n),document.removeEventListener(`mousemove`,o),document.removeEventListener(`mouseup`,s)}};document.addEventListener(`mousemove`,o),document.addEventListener(`mouseup`,s)})}function P(e,t,n){let r=w(`activeDraftCandidates`)[e];if(!r||r.length===0)return;let i=w(`draftWheelFrontCardIndices`);i[e]===void 0&&(i[e]=0);let a=(i[e]+t)%n;a<0&&(a+=n),i[e]=a;let o=360/n,s=w(`draftWheelAngles`);s[e]===void 0&&(s[e]=0);let c=s[e]+t*o;s[e]=c;let l=document.getElementById(`draft-wheel-${e}`);l&&(l.style.transform=`rotateY(${-c}deg)`),St(e)}function xt(e,t){let n=(t-e)%360;return n<-180?n+=360:n>180&&(n-=360),e+n}function St(e){let t=document.getElementById(`select-${e}`),n=document.getElementById(`confirm-draft-btn-${e}`),r=document.getElementById(`bg-img-${e}`),i=document.querySelectorAll(`[id^="draft-card-wrapper-${e}-"]`);t&&(t.value=``),i.forEach(e=>{e.classList.remove(`selected`)}),r&&(r.style.opacity=`0`),n&&(n.disabled=!0),w(`selectedDraftHeroes`)[e]=null}function Ct(e,t,n,r,i,a){let o=w(`selectedDraftHeroes`);if(o[e]&&o[e].id===r){St(e);return}let s=document.getElementById(`select-${e}`),c=document.getElementById(`confirm-draft-btn-${e}`),l=document.getElementById(`bg-img-${e}`),u=document.querySelectorAll(`[id^="draft-card-wrapper-${e}-"]`);s&&(s.value=t),w(`draftWheelFrontCardIndices`)[e]=a;let d=w(`draftWheelAngles`);d[e]===void 0&&(d[e]=0);let f=d[e],p=xt(f,i);d[e]=p;let m=document.getElementById(`draft-wheel-${e}`);m&&(m.style.transform=`rotateY(${-p}deg)`),u.forEach((e,t)=>{t===a?e.classList.add(`selected`):e.classList.remove(`selected`)}),l&&(l.src=K(n),l.style.opacity=`0.25`),c&&(c.disabled=!1),o[e]=w(`characters`).find(e=>e.id===r)}function wt(e,t){qe(e,t)}function Tt(e){let t=w(`selectedDraftHeroes`)[e];t&&(wt(e,t),T(`activeDraftStep`,w(`activeDraftStep`)+1),gt())}function Et(e){T(`stagedGamesWinnerOnly`,e),I()}function Dt(){T(`currentDrawerMode`,`history-filter`),T(`stagedSelectedGamePlayerIndex`,w(`selectedGamePlayerIndex`)),T(`stagedGamesWinnerOnly`,w(`gamesWinnerOnly`)),T(`stagedGamesUseHistorical`,w(`gamesUseHistorical`)),_e()}function Ot(){T(`stagedFilterDataHistories`,new Set(w(`activeFilterDataHistories`))),T(`stagedFilterPlayers`,new Set(w(`activeFilterPlayers`))),T(`stagedFilterComplexities`,new Set(w(`activeFilterComplexities`))),T(`stagedFilterGroups`,new Set(w(`activeFilterGroups`))),T(`stagedOwnershipFilter`,w(`activeOwnershipFilter`)),ye()}function kt(e){T(`stagedOwnershipFilter`,e),ve(),k()}function At(e=null,t=!1){be(e,t)}function jt(e){let t=e.getAttribute(`data-type`),n=e.value,r=e.checked;if(t===`data-history`)E(`stagedFilterDataHistories`,r?`add`:`delete`,n);else if(t===`player`)E(`stagedFilterPlayers`,r?`add`:`delete`,n);else if(t===`complexity`){let e=Number(n);E(`stagedFilterComplexities`,r?`add`:`delete`,e)}else t===`group`&&E(`stagedFilterGroups`,r?`add`:`delete`,n);k(),Ae()}function Mt(){w(`stagedFilterDataHistories`).clear(),w(`stagedFilterPlayers`).clear(),w(`stagedFilterComplexities`).clear(),w(`stagedFilterGroups`).clear(),T(`stagedOwnershipFilter`,`all`),document.querySelectorAll(`#filter-drawer-left input[type="checkbox"]`).forEach(e=>{e.checked=!1}),ve(),k(),Ae()}function Nt(){T(`activeFilterDataHistories`,new Set(w(`stagedFilterDataHistories`))),T(`activeFilterPlayers`,new Set(w(`stagedFilterPlayers`))),T(`activeFilterComplexities`,new Set(w(`stagedFilterComplexities`))),T(`activeFilterGroups`,new Set(w(`stagedFilterGroups`))),T(`dbUseHistorical`,!w(`activeFilterDataHistories`).has(`Normal only`)||w(`activeFilterDataHistories`).has(`Historical only`));let e=w(`stagedOwnershipFilter`);T(`activeOwnershipFilter`,e),In(e),At(null,!0),z(),L(),R()}function Pt(){let e=document.getElementById(`hero-search`)?.value.toLowerCase()||``,t=w(`stagedOwnershipFilter`),n=t===`owned`||t===`all`,r=t===`unowned`||t===`all`,i=w(`characters`),a=w(`games`),o=w(`stagedFilterComplexities`),s=w(`stagedFilterGroups`),c=w(`stagedFilterDataHistories`),l=w(`stagedFilterPlayers`);return i.filter(t=>{let i=!0;o.size>0&&(i=o.has(Number(t.complexity)));let u=!0;s.size>0&&(u=s.has(t.group_id));let d=!0,f=c.has(`Normal only`),p=c.has(`Historical only`);f&&!p?d=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>!e.is_historical):p&&!f&&(d=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>e.is_historical));let m=!0;l.size>0&&(m=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>e.game_players.some(e=>e.hero_id===t.id&&l.has(e.player_id))));let h=J(t)&&n||!J(t)&&r;return tn(t,e)&&i&&u&&d&&m&&h}).length}function F(e=null,t=!1){xe(e,t)}function I(){Me()}function Ft(e){w(`stagedSelectedGamePlayerIndex`)===e?T(`stagedSelectedGamePlayerIndex`,null):T(`stagedSelectedGamePlayerIndex`,e),w(`stagedSelectedGamePlayerIndex`)===null&&T(`stagedGamesWinnerOnly`,!1),I()}function It(e){T(`stagedGamesUseHistorical`,e),I()}function Lt(e){e===`name`?T(`stagedSort`,`name`):e===`group`?T(`stagedSort`,`group`):e===`probability`?T(`stagedSort`,`w${w(`stagedSortPlayerIndex`)}`):e===`lastPlayed`&&T(`stagedSort`,`d${w(`stagedSortPlayerIndex`)}`),T(`stagedSortAsc`,e===`name`||e===`group`),Ne(),Pe()}function Rt(e){T(`stagedSortPlayerIndex`,e);let t=w(`stagedSort`);t.startsWith(`w`)?T(`stagedSort`,`w${e}`):t.startsWith(`d`)&&T(`stagedSort`,`d${e}`),Pe()}function zt(e){let t=w(`stagedPlayerIndices`),n=t.indexOf(e);n>-1?t.splice(n,1):t.push(e),T(`stagedPlayerIndices`,t),I()}function Bt(e){e===`all`?T(`stagedLevels`,w(`stagedLevels`).size===6?new Set:new Set([1,2,3,4,5,6])):E(`stagedLevels`,`toggle`,e),Fe(),Re()}function Vt(e){let t=w(`groups`);e===`all`?w(`stagedGroups`).size===t.length?E(`stagedGroups`,`clear`):t.forEach(e=>E(`stagedGroups`,`add`,e.id)):E(`stagedGroups`,`toggle`,e),Fe(),Re()}function Ht(){let e=w(`groups`),t=w(`currentDrawerMode`);t===`sort-filter`?(T(`stagedSort`,`name`),T(`stagedSortAsc`,!0),T(`stagedSortPlayerIndex`,0),T(`stagedLevels`,new Set([1,2,3,4,5,6])),T(`stagedGroups`,new Set(e.map(e=>e.id))),I()):t===`columns`?(T(`stagedPlayerIndices`,[0,1,2,3]),T(`stagedUseHistorical`,!0),I()):t===`history-filter`?(T(`stagedSelectedGamePlayerIndex`,null),T(`stagedGamesWinnerOnly`,!1),T(`stagedGamesUseHistorical`,!0),I()):t===`roll-settings`&&(T(`stagedDraftModeEnabled`,!1),T(`stagedDraftCount`,3),T(`stagedBannedHeroIds`,new Set),T(`stagedBanSearchQuery`,``),I())}function Ut(){let e=w(`currentDrawerMode`);e===`sort-filter`?(T(`currentSort`,w(`stagedSort`)),T(`sortAsc`,w(`stagedSortAsc`)),T(`currentSortPlayerIndex`,w(`stagedSortPlayerIndex`)),T(`activeLevels`,new Set(w(`stagedLevels`))),T(`activeGroups`,new Set(w(`stagedGroups`))),L(),F(null,!0),z()):e===`columns`?(T(`activePlayerIndices`,[...w(`stagedPlayerIndices`)]),T(`dbUseHistorical`,w(`stagedUseHistorical`)),L(),F(null,!0),z()):e===`history-filter`?(T(`selectedGamePlayerIndex`,w(`stagedSelectedGamePlayerIndex`)),T(`gamesWinnerOnly`,w(`stagedGamesWinnerOnly`)),T(`gamesUseHistorical`,w(`stagedGamesUseHistorical`)),Wt(),F(null,!0),W()):e===`roll-settings`&&(T(`draftModeEnabled`,w(`stagedDraftModeEnabled`)),T(`draftCount`,w(`stagedDraftCount`)),T(`bannedHeroIds`,new Set(w(`stagedBannedHeroIds`))),localStorage.setItem(`draftModeEnabled`,w(`draftModeEnabled`)),localStorage.setItem(`draftCount`,w(`draftCount`)),localStorage.setItem(`bannedHeroIds`,JSON.stringify(Array.from(w(`bannedHeroIds`)))),ht(),F(null,!0))}function L(){Ce()}function Wt(){we()}function Gt(e){let t=w(`currentSort`),n=w(`sortAsc`);t===e?T(`sortAsc`,!n):(T(`currentSort`,e),T(`sortAsc`,!0)),Kt(),z()}function Kt(){Ee()}function qt(e){Oe(e)}function Jt(){ke()}function Yt(e,t){T(`currentSort`,e),T(`sortAsc`,t),(e.startsWith(`w`)||e.startsWith(`d`))&&T(`currentSortPlayerIndex`,parseInt(e.substring(1))),Jt(),Kt(),z()}function Xt(){let e=document.getElementById(`hero-search`),t=document.getElementById(`clear-search`);e&&t&&t.classList.toggle(`hidden`,e.value.trim().length===0)}function Zt(){let e=document.getElementById(`hero-search`);e&&(e.value=``,e.focus()),Xt(),Qt()}function Qt(){z(),R()}function R(){ze()}function $t(e,t){if(e===`data-history`)E(`activeFilterDataHistories`,`delete`,t),T(`dbUseHistorical`,!w(`activeFilterDataHistories`).has(`Normal only`)||w(`activeFilterDataHistories`).has(`Historical only`));else if(e===`player`)E(`activeFilterPlayers`,`delete`,t);else if(e===`complexity`)E(`activeFilterComplexities`,`delete`,t);else if(e===`group`)E(`activeFilterGroups`,`delete`,t);else if(e===`ownership`){T(`activeOwnershipFilter`,`all`),T(`stagedOwnershipFilter`,`all`);let e=document.getElementById(`db-show-owned`),t=document.getElementById(`db-show-not-owned`);e&&(e.checked=!0),t&&(t.checked=!0)}if(e!==`ownership`){let n=document.querySelector(`#filter-drawer-left input[value="${t}"][data-type="${e}"]`);n&&(n.checked=!1)}z(),R(),L()}function en(){Zt()}function z(){Be()}function tn(e,t){if(!t)return!0;let n=t.trim().toLowerCase();return(e.name||``).toLowerCase().includes(n)||(e.group||``).toLowerCase().includes(n)}var nn=null,B=()=>(nn||={buildInfoDiv:document.getElementById(`admin-build-info`),changelogModal:document.getElementById(`changelog-modal`),changelogContainer:document.getElementById(`changelog-container`),whatsNewModal:document.getElementById(`whats-new-modal`),whatsNewContainer:document.getElementById(`whats-new-container`),collectionContainer:document.getElementById(`collectionContainer`),collectionCountLabel:document.getElementById(`collection-count-stats`),heroForm:document.getElementById(`heroForm`),addHeroBtn:document.getElementById(`addHeroBtn`),groupSelect:document.getElementById(`charGroup`),formTitle:document.getElementById(`formTitle`),charNameInput:document.getElementById(`charName`),charSlugInput:document.getElementById(`charSlug`),charComplexitySelect:document.getElementById(`charComplexity`),groupsListContainer:document.getElementById(`groupsListContainer`),heroesListContainer:document.getElementById(`heroesListContainer`),playersListContainer:document.getElementById(`playersListContainer`),usersListContainer:document.getElementById(`usersListContainer`),collectionsListContainer:document.getElementById(`collectionsListContainer`),gamesListContainer:document.getElementById(`gamesContainer`),winnerModal:document.getElementById(`winner-modal`),winnerContainer:document.getElementById(`winner-selection-container`),confirmWinnerBtn:document.getElementById(`confirm-winner-btn`),groupForm:document.getElementById(`groupForm`),addGroupBtn:document.getElementById(`addGroupBtn`)},nn);function rn(){let t=B();if(!t.buildInfoDiv)return;let n=window.location.hostname,r=`Localhost`;n.includes(`github.io`)?r=`GitHub Pages`:n.includes(`workers.dev`)&&(r=`Cloudflare Workers`);let i=e?`Production`:`Development`,a=e?`Supabase PROD`:`Supabase DEV`,o=e?`main`:`dev/local`;t.buildInfoDiv.innerHTML=`
        <div><b>Platform:</b> ${r} (${n})</div>
        <div><b>Environment:</b> ${i} (Targeting: ${o})</div>
        <div><b>Database:</b> ${a}</div>
        ${e?``:`<div style="margin-top:5px; color:var(--danger); font-style:italic;">Note: Dev heroes are prefixed with "DEV-" in this database.</div>`}
    `}function an(){let e=B(),t=w(`cachedChangelog`);!t||!e.changelogContainer||!e.changelogModal||(e.changelogContainer.innerHTML=t.map(e=>`
        <div>
            <h3>v${e.version}</h3>
            <ul>
                ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
        </div>
    `).join(``),e.changelogModal.style.display=`flex`,document.body.style.overflow=`hidden`)}function on(){let e=B();e.changelogModal&&(e.changelogModal.style.display=`none`),document.body.style.overflow=`auto`}function sn(e){let t=B();!t.whatsNewContainer||!t.whatsNewModal||(t.whatsNewContainer.innerHTML=`
        <div>
            <h3>v${e.version}</h3>
            <ul style="text-align: left;">
                ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
        </div>
    `,t.whatsNewModal.style.display=`flex`,document.body.style.overflow=`hidden`)}function cn(){let e=B();e.whatsNewModal&&(e.whatsNewModal.style.display=`none`),document.body.style.overflow=`auto`}function ln(e){if(e===`admin`&&!G())return;let t={roll:`rollSection`,database:`dbSection`,history:`gamesSection`,collection:`collectionSection`,admin:`adminSection`},n=t[e];n&&(Object.values(t).forEach(e=>{let t=document.getElementById(e);t&&(e===n?t.classList.remove(`hidden`):t.classList.add(`hidden`))}),e===`database`?setTimeout(Te,50):e===`history`?Dn():e===`collection`&&fn())}function un(e,t){let n=document.getElementById(t),r=(e.currentTarget.closest(`.panel-header`)||e.currentTarget).querySelector(`.panel-toggle`);if(!n||!r)return;let i=n.classList.toggle(`hidden`);r.classList.toggle(`open`,!i),r.setAttribute(`aria-expanded`,String(!i))}function dn(e){let t=e.closest(`.hero-item`),n=e.querySelector(`.panel-toggle`);if(!t||!n)return;let r=t.classList.toggle(`collapsed`);n.classList.toggle(`open`,!r),n.setAttribute(`aria-expanded`,String(!r))}function fn(){let e=B();if(!e.collectionContainer)return;let t=w(`characters`),n=w(`groups`),r=w(`currentUser`),i=w(`expandedCollectionGroups`),a=t.length,o=t.filter(w(`isHeroOwned`)||(e=>e.is_owned)).length;e.collectionCountLabel&&(e.collectionCountLabel.innerText=`Owned ${o} of ${a} heroes`);let s=[...n].sort((e,t)=>{let n=e.order_index??2**53-1,r=t.order_index??2**53-1;return n===r?e.name.localeCompare(t.name):n-r}),c=r?``:`disabled`;e.collectionContainer.innerHTML=s.map(e=>{let n=t.filter(t=>t.group_id===e.id).sort((e,t)=>e.name.localeCompare(t.name));if(n.length===0)return``;let r=n.every(w(`isHeroOwned`)||(e=>e.is_owned)),a=n.map(e=>{let t=e.is_owned;return`
            <div class="collection-hero-card ${t?`selected`:``} ${c?`disabled`:``}" data-action="toggle-hero-owned" data-hero-id="${e.id}" data-selected="${t}">
                <img src="${K(e.slug)}" class="collection-hero-card-img" alt="${e.name}">
                <div class="collection-hero-card-name">${e.name}</div>
            </div>
        `}).join(``),o=i.has(e.id),s=n.length,l=n.filter(e=>e.is_owned).length;return`
            <div class="collection-group${o?``:` collapsed`}">
                <div class="collection-group-header" data-action="toggle-collection-group" data-group-id="${e.id}" style="cursor: pointer;">
                    <input type="checkbox" id="owned-group-${e.id}" ${r?`checked`:``} ${c} data-action="toggle-group-owned" data-group-id="${e.id}">
                    <label for="owned-group-${e.id}">
                        <strong>${e.name}</strong>
                        ${e.year?` <span style="opacity: 0.6; font-size: 0.85em;">(${e.year})</span>`:``}
                        <span class="stats-divider" style="margin: 0 8px;">|</span>
                        <span style="opacity: 0.6; font-size: 0.85em;">Owned: <strong style="color: #fff;">${l}</strong>/<strong style="color: #fff;">${s}</strong></span>
                    </label>
                    <button type="button" class="panel-toggle${o?` open`:``}" aria-expanded="${o}">V</button>
                </div>
                <div class="collection-heroes-list">
                    ${a}
                </div>
            </div>
        `}).join(``)}function pn(){let e=B();e.charNameInput&&(e.charNameInput.value=``),e.charSlugInput&&(e.charSlugInput.value=``),e.groupSelect&&(e.groupSelect.value=``),e.charComplexitySelect&&(e.charComplexitySelect.value=``),e.formTitle&&(e.formTitle.innerText=`Add New Hero`),e.heroForm&&e.addHeroBtn&&(e.heroForm.classList.add(`hidden`),e.addHeroBtn.innerText=`Add Hero`)}function mn(){let e=B();if(!e.heroForm||!e.addHeroBtn)return;let t=e.heroForm.classList.toggle(`hidden`);e.addHeroBtn.innerText=t?`Add Hero`:`Hide Hero Form`,!t&&e.charNameInput&&e.charNameInput.focus()}function hn(){let e=B();if(!e.groupSelect)return;let t=w(`groups`).map(e=>`<option value="${e.id}">${e.name}</option>`).join(``);e.groupSelect.innerHTML=`<option value="">-- Select Group --</option>`+t}function gn(){let e=B();if(!e.groupsListContainer)return;let t=w(`groups`);if(t.length===0){e.groupsListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No groups yet. Create one above.</p>`;return}let n=t.map(e=>`
        <div id="groupRow-${e.id}" class="group-row" style="margin: 5px 0; background: rgba(255,255,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                <div>
                    <strong>${Y(e.name)}</strong>
                    ${e.year?` <span style="opacity: 0.6;">(${e.year})</span>`:``}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-save btn-inline" data-action="edit-group" data-group-id="${e.id}">Edit</button>
                    <button type="button" class="btn-cancel btn-inline" data-action="delete-group" data-group-id="${e.id}">Delete</button>
                </div>
            </div>
            <div id="groupEditPanel-${e.id}" class="group-edit-panel hidden">
                <div class="form-grid">
                    <input type="text" id="groupName-${e.id}" placeholder="Group Name" value="${Y(e.name)}">
                    <input type="number" id="groupOrder-${e.id}" placeholder="Order Index" value="${e.order_index??``}">
                    <input type="number" id="groupYear-${e.id}" placeholder="Release Year" value="${e.year??``}">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn-save" data-action="save-group-inline" data-group-id="${e.id}">Save</button>
                    <button type="button" class="btn-cancel" data-action="cancel-group-edit" data-group-id="${e.id}">Cancel</button>
                </div>
            </div>
        </div>
    `).join(``);e.groupsListContainer.innerHTML=n}function _n(){let e=B();if(!e.heroesListContainer)return;let t=w(`characters`),n=w(`editIndex`),r=w(`groups`);if(t.length===0){e.heroesListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No heroes yet. Add one above.</p>`;return}let i=t.map((e,t)=>{let i=n===t,a=G()?`<button class="btn-save btn-inline" data-action="edit-hero" data-hero-idx="${t}">Edit</button>`:``,o=G()?`<button class="btn-cancel btn-inline" data-action="delete-hero" data-hero-id="${e.id}">Delete</button>`:``,s=r.map(t=>`<option value="${t.id}" ${t.id===e.group_id?`selected`:``}>${Y(t.name)}</option>`).join(``);return`
            <div id="heroRow-${e.id}" class="group-row hero-admin-row${i?` editing`:``}">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div>
                        <strong>${Y(e.name)}</strong>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${a}
                        ${o}
                    </div>
                </div>
                <div id="heroEditPanel-${e.id}" class="group-edit-panel${i?``:` hidden`}">
                    <div class="form-grid">
                        <input type="text" id="heroName-${t}" placeholder="Hero Name" value="${Y(e.name)}">
                        <select id="heroGroup-${t}">
                            <option value="">-- Select Group --</option>
                            ${s}
                        </select>
                    </div>
                    <div class="form-grid">
                        <input type="text" id="heroSlug-${t}" placeholder="Slug (for image)" value="${Y(e.slug)}">
                        <select id="heroComplexity-${t}">
                            <option value="">-- Complexity --</option>
                            ${[1,2,3,4,5,6].map(t=>`<option value="${t}" ${e.complexity==t?`selected`:``}>${t}</option>`).join(``)}
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-save" data-action="save-hero-inline" data-hero-id="${e.id}" data-hero-idx="${t}">Save</button>
                        <button class="btn-cancel" data-action="cancel-hero-edit">Cancel</button>
                    </div>
                </div>
            </div>`}).join(``);e.heroesListContainer.innerHTML=i,n===-1?e.heroesListContainer.classList.remove(`group-edit-active`):e.heroesListContainer.classList.add(`group-edit-active`)}function vn(e){let t=document.getElementById(`groupEditPanel-${e}`),n=document.getElementById(`groupRow-${e}`);t&&t.classList.add(`hidden`),n&&n.classList.remove(`editing`);let r=B().groupsListContainer;r&&(r.querySelectorAll(`.group-row.editing`).length>0||r.classList.remove(`group-edit-active`))}function yn(){let e=document.getElementById(`groupName`),t=document.getElementById(`groupOrder`),n=document.getElementById(`groupYear`);e&&(e.value=``),t&&(t.value=``),n&&(n.value=``);let r=B().groupForm,i=B().addGroupBtn;r&&i&&(r.classList.add(`hidden`),i.innerText=`Add Group`)}function bn(){let e=B().groupForm,t=B().addGroupBtn;if(!e||!t)return;let n=e.classList.toggle(`hidden`);if(t.innerText=n?`Add Group`:`Hide Group Form`,!n){let e=document.getElementById(`groupName`);e&&e.focus()}}function xn(){let e=B();if(!e.playersListContainer)return;let t=w(`players`);if(t.length===0){e.playersListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No players loaded.</p>`;return}let n=t.map((e,t)=>{let n=br(e);return`
            <div id="playerRow-${e.id}" class="group-row player-admin-row">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: ${n}; border: 1px solid rgba(255,255,255,0.2);"></span>
                        <strong>${Y(e.name)}</strong>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label class="color-picker-button" title="Choose player color">
                            <span>🎨</span>
                            <input type="color" id="playerColor-${e.id}" value="${n}" data-action="player-color-change" data-player-id="${e.id}">
                        </label>
                        <button class="btn-save btn-inline" data-action="edit-player" data-player-id="${e.id}">Edit</button>
                    </div>
                </div>
                <div id="playerEditPanel-${e.id}" class="group-edit-panel hidden">
                    <div class="form-grid">
                        <input type="text" id="playerName-${e.id}" placeholder="Player Name" value="${Y(e.name)}">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-save" data-action="save-player-inline" data-player-id="${e.id}">Save</button>
                        <button class="btn-cancel" data-action="cancel-player-edit" data-player-id="${e.id}">Cancel</button>
                    </div>
                </div>
            </div>`}).join(``);e.playersListContainer.innerHTML=n}function Sn(e){let t=document.getElementById(`playerEditPanel-${e}`),n=document.getElementById(`playerRow-${e}`);t&&t.classList.add(`hidden`),n&&n.classList.remove(`editing`);let r=B().playersListContainer;r&&(r.querySelectorAll(`.player-admin-row.editing`).length>0||r.classList.remove(`player-edit-active`))}function Cn(){let e=B();if(!e.usersListContainer)return;let t=w(`authUsers`);if(t.length===0){e.usersListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No system users loaded.</p>`;return}let n=t.map(e=>{let t=e.role||`user`,n=t===`admin`;return`
            <div class="user-row" style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div>
                    <div><strong>${Y(e.email||`No Email`)}</strong></div>
                    <div style="font-size: 0.8em; opacity: 0.6;">Role: ${t.toUpperCase()}</div>
                </div>
                <div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${n?`checked`:``} data-action="user-role-change" data-user-id="${e.id}">
                        <span class="toggle-slider"></span>
                    </label>
                    <span style="font-size: 0.75rem; opacity: 0.7; margin-left: 5px;">Admin</span>
                </div>
            </div>`}).join(``);e.usersListContainer.innerHTML=n}function wn(e,t){let n=B();if(!n.collectionsListContainer)return;if(e.length===0){n.collectionsListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No collections loaded.</p>`;return}let r=w(`characters`),i={};t.forEach(e=>{i[`${e.user_id}_${e.hero_id}`]=e.is_owned});let a=document.createElement(`div`);a.style.overflowX=`auto`,a.style.marginTop=`10px`,a.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr>
                    <th style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">Hero</th>
                    ${e.map(e=>`<th style="padding: 10px; font-weight: 600; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">${Y(e.name)}</th>`).join(``)}
                </tr>
            </thead>
            <tbody>
                ${r.map(t=>{let n=e.map(e=>`
                        <td style="padding: 8px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <input 
                                type="checkbox" 
                                ${i[`${e.user_id}_${t.id}`]===!1?``:`checked`} 
                                data-action="toggle-user-hero-owned" data-user-id="${e.user_id}" data-hero-id="${t.id}"
                                style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--accent);"
                            >
                        </td>
                    `).join(``);return`
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 500; font-size: 0.9rem;">
                        ${Y(t.name)}
                    </td>
                    ${n}
                </tr>
            `}).join(``)}
            </tbody>
        </table>
    `,n.collectionsListContainer.innerHTML=``,n.collectionsListContainer.appendChild(a)}function Tn(e){let t=B(),n=w(`games`);w(`players`);let r=w(`NAMES`);if(!t.winnerModal||!t.winnerContainer||!t.confirmWinnerBtn)return;let i=n.find(t=>t.id===e);if(!i)return;t.confirmWinnerBtn.setAttribute(`data-game-id`,e),t.confirmWinnerBtn.disabled=!0;let a=i.game_players.filter(e=>e.is_winner===!0),o=i.game_players.filter(e=>e.is_winner===!1),s=a.length===0&&o.length>0&&o.length===i.game_players.length,c=`<div class="${i.game_players.length>3?`winner-select-grid two-rows`:`winner-select-grid`}">`;i.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1,n=e.heroes?.name||`Unknown`,i=e.heroes?.slug||``,a=e.is_winner===!0,o=a?`checked`:``,s=a?`selected`:``,l=r[t]||`Invitee`;t>=4&&(l=`Invitee (${e.player_id===`p5`?`1`:`2`})`),c+=`
            <div class="winner-card ${s}" data-action="winner-card-click" data-value="${e.player_id}">
                <input type="radio" name="winner-selection" value="${e.player_id}" ${o} style="display: none;">
                <img src="${K(i)}" class="winner-card-img" alt="${n}">
                <div class="winner-card-player-name">${l}</div>
                <div class="winner-card-hero-name">${n}</div>
            </div>
        `}),c+=`
            <div class="winner-draw-card ${s?`selected`:``}" data-action="winner-card-click" data-value="draw">
                <input type="radio" name="winner-selection" value="draw" ${s?`checked`:``} style="display: none;">
                <span style="font-size: 1.5rem; line-height: 1;">🤝</span>
                <div style="text-align: left;">
                    <div class="winner-card-player-name" style="font-size: 0.9rem;">Select a Draw</div>
                    <div class="winner-card-hero-name" style="font-size: 0.7rem; opacity: 0.7;">No winner for this match</div>
                </div>
            </div>
        </div>
    `,t.winnerContainer.innerHTML=c,t.winnerModal.style.display=`flex`,document.body.style.overflow=`hidden`}function En(){let e=B();e.winnerModal&&(e.winnerModal.style.display=`none`),document.body.style.overflow=`auto`}function Dn(){let e=B();if(!e.gamesListContainer)return;let t=w(`games`);w(`players`);let n=w(`NAMES`),r=w(`expandedGameIds`),i=w(`selectedGamePlayerIndex`),a=w(`gamesWinnerOnly`),o=w(`gamesUseHistorical`),s=w(`gamesHistoryStyle`)||`gorgeous`,c=document.getElementById(`games-search`),l=c?c.value.toLowerCase().trim():``,u=s===`gorgeous`,d=e=>{let n=document.getElementById(`game-count-stats`);n&&(n.innerText=`Showing ${e} of ${t?t.filter(e=>u?!e.is_historical:o||!e.is_historical).length:0} games`)},f=``;if(G()&&(f=`
            <div class="admin-view-toggle-row" style="display: flex; justify-content: flex-end; margin-bottom: 15px; padding: 0 5px;">
                <button type="button" class="btn-save btn-inline" data-action="toggle-history-view-style" style="font-size: 0.85em; padding: 6px 12px; height: auto;">
                    ${u?`Switch to Admin List View`:`Switch to Gorgeous View`}
                </button>
            </div>
        `),!t||t.length===0){e.gamesListContainer.innerHTML=f+`<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No games played yet.</p>`,d(0);return}let p=t.filter(e=>{if(u&&e.is_historical||!u&&!o&&e.is_historical)return!1;let t=!0;return i!==null&&(t=e.game_players.some(e=>{let t=parseInt(e.player_id.substring(1))-1,n=!1;return i>=0&&i<4?n=t===i:i===4&&(n=t===4||t===5),n&&a?e.is_winner===!0:n})),!(!t||l&&!(e.game_players||[]).map(e=>e.heroes?.name||``).join(` `).toLowerCase().includes(l))});if(p.length===0){e.gamesListContainer.innerHTML=f+`<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No matches found matching filter criteria.</p>`,d(0);return}d(p.length),u?e.gamesListContainer.innerHTML=f+p.map(e=>{let a=e.played_at||``;a&&!a.includes(`T`)&&(a=a.replace(` `,`T`)),a&&!a.includes(`Z`)&&!a.includes(`+`)&&(a+=`Z`);let o=new Date(a).toLocaleString(void 0,{dateStyle:`medium`,timeStyle:`short`}),s=e.game_players.filter(e=>e.is_winner===!0),c=e.game_players.filter(e=>e.is_winner===!1),u=s.length===0&&c.length>0&&c.length===e.game_players.length,d=s.length===0&&!u,f=r.has(e.id)?`expanded`:``,p=``;s.length>0&&s[0].heroes?.slug&&(p=`<img src="${K(s[0].heroes.slug)}" class="game-card-bg-img" alt="">`);let m={};e.game_players.forEach(e=>{let t=n[parseInt(e.player_id.substring(1))-1]||`Unknown`;t.toLowerCase().startsWith(`player `)&&t.length>7&&(t=`P`+t.substring(7)),m[e.player_id]=t});let h=Object.values(m).map(e=>e.charAt(0).toUpperCase()),g={};e.game_players.forEach(e=>{let t=m[e.player_id],n=t.charAt(0).toUpperCase(),r=h.filter(e=>e===n).length,i=n;r>1&&t.length>1&&(i=n+t.charAt(1).toLowerCase()),g[e.player_id]=i});let _=[...e.game_players].sort((e,t)=>e.is_winner&&!t.is_winner?-1:!e.is_winner&&t.is_winner?1:0).map(e=>{let t=parseInt(e.player_id.substring(1))-1,n=e.heroes?.slug||``,r=e.heroes?.name||`Unknown`,i=e.is_winner===!0,a=i?`winner-highlight`:``,o=i?`<span class="mini-winner-trophy">🏆</span>`:``,s=g[e.player_id];return`
                            <a href="${q(n)}" target="_blank" class="mini-portrait-wrapper ${a}" title="${r}">
                                ${o}
                                <img src="${K(n)}" class="mini-portrait-img" alt="${r}">
                                <div class="mini-portrait-pill" style="background-color: var(--p${t+1});">${s}</div>
                            </a>
                        `}).join(``),v=d?`<span class="game-card-status-badge">In Progress</span>`:``,ee=u?`<div class="player-plate-draw-badge">DRAW</div>`:``,te=`
                <div class="game-card-header" data-action="toggle-game-expansion" data-game-id="${e.id}">
                    <div class="game-card-title-group">
                        <span class="game-card-date">${o}</span>
                        ${v}
                    </div>
                    <div class="game-card-collapsed-summary">
                        <div class="mini-portrait-strip">
                            ${_}
                            ${ee}
                        </div>
                        <span class="chevron-icon">▼</span>
                    </div>
                </div>`,y=G()||e.last_updated_by===w(`currentUser`)?.id?`
                    <div class="game-card-actions">
                        <button class="btn-game-action" data-action="select-winner" data-game-id="${e.id}" title="Select Winner">🏆</button>
                        <button class="btn-game-action delete" data-action="delete-game" data-game-id="${e.id}" title="Delete Game">🗑️</button>
                    </div>
                `:``,ne=e.game_players.map(e=>{let r=parseInt(e.player_id.substring(1))-1,a=e.heroes?.name||`Unknown`,o=e.heroes?.slug||``,c=!!(l&&a.toLowerCase().includes(l)),f=!1;i!==null&&(i>=0&&i<4?f=r===i:i===4&&(f=r===4||r===5));let p=`draw`;p=s.length>0?e.is_winner?`winner`:`loser`:u?`draw`:d?`in-progress`:e.is_winner===!1?`loser`:`draw`;let m=``;(c||f)&&(m=`box-shadow: 0 0 8px var(--accent), 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);`);let h=e.is_winner?`<div class="player-plate-trophy">🏆</div>`:``,g=u?`<div class="player-plate-draw-badge">DRAW</div>`:``,_=``;if(e.is_winner){let n=0,r=0,i=w(`gamesUseHistorical`);t.forEach(t=>{!i&&t.is_historical||t.game_players.forEach(t=>{t.player_id===e.player_id&&t.hero_id===e.hero_id&&(n++,t.is_winner&&r++)})});let a=n>0?(r/n).toFixed(3):`.000`,o=a.startsWith(`0`)?a.substring(1):a;_=`
                                <div class="player-plate-winner-stats">${r}🏆 / ${n}🎲</div>
                                <div class="player-plate-winner-pct">( ${o})</div>
                            `}return`
                        <a href="${q(o)}" target="_blank" class="player-plate ${p}" style="${m}">
                            <img src="${K(o)}" class="player-plate-bg-art" alt="${a}">
                            <div class="player-plate-overlay"></div>
                            ${h}
                            ${g}
                            <div class="player-plate-tag" style="background-color: var(--p${r+1});">${n[r]}</div>
                            <div class="player-plate-info">
                                <div class="player-plate-hero-name">${a}</div>
                                ${_}
                            </div>
                        </a>`}).join(``);return`
                <div class="game-history-card ${f}">
                    ${p}
                    ${te}
                    <div class="game-card-body">
                        <div class="player-responsive-grid">
                            ${ne}
                        </div>
                        ${y}
                    </div>
                </div>`}).join(``):e.gamesListContainer.innerHTML=f+p.map(e=>{let t=r.has(e.id),i=new Date(e.played_at).toLocaleDateString(void 0,{month:`short`,day:`numeric`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}),a=``,o=``,s=e.game_players.filter(e=>e.is_winner===!0),c=e.game_players.filter(e=>e.is_winner===!1),u=s.length===0&&c.length===e.game_players.length,d=s.length===0&&!u;a=u?`<span style="color: var(--accent); font-weight: bold;">TIE</span>`:d?`<span style="opacity: 0.5; font-style: italic; font-size: 0.85em;">Pending...</span>`:s.map(e=>{let t=parseInt(e.player_id.substring(1))-1,r=n[t]||`Invitee`;return t>=4&&(r=`Invitee (${e.player_id===`p5`?`1`:`2`})`),`<span style="color: var(--p${t+1}); font-weight: bold;">${r}</span>`}).join(`, `),e.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1,r=`--p${t+1}`,i=n[t]||`Invitee`;t>=4&&(r=`--p5`,i=`Invitee (${e.player_id===`p5`?`1`:`2`})`);let a=``;a=e.is_winner===!0?`<span class="status-badge-win">WIN</span>`:e.is_winner===!1?`<span class="status-badge-lose">LOSS</span>`:`<span class="status-badge-pending">...</span>`;let s=!!(l&&e.heroes?.name?.toLowerCase().includes(l));o+=`
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.03);${s?` border: 1px solid var(--accent); padding: 6px; border-radius: 4px;`:``}">
                            <span style="color: var(${r}); font-weight: bold;">${i}</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 0.9em; ${s?`color: var(--accent); font-weight: bold;`:`opacity: 0.8;`}">${e.heroes?.name||`Unknown`}</span>
                                ${a}
                            </div>
                        </div>
                    `});let f=vr()&&d?`<button type="button" class="btn-save btn-inline" data-action="open-winner-modal" data-game-id="${e.id}">Select Winner</button>`:``,p=G()?`<button type="button" class="btn-cancel btn-inline" data-action="delete-game" data-game-id="${e.id}">Delete</button>`:``,m=e.is_historical?`<span style="font-size: 0.7em; letter-spacing: 0.5px; opacity: 0.5; padding: 2px 6px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; font-weight: 500; font-family: monospace;">HISTORICAL</span>`:``;return`
                <div id="gameCard-${e.id}" class="game-history-card${t?` expanded`:``}" style="border: 1px solid rgba(255,255,255,0.08); margin: 10px 0; border-radius: 8px; background: rgba(0,0,0,0.15);">
                    <div class="game-card-summary-header" data-action="toggle-game-expansion" data-game-id="${e.id}" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 12px 15px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span style="font-size: 0.8em; opacity: 0.6;">${i} ${m}</span>
                            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.95em;">
                                <strong>Winner:</strong>
                                ${a}
                            </div>
                        </div>
                        <button type="button" class="panel-toggle${t?` open`:``}">V</button>
                    </div>
                    <div class="game-card-expansion-content${t?``:` hidden`}" style="padding: 0 15px 15px 15px; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.03);">
                        <div style="margin: 10px 0;">
                            ${o}
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                            ${f}
                            ${p}
                        </div>
                    </div>
                </div>`}).join(``)}function On(){rn()}function kn(){an()}function An(){on()}function jn(e){sn(e),localStorage.setItem(`lastSeenVersion`,e.version)}function Mn(){cn()}function V(e){ln(e)}function Nn(e,t){un(e,t)}function Pn(e){dn(e)}function Fn(e,t){t.target.tagName===`INPUT`||t.target.tagName===`LABEL`||t.target.closest(`label`)||(E(`expandedCollectionGroups`,`toggle`,e),H())}function In(e){let t=document.getElementById(`db-show-owned`),n=document.getElementById(`db-show-not-owned`);t&&n&&(e===`owned`?(t.checked=!0,n.checked=!1):e===`unowned`?(t.checked=!1,n.checked=!0):(t.checked=!0,n.checked=!0)),z()}function H(){fn()}async function Ln(e,t){if(!w(`currentUser`)){alert(`Please log in to manage your collection.`);return}let n=w(`characters`).find(t=>t.id===e);n&&(n.is_owned=t),H(),z(),j();let r=document.getElementById(`admin-owned-${w(`currentUser`).id}-${e}`);r&&(r.checked=t);let{error:i}=await y(w(`currentUser`).id,e,t);i&&(alert(`Error updating ownership: `+i.message),n&&(n.is_owned=!t),H(),j(),z(),r&&(r.checked=!t))}async function Rn(e,t){if(!w(`currentUser`)){alert(`Please log in to manage your collection.`);return}let n=w(`characters`);n.forEach(n=>{if(n.group_id===e){n.is_owned=t;let e=document.getElementById(`admin-owned-${w(`currentUser`).id}-${n.id}`);e&&(e.checked=t)}}),H(),z(),j();let{error:r}=await ne(n.filter(t=>t.group_id===e).map(e=>({user_id:w(`currentUser`).id,hero_id:e.id,is_owned:t})));r&&(alert(`Error updating group ownership: `+r.message),n.forEach(n=>{n.group_id===e&&(n.is_owned=!t)}),H(),j(),z())}async function zn(){let e=document.getElementById(`charName`).value.trim(),t=document.getElementById(`charGroup`).value,n=document.getElementById(`charSlug`).value.trim(),r=document.getElementById(`charComplexity`).value.trim();if(!e)return alert(`Name is required`);if(!t)return alert(`Group is required`);let{error:i}=await re({name:e,slug:n,complexity:r?parseInt(r):null,group_id:t,last_updated_by:w(`currentUser`).id});if(i)return alert(`Error saving: `+i.message);await $(),Hn()}function Bn(e){T(`editIndex`,e),U(),document.getElementById(`adminSection`).classList.contains(`hidden`)&&V(`admin`);let t=w(`characters`),n=document.getElementById(`heroEditPanel-${t[e]?.id}`);n&&!Vn(n)&&n.scrollIntoView({behavior:`smooth`,block:`nearest`})}function Vn(e){let t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)}function Hn(){T(`editIndex`,-1),pn()}function Un(){mn()}function Wn(){hn()}function Gn(){gn()}function U(){_n()}function Kn(){T(`editIndex`,-1),U()}async function qn(e,t){let n=document.getElementById(`heroName-${t}`).value.trim(),r=document.getElementById(`heroGroup-${t}`).value,i=document.getElementById(`heroSlug-${t}`).value.trim(),a=document.getElementById(`heroComplexity-${t}`).value.trim();if(!n)return alert(`Name is required`);if(!r)return alert(`Group is required`);let{error:o}=await ie({id:e,name:n,slug:i,complexity:a?parseInt(a):null,group_id:r,last_updated_by:w(`currentUser`).id});if(o)return alert(`Error saving: `+o.message);T(`editIndex`,-1),await $()}async function Jn(e){if(!await D(`Delete Hero`,`Delete this hero? This action cannot be undone.`))return;let{error:t}=await b(e);if(t)return alert(`Error deleting hero: `+t.message);await $()}async function Yn(){let e=document.getElementById(`groupName`).value.trim(),t=document.getElementById(`groupOrder`).value.trim(),n=document.getElementById(`groupYear`).value.trim();if(!e)return alert(`Group name is required`);let{error:r}=await x({name:e,order_index:t?parseInt(t):null,year:n?parseInt(n):null,is_active:!0});if(r)return alert(`Error saving group: `+r.message);$n(),$()}function Xn(e){let t=w(`groups`).find(t=>t.id===e);if(!t)return;let n=document.getElementById(`groupsListContainer`);n&&(n.classList.add(`group-edit-active`),n.querySelectorAll(`.group-row`).forEach(e=>e.classList.remove(`editing`)));let r=document.getElementById(`groupEditPanel-${e}`),i=document.getElementById(`groupRow-${e}`);!r||!i||(i.classList.add(`editing`),document.getElementById(`groupName-${e}`).value=t.name,document.getElementById(`groupOrder-${e}`).value=t.order_index||``,document.getElementById(`groupYear-${e}`).value=t.year||``,r.classList.remove(`hidden`))}function Zn(e){vn(e)}async function Qn(e){let t=document.getElementById(`groupName-${e}`).value.trim(),n=document.getElementById(`groupOrder-${e}`).value.trim(),r=document.getElementById(`groupYear-${e}`).value.trim();if(!t)return alert(`Group name is required`);let{error:i}=await x({id:e,name:t,order_index:n?parseInt(n):null,year:r?parseInt(r):null,is_active:!0});if(i)return alert(`Error saving group: `+i.message);$()}function $n(){yn()}function er(){bn()}function tr(){xn()}function nr(e){let t=w(`players`).find(t=>t.id===e);if(!t)return;let n=document.getElementById(`playersListContainer`);n&&(n.classList.add(`player-edit-active`),n.querySelectorAll(`.player-admin-row`).forEach(e=>e.classList.remove(`editing`)));let r=document.getElementById(`playerEditPanel-${e}`),i=document.getElementById(`playerRow-${e}`);!r||!i||(i.classList.add(`editing`),document.getElementById(`playerName-${e}`).value=t.name,r.classList.remove(`hidden`))}function rr(e){Sn(e)}async function ir(e){let t=document.getElementById(`playerName-${e}`).value.trim();if(!t)return alert(`Player name is required`);let{error:n}=await te(e,t);if(n)return alert(`Error saving player: `+n.message);let r=w(`players`),i=w(`NAMES`),a=r.findIndex(t=>t.id===e);a!==-1&&(r[a].name=t,i[a]=t),rr(e),tr()}function ar(){Cn()}async function or(){let e=document.getElementById(`collectionsListContainer`);if(!e)return;e.innerHTML=`<p style="opacity: 0.7; font-style: italic; padding: 10px;">Loading collections...</p>`;let t=[];try{let{data:n,error:r}=await v();if(r){e.innerHTML=`<p style="color: var(--danger); padding: 10px;">Error loading collections: ${Y(r.message)}</p>`;return}t=n||[]}catch(t){e.innerHTML=`<p style="color: var(--danger); padding: 10px;">Error connecting to database: ${Y(t.message)}</p>`;return}let n=[],r=w(`players`);r.forEach(e=>{e.user_id&&n.push({user_id:e.user_id,name:e.name,isLinked:!0})}),t.forEach(e=>{n.some(t=>t.user_id===e.user_id)||n.push({user_id:e.user_id,name:`User (${e.user_id.substring(0,8)})`,isLinked:!1})});let i=w(`currentUser`);if(i&&!n.some(e=>e.user_id===i.id)){let e=r.find(e=>e.user_id===i.id),t=e?e.name:i.email?i.email.split(`@`)[0]:`Admin`;n.push({user_id:i.id,name:t,isLinked:!!e})}wn(n,t)}async function sr(e,t,n){let r=w(`currentUser`);if(e===r?.id){let e=w(`characters`).find(e=>e.id===t);e&&(e.is_owned=n),H(),z(),j()}let{error:i}=await y(e,t,n);if(i){if(alert(`Error updating user collection: `+i.message),e===r?.id){let e=w(`characters`).find(e=>e.id===t);e&&(e.is_owned=!n),H(),z(),j()}or()}}async function cr(e){if(!await D(`Delete Group`,`Delete this group?`))return;let{error:t}=await ae(e);if(t)return alert(`Error deleting group: `+t.message);$n(),$()}function W(){Dn()}function lr(){let e=document.getElementById(`games-search`),t=document.getElementById(`clear-games-search`);e&&t&&t.classList.toggle(`hidden`,e.value.trim().length===0),W()}function ur(){let e=document.getElementById(`games-search`);e&&(e.value=``,e.focus()),lr()}function dr(e){E(`expandedGameIds`,`toggle`,e),W()}function fr(){T(`gamesHistoryStyle`,(w(`gamesHistoryStyle`)||`gorgeous`)===`gorgeous`?`admin`:`gorgeous`),W()}function pr(e){Tn(e)}function mr(){En()}async function hr(e){let t=document.querySelector(`input[name="winner-selection"]:checked`);if(!t)return alert(`Please select a winner.`);let n=t.value,r=document.getElementById(`confirm-winner-btn`);r.disabled=!0,r.innerText=`Saving...`;try{let{error:t}=await ce(e,n,w(`currentUser`).id);if(t)throw t;mr(),await $()}catch(e){alert(`Error updating winner: `+e.message)}finally{r.disabled=!1,r.innerText=`Save Result`}}async function gr(e){if(!await D(`Delete Game Record`,`Are you sure you want to delete this game record? This cannot be undone.`))return;let{error:t}=await le(e);if(t)return console.error(`Error deleting game:`,t),alert(`Failed to delete game: `+t.message);await $()}function _r(){let e=!0,t=!0,n=w(`activeFilterDataHistories`),r=n.has(`Normal only`),i=n.has(`Historical only`);r&&!i?(e=!0,t=!1):i&&!r&&(e=!1,t=!0);let a=w(`characters`);a.forEach(e=>{e.playCount=[0,0,0,0],e.lastPlayed=[`Never`,`Never`,`Never`,`Never`],e.winCount=[0,0,0,0]});let o=w(`games`);o&&o.forEach(n=>{let r=!!n.is_historical;r&&!t||!r&&!e||n.game_players.forEach(e=>{let t=parseInt(e.player_id?.substring(1)||`0`,10)-1;if(t>=0&&t<4){let r=a.find(t=>t.id===e.hero_id);if(!r)return;if(r.playCount[t]++,e.is_winner&&r.winCount[t]++,r.lastPlayed[t]===`Never`){let e=n.played_at||``;e&&!e.includes(`T`)&&(e=e.replace(` `,`T`)),e&&!e.includes(`Z`)&&!e.includes(`+`)&&(e+=`Z`);let i=new Date(e);r.lastPlayed[t]=i.getFullYear()<2026?`Unknown`:i.toLocaleDateString(`en-CA`)}}})})}window.alert=function(e){he(e,e&&(e.toLowerCase().includes(`error`)||e.toLowerCase().includes(`failed`))?`error`:`warning`)};function G(){return w(`currentUser`)?.app_metadata?.role===`admin`}function vr(){return!!w(`currentUser`)}var K=e=>e?`https://dice-throne.rulepop.com/heroes/${e}.webp`:``,q=e=>`https://dice-throne.rulepop.com/#hero/${e}`,J=e=>!!e?.is_owned,Y=e=>String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),yr=e=>{if(!e)return`#ffffff`;if(e=e.trim(),e.startsWith(`#`))return e;let t=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(t){let e=parseInt(t[1],10),n=parseInt(t[2],10),r=parseInt(t[3],10);return`#${(1<<24|e<<16|n<<8|r).toString(16).slice(1)}`}return e},br=e=>e?.player_color?yr(e.player_color):yr(getComputedStyle(document.documentElement).getPropertyValue(`--${e?.id}`).trim()),xr=(e,t)=>{document.documentElement.style.setProperty(`--${e}`,t)};function X(e,t){return e.weights[t]/(e.playCount[t]*3+1)**2}function Z(e,t){if(!e)return`0.00%`;let n=w(`characters`).filter(J).length;if(n===0)return`0.00%`;if(t>=4)return`${(100/n).toFixed(2)}%`;let r=0;if(w(`characters`).filter(J).forEach(e=>r+=X(e,t)),r===0)return`0.00%`;let i=J(e),a=X(e,t);return`${i?(a/r*100).toFixed(2):`0.00`}%`}async function Sr(e,t){let n=w(`players`).find(t=>t.id===e);if(!n)return;let r=br(n),i=yr(t.value);if(i.toLowerCase()===r.toLowerCase())return;if(!await D(`Change Player Color`,`Change ${n.name}'s color from ${r} to ${i}?`)){t.value=r;return}let{error:a}=await ee(e,i);if(a){alert(`Error saving player color: `+a.message),t.value=r;return}let o=w(`players`).findIndex(t=>t.id===e);o!==-1&&(w(`players`)[o].player_color=i),xr(e,i),tr()}function Cr(e){if(!e)return null;try{let t=e.trim();t&&!t.includes(`T`)&&(t=t.replace(` `,`T`)),t&&t.includes(`:`)&&!t.includes(`Z`)&&!t.includes(`+`)&&(t+=`Z`);let n=new Date(t);return isNaN(n.getTime())?null:n}catch{return null}}function wr(e){if(!e||e===`Never`)return``;if(e===`Unknown`)return`Date unknown (historical)`;let t=Cr(e);if(!t)return``;try{let e=new Date;t.setHours(0,0,0,0),e.setHours(0,0,0,0);let n=e-t,r=Math.floor(n/(1e3*60*60*24));return r<0?``:r===0?`today`:r===1?`yesterday`:`${r} days ago`}catch{return``}}function Tr(e){let t=`⚫`;if(e&&e===`Unknown`)t=`🔴`;else if(e&&e!==`Never`&&e!==`Unknown`){let n=Cr(e);if(n)try{let e=new Date;n.setHours(0,0,0,0),e.setHours(0,0,0,0);let r=e-n,i=Math.floor(r/(1e3*60*60*24));t=i<=15?`🟢`:i<=60?`🟡`:`🔴`}catch{t=`⚪`}else t=`⚪`}return t}var Er=null,Q=()=>(Er||={adminNav:document.querySelector(`.bottom-nav .admin-only`),authBtn:document.getElementById(`auth-btn`),actionButtons:document.getElementById(`action-buttons`),rollBtnContainer:document.getElementById(`rollBtnContainer`),rollBtn:document.getElementById(`rollBtn`),rollDraftBtn:document.getElementById(`rollDraftBtn`),loginModal:document.getElementById(`login-modal`),loginError:document.getElementById(`login-error`),loginEmailInput:document.getElementById(`login-email`),updatePasswordModal:document.getElementById(`update-password-modal`),updatePasswordError:document.getElementById(`update-password-error`),updatePasswordUsername:document.getElementById(`update-password-username`),newPasswordInput:document.getElementById(`new-password`),confirmPasswordInput:document.getElementById(`confirm-password`),playerTogglesContainer:document.getElementById(`player-toggle-zone-top`)},Er);function Dr(){let e=Q(),t=w(`currentUser`),n=w(`loggedInPlayerIndex`),r=w(`NAMES`);if(t){if(n!==-1&&r[n])e.authBtn&&(e.authBtn.innerText=`Logout (${r[n]})`);else{let n=t.email?t.email.split(`@`)[0]:`User`;e.authBtn&&(e.authBtn.innerText=`Logout (${n})`)}e.adminNav&&(e.adminNav.style.display=G()?`flex`:`none`)}else{e.authBtn&&(e.authBtn.innerText=`Login`),e.adminNav&&(e.adminNav.style.display=`none`);let t=document.getElementById(`adminSection`);t&&t.classList.add(`hidden`),e.actionButtons&&(e.actionButtons.style.display=`none`),e.rollBtnContainer&&(e.rollBtnContainer.style.display=`flex`),e.rollBtn&&(e.rollBtn.style.display=`block`),e.rollDraftBtn&&(e.rollDraftBtn.style.display=`block`)}}function Or(){let e=Q(),t=w(`players`);!e.playerTogglesContainer||!t||t.length===0||(e.playerTogglesContainer.innerHTML=t.map((e,t)=>{let n=t<4?`checked`:``;return`
            <label class="player-card" style="--player-color: var(--${e.id})">
                <input type="checkbox" id="use${t}" ${n} data-action="toggle-player-slot" data-player-idx="${t}">
                <span class="player-card-name">${e.name}</span>
            </label>`}).join(``))}function kr(){let e=Q();e.loginModal&&(e.loginModal.style.display=`flex`),e.loginError&&(e.loginError.style.display=`none`),Nr(),document.body.style.overflow=`hidden`}function Ar(){let e=Q();e.loginModal&&(e.loginModal.style.display=`none`),Nr(),document.body.style.overflow=`auto`}function jr(e){let t=Q();t.loginError&&(t.loginError.innerText=e,t.loginError.style.color=`var(--danger)`,t.loginError.style.fontSize=`0.95rem`,t.loginError.style.fontWeight=`600`,t.loginError.style.display=`block`)}function Mr(e){jr(e);let t=Q();t.loginEmailInput&&(t.loginEmailInput.style.borderColor=`var(--danger)`,t.loginEmailInput.style.boxShadow=`0 0 0 2px color-mix(in srgb, var(--danger) 25%, transparent)`)}function Nr(){let e=Q();e.loginEmailInput&&(e.loginEmailInput.style.borderColor=`#ccc`,e.loginEmailInput.style.boxShadow=``)}function Pr(){let e=Q();e.updatePasswordModal&&(e.updatePasswordModal.style.display=`block`),e.updatePasswordError&&(e.updatePasswordError.style.display=`none`),document.body.style.overflow=`hidden`;let t=w(`currentUser`);e.updatePasswordUsername&&t&&(e.updatePasswordUsername.value=t.email||``)}function Fr(){let e=Q();e.updatePasswordModal&&(e.updatePasswordModal.style.display=`none`),document.body.style.overflow=`auto`}function Ir(e){let t=Q();t.updatePasswordError&&(t.updatePasswordError.innerText=e,t.updatePasswordError.style.color=`var(--danger)`,t.updatePasswordError.style.display=`block`)}function Lr(){let e=Q();e.loginError&&(e.loginError.innerText=`Password reset email sent. Please check your inbox.`,e.loginError.style.color=`#4CAF50`,e.loginError.style.fontSize=`0.95rem`,e.loginError.style.fontWeight=`600`,e.loginError.style.display=`block`,setTimeout(()=>{e.loginError&&(e.loginError.style.display=`none`,e.loginError.innerText=``,e.loginError.style.color=`var(--danger)`)},5e3))}function Rr(){let e=Q();e.newPasswordInput&&(e.newPasswordInput.value=``),e.confirmPasswordInput&&(e.confirmPasswordInput.value=``)}var zr=null;function Br(){Dr(),z(),W(),U()}function Vr(){Or()}function Hr(){kr(),zr=e=>{e.key===`Escape`&&Ur()},document.addEventListener(`keydown`,zr)}function Ur(){Ar(),zr&&document.removeEventListener(`keydown`,zr)}async function Wr(){let e=document.getElementById(`login-email`).value,t=document.getElementById(`login-password`).value,{error:n}=await c({email:e,password:t});n&&jr(n.message)}async function Gr(){let e=document.getElementById(`login-email`).value;if(!e){Mr(`Please enter your email address first.`);return}Nr();let{error:t}=await l(e);t?jr(t.message):Lr()}function Kr(){Pr()}function qr(){Fr()}async function Jr(){let e=document.getElementById(`new-password`).value,t=document.getElementById(`confirm-password`).value;if(!e){Ir(`Please enter a new password.`);return}if(e!==t){Ir(`Passwords do not match.`);return}let{error:n}=await u({password:e});n?Ir(n.message):(alert(`Password updated successfully!`),qr(),Rr())}async function Yr(){await D(`Log Out`,`Log out now?`)&&await d()}function Xr(){let e=(e,t)=>{let n=document.getElementById(e);n&&n.addEventListener(`click`,t)};e(`rollBtn`,$e),e(`rollDraftBtn`,et),e(`rollSettingsBtn`,lt),e(`cancelBtn`,ct),e(`confirmBtn`,st),e(`clear-search`,Zt),e(`hero-search-btn`,Qt),e(`btn-trigger-sort`,qt),e(`btn-trigger-filter`,Ot),e(`clear-games-search`,ur),e(`btn-trigger-games-filter`,Dt),document.querySelectorAll(`.bottom-nav .nav-item`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.getAttribute(`data-section`);n&&V(n)})});let t=document.getElementById(`version-number`);t&&t.addEventListener(`click`,kn);let n=document.querySelector(`.close-button`);n&&n.addEventListener(`click`,An),e(`whats-new-close`,Mn),e(`whats-new-got-it`,Mn),e(`winner-close`,mr),e(`winner-cancel`,mr),e(`login-close`,Ur),e(`forgot-password-btn`,Gr),e(`update-password-close`,qr),e(`hero-select-close`,M);let r=document.getElementById(`hero-search`);r&&(r.addEventListener(`keydown`,e=>{e.key===`Enter`&&Qt()}),r.addEventListener(`input`,Xt));let i=document.getElementById(`games-search`);i&&i.addEventListener(`input`,lr);let a=document.getElementById(`hero-select-search`);a&&a.addEventListener(`input`,rt);let o=document.getElementById(`modal-sort-name`);o&&o.addEventListener(`click`,()=>nt(`name`));let s=document.getElementById(`modal-sort-weight`);s&&s.addEventListener(`click`,()=>nt(`weight`));let c=document.getElementById(`sort-filter-drawer`);c&&c.addEventListener(`click`,e=>{F(e)});let l=document.getElementById(`filter-drawer-left`);l&&l.addEventListener(`click`,e=>{let t=e.target.closest(`.segmented-pill[data-filter]`);if(t){let e=t.getAttribute(`data-filter`);e&&kt(e);return}At(e)}),e(`drawer-close`,()=>F(null,!0)),e(`drawer-reset`,Ht),e(`drawer-apply`,Ut),e(`filter-drawer-close-btn`,Nt),e(`filter-drawer-reset`,Mt),e(`filter-drawer-apply`,Nt),e(`addGroupBtn`,er),e(`saveGroupBtn`,Yn);let u=document.getElementById(`cancelGroupBtn`);u&&u.addEventListener(`click`,async()=>{document.getElementById(`groupName`).value&&!await D(`Discard Changes`,`Discard unsaved changes?`)||$n()}),e(`addHeroBtn`,Un),e(`saveBtn`,zn);let d=document.getElementById(`cancelHeroBtn`);d&&d.addEventListener(`click`,async()=>{document.getElementById(`charName`).value&&!await D(`Discard Changes`,`Discard unsaved changes?`)||Hn()}),document.querySelectorAll(`#adminSection .panel-header`).forEach(e=>{e.addEventListener(`click`,t=>{let n=e.getAttribute(`data-panel`);n&&Nn(t,n)})});let f=document.getElementById(`login-form`);f&&f.addEventListener(`submit`,e=>{e.preventDefault(),Wr()});let p=document.getElementById(`update-password-form`);p&&p.addEventListener(`submit`,e=>{e.preventDefault(),Jr()});let m=document.getElementById(`auth-btn`);m&&m.addEventListener(`click`,()=>{w(`currentUser`)?Yr():Hr()});let h=document.getElementById(`confirm-winner-btn`);h&&h.addEventListener(`click`,()=>{let e=h.getAttribute(`data-game-id`);e&&hr(e)});let g=document.getElementById(`sort-dropdown-menu`);g&&g.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="select-sort"]`);t&&Yt(t.getAttribute(`data-sort-key`),t.getAttribute(`data-sort-asc`)===`true`)});let _=document.getElementById(`filter-drawer-left`);_&&_.addEventListener(`change`,e=>{let t=e.target.closest(`input[type="checkbox"][data-type]`);t&&jt(t)});let v=document.getElementById(`drawer-body-content`);v&&(v.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-drawer-player-filter"]`);if(n){zt(parseInt(n.getAttribute(`data-player-idx`),10));return}let r=t.closest(`[data-action="toggle-staged-player-game-filter"]`);if(r){Ft(parseInt(r.getAttribute(`data-player-idx`),10));return}let i=t.closest(`[data-action="set-staged-draft-count"]`);if(i){ft(parseInt(i.getAttribute(`data-count`),10));return}let a=t.closest(`[data-action="switch-roll-settings-tab"]`);if(a){ut(a.getAttribute(`data-tab`));return}let o=t.closest(`[data-action="drawer-sort-player-change"]`);if(o){Rt(parseInt(o.getAttribute(`data-player-idx`),10));return}let s=t.closest(`[data-action="toggle-drawer-level"]`);if(s){if(s.getAttribute(`data-disabled`)===`true`)return;let e=s.getAttribute(`data-level`);Bt(e===`all`?`all`:parseInt(e,10));return}let c=t.closest(`[data-action="toggle-drawer-group"]`);if(c){if(c.getAttribute(`data-disabled`)===`true`)return;Vt(c.getAttribute(`data-group-id`));return}}),v.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-use-historical"]`);if(n){It(n.checked);return}let r=t.closest(`[data-action="toggle-staged-draft-mode"]`);if(r){dt(r.checked);return}let i=t.closest(`[data-action="toggle-staged-winner-only"]`);if(i){Et(i.checked);return}let a=t.closest(`[data-action="drawer-sort-type-change"]`);if(a){Lt(a.value);return}let o=t.closest(`[data-action="toggle-staged-ban"]`);if(o){pt(o.getAttribute(`data-hero-id`));return}}),v.addEventListener(`input`,e=>{let t=e.target.closest(`[data-action="ban-search-input"]`);t&&mt(t.value)}));let ee=document.getElementById(`active-filters-container`);ee&&ee.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-action="clear-search-filter"]`)){en();return}let n=t.closest(`[data-action="remove-filter-chip"]`);if(n){let e=n.getAttribute(`data-type`),t=n.getAttribute(`data-value`);e===`complexity`&&(t=parseInt(t,10)),$t(e,t);return}});let te=document.getElementById(`results`);te&&te.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="open-hero-select"]`);if(n){tt(parseInt(n.getAttribute(`data-player-idx`),10));return}let r=t.closest(`[data-action="select-draft-hero"]`);if(r){Ct(parseInt(r.getAttribute(`data-player-idx`),10),r.getAttribute(`data-hero-name`),r.getAttribute(`data-hero-slug`),r.getAttribute(`data-hero-id`),parseFloat(r.getAttribute(`data-angle`)),parseInt(r.getAttribute(`data-card-idx`),10));return}if(t.closest(`[data-action="cancel-roll"]`)){ct();return}let i=t.closest(`[data-action="rotate-draft"]`);if(i){P(parseInt(i.getAttribute(`data-player-idx`),10),parseInt(i.getAttribute(`data-direction`),10),parseInt(i.getAttribute(`data-draft-count`),10));return}let a=t.closest(`[data-action="confirm-draft"]`);if(a){Tt(parseInt(a.getAttribute(`data-player-idx`),10));return}});let y=document.getElementById(`hero-select-options-container`);y&&y.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="select-hero-option"]`);t&&it(t.getAttribute(`data-hero-name`))});let ne=document.getElementById(`heroContainer`);ne&&ne.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="toggle-hero-panel"]`);if(t){if(e.target.closest(`a`)||e.target.closest(`.complexity-dice-bar`))return;Pn(t)}});let re=document.getElementById(`groupsListContainer`);re&&re.addEventListener(`click`,e=>{let t=e.target,n=t.getAttribute(`data-group-id`);t.closest(`[data-action="edit-group"]`)?Xn(n):t.closest(`[data-action="delete-group"]`)?cr(n):t.closest(`[data-action="save-group-inline"]`)?Qn(n):t.closest(`[data-action="cancel-group-edit"]`)&&Zn(n)});let ie=document.getElementById(`heroesListContainer`);ie&&ie.addEventListener(`click`,e=>{let t=e.target;t.closest(`[data-action="edit-hero"]`)?Bn(parseInt(t.getAttribute(`data-hero-idx`),10)):t.closest(`[data-action="delete-hero"]`)?Jn(t.getAttribute(`data-hero-id`)):t.closest(`[data-action="save-hero-inline"]`)?qn(t.getAttribute(`data-hero-id`),parseInt(t.getAttribute(`data-hero-idx`),10)):t.closest(`[data-action="cancel-hero-edit"]`)&&Kn()});let b=document.getElementById(`playersListContainer`);b&&(b.addEventListener(`click`,e=>{let t=e.target,n=t.getAttribute(`data-player-id`);t.closest(`[data-action="edit-player"]`)?nr(n):t.closest(`[data-action="save-player-inline"]`)?ir(n):t.closest(`[data-action="cancel-player-edit"]`)&&rr(n)}),b.addEventListener(`change`,e=>{let t=e.target.closest(`[data-action="player-color-change"]`);t&&Sr(t.getAttribute(`data-player-id`),t)}));let x=document.getElementById(`usersListContainer`);x&&x.addEventListener(`change`,e=>{e.target.closest(`[data-action="user-role-change"]`)&&(alert(`User roles must be modified directly in the Supabase Dashboard for security reasons.`),ar())});let ae=e=>{e&&(e.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-hero-owned"]`);if(n){Ln(n.getAttribute(`data-hero-id`),n.getAttribute(`data-selected`)!==`true`);return}let r=t.closest(`[data-action="toggle-collection-group"]`);if(r){if(e.target.closest(`input[type="checkbox"]`)||e.target.closest(`label`))return;Fn(r.getAttribute(`data-group-id`),e);return}}),e.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-group-owned"]`);if(n){Rn(n.getAttribute(`data-group-id`),n.checked);return}let r=t.closest(`[data-action="toggle-user-hero-owned"]`);if(r){sr(r.getAttribute(`data-user-id`),r.getAttribute(`data-hero-id`),r.checked);return}}))};ae(document.getElementById(`collectionsListContainer`)),ae(document.getElementById(`collectionContainer`));let oe=document.getElementById(`gamesSection`);oe&&oe.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-action="toggle-history-view-style"]`)){fr();return}let n=t.closest(`[data-action="toggle-game-expansion"]`);if(n){dr(n.getAttribute(`data-game-id`));return}let r=t.closest(`[data-action="select-winner"]`);if(r){pr(r.getAttribute(`data-game-id`));return}let i=t.closest(`[data-action="delete-game"]`);if(i){gr(i.getAttribute(`data-game-id`));return}let a=t.closest(`[data-action="open-winner-modal"]`);if(a){pr(a.getAttribute(`data-game-id`));return}});let S=document.getElementById(`winner-selection-container`);S&&S.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="winner-card-click"]`);if(t){let e=t.querySelector(`input[name="winner-selection"]`);if(e){e.checked=!0,S.querySelectorAll(`.winner-card, .winner-draw-card`).forEach(e=>{e.classList.toggle(`selected`,e===t)});let n=document.getElementById(`confirm-winner-btn`);n&&(n.disabled=!1)}}}),window.addEventListener(`click`,e=>{let t=document.getElementById(`changelog-modal`),n=document.getElementById(`login-modal`),r=document.getElementById(`whats-new-modal`),i=document.getElementById(`update-password-modal`),a=document.getElementById(`hero-select-modal`);e.target===t&&An(),e.target===n&&Ur(),e.target===r&&Mn(),e.target===i&&qr(),e.target===a&&M();let o=document.getElementById(`sort-dropdown-menu`),s=document.getElementById(`sort-dropdown-container`);o&&o.classList.contains(`show`)&&s&&!s.contains(e.target)&&Jt()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&M()})}async function $(){T(`draftModeEnabled`,localStorage.getItem(`draftModeEnabled`)===`true`);let e=parseInt(localStorage.getItem(`draftCount`)||`3`,10);e!==2&&e!==3&&(e=3),T(`draftCount`,e);let t=localStorage.getItem(`bannedHeroIds`);T(`bannedHeroIds`,t?new Set(JSON.parse(t)):new Set),ht();let{data:n,error:r}=await m();if(!r&&n){T(`groups`,n),Wn(),Gn();let e=new Set(n.map(e=>e.id));if(w(`activeGroups`).size===0)n.forEach(e=>E(`activeGroups`,`add`,e.id));else for(let t of w(`activeGroups`))e.has(t)||E(`activeGroups`,`delete`,t);L(),R()}let{data:i,error:a}=await h();if(!a&&i){T(`players`,i),i.forEach(e=>{e.player_color&&xr(e.id,yr(e.player_color))});let e=i.map(e=>e.name),t=-1,n=w(`currentUser`);i.forEach((r,i)=>{i<6&&(e[i]=r.name,n&&r.user_id===n.id&&(t=i))}),T(`NAMES`,e),T(`loggedInPlayerIndex`,t),Br(),Vr()}let{data:o,error:s}=await g();if(s)return console.error(`Error fetching heroes:`,s);T(`characters`,o.map(e=>{let t=e.user_heroes?.find(e=>e.user_id===w(`currentUser`)?.id),n=t?t.is_owned:!0,r={id:e.id,name:e.name,slug:e.slug,complexity:e.complexity,group_id:e.group_id,is_owned:n,group:e.groups?.name||`Unknown`,weights:[,,,,].fill(250),playCount:[,,,,].fill(0),lastPlayed:[,,,,].fill(`Never`),winCount:[,,,,].fill(0)};return e.player_hero_stats?.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1;t>=0&&t<4&&(r.weights[t]=e.weight)}),r}));let{data:c,error:l}=await _();l?console.error(`Error fetching games:`,l):T(`games`,c.map(e=>({...e,game_players:(e.game_players||[]).slice().sort((e,t)=>parseInt(e.player_id?.substring(1)||`0`,10)-parseInt(t.player_id?.substring(1)||`0`,10))}))),On(),Gn(),W(),U(),tr(),ar(),G()&&or(),H();let u=w(`currentSort`);T(`currentSort`,null),Gt(u)}async function Zr(){try{let{data:{session:e}}=await f();T(`currentUser`,e?.user||null),Br(),await $(),T(`cachedChangelog`,await(await fetch(`changelog.json`)).json());let t=w(`cachedChangelog`);if(t&&t.length>0){let e=t[0],n=document.getElementById(`version-number`);n&&(n.innerText=e.version),localStorage.getItem(`lastSeenVersion`)!==e.version&&jn(e)}ue($),fe((e,t)=>{console.log(`[stateStore] Update: ${e} =`,t)})}catch(e){console.error(`Could not load version number:`,e);let t=document.getElementById(`version-number`);t&&(t.innerText=`Error`)}finally{Qr()}}function Qr(){let e=document.getElementById(`preloader`);e&&(e.classList.add(`fade-out`),document.body.classList.add(`loaded`),e.addEventListener(`animationend`,()=>e.remove(),{once:!0}))}window.addEventListener(`DOMContentLoaded`,()=>{Xr(),Zr(),p((e,t)=>{T(`currentUser`,t?.user||null),(e===`SIGNED_IN`||e===`SIGNED_OUT`)&&$(),e===`PASSWORD_RECOVERY`&&Kr(),Br(),e===`SIGNED_IN`&&Ur()})});