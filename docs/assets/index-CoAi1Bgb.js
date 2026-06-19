var e=Object.defineProperty,t=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var n=window.location.hostname===`sygec.github.io`||window.location.hostname===`dicethrone-prod.sygec.workers.dev`,r=`https://ojqkkixtvdtccuixishh.supabase.co`,i=`sb_publishable_AT9BZrEkq1IDrZmP1Y_pDQ_Qwnh57ZH`,a=`https://wmxrzjmadvivvpzbslgj.supabase.co`,o=`sb_publishable_Hohs2ojpVd5nmRJoi0upNg_PJv8M7x6`,s=n?r:a,c=n?i:o,l=supabase.createClient(s,c);async function u({email:e,password:t}){return l.auth.signInWithPassword({email:e,password:t})}async function d(e){return l.auth.resetPasswordForEmail(e)}async function f({password:e}){return l.auth.updateUser({password:e})}async function p(){return l.auth.signOut()}async function m(){return l.auth.getSession()}function h(e){return l.auth.onAuthStateChange(e)}async function g(){return l.from(`groups`).select(`*`).eq(`is_active`,!0).order(`order_index`,{ascending:!0})}async function _(){return l.from(`players`).select(`*`).order(`id`,{ascending:!0})}async function v(){return l.from(`heroes`).select(`
            *,
            groups (name),
            player_hero_stats (*),
            user_heroes (*)
        `).order(`name`,{ascending:!0})}async function ee(){return l.from(`games`).select(`
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
        `).order(`played_at`,{ascending:!1}).order(`player_id`,{foreignTable:`game_players`,ascending:!0})}async function y(){return l.from(`user_heroes`).select(`*`)}async function b(e,t){return l.from(`players`).update({player_color:t}).eq(`id`,e).select().single()}async function x(e,t){return l.from(`players`).update({name:t}).eq(`id`,e).select().single()}async function S(e,t,n){return l.from(`user_heroes`).upsert({user_id:e,hero_id:t,is_owned:n})}async function te(e){return l.from(`user_heroes`).upsert(e)}async function ne(e){return l.from(`heroes`).insert(e).select().single()}async function re(e){return l.from(`heroes`).upsert(e).select().single()}async function ie(e){return l.from(`heroes`).delete().eq(`id`,e)}async function ae(e){return l.from(`groups`).upsert(e).select().single()}async function oe(e){return l.from(`groups`).delete().eq(`id`,e)}async function se(e){return l.from(`games`).insert({last_updated_by:e}).select().single()}async function ce(e){return l.from(`game_players`).insert(e)}async function le(e){return l.from(`player_hero_stats`).upsert(e)}async function ue(e,t,n){if(t===`draw`)return l.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e);{let r=await l.from(`game_players`).update({is_winner:!0,last_updated_by:n}).eq(`game_id`,e).eq(`player_id`,t);return r.error?r:l.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e).neq(`player_id`,t)}}async function de(e){return l.from(`games`).delete().eq(`id`,e)}function fe(e){return l.channel(`schema-db-changes`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`user_heroes`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`player_hero_stats`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`heroes`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`games`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`game_players`},e).subscribe()}var C={NAMES:[],characters:[],games:[],players:[],groups:[],authUsers:[],cachedChangelog:null,activeLevels:new Set([1,2,3,4,5,6]),activeGroups:new Set,selectedGamePlayerIndex:null,expandedGameIds:new Set,currentSort:`name`,sortAsc:!0,currentSortPlayerIndex:0,editIndex:-1,activePlayerIndices:[0,1,2,3],currentDrawerMode:`sort-filter`,stagedSort:``,stagedSortAsc:!0,stagedSortPlayerIndex:0,stagedLevels:new Set,stagedGroups:new Set,stagedPlayerIndices:[],stagedUseHistorical:!0,dbUseHistorical:!0,activeFilterDataHistories:new Set,activeFilterPlayers:new Set,activeFilterComplexities:new Set,activeFilterGroups:new Set,stagedFilterDataHistories:new Set,stagedFilterPlayers:new Set,stagedFilterComplexities:new Set,stagedFilterGroups:new Set,gamesWinnerOnly:!1,gamesUseHistorical:!0,stagedSelectedGamePlayerIndex:null,stagedGamesWinnerOnly:!1,stagedGamesUseHistorical:!0,currentUser:null,loggedInPlayerIndex:-1,isRollActive:!1,expandedCollectionGroups:new Set,scrambleIntervals:{},activeSelectPlayerIdx:null,modalSortMode:`name`,draftModeEnabled:!1,draftCount:3,bannedHeroIds:new Set,stagedDraftModeEnabled:!1,stagedDraftCount:3,stagedBannedHeroIds:new Set,stagedBanSearchQuery:``,stagedRollSettingsTab:`draft`,activeDraftOrder:[],activeDraftStep:0,selectedDraftHeroes:{},activeDraftCandidates:{},draftWheelAngles:{},draftWheelFrontCardIndices:{},gamesHistoryStyle:`gorgeous`},pe=new Set;function me(e){return pe.add(e),()=>{pe.delete(e)}}function he(e,t){pe.forEach(n=>{try{n(e,t,C)}catch(e){console.error(`Error in stateStore listener:`,e)}})}function w(e){return C[e]}function T(e,t){C[e]=t,he(e,t)}function E(e,t,n){let r=C[e];if(!(r instanceof Set)){console.warn(`stateStore: ${e} is not an instance of Set.`);return}t===`add`?r.add(n):t===`delete`?r.delete(n):t===`clear`?r.clear():t===`toggle`&&(r.has(n)?r.delete(n):r.add(n)),he(e,r)}function D(e,t,n){let r=C[e];if(typeof r!=`object`||!r){console.warn(`stateStore: ${e} is not an object.`);return}n===void 0?delete r[t]:r[t]=n,he(e,r)}function ge(e,t=`info`){let n=document.getElementById(`toast-container`);n||(n=document.createElement(`div`),n.id=`toast-container`,document.body.appendChild(n));let r=document.createElement(`div`);r.className=`toast toast-${t}`,r.innerHTML=`
        <span class="toast-message"></span>
        <button class="toast-close" aria-label="Close">&times;</button>
    `,r.querySelector(`.toast-message`).textContent=e,n.appendChild(r),requestAnimationFrame(()=>{r.classList.add(`show`)});let i=()=>{r.parentNode&&(r.classList.remove(`show`),r.addEventListener(`transitionend`,()=>{r.parentNode&&r.parentNode.removeChild(r)}))},a=setTimeout(i,4e3);r.querySelector(`.toast-close`).addEventListener(`click`,()=>{clearTimeout(a),i()})}function O(e,t){return new Promise(n=>{let r=document.createElement(`div`);r.id=`confirm-modal-overlay`,r.innerHTML=`
            <div class="confirm-modal-content">
                <h3 class="confirm-modal-title"></h3>
                <p class="confirm-modal-message"></p>
                <div class="confirm-modal-actions">
                    <button class="confirm-btn confirm-btn-cancel" id="confirm-cancel-btn">Cancel</button>
                    <button class="confirm-btn confirm-btn-confirm" id="confirm-confirm-btn">Confirm</button>
                </div>
            </div>
        `,r.querySelector(`.confirm-modal-title`).textContent=e,r.querySelector(`.confirm-modal-message`).textContent=t,document.body.appendChild(r),requestAnimationFrame(()=>{r.classList.add(`show`)});let i=()=>{r.classList.remove(`show`),r.addEventListener(`transitionend`,()=>{r.parentNode&&r.parentNode.removeChild(r)})};r.querySelector(`#confirm-cancel-btn`).addEventListener(`click`,()=>{i(),n(!1)}),r.querySelector(`#confirm-confirm-btn`).addEventListener(`click`,()=>{i(),n(!0)}),r.addEventListener(`click`,e=>{e.target===r&&(i(),n(!1))})})}var _e=`modulepreload`,ve=function(e){return`/`+e},ye={},be=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=ve(t,n),t in ye)return;ye[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:_e,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};window.alert=function(e){ge(e,e&&(e.toLowerCase().includes(`error`)||e.toLowerCase().includes(`failed`))?`error`:`warning`)};function k(){return w(`currentUser`)?.app_metadata?.role===`admin`}function xe(){return!!w(`currentUser`)}var A=e=>e?`https://dice-throne.rulepop.com/heroes/${e}.webp`:``,j=e=>`https://dice-throne.rulepop.com/#hero/${e}`,M=e=>!!e?.is_owned,N=e=>String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),P=e=>{if(!e)return`#ffffff`;if(e=e.trim(),e.startsWith(`#`))return e;let t=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(t){let e=parseInt(t[1],10),n=parseInt(t[2],10),r=parseInt(t[3],10);return`#${(1<<24|e<<16|n<<8|r).toString(16).slice(1)}`}return e},Se=e=>e?.player_color?P(e.player_color):P(getComputedStyle(document.documentElement).getPropertyValue(`--${e?.id}`).trim()),Ce=(e,t)=>{document.documentElement.style.setProperty(`--${e}`,t)};function F(e,t){return e.weights[t]/(e.playCount[t]*3+1)**2}function I(e,t){if(!e)return`0.00%`;let n=w(`characters`).filter(M).length;if(n===0)return`0.00%`;if(t>=4)return`${(100/n).toFixed(2)}%`;let r=0;if(w(`characters`).filter(M).forEach(e=>r+=F(e,t)),r===0)return`0.00%`;let i=M(e),a=F(e,t);return`${i?(a/r*100).toFixed(2):`0.00`}%`}async function we(e,t){let n=w(`players`).find(t=>t.id===e);if(!n)return;let r=Se(n),i=P(t.value);if(i.toLowerCase()===r.toLowerCase())return;if(!await O(`Change Player Color`,`Change ${n.name}'s color from ${r} to ${i}?`)){t.value=r;return}let{error:a}=await b(e,i);if(a){alert(`Error saving player color: `+a.message),t.value=r;return}let o=w(`players`).findIndex(t=>t.id===e);o!==-1&&(w(`players`)[o].player_color=i),Ce(e,i),(async()=>{(await be(()=>Promise.resolve().then(()=>cn),void 0)).renderPlayersList()})()}function Te(e){if(!e)return null;try{let t=e.trim();t&&!t.includes(`T`)&&(t=t.replace(` `,`T`)),t&&t.includes(`:`)&&!t.includes(`Z`)&&!t.includes(`+`)&&(t+=`Z`);let n=new Date(t);return isNaN(n.getTime())?null:n}catch{return null}}function Ee(e){if(!e||e===`Never`)return``;if(e===`Unknown`)return`Date unknown (historical)`;let t=Te(e);if(!t)return``;try{let e=new Date;t.setHours(0,0,0,0),e.setHours(0,0,0,0);let n=e-t,r=Math.floor(n/(1e3*60*60*24));return r<0?``:r===0?`today`:r===1?`yesterday`:`${r} days ago`}catch{return``}}function De(e){let t=`⚫`;if(e&&e===`Unknown`)t=`🔴`;else if(e&&e!==`Never`&&e!==`Unknown`){let n=Te(e);if(n)try{let e=new Date;n.setHours(0,0,0,0),e.setHours(0,0,0,0);let r=e-n,i=Math.floor(r/(1e3*60*60*24));t=i<=15?`🟢`:i<=60?`🟡`:`🔴`}catch{t=`⚪`}else t=`⚪`}return t}var Oe=null,L=()=>(Oe||={sortSection:document.getElementById(`sort-section`),sortToggleBtn:document.getElementById(`sort-panel-toggle`),filterSection:document.getElementById(`filter-section`),filterToggleBtn:document.getElementById(`filter-panel-toggle`),sortFilterDrawer:document.getElementById(`sort-filter-drawer`),drawerTitle:document.getElementById(`drawer-title-text`),drawerFooter:document.getElementById(`drawer-footer-content`),drawerBody:document.getElementById(`drawer-body-content`),leftFilterDrawer:document.getElementById(`filter-drawer-left`),leftPlayersContainer:document.getElementById(`filter-options-players`),leftGroupsContainer:document.getElementById(`filter-options-groups`),leftHeroCountLabel:document.getElementById(`filter-drawer-hero-count`),leftTitleDataHistory:document.getElementById(`title-data-history`),leftTitlePlayers:document.getElementById(`title-players`),leftTitleComplexity:document.getElementById(`title-complexity`),leftTitleGroups:document.getElementById(`title-groups`),filterActiveBadge:document.getElementById(`filter-active-badge`),gamesFilterActiveBadge:document.getElementById(`games-filter-active-badge`),sortTriggerBtn:document.getElementById(`btn-trigger-sort`),sortDropdownMenu:document.getElementById(`sort-dropdown-menu`),activeFiltersContainer:document.getElementById(`active-filters-container`),heroContainer:document.getElementById(`heroContainer`),countStatsLabel:document.getElementById(`count-stats`),heroSearchInput:document.getElementById(`hero-search`),dbShowOwnedCheckbox:document.getElementById(`db-show-owned`),dbShowNotOwnedCheckbox:document.getElementById(`db-show-not-owned`)},Oe);function ke(){let e=L();e.sortFilterDrawer&&(e.drawerTitle&&(e.drawerTitle.innerText=`Filter History`),e.drawerFooter&&(e.drawerFooter.style.display=`flex`),Ue(),e.sortFilterDrawer.classList.add(`open`),document.body.style.overflow=`hidden`)}function Ae(){Ne(),Be(),Ve();let e=L();e.leftFilterDrawer&&(e.leftFilterDrawer.classList.add(`open`),document.body.style.overflow=`hidden`)}function je(e=null,t=!1){if(e&&e.target!==e.currentTarget&&!t)return;let n=L();n.leftFilterDrawer&&(n.leftFilterDrawer.classList.remove(`open`),document.body.style.overflow=`auto`)}function Me(e=null,t=!1){if(e&&e.target!==e.currentTarget&&!t)return;let n=L();n.sortFilterDrawer&&(n.sortFilterDrawer.classList.remove(`open`),document.body.style.overflow=`auto`)}function Ne(){let e=L(),t=w(`players`),n=w(`groups`),r=w(`stagedFilterPlayers`),i=w(`stagedFilterGroups`),a=w(`stagedFilterDataHistories`),o=w(`stagedFilterComplexities`);if(e.leftPlayersContainer&&t){let n=t.filter(e=>e.name&&!e.name.toLowerCase().includes(`invitee`)).slice().sort((e,t)=>e.name.localeCompare(t.name));e.leftPlayersContainer.innerHTML=n.map(e=>{let t=r.has(e.id)?`checked`:``;return`
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${e.id}" data-type="player" ${t} />
                    ${e.name}
                </label>
            `}).join(``)}if(e.leftGroupsContainer&&n){let t=n.slice().sort((e,t)=>(e.order_index??0)-(t.order_index??0));e.leftGroupsContainer.innerHTML=t.map(e=>{let t=i.has(e.id)?`checked`:``;return`
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${e.id}" data-type="group" ${t} />
                    ${e.name}
                </label>
            `}).join(``)}document.querySelectorAll(`#filter-drawer-left input[data-type="data-history"]`).forEach(e=>{e.checked=a.has(e.value)}),document.querySelectorAll(`#filter-drawer-left input[data-type="complexity"]`).forEach(e=>{e.checked=o.has(Number(e.value))})}function Pe(){let e=L();if(!e.filterActiveBadge)return;let t=w(`activeFilterDataHistories`),n=w(`activeFilterPlayers`),r=w(`activeFilterComplexities`),i=w(`activeFilterGroups`),a=0;t&&(a+=t.size),n&&(a+=n.size),r&&(a+=r.size),i&&(a+=i.size),a>0?(e.filterActiveBadge.innerText=a,e.filterActiveBadge.style.display=`inline-block`):e.filterActiveBadge.style.display=`none`}function Fe(){let e=L();if(!e.gamesFilterActiveBadge)return;let t=w(`selectedGamePlayerIndex`),n=w(`gamesWinnerOnly`),r=w(`gamesUseHistorical`),i=0;t!==null&&i++,n&&i++,r||i++,i>0?(e.gamesFilterActiveBadge.innerText=i,e.gamesFilterActiveBadge.style.display=`inline-block`):e.gamesFilterActiveBadge.style.display=`none`}function R(){document.querySelectorAll(`.ownership-segmented-control, .segmented-control`).forEach(e=>{let t=e.querySelector(`.segmented-pill.active`),n=e.querySelector(`.segmented-highlight`);n||(n=document.createElement(`div`),n.className=`segmented-highlight`,e.insertBefore(n,e.firstChild)),t&&(n.style.width=`${t.offsetWidth}px`,n.style.transform=`translateX(${t.offsetLeft}px)`,n.style.height=`${t.offsetHeight}px`)})}function Ie(){let e=L();if(!e.sortTriggerBtn)return;let t=w(`currentSort`),n=w(`sortAsc`),r=w(`currentSortPlayerIndex`),i=w(`NAMES`),a=`Hero (A-Z)`;if(t===`name`)a=n?`Hero (A-Z)`:`Hero (Z-A)`;else if(t===`complexity`)a=n?`Complexity (1-6)`:`Complexity (6-1)`;else if(t.startsWith(`w`)){let e=i[r]||`Player ${r+1}`;a=n?`${e} % (Low to High)`:`${e} % (High to Low)`}else if(t.startsWith(`d`)){let e=i[r]||`Player ${r+1}`;a=n?`${e} Played (Oldest)`:`${e} Played (Newest)`}else t===`group`&&(a=n?`Group (A-Z)`:`Group (Z-A)`);e.sortTriggerBtn.innerHTML=`<span class="action-icon">⇅</span> <strong style="font-weight: 700;">SORT:</strong> <span style="font-weight: 400; text-transform: none; margin-left: 2px;">${a}</span>`}function Le(){let e=L();if(!e.sortDropdownMenu)return;let t=w(`currentSort`),n=w(`sortAsc`),r=w(`activePlayerIndices`),i=w(`NAMES`),a=`
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
            `})),e.sortDropdownMenu.innerHTML=a}function Re(e){let t=L();t.sortDropdownMenu&&(e.stopPropagation(),t.sortDropdownMenu.classList.toggle(`show`)?(t.sortTriggerBtn&&t.sortTriggerBtn.classList.add(`active`),Le()):t.sortTriggerBtn&&t.sortTriggerBtn.classList.remove(`active`))}function ze(){let e=L();e.sortDropdownMenu&&e.sortDropdownMenu.classList.remove(`show`),e.sortTriggerBtn&&e.sortTriggerBtn.classList.remove(`active`)}function Be(){let e=L();if(!e.leftHeroCountLabel)return;let t=or();e.leftHeroCountLabel.innerText=`${t} heroes match`}function Ve(){let e=L(),t=w(`stagedFilterDataHistories`),n=w(`stagedFilterPlayers`),r=w(`stagedFilterComplexities`),i=w(`stagedFilterGroups`);if(e.leftTitleDataHistory){let n=t.size;e.leftTitleDataHistory.innerHTML=`Data Type ${n>0?`<span class="filter-count-bubble">${n}</span>`:``}`}if(e.leftTitlePlayers){let t=n.size;e.leftTitlePlayers.innerHTML=`Players ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}if(e.leftTitleComplexity){let t=r.size;e.leftTitleComplexity.innerHTML=`Complexity ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}if(e.leftTitleGroups){let t=i.size;e.leftTitleGroups.innerHTML=`Group / Season ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}}function He(e){let t=w(`players`),n=w(`games`);w(`NAMES`);let r=w(`stagedGamesUseHistorical`),i=w(`stagedSelectedGamePlayerIndex`),a=w(`stagedGamesWinnerOnly`),o=r,s=t.map(()=>({played:0,won:0})),c=0,l=0;n&&n.forEach(e=>{!o&&e.is_historical||e.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1;t>=0&&t<4?(s[t].played++,e.is_winner&&s[t].won++):(t===4||t===5)&&(c++,e.is_winner&&l++)})});let u=``;for(let e=0;e<4;e++){let n=t[e];n&&(u+=`
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
    `}function Ue(){let e=L();if(!e.drawerBody)return;let t=w(`currentDrawerMode`),n=w(`stagedSort`);w(`stagedSortPlayerIndex`);let r=w(`stagedPlayerIndices`),i=w(`stagedUseHistorical`),a=w(`NAMES`);w(`activePlayerIndices`);let o=w(`stagedDraftModeEnabled`),s=w(`stagedDraftCount`),c=w(`stagedRollSettingsTab`),l=w(`stagedBanSearchQuery`);if(e.drawerBody.style.overflowY=`auto`,t===`sort-filter`){e.drawerBody.innerHTML=`
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
        `;let t=`name`;n===`group`?t=`group`:n.startsWith(`w`)?t=`probability`:n.startsWith(`d`)&&(t=`lastPlayed`);let r=document.getElementById(`drawer-sort-type-select`);r&&(r.value=t),We(),Ge(),Ke(),Ye()}else if(t===`columns`){let t=a.slice(0,4).map((e,t)=>`
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
        `}else if(t===`history-filter`)He(e.drawerBody);else if(t===`roll-settings`){e.drawerBody.style.overflowY=`hidden`;let t=o?`checked`:``,n=[2,3].map(e=>`
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
        `,ct()}}function We(){let e=document.getElementById(`drawer-sort-direction-text`),t=document.getElementById(`drawer-sort-direction-arrow`),n=w(`stagedSortAsc`);e&&t&&(e.innerText=n?`Ascending`:`Descending`,t.innerText=n?`▲`:`▼`)}function Ge(){let e=document.getElementById(`drawer-player-sort-sub-section`),t=document.getElementById(`drawer-player-sort-pills`);if(!e||!t)return;let n=w(`stagedSort`),r=w(`stagedSortPlayerIndex`),i=w(`activePlayerIndices`),a=w(`NAMES`),o=n.startsWith(`w`)||n.startsWith(`d`);e.style.display=o?`block`:`none`,o&&(t.innerHTML=a.slice(0,4).map((e,t)=>`
                <button type="button" class="pill-toggle ${r===t?`active p${t+1}-color`:``}" style="${i.includes(t)?``:`opacity: 0.5;`}" data-action="drawer-sort-player-change" data-player-idx="${t}">
                    ${e}
                </button>
            `).join(``))}function Ke(){let e=document.getElementById(`drawer-complexity-filter-bar`);if(!e)return;let t=document.getElementById(`hero-search`),n=t?t.value.toLowerCase():``,r=document.getElementById(`db-show-owned`)?.checked??!0,i=document.getElementById(`db-show-not-owned`)?.checked??!1,a=w(`stagedGroups`),o=w(`stagedLevels`),s=w(`characters`),c=(e,t)=>t?e.name.toLowerCase().includes(t)||e.group&&e.group.toLowerCase().includes(t):!0,l=``;for(let e=1;e<=6;e++){let t=s.filter(t=>{if(Number(t.complexity)!==e)return!1;let o=a.has(t.group_id),s=M(t)&&r||!M(t)&&i;return c(t,n)&&o&&s}).length,u=t===0,d=o.has(e)&&!u?`active-die`:``;l+=`
            <div class="group-badge-card group-complexity ${d} ${u?`disabled`:``}" 
                 data-action="toggle-drawer-level" data-level="${e}" data-disabled="${u}"
                 title="Level ${e} (${t} heroes)">
                <img src="images/dice/d${e}.png" class="complexity-dice-img" alt="Level ${e}">
                <span class="group-badge-count">${t}</span>
            </div>`}let u=s.filter(e=>{let t=a.has(e.group_id),o=M(e)&&r||!M(e)&&i;return c(e,n)&&t&&o}).length,d=u===0,f=o.size===6&&!d?`active-die`:``;l+=`
        <div class="group-badge-card group-complexity group-complexity-all ${f} ${d?`disabled`:``}" 
             data-action="toggle-drawer-level" data-level="all" data-disabled="${d}"
             title="All Levels (${u} heroes)">
            <img src="images/dice/d_all.png" class="complexity-dice-img" alt="All">
            <span class="group-badge-count">${u}</span>
        </div>`,e.innerHTML=l}function qe(e){let t=(e||``).toLowerCase();return t.includes(`season 1`)||t.includes(`s1`)?`group-s1`:t.includes(`season 2`)||t.includes(`s2`)?`group-s2`:t.includes(`marvel`)?`group-marvel`:t.includes(`x-men`)||t.includes(`xmen`)?`group-xmen`:t.includes(`adventures`)?`group-adventures`:t.includes(`solo`)?`group-solo`:t.includes(`outcast`)?`group-outcast`:t.includes(`santa`)||t.includes(`krampus`)||t.includes(`svk`)?`group-svk`:t.includes(`vanguard`)?`group-vanguard`:`group-default`}function Je(e){if(!e)return`?`;let t=e.trim().toLowerCase();if(t.includes(`season 1`))return`S1`;if(t.includes(`season 2`))return`S2`;if(t.includes(`marvel`))return`MRVL`;if(t.includes(`x-men`)||t.includes(`xmen`))return`XMEN`;if(t.includes(`adventure`))return`ADV`;if(t.includes(`santa`)&&t.includes(`krampus`))return`SvK`;if(t.includes(`solo`))return`SOLO`;if(t.includes(`outcast`))return`OUTC`;if(t.includes(`vanguard`))return`VNGD`;let n=e.split(/\s+/);return n.length>1?n.map(e=>e[0]).join(``).toUpperCase().substring(0,3):e.substring(0,3).toUpperCase()}function Ye(){let e=document.getElementById(`drawer-group-filter-bar`);if(!e)return;let t=document.getElementById(`hero-search`),n=t?t.value.toLowerCase():``,r=document.getElementById(`db-show-owned`)?.checked??!0,i=document.getElementById(`db-show-not-owned`)?.checked??!1,a=w(`stagedLevels`),o=w(`stagedGroups`),s=w(`groups`),c=w(`characters`),l=(e,t)=>t?e.name.toLowerCase().includes(t)||e.group&&e.group.toLowerCase().includes(t):!0,u=s.map(e=>{let t=Je(e.name),s=o.has(e.id),u=qe(e.name),d=c.filter(t=>{if(t.group_id!==e.id)return!1;let o=a.has(Number(t.complexity)),s=M(t)&&r||!M(t)&&i;return l(t,n)&&o&&s}).length,f=d===0;return`
                <div class="group-badge-card ${u} ${s&&!f?`active-die`:``} ${f?`disabled`:``}" 
                     data-action="toggle-drawer-group" data-group-id="${e.id}" data-disabled="${f}"
                     title="${N(e.name)} (${d} heroes)">
                    <span class="group-badge-initials">${t}</span>
                    <span class="group-badge-count">${d}</span>
                </div>`}).join(``),d=c.filter(e=>{let t=a.has(Number(e.complexity)),o=M(e)&&r||!M(e)&&i;return l(e,n)&&t&&o}).length,f=d===0;e.innerHTML=`
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
    `}function Xe(){let e=L();if(!e.activeFiltersContainer)return;let t=e.heroSearchInput,n=t?t.value.trim():``,r=w(`activeFilterDataHistories`),i=w(`activeFilterPlayers`),a=w(`activeFilterComplexities`),o=w(`activeFilterGroups`),s=w(`players`),c=w(`groups`),l=``;n&&(l+=`
            <div class="filter-chip" title="Active Search Filter">
                <span class="filter-chip-remove" data-action="clear-search-filter" title="Remove search filter">✖</span>
                <span class="filter-chip-label">Search: "${n}"</span>
            </div>
        `),r&&Array.from(r).sort((e,t)=>{let n=[`Normal only`,`Historical only`];return n.indexOf(e)-n.indexOf(t)}).forEach(e=>{l+=`
                <div class="filter-chip" title="Active Data History Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="data-history" data-value="${e}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">Data: ${e}</span>
                </div>
            `}),i&&s&&Array.from(i).sort((e,t)=>{let n=s.find(t=>t.id===e),r=s.find(e=>e.id===t),i=n?n.name:``,a=r?r.name:``;return i.localeCompare(a)}).forEach(e=>{let t=s.find(t=>t.id===e),n=t?t.name:e;l+=`
                <div class="filter-chip" title="Active Player Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="player" data-value="${e}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">${n}</span>
                </div>
            `}),a&&Array.from(a).sort((e,t)=>e-t).forEach(e=>{l+=`
                <div class="filter-chip" title="Active Complexity Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="complexity" data-value="${e}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">Complexity: ${e}</span>
                </div>
            `}),o&&c&&Array.from(o).sort((e,t)=>{let n=c.find(t=>t.id===e),r=c.find(e=>e.id===t);return(n?n.order_index??0:0)-(r?r.order_index??0:0)}).forEach(e=>{let t=c.find(t=>t.id===e),n=t?t.name:e;l+=`
                <div class="filter-chip" title="Active Group Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="group" data-value="${e}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">${n}</span>
                </div>
            `}),e.activeFiltersContainer.innerHTML=l}function Ze(){let e=L();if(!e.heroContainer)return;Qn();let t=e.heroSearchInput?.value.toLowerCase()||``,n=e.dbShowOwnedCheckbox?.checked??!0,r=e.dbShowNotOwnedCheckbox?.checked??!1,i=w(`NAMES`),a=w(`characters`),o=w(`activeFilterComplexities`),s=w(`activeFilterGroups`),c=w(`activeFilterDataHistories`),l=w(`activeFilterPlayers`),u=w(`games`),d=w(`activePlayerIndices`),f=w(`currentSort`),p=w(`sortAsc`);w(`currentSortPlayerIndex`);let m=(e,t)=>{if(!t)return!0;let n=t.trim().toLowerCase();return(e.name||``).toLowerCase().includes(n)||(e.group||``).toLowerCase().includes(n)},h=[];t&&i.forEach((e,n)=>{e&&e.toLowerCase().includes(t)&&h.push(n)});let g=[,,,,].fill(0);a.filter(M).forEach(e=>{for(let t=0;t<4;t++)g[t]+=F(e,t)});let _=a.map((e,t)=>({...e,originalIndex:t})).filter(e=>{let i=!0;o.size>0&&(i=o.has(Number(e.complexity)));let a=!0;s.size>0&&(a=s.has(e.group_id));let d=!0,f=c.has(`Normal only`),p=c.has(`Historical only`);f&&!p?d=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(e=>!e.is_historical):p&&!f&&(d=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(e=>e.is_historical));let h=!0;l.size>0&&(h=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(t=>t.game_players.some(t=>t.hero_id===e.id&&l.has(t.player_id))));let g=M(e)&&n||!M(e)&&r;return m(e,t)&&i&&a&&d&&h&&g});e.countStatsLabel&&(e.countStatsLabel.innerText=`Showing ${_.length} of ${a.length} heroes`),_.sort((e,t)=>{let n,r;if(f.startsWith(`w`)){let i=parseInt(f[1]);n=F(e,i),r=F(t,i)}else if(f.startsWith(`d`)){let i=parseInt(f[1]);n=e.lastPlayed&&e.lastPlayed[i]||``,r=t.lastPlayed&&t.lastPlayed[i]||``,(n===`Never`||n===`Unknown`)&&(n=``),(r===`Never`||r===`Unknown`)&&(r=``)}else if(f===`group`){if(n=(e.group||``).toLowerCase(),r=(t.group||``).toLowerCase(),n===r){let n=(e.name||``).toLowerCase(),r=(t.name||``).toLowerCase();return p?n.localeCompare(r):r.localeCompare(n)}}else if(f===`complexity`){if(n=Number(e.complexity)||0,r=Number(t.complexity)||0,n===r){let n=(e.name||``).toLowerCase(),r=(t.name||``).toLowerCase();return n.localeCompare(r)}}else n=(e[f]||``).toLowerCase(),r=(t[f]||``).toLowerCase();if(n===r)return 0;let i=n<r?-1:1;return p?i:-i}),e.heroContainer.innerHTML=_.map(e=>{let t=d;l.size>0?t=Array.from(l).map(e=>parseInt(e.substring(1))-1).filter(e=>e>=0&&e<4):h.length>0&&(t=d.filter(e=>h.includes(e)));let n=t.map(t=>{let n=F(e,t),r=M(e)&&g[t]>0?(n/g[t]*100).toFixed(2):`0.00`,i=e.playCount&&e.playCount[t]||0,a=e.lastPlayed&&e.lastPlayed[t]||`Never`,o=e.winCount&&e.winCount[t]||0,s=i>0?(o/i*100).toFixed(1):`0.0`;return{p:t,percentage:parseFloat(r),percentageStr:r,playCount:i,lastPlayed:a,winCount:o,winRate:s}});n.sort((e,t)=>{let n=(i[e.p]||``).toLowerCase(),r=(i[t.p]||``).toLowerCase();return n.localeCompare(r)});let r=n.map(e=>{let t=De(e.lastPlayed);return`
                <div class="collapsed-player-row-simple">
                    <span class="collapsed-player-name" style="color: var(--p${e.p+1});">${i[e.p]}</span>
                    <span class="collapsed-player-prob">${e.percentageStr}%</span>
                    <span class="collapsed-player-plays">🎲 ${e.playCount}</span>
                    <span class="collapsed-player-wins">🏆 ${e.winCount} <span class="collapsed-player-rate">(${e.winRate}%)</span></span>
                    <span class="collapsed-player-recency" title="Last played: ${e.lastPlayed}">${t}</span>
                </div>`}).join(``),a=n.map(e=>{let t=Ee(e.lastPlayed),n=De(e.lastPlayed),r=t?`<span class="expanded-player-relative">${t} ${n}</span>`:``;return`
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
                <img src="${A(e.slug)}" class="char-bg-img" alt="${e.name}">
                
                <div class="hero-header" data-action="toggle-hero-panel">
                    <div class="header-title-collapsed">
                        <a href="${j(e.slug)}" target="_blank" class="hero-name-link">
                            <span class="hero-name">${e.name}</span>
                        </a>
                    </div>
                    
                    <div class="header-title-expanded">
                        <a href="${j(e.slug)}" target="_blank" class="hero-name-link">
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
            </div>`}).join(``)}var z=()=>({resultsDiv:document.getElementById(`results`),rollBtnContainer:document.getElementById(`rollBtnContainer`),rollBtn:document.getElementById(`rollBtn`),actionButtons:document.getElementById(`action-buttons`),heroSelectModal:document.getElementById(`hero-select-modal`),heroSelectModalTitle:document.getElementById(`hero-select-modal-title`),heroSelectSearch:document.getElementById(`hero-select-search`),modalSortName:document.getElementById(`modal-sort-name`),modalSortWeight:document.getElementById(`modal-sort-weight`),heroSelectOptionsContainer:document.getElementById(`hero-select-options-container`),confirmBtn:document.getElementById(`confirmBtn`),errorMsg:document.getElementById(`error-msg`),rollSettingsBadge:document.getElementById(`roll-settings-badge`),rollSettingsBtn:document.getElementById(`rollSettingsBtn`),drawerBanListContainer:document.getElementById(`drawer-ban-list-container`)});function Qe(e){let t=z();if(!t.resultsDiv)return;let n=w(`NAMES`)[e]||`Player ${e+1}`;t.resultsDiv.innerHTML+=`
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
    `}function $e(e){let t=z();if(!t.heroSelectModal)return;t.heroSelectModal.style.display=`flex`,document.body.style.overflow=`hidden`;let n=w(`NAMES`);t.heroSelectModalTitle&&n[e]&&(t.heroSelectModalTitle.innerText=`Select Hero for ${n[e]}`),t.heroSelectSearch&&(t.heroSelectSearch.value=``),T(`modalSortMode`,`name`),tt(`name`),nt(),setTimeout(R,50)}function et(){let e=z();e.heroSelectModal&&(e.heroSelectModal.style.display=`none`),document.body.style.overflow=``}function tt(e){let t=z();t.modalSortName&&t.modalSortName.classList.toggle(`active`,e===`name`),t.modalSortWeight&&t.modalSortWeight.classList.toggle(`active`,e===`weight`),R()}function nt(){let e=z();if(!e.heroSelectOptionsContainer)return;let t=w(`activeSelectPlayerIdx`),n=w(`modalSortMode`),r=e.heroSelectSearch,i=r?r.value.toLowerCase().trim():``,a=w(`characters`),o=w(`bannedHeroIds`);if(t===null)return;let s=a.filter(e=>M(e)&&!o.has(e.id));i&&(s=s.filter(e=>e.name.toLowerCase().includes(i)||e.group&&e.group.toLowerCase().includes(i))),n===`name`?s.sort((e,t)=>e.name.localeCompare(t.name)):n===`weight`&&s.sort((e,n)=>{let r=F(e,t),i=F(n,t);return r===i?e.name.localeCompare(n.name):i-r});let c=document.getElementById(`select-${t}`)?.value;if(s.length===0){e.heroSelectOptionsContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic; grid-column: 1 / -1; text-align: center; padding: 20px;">No available heroes found.</p>`;return}e.heroSelectOptionsContainer.innerHTML=s.map(e=>{let n=c===e.name,r=I(e,t);return`
            <div class="hero-select-card ${n?`selected`:``}" data-action="select-hero-option" data-hero-name="${e.name.replace(/"/g,`&quot;`)}" data-hero-slug="${e.slug}" data-hero-id="${e.id}">
                <img src="${A(e.slug)}" class="hero-select-card-img" alt="${e.name}">
                <div class="hero-select-card-info">
                    <div class="hero-select-card-name">${e.name}</div>
                    <div class="hero-select-card-prob">${r}</div>
                </div>
            </div>`}).join(``)}function rt(e,t){let n=document.getElementById(`player-row-${e}`),r=document.getElementById(`select-${e}`),i=document.getElementById(`bg-img-${e}`),a=document.getElementById(`hero-name-title-${e}`),o=document.getElementById(`hero-group-${e}`),s=document.getElementById(`stats-row-${e}`);if(w(`NAMES`),r&&(r.value=t.name),i&&(i.src=A(t.slug),i.style.opacity=`0.25`,i.classList.remove(`scramble-img`)),a&&(a.innerText=t.name,a.href=j(t.slug),a.classList.remove(`scramble-text`)),o&&(o.innerText=t.group||`Unknown`),s){let n=`Prob: <b>${I(t,e)}</b>`;e<4?s.innerHTML=`
                <span>Plays: <b>${t.playCount[e]||0}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                <span class="stats-divider">|</span>
                <span>${n}</span>
            `:s.innerHTML=`<span>${n}</span>`}if(n){n.classList.remove(`randomizing`),n.classList.add(`revealed`),o&&(o.classList.remove(`scramble-hidden`,`opacity-0`),o.classList.add(`fade-in-resolve`)),s&&(s.classList.remove(`scramble-hidden`,`opacity-0`),s.classList.add(`fade-in-resolve`));let t=document.getElementById(`select-container-${e}`);t&&(t.classList.remove(`scramble-hidden`,`opacity-0`),t.classList.add(`fade-in-resolve`))}}function it(e,t){let n=document.getElementById(`player-row-${e}`);if(!n)return;let r=w(`NAMES`)[e]||`Player ${e+1}`;n.className=`player-row revealed`,n.style.cssText=`--player-color: var(--p${e+1}); border-color: var(--p${e+1});`,n.innerHTML=`
        <img src="${A(t.slug)}" class="char-bg-img" id="bg-img-${e}" alt="${t.name}" style="opacity: 0.25;">
        <div class="player-row-content">
            <div class="hero-info-container" id="info-container-${e}">
                <div class="hero-header-row">
                    <div class="hero-header-left">
                        <span class="player-name-caps" style="color: var(--player-color);">${r.toUpperCase()}</span>
                        <span class="hero-name-divider">:</span>
                        <a href="${j(t.slug)}" target="_blank" class="hero-name hero-name-link resolved" id="hero-name-title-${e}">${t.name}</a>
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
    `;let i=document.getElementById(`stats-row-${e}`);if(i){let n=`Prob: <b>${I(t,e)}</b>`;e<4?i.innerHTML=`
                <span>Plays: <b>${t.playCount[e]||0}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                <span class="stats-divider">|</span>
                <span>${n}</span>
            `:i.innerHTML=`<span>${n}</span>`}}function at(e,t){let n=z();if(!n.resultsDiv)return;let r=document.getElementById(`player-row-${e}`);r||(r=document.createElement(`div`),r.id=`player-row-${e}`,n.resultsDiv.appendChild(r));let i=w(`NAMES`)[e]||`Player ${e+1}`;r.className=`player-row waiting-draft`,r.style.cssText=`--player-color: var(--p${e+1}); border-color: var(--p${e+1});`,r.innerHTML=`
        <div class="player-row-content">
            <span class="player-name-caps" style="color: var(--player-color);">${i.toUpperCase()}</span>
            <span class="draft-waiting-status">Waiting for ${t}...</span>
        </div>
    `}function ot(e){let t=z();if(!t.resultsDiv)return;let n=document.getElementById(`player-row-${e}`);n||(n=document.createElement(`div`),n.id=`player-row-${e}`,t.resultsDiv.appendChild(n));let r=w(`NAMES`)[e]||`Player ${e+1}`,i=w(`draftCount`);n.className=`player-row active-draft`,n.style.cssText=`--player-color: var(--p${e+1}); border-color: var(--p${e+1});`,n.innerHTML=`
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
    `}function st(){let e=z();if(!e.rollSettingsBadge||!e.rollSettingsBtn)return;let t=w(`draftModeEnabled`),n=w(`bannedHeroIds`),r=0;t&&r++,n&&n.size>0&&(r+=n.size),r>0?(e.rollSettingsBadge.innerText=r,e.rollSettingsBadge.style.display=`inline-block`,e.rollSettingsBtn.classList.add(`has-settings`)):(e.rollSettingsBadge.style.display=`none`,e.rollSettingsBtn.classList.remove(`has-settings`))}function ct(){let e=z();if(!e.drawerBanListContainer)return;let t=w(`characters`),n=w(`stagedBannedHeroIds`),r=w(`stagedBanSearchQuery`)||``,i=r.toLowerCase().trim(),a=t;i&&(a=t.filter(e=>e.name.toLowerCase().includes(i)||e.group&&e.group.toLowerCase().includes(i)));let o=[...a].sort((e,t)=>e.name.localeCompare(t.name));if(o.length===0){e.drawerBanListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic; text-align: center; padding: 20px;">No heroes found matching "${r}"</p>`;return}e.drawerBanListContainer.innerHTML=o.map(e=>{let t=n.has(e.id);return`
            <label class="ban-list-item ${t?`banned`:``}">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" ${t?`checked`:``} data-action="toggle-staged-ban" data-hero-id="${e.id}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--danger);">
                    <span>${e.name}</span>
                </div>
                <span class="ban-item-group">${e.group||`Unknown`}</span>
            </label>
        `}).join(``)}function lt(){let e=w(`NAMES`),t=w(`characters`),n=w(`bannedHeroIds`),r=e.map((e,t)=>t).filter(e=>document.getElementById(`use${e}`)?.checked);if(r.length===0)return alert(`Select players!`);let i=[...r].sort(()=>Math.random()-.5),a=document.getElementById(`results`);a&&(a.innerHTML=``);let o=t.filter(e=>M(e)&&!n.has(e.id)).map(e=>structuredClone(e));if(o.length<r.length)return alert(`Not enough available (owned & non-banned) heroes (${o.length}) in your collection for ${r.length} players!`);if(w(`draftModeEnabled`)){let t=document.getElementById(`rollBtnContainer`);t&&(t.style.display=`none`);let n=document.getElementById(`action-buttons`);n&&(n.style.display=`none`),T(`activeDraftOrder`,i),T(`activeDraftStep`,0),T(`selectedDraftHeroes`,{}),T(`activeDraftCandidates`,{}),T(`draftWheelAngles`,{}),T(`draftWheelFrontCardIndices`,{}),[...r].sort((e,t)=>e-t).forEach(t=>{at(t,e[i[0]])}),W(`roll`),a&&a.scrollIntoView({behavior:`smooth`,block:`start`}),Et();return}let s={};i.forEach(e=>{let t=null;if(e>=4){let e=Math.floor(Math.random()*o.length);t=o[e],o.splice(e,1)}else{let n=o.filter(t=>t.weights[e]>0);if(n.length===0){if(o.length>0){let e=Math.floor(Math.random()*o.length);t=o[e],o.splice(e,1)}}else{let r=n.reduce((t,n)=>t+F(n,e),0),i=Math.random()*r;for(let r of n){let n=F(r,e);if(i<n){t=r,o.splice(o.findIndex(e=>e.name===r.name),1);break}i-=n}}}s[e]=t});let c=document.getElementById(`rollBtnContainer`);c&&(c.style.display=`none`);let l=document.getElementById(`rollBtn`);l&&(l.disabled=!0,l.style.opacity=`0.6`,l.style.cursor=`not-allowed`);let u=document.getElementById(`action-buttons`);u&&(u.style.display=`none`),T(`isRollActive`,!1);let d=[...r].sort((e,t)=>e-t);d.forEach(e=>{Qe(e)}),W(`roll`),a&&a.scrollIntoView({behavior:`smooth`,block:`start`});let f=t.filter(e=>M(e)&&!n.has(e.id));d.forEach(e=>{mt(e,f)});let p=0;function m(){if(p>=i.length){gt(),xe()?(u&&(u.style.display=`flex`),c&&(c.style.display=`none`)):(c&&(c.style.display=`flex`),l&&(l.disabled=!1,l.style.opacity=`1`,l.style.cursor=`pointer`)),T(`isRollActive`,!0);return}let e=i[p],t=s[e],n=500+Math.random()*500;setTimeout(()=>{ht(e,t),p++,setTimeout(m,400)},n)}m()}function B(){gt()}function ut(e){T(`activeSelectPlayerIdx`,e),$e(e)}function V(){et(),T(`activeSelectPlayerIdx`,null)}function dt(e){T(`modalSortMode`,e),tt(e),ft()}function ft(){nt()}function pt(e){let t=w(`activeSelectPlayerIdx`);if(t===null)return;let n=w(`characters`).find(t=>t.name===e);n&&(w(`draftModeEnabled`)&&(w(`selectedDraftHeroes`)[t]=n),rt(t,n),gt(),V())}function mt(e,t){if(t.length===0)return;let n=document.getElementById(`bg-img-${e}`),r=document.getElementById(`hero-name-title-${e}`);D(`scrambleIntervals`,e,setInterval(()=>{let e=t[Math.floor(Math.random()*t.length)];if(n&&(n.src=A(e.slug)),r){let e=``;for(let t=0;t<8;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*`[Math.floor(Math.random()*32)];r.innerText=e}},70))}function ht(e,t){let n=w(`scrambleIntervals`);n[e]&&(clearInterval(n[e]),D(`scrambleIntervals`,e,void 0)),t&&rt(e,t)}function gt(){let e=document.querySelectorAll(`.char-select`),t=Array.from(e).map(e=>e.value),n=t.reduce((e,t)=>(e[t]=(e[t]||0)+1,e),{}),r=Object.values(n).some(e=>e>1),i=w(`characters`),a=t.filter(e=>{let t=i.find(t=>t.name===e);return t&&!M(t)}),o=a.length>0,s=document.getElementById(`confirmBtn`),c=document.getElementById(`error-msg`);!s||!c||(s.classList.remove(`disabled`,`warning`),s.disabled=!1,s.innerHTML=`LOCK IN SESSION`,c.style.display=`none`,r?(s.classList.add(`disabled`),s.disabled=!0,c.style.display=`block`,c.innerText=`⚠ Duplicate hero selected! Each player must have a unique character.`):o&&(s.classList.add(`warning`),s.innerHTML=`⚠️ LOCK IN SESSION`,c.style.display=`block`,c.innerText=`⚠️ You have selected unowned heroes: ${a.join(`, `)}.`),e.forEach(e=>{let t=e.closest(`.player-row`);t&&t.classList.toggle(`error`,n[e.value]>1)}))}async function _t(){let e=document.getElementById(`confirmBtn`),t=e?e.innerText:`Lock In`;e&&(e.disabled=!0,e.innerText=`Saving...`);let n=Array.from(document.querySelectorAll(`.char-select`)).map(e=>e.value),r=w(`characters`),i=n.filter(e=>{let t=r.find(t=>t.name===e);return t&&!M(t)});if(i.length>0&&!await O(`Unowned Heroes Selected`,`You have selected unowned heroes: ${i.join(`, `)}. Do you want to proceed?`)){e&&(e.disabled=!1,e.innerText=t);return}let a=document.querySelectorAll(`.char-select`),o=[],s=[],c=new Map(Array.from(a).map(e=>[parseInt(e.dataset.player),e.value])),{data:l,error:u}=await se(w(`currentUser`).id);if(u)return e&&(e.disabled=!1,e.innerText=t),alert(`Error creating game: `+u.message);r.forEach(e=>{[0,1,2,3,4,5].forEach(t=>{let n=c.get(t);if(n===e.name&&s.push({game_id:l.id,player_id:`p${t+1}`,hero_id:e.id,is_winner:null,last_updated_by:w(`currentUser`).id}),t<4&&n!==void 0){let r=n===e.name?20:(e.weights[t]||250)+10;o.push({hero_id:e.id,player_id:`p${t+1}`,weight:r,last_updated_by:w(`currentUser`).id})}})});let{error:d}=await ce(s);if(d)return e&&(e.disabled=!1,e.innerText=t),alert(`Error logging game participants: `+d.message);let{error:f}=await le(o);if(f)return e&&(e.disabled=!1,e.innerText=t),alert(`Error saving results: `+f.message);await $();let p=document.getElementById(`action-buttons`);p&&(p.style.display=`none`);let m=document.getElementById(`rollBtnContainer`);m&&(m.style.display=`flex`);let h=document.getElementById(`rollBtn`);h&&(h.style.display=`block`,h.disabled=!1,h.style.opacity=`1`,h.style.cursor=`pointer`);let g=document.getElementById(`results`);g&&(g.innerHTML=`
            <p style="color:#28a745; text-align:center; font-weight:bold;">
                Session Logged! Game record created and stats updated.
            </p>`),T(`isRollActive`,!1)}function vt(){let e=document.getElementById(`results`);e&&(e.innerHTML=`<p style="text-align: center; opacity: 0.6;">Select players and roll.</p>`);let t=document.getElementById(`action-buttons`);t&&(t.style.display=`none`);let n=w(`scrambleIntervals`);n&&(Object.keys(n).forEach(e=>{n[e]&&clearInterval(n[e])}),T(`scrambleIntervals`,{}));let r=document.getElementById(`rollBtnContainer`);r&&(r.style.display=`flex`);let i=document.getElementById(`rollBtn`);i&&(i.style.display=`block`,i.disabled=!1,i.style.opacity=`1`,i.style.cursor=`pointer`),T(`isRollActive`,!1)}function yt(){T(`currentDrawerMode`,`roll-settings`),T(`stagedDraftModeEnabled`,w(`draftModeEnabled`)),T(`stagedDraftCount`,w(`draftCount`)),T(`stagedBannedHeroIds`,new Set(w(`bannedHeroIds`))),T(`stagedBanSearchQuery`,``),T(`stagedRollSettingsTab`,`draft`);let e=document.getElementById(`sort-filter-drawer`),t=document.getElementById(`drawer-title-text`),n=document.getElementById(`drawer-footer-content`);t&&(t.innerText=`Roll Configuration`),n&&(n.style.display=`flex`),Y(),e&&(e.classList.add(`open`),document.body.style.overflow=`hidden`)}function bt(e){T(`stagedRollSettingsTab`,e),Y()}function xt(e){T(`stagedDraftModeEnabled`,e);let t=document.getElementById(`drawer-draft-count-section`);t&&(t.style.display=e?`block`:`none`)}function St(e){T(`stagedDraftCount`,e),Y()}function Ct(e){E(`stagedBannedHeroIds`,`toggle`,e),ct()}function wt(e){T(`stagedBanSearchQuery`,e),ct()}function Tt(){st()}function Et(){let e=w(`activeDraftStep`),t=w(`activeDraftOrder`),n=w(`NAMES`),r=w(`characters`),i=w(`bannedHeroIds`),a=w(`selectedDraftHeroes`);if(e>=t.length){gt();let e=document.getElementById(`action-buttons`);e&&(e.style.display=`flex`);let t=document.getElementById(`rollBtnContainer`);t&&(t.style.display=`none`),T(`isRollActive`,!0);return}let o=t[e],s=n[o];t.forEach(n=>{let r=t.indexOf(n);r<e||(r===e?ot(n):at(n,s))});let c=Object.values(a).map(e=>e?.name),l=r.filter(e=>M(e)&&!i.has(e.id)&&!c.includes(e.name));Ot(o,l),setTimeout(()=>{let e=Dt(o,l);w(`activeDraftCandidates`)[o]=e,kt(o,e)},1e3)}function Dt(e,t){let n=[],r=[...t],i=w(`draftCount`),a=Math.min(i,r.length);for(let t=0;t<a;t++){let t=null;if(e>=4){let e=Math.floor(Math.random()*r.length);t=r[e],r.splice(e,1)}else{let n=r.filter(t=>t.weights[e]>0);if(n.length===0){if(r.length>0){let e=Math.floor(Math.random()*r.length);t=r[e],r.splice(e,1)}}else{let i=n.reduce((t,n)=>t+F(n,e),0),a=Math.random()*i;for(let i of n){let n=F(i,e);if(a<n){t=i,r.splice(r.findIndex(e=>e.name===i.name),1);break}a-=n}}}t&&n.push(t)}return n}function Ot(e,t){let n=document.getElementById(`draft-wheel-${e}`);if(!n)return;let r=``,i=w(`draftCount`),a=360/i;for(let t=0;t<i;t++){let n=t*a;r+=`
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
        `}n.innerHTML=r,D(`scrambleIntervals`,e,setInterval(()=>{for(let n=0;n<i;n++){let r=t[Math.floor(Math.random()*t.length)];if(!r)continue;let i=document.getElementById(`draft-card-img-${e}-${n}`),a=document.getElementById(`draft-card-name-${e}-${n}`),o=document.getElementById(`draft-card-group-${e}-${n}`);if(i&&(i.src=A(r.slug)),a){let e=``;for(let t=0;t<6;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZ`[Math.floor(Math.random()*26)];a.innerText=e}o&&(o.innerText=r.group||``)}},70))}function kt(e,t){let n=w(`scrambleIntervals`);n[e]&&(clearInterval(n[e]),D(`scrambleIntervals`,e,void 0));let r=document.getElementById(`draft-wheel-${e}`);if(!r)return;let i=``,a=t.length;r.style.transform=`rotateY(0deg)`,w(`draftWheelFrontCardIndices`)[e]=0,w(`draftWheelAngles`)[e]=0;let o=360/a;t.forEach((t,n)=>{let r=n*o,a=e<4?`
            <span>Plays: <b>${t.playCount[e]||0}</b></span>
            <span class="stats-divider">|</span>
            <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
            <span class="stats-divider">|</span>
            <span>Prob: <b>${I(t,e)}</b></span>
        `:`
            <span>Prob: <b>${I(t,e)}</b></span>
        `;i+=`
            <div class="draft-card-wrapper" id="draft-card-wrapper-${e}-${n}" style="transform: rotateY(${r}deg) translateZ(150px);" data-action="select-draft-hero" data-player-idx="${e}" data-hero-name="${t.name.replace(/"/g,`&quot;`)}" data-hero-slug="${t.slug}" data-hero-id="${t.id}" data-angle="${r}" data-card-idx="${n}">
                <div class="draft-card">
                    <img src="${A(t.slug)}" alt="${t.name}" class="char-bg-img" style="opacity: 0.25;">
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
        `}),r.innerHTML=i;let s=document.getElementById(`draft-wheel-container-${e}`);s&&At(e,s,a)}function At(e,t,n){let r=0,i=!1,a=!1;t.addEventListener(`click`,e=>{a&&=(e.stopPropagation(),e.preventDefault(),!1)},!0),t.addEventListener(`touchstart`,e=>{r=e.touches[0].clientX,i=!0},{passive:!0}),t.addEventListener(`touchend`,t=>{if(!i)return;i=!1;let o=t.changedTouches[0].clientX-r;Math.abs(o)>10&&(a=!0),o>50?H(e,-1,n):o<-50&&H(e,1,n)},{passive:!0}),t.addEventListener(`mousedown`,t=>{r=t.clientX,i=!0;let o=()=>{},s=t=>{if(i){i=!1;let c=t.clientX-r;Math.abs(c)>10&&(a=!0),c>50?H(e,-1,n):c<-50&&H(e,1,n),document.removeEventListener(`mousemove`,o),document.removeEventListener(`mouseup`,s)}};document.addEventListener(`mousemove`,o),document.addEventListener(`mouseup`,s)})}function H(e,t,n){let r=w(`activeDraftCandidates`)[e];if(!r||r.length===0)return;let i=w(`draftWheelFrontCardIndices`);i[e]===void 0&&(i[e]=0);let a=(i[e]+t)%n;a<0&&(a+=n),i[e]=a;let o=360/n,s=w(`draftWheelAngles`);s[e]===void 0&&(s[e]=0);let c=s[e]+t*o;s[e]=c;let l=document.getElementById(`draft-wheel-${e}`);l&&(l.style.transform=`rotateY(${-c}deg)`),Mt(e)}function jt(e,t){let n=(t-e)%360;return n<-180?n+=360:n>180&&(n-=360),e+n}function Mt(e){let t=document.getElementById(`select-${e}`),n=document.getElementById(`confirm-draft-btn-${e}`),r=document.getElementById(`bg-img-${e}`),i=document.querySelectorAll(`[id^="draft-card-wrapper-${e}-"]`);t&&(t.value=``),i.forEach(e=>{e.classList.remove(`selected`)}),r&&(r.style.opacity=`0`),n&&(n.disabled=!0),w(`selectedDraftHeroes`)[e]=null}function Nt(e,t,n,r,i,a){let o=w(`selectedDraftHeroes`);if(o[e]&&o[e].id===r){Mt(e);return}let s=document.getElementById(`select-${e}`),c=document.getElementById(`confirm-draft-btn-${e}`),l=document.getElementById(`bg-img-${e}`),u=document.querySelectorAll(`[id^="draft-card-wrapper-${e}-"]`);s&&(s.value=t),w(`draftWheelFrontCardIndices`)[e]=a;let d=w(`draftWheelAngles`);d[e]===void 0&&(d[e]=0);let f=d[e],p=jt(f,i);d[e]=p;let m=document.getElementById(`draft-wheel-${e}`);m&&(m.style.transform=`rotateY(${-p}deg)`),u.forEach((e,t)=>{t===a?e.classList.add(`selected`):e.classList.remove(`selected`)}),l&&(l.src=A(n),l.style.opacity=`0.25`),c&&(c.disabled=!1),o[e]=w(`characters`).find(e=>e.id===r)}function Pt(e,t){it(e,t)}function Ft(e){let t=w(`selectedDraftHeroes`)[e];t&&(Pt(e,t),T(`activeDraftStep`,w(`activeDraftStep`)+1),Et())}var It=null,U=()=>(It||={buildInfoDiv:document.getElementById(`admin-build-info`),changelogModal:document.getElementById(`changelog-modal`),changelogContainer:document.getElementById(`changelog-container`),whatsNewModal:document.getElementById(`whats-new-modal`),whatsNewContainer:document.getElementById(`whats-new-container`),collectionContainer:document.getElementById(`collectionContainer`),collectionCountLabel:document.getElementById(`collection-count-stats`),heroForm:document.getElementById(`heroForm`),addHeroBtn:document.getElementById(`addHeroBtn`),groupSelect:document.getElementById(`charGroup`),formTitle:document.getElementById(`formTitle`),charNameInput:document.getElementById(`charName`),charSlugInput:document.getElementById(`charSlug`),charComplexitySelect:document.getElementById(`charComplexity`),groupsListContainer:document.getElementById(`groupsListContainer`),heroesListContainer:document.getElementById(`heroesListContainer`),playersListContainer:document.getElementById(`playersListContainer`),usersListContainer:document.getElementById(`usersListContainer`),collectionsListContainer:document.getElementById(`collectionsListContainer`),gamesListContainer:document.getElementById(`gamesContainer`),winnerModal:document.getElementById(`winner-modal`),winnerContainer:document.getElementById(`winner-selection-container`),confirmWinnerBtn:document.getElementById(`confirm-winner-btn`),groupForm:document.getElementById(`groupForm`),addGroupBtn:document.getElementById(`addGroupBtn`)},It);function Lt(){let e=U();if(!e.buildInfoDiv)return;let t=window.location.hostname,r=`Localhost`;t.includes(`github.io`)?r=`GitHub Pages`:t.includes(`workers.dev`)&&(r=`Cloudflare Workers`);let i=n?`Production`:`Development`,a=n?`Supabase PROD`:`Supabase DEV`,o=n?`main`:`dev/local`;e.buildInfoDiv.innerHTML=`
        <div><b>Platform:</b> ${r} (${t})</div>
        <div><b>Environment:</b> ${i} (Targeting: ${o})</div>
        <div><b>Database:</b> ${a}</div>
        ${n?``:`<div style="margin-top:5px; color:var(--danger); font-style:italic;">Note: Dev heroes are prefixed with "DEV-" in this database.</div>`}
    `}function Rt(){let e=U(),t=w(`cachedChangelog`);!t||!e.changelogContainer||!e.changelogModal||(e.changelogContainer.innerHTML=t.map(e=>`
        <div>
            <h3>v${e.version}</h3>
            <ul>
                ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
        </div>
    `).join(``),e.changelogModal.style.display=`flex`,document.body.style.overflow=`hidden`)}function zt(){let e=U();e.changelogModal&&(e.changelogModal.style.display=`none`),document.body.style.overflow=`auto`}function Bt(e){let t=U();!t.whatsNewContainer||!t.whatsNewModal||(t.whatsNewContainer.innerHTML=`
        <div>
            <h3>v${e.version}</h3>
            <ul style="text-align: left;">
                ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
        </div>
    `,t.whatsNewModal.style.display=`flex`,document.body.style.overflow=`hidden`)}function Vt(){let e=U();e.whatsNewModal&&(e.whatsNewModal.style.display=`none`),document.body.style.overflow=`auto`}function Ht(e){if(e===`admin`&&!k())return;let t={roll:`rollSection`,database:`dbSection`,history:`gamesSection`,collection:`collectionSection`,admin:`adminSection`},n=t[e];n&&(Object.values(t).forEach(e=>{let t=document.getElementById(e);t&&(e===n?t.classList.remove(`hidden`):t.classList.add(`hidden`))}),e===`database`?setTimeout(R,50):e===`history`?sn():e===`collection`&&Gt())}function Ut(e,t){let n=document.getElementById(t),r=(e.currentTarget.closest(`.panel-header`)||e.currentTarget).querySelector(`.panel-toggle`);if(!n||!r)return;let i=n.classList.toggle(`hidden`);r.classList.toggle(`open`,!i),r.setAttribute(`aria-expanded`,String(!i))}function Wt(e){let t=e.closest(`.hero-item`),n=e.querySelector(`.panel-toggle`);if(!t||!n)return;let r=t.classList.toggle(`collapsed`);n.classList.toggle(`open`,!r),n.setAttribute(`aria-expanded`,String(!r))}function Gt(){let e=U();if(!e.collectionContainer)return;let t=w(`characters`),n=w(`groups`),r=w(`currentUser`),i=w(`expandedCollectionGroups`),a=t.length,o=t.filter(w(`isHeroOwned`)||(e=>e.is_owned)).length;e.collectionCountLabel&&(e.collectionCountLabel.innerText=`Owned ${o} of ${a} heroes`);let s=[...n].sort((e,t)=>{let n=e.order_index??2**53-1,r=t.order_index??2**53-1;return n===r?e.name.localeCompare(t.name):n-r}),c=r?``:`disabled`;e.collectionContainer.innerHTML=s.map(e=>{let n=t.filter(t=>t.group_id===e.id).sort((e,t)=>e.name.localeCompare(t.name));if(n.length===0)return``;let r=n.every(w(`isHeroOwned`)||(e=>e.is_owned)),a=n.map(e=>{let t=e.is_owned;return`
            <div class="collection-hero-card ${t?`selected`:``} ${c?`disabled`:``}" data-action="toggle-hero-owned" data-hero-id="${e.id}" data-selected="${t}">
                <img src="${A(e.slug)}" class="collection-hero-card-img" alt="${e.name}">
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
        `}).join(``)}function Kt(){let e=U();e.charNameInput&&(e.charNameInput.value=``),e.charSlugInput&&(e.charSlugInput.value=``),e.groupSelect&&(e.groupSelect.value=``),e.charComplexitySelect&&(e.charComplexitySelect.value=``),e.formTitle&&(e.formTitle.innerText=`Add New Hero`),e.heroForm&&e.addHeroBtn&&(e.heroForm.classList.add(`hidden`),e.addHeroBtn.innerText=`Add Hero`)}function qt(){let e=U();if(!e.heroForm||!e.addHeroBtn)return;let t=e.heroForm.classList.toggle(`hidden`);e.addHeroBtn.innerText=t?`Add Hero`:`Hide Hero Form`,!t&&e.charNameInput&&e.charNameInput.focus()}function Jt(){let e=U();if(!e.groupSelect)return;let t=w(`groups`).map(e=>`<option value="${e.id}">${e.name}</option>`).join(``);e.groupSelect.innerHTML=`<option value="">-- Select Group --</option>`+t}function Yt(){let e=U();if(!e.groupsListContainer)return;let t=w(`groups`);if(t.length===0){e.groupsListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No groups yet. Create one above.</p>`;return}let n=t.map(e=>`
        <div id="groupRow-${e.id}" class="group-row" style="margin: 5px 0; background: rgba(255,255,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                <div>
                    <strong>${N(e.name)}</strong>
                    ${e.year?` <span style="opacity: 0.6;">(${e.year})</span>`:``}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-save btn-inline" data-action="edit-group" data-group-id="${e.id}">Edit</button>
                    <button type="button" class="btn-cancel btn-inline" data-action="delete-group" data-group-id="${e.id}">Delete</button>
                </div>
            </div>
            <div id="groupEditPanel-${e.id}" class="group-edit-panel hidden">
                <div class="form-grid">
                    <input type="text" id="groupName-${e.id}" placeholder="Group Name" value="${N(e.name)}">
                    <input type="number" id="groupOrder-${e.id}" placeholder="Order Index" value="${e.order_index??``}">
                    <input type="number" id="groupYear-${e.id}" placeholder="Release Year" value="${e.year??``}">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn-save" data-action="save-group-inline" data-group-id="${e.id}">Save</button>
                    <button type="button" class="btn-cancel" data-action="cancel-group-edit" data-group-id="${e.id}">Cancel</button>
                </div>
            </div>
        </div>
    `).join(``);e.groupsListContainer.innerHTML=n}function Xt(){let e=U();if(!e.heroesListContainer)return;let t=w(`characters`),n=w(`editIndex`),r=w(`groups`);if(t.length===0){e.heroesListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No heroes yet. Add one above.</p>`;return}let i=t.map((e,t)=>{let i=n===t,a=k()?`<button class="btn-save btn-inline" data-action="edit-hero" data-hero-idx="${t}">Edit</button>`:``,o=k()?`<button class="btn-cancel btn-inline" data-action="delete-hero" data-hero-id="${e.id}">Delete</button>`:``,s=r.map(t=>`<option value="${t.id}" ${t.id===e.group_id?`selected`:``}>${N(t.name)}</option>`).join(``);return`
            <div id="heroRow-${e.id}" class="group-row hero-admin-row${i?` editing`:``}">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div>
                        <strong>${N(e.name)}</strong>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${a}
                        ${o}
                    </div>
                </div>
                <div id="heroEditPanel-${e.id}" class="group-edit-panel${i?``:` hidden`}">
                    <div class="form-grid">
                        <input type="text" id="heroName-${t}" placeholder="Hero Name" value="${N(e.name)}">
                        <select id="heroGroup-${t}">
                            <option value="">-- Select Group --</option>
                            ${s}
                        </select>
                    </div>
                    <div class="form-grid">
                        <input type="text" id="heroSlug-${t}" placeholder="Slug (for image)" value="${N(e.slug)}">
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
            </div>`}).join(``);e.heroesListContainer.innerHTML=i,n===-1?e.heroesListContainer.classList.remove(`group-edit-active`):e.heroesListContainer.classList.add(`group-edit-active`)}function Zt(e){let t=document.getElementById(`groupEditPanel-${e}`),n=document.getElementById(`groupRow-${e}`);t&&t.classList.add(`hidden`),n&&n.classList.remove(`editing`);let r=U().groupsListContainer;r&&(r.querySelectorAll(`.group-row.editing`).length>0||r.classList.remove(`group-edit-active`))}function Qt(){let e=document.getElementById(`groupName`),t=document.getElementById(`groupOrder`),n=document.getElementById(`groupYear`);e&&(e.value=``),t&&(t.value=``),n&&(n.value=``);let r=U().groupForm,i=U().addGroupBtn;r&&i&&(r.classList.add(`hidden`),i.innerText=`Add Group`)}function $t(){let e=U().groupForm,t=U().addGroupBtn;if(!e||!t)return;let n=e.classList.toggle(`hidden`);if(t.innerText=n?`Add Group`:`Hide Group Form`,!n){let e=document.getElementById(`groupName`);e&&e.focus()}}function en(){let e=U();if(!e.playersListContainer)return;let t=w(`players`);if(t.length===0){e.playersListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No players loaded.</p>`;return}let n=t.map((e,t)=>{let n=Se(e);return`
            <div id="playerRow-${e.id}" class="group-row player-admin-row">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: ${n}; border: 1px solid rgba(255,255,255,0.2);"></span>
                        <strong>${N(e.name)}</strong>
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
                        <input type="text" id="playerName-${e.id}" placeholder="Player Name" value="${N(e.name)}">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-save" data-action="save-player-inline" data-player-id="${e.id}">Save</button>
                        <button class="btn-cancel" data-action="cancel-player-edit" data-player-id="${e.id}">Cancel</button>
                    </div>
                </div>
            </div>`}).join(``);e.playersListContainer.innerHTML=n}function tn(e){let t=document.getElementById(`playerEditPanel-${e}`),n=document.getElementById(`playerRow-${e}`);t&&t.classList.add(`hidden`),n&&n.classList.remove(`editing`);let r=U().playersListContainer;r&&(r.querySelectorAll(`.player-admin-row.editing`).length>0||r.classList.remove(`player-edit-active`))}function nn(){let e=U();if(!e.usersListContainer)return;let t=w(`authUsers`);if(t.length===0){e.usersListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No system users loaded.</p>`;return}let n=t.map(e=>{let t=e.role||`user`,n=t===`admin`;return`
            <div class="user-row" style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div>
                    <div><strong>${N(e.email||`No Email`)}</strong></div>
                    <div style="font-size: 0.8em; opacity: 0.6;">Role: ${t.toUpperCase()}</div>
                </div>
                <div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${n?`checked`:``} data-action="user-role-change" data-user-id="${e.id}">
                        <span class="toggle-slider"></span>
                    </label>
                    <span style="font-size: 0.75rem; opacity: 0.7; margin-left: 5px;">Admin</span>
                </div>
            </div>`}).join(``);e.usersListContainer.innerHTML=n}function rn(e,t){let n=U();if(!n.collectionsListContainer)return;if(e.length===0){n.collectionsListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No collections loaded.</p>`;return}let r=w(`characters`),i={};t.forEach(e=>{i[`${e.user_id}_${e.hero_id}`]=e.is_owned});let a=document.createElement(`div`);a.style.overflowX=`auto`,a.style.marginTop=`10px`,a.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr>
                    <th style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">Hero</th>
                    ${e.map(e=>`<th style="padding: 10px; font-weight: 600; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">${N(e.name)}</th>`).join(``)}
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
                        ${N(t.name)}
                    </td>
                    ${n}
                </tr>
            `}).join(``)}
            </tbody>
        </table>
    `,n.collectionsListContainer.innerHTML=``,n.collectionsListContainer.appendChild(a)}function an(e){let t=U(),n=w(`games`);w(`players`);let r=w(`NAMES`);if(!t.winnerModal||!t.winnerContainer||!t.confirmWinnerBtn)return;let i=n.find(t=>t.id===e);if(!i)return;t.confirmWinnerBtn.setAttribute(`data-game-id`,e),t.confirmWinnerBtn.disabled=!0;let a=i.game_players.filter(e=>e.is_winner===!0),o=i.game_players.filter(e=>e.is_winner===!1),s=a.length===0&&o.length>0&&o.length===i.game_players.length,c=`<div class="${i.game_players.length>3?`winner-select-grid two-rows`:`winner-select-grid`}">`;i.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1,n=e.heroes?.name||`Unknown`,i=e.heroes?.slug||``,a=e.is_winner===!0,o=a?`checked`:``,s=a?`selected`:``,l=r[t]||`Invitee`;t>=4&&(l=`Invitee (${e.player_id===`p5`?`1`:`2`})`),c+=`
            <div class="winner-card ${s}" data-action="winner-card-click" data-value="${e.player_id}">
                <input type="radio" name="winner-selection" value="${e.player_id}" ${o} style="display: none;">
                <img src="${A(i)}" class="winner-card-img" alt="${n}">
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
    `,t.winnerContainer.innerHTML=c,t.winnerModal.style.display=`flex`,document.body.style.overflow=`hidden`}function on(){let e=U();e.winnerModal&&(e.winnerModal.style.display=`none`),document.body.style.overflow=`auto`}function sn(){let e=U();if(!e.gamesListContainer)return;let t=w(`games`);w(`players`);let n=w(`NAMES`),r=w(`expandedGameIds`),i=w(`selectedGamePlayerIndex`),a=w(`gamesWinnerOnly`),o=w(`gamesUseHistorical`),s=w(`gamesHistoryStyle`)||`gorgeous`,c=document.getElementById(`games-search`),l=c?c.value.toLowerCase().trim():``,u=s===`gorgeous`,d=e=>{let n=document.getElementById(`game-count-stats`);n&&(n.innerText=`Showing ${e} of ${t?t.filter(e=>u?!e.is_historical:o||!e.is_historical).length:0} games`)},f=``;if(k()&&(f=`
            <div class="admin-view-toggle-row" style="display: flex; justify-content: flex-end; margin-bottom: 15px; padding: 0 5px;">
                <button type="button" class="btn-save btn-inline" data-action="toggle-history-view-style" style="font-size: 0.85em; padding: 6px 12px; height: auto;">
                    ${u?`Switch to Admin List View`:`Switch to Gorgeous View`}
                </button>
            </div>
        `),!t||t.length===0){e.gamesListContainer.innerHTML=f+`<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No games played yet.</p>`,d(0);return}let p=t.filter(e=>{if(u&&e.is_historical||!u&&!o&&e.is_historical)return!1;let t=!0;return i!==null&&(t=e.game_players.some(e=>{let t=parseInt(e.player_id.substring(1))-1,n=!1;return i>=0&&i<4?n=t===i:i===4&&(n=t===4||t===5),n&&a?e.is_winner===!0:n})),!(!t||l&&!(e.game_players||[]).map(e=>e.heroes?.name||``).join(` `).toLowerCase().includes(l))});if(p.length===0){e.gamesListContainer.innerHTML=f+`<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No matches found matching filter criteria.</p>`,d(0);return}d(p.length),u?e.gamesListContainer.innerHTML=f+p.map(e=>{let a=e.played_at||``;a&&!a.includes(`T`)&&(a=a.replace(` `,`T`)),a&&!a.includes(`Z`)&&!a.includes(`+`)&&(a+=`Z`);let o=new Date(a).toLocaleString(void 0,{dateStyle:`medium`,timeStyle:`short`}),s=e.game_players.filter(e=>e.is_winner===!0),c=e.game_players.filter(e=>e.is_winner===!1),u=s.length===0&&c.length>0&&c.length===e.game_players.length,d=s.length===0&&!u,f=r.has(e.id)?`expanded`:``,p=``;s.length>0&&s[0].heroes?.slug&&(p=`<img src="${A(s[0].heroes.slug)}" class="game-card-bg-img" alt="">`);let m={};e.game_players.forEach(e=>{let t=n[parseInt(e.player_id.substring(1))-1]||`Unknown`;t.toLowerCase().startsWith(`player `)&&t.length>7&&(t=`P`+t.substring(7)),m[e.player_id]=t});let h=Object.values(m).map(e=>e.charAt(0).toUpperCase()),g={};e.game_players.forEach(e=>{let t=m[e.player_id],n=t.charAt(0).toUpperCase(),r=h.filter(e=>e===n).length,i=n;r>1&&t.length>1&&(i=n+t.charAt(1).toLowerCase()),g[e.player_id]=i});let _=[...e.game_players].sort((e,t)=>e.is_winner&&!t.is_winner?-1:!e.is_winner&&t.is_winner?1:0).map(e=>{let t=parseInt(e.player_id.substring(1))-1,n=e.heroes?.slug||``,r=e.heroes?.name||`Unknown`,i=e.is_winner===!0,a=i?`winner-highlight`:``,o=i?`<span class="mini-winner-trophy">🏆</span>`:``,s=g[e.player_id];return`
                            <a href="${j(n)}" target="_blank" class="mini-portrait-wrapper ${a}" title="${r}">
                                ${o}
                                <img src="${A(n)}" class="mini-portrait-img" alt="${r}">
                                <div class="mini-portrait-pill" style="background-color: var(--p${t+1});">${s}</div>
                            </a>
                        `}).join(``),v=d?`<span class="game-card-status-badge">In Progress</span>`:``,ee=u?`<div class="player-plate-draw-badge">DRAW</div>`:``,y=`
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
                </div>`,b=k()||e.last_updated_by===w(`currentUser`)?.id?`
                    <div class="game-card-actions">
                        <button class="btn-game-action" data-action="select-winner" data-game-id="${e.id}" title="Select Winner">🏆</button>
                        <button class="btn-game-action delete" data-action="delete-game" data-game-id="${e.id}" title="Delete Game">🗑️</button>
                    </div>
                `:``,x=e.game_players.map(e=>{let r=parseInt(e.player_id.substring(1))-1,a=e.heroes?.name||`Unknown`,o=e.heroes?.slug||``,c=!!(l&&a.toLowerCase().includes(l)),f=!1;i!==null&&(i>=0&&i<4?f=r===i:i===4&&(f=r===4||r===5));let p=`draw`;p=s.length>0?e.is_winner?`winner`:`loser`:u?`draw`:d?`in-progress`:e.is_winner===!1?`loser`:`draw`;let m=``;(c||f)&&(m=`box-shadow: 0 0 8px var(--accent), 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);`);let h=e.is_winner?`<div class="player-plate-trophy">🏆</div>`:``,g=u?`<div class="player-plate-draw-badge">DRAW</div>`:``,_=``;if(e.is_winner){let n=0,r=0,i=w(`gamesUseHistorical`);t.forEach(t=>{!i&&t.is_historical||t.game_players.forEach(t=>{t.player_id===e.player_id&&t.hero_id===e.hero_id&&(n++,t.is_winner&&r++)})});let a=n>0?(r/n).toFixed(3):`.000`,o=a.startsWith(`0`)?a.substring(1):a;_=`
                                <div class="player-plate-winner-stats">${r}🏆 / ${n}🎲</div>
                                <div class="player-plate-winner-pct">( ${o})</div>
                            `}return`
                        <a href="${j(o)}" target="_blank" class="player-plate ${p}" style="${m}">
                            <img src="${A(o)}" class="player-plate-bg-art" alt="${a}">
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
                    ${y}
                    <div class="game-card-body">
                        <div class="player-responsive-grid">
                            ${x}
                        </div>
                        ${b}
                    </div>
                </div>`}).join(``):e.gamesListContainer.innerHTML=f+p.map(e=>{let t=r.has(e.id),i=new Date(e.played_at).toLocaleDateString(void 0,{month:`short`,day:`numeric`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}),a=``,o=``,s=e.game_players.filter(e=>e.is_winner===!0),c=e.game_players.filter(e=>e.is_winner===!1),u=s.length===0&&c.length===e.game_players.length,d=s.length===0&&!u;a=u?`<span style="color: var(--accent); font-weight: bold;">TIE</span>`:d?`<span style="opacity: 0.5; font-style: italic; font-size: 0.85em;">Pending...</span>`:s.map(e=>{let t=parseInt(e.player_id.substring(1))-1,r=n[t]||`Invitee`;return t>=4&&(r=`Invitee (${e.player_id===`p5`?`1`:`2`})`),`<span style="color: var(--p${t+1}); font-weight: bold;">${r}</span>`}).join(`, `),e.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1,r=`--p${t+1}`,i=n[t]||`Invitee`;t>=4&&(r=`--p5`,i=`Invitee (${e.player_id===`p5`?`1`:`2`})`);let a=``;a=e.is_winner===!0?`<span class="status-badge-win">WIN</span>`:e.is_winner===!1?`<span class="status-badge-lose">LOSS</span>`:`<span class="status-badge-pending">...</span>`;let s=!!(l&&e.heroes?.name?.toLowerCase().includes(l));o+=`
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.03);${s?` border: 1px solid var(--accent); padding: 6px; border-radius: 4px;`:``}">
                            <span style="color: var(${r}); font-weight: bold;">${i}</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 0.9em; ${s?`color: var(--accent); font-weight: bold;`:`opacity: 0.8;`}">${e.heroes?.name||`Unknown`}</span>
                                ${a}
                            </div>
                        </div>
                    `});let f=xe()&&d?`<button type="button" class="btn-save btn-inline" data-action="open-winner-modal" data-game-id="${e.id}">Select Winner</button>`:``,p=k()?`<button type="button" class="btn-cancel btn-inline" data-action="delete-game" data-game-id="${e.id}">Delete</button>`:``,m=e.is_historical?`<span style="font-size: 0.7em; letter-spacing: 0.5px; opacity: 0.5; padding: 2px 6px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; font-weight: 500; font-family: monospace;">HISTORICAL</span>`:``;return`
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
                </div>`}).join(``)}var cn=t({cancelGroupEdit:()=>Mn,cancelHeroEdit:()=>Dn,cancelPlayerEdit:()=>Rn,clearGamesSearch:()=>Gn,closeChangelog:()=>dn,closeWhatsNew:()=>pn,closeWinnerModal:()=>Yn,deleteGame:()=>Zn,deleteGroup:()=>Un,deleteHero:()=>kn,editChar:()=>xn,editGroup:()=>jn,editPlayer:()=>Ln,handleGamesSearchInput:()=>Wn,isElementFullyVisible:()=>Sn,openChangelog:()=>un,populateGroupDropdown:()=>Tn,renderAdminBuildInfo:()=>ln,renderCollectionView:()=>G,renderCollectionsList:()=>Vn,renderGamesList:()=>q,renderGroupsList:()=>En,renderHeroesList:()=>K,renderPlayersList:()=>In,renderUsersList:()=>Bn,resetForm:()=>Cn,resetGroupForm:()=>Pn,saveCharacter:()=>bn,saveGroup:()=>An,saveGroupInline:()=>Nn,saveHeroInline:()=>On,savePlayerInline:()=>zn,selectWinner:()=>Jn,setOwnershipFilter:()=>_n,showSection:()=>W,showWhatsNew:()=>fn,submitWinner:()=>Xn,toggleAdminPanel:()=>mn,toggleCollectionGroup:()=>gn,toggleGameExpansion:()=>Kn,toggleGroupForm:()=>Fn,toggleGroupOwned:()=>yn,toggleHeroForm:()=>wn,toggleHeroOwned:()=>vn,toggleHeroPanel:()=>hn,toggleHistoryViewStyle:()=>qn,toggleUserHeroOwned:()=>Hn,updateHeroStatsFromHistory:()=>Qn});function ln(){Lt()}function un(){Rt()}function dn(){zt()}function fn(e){Bt(e),localStorage.setItem(`lastSeenVersion`,e.version)}function pn(){Vt()}function W(e){Ht(e)}function mn(e,t){Ut(e,t)}function hn(e){Wt(e)}function gn(e,t){t.target.tagName===`INPUT`||t.target.tagName===`LABEL`||t.target.closest(`label`)||(E(`expandedCollectionGroups`,`toggle`,e),G())}function _n(e){let t=document.getElementById(`db-show-owned`),n=document.getElementById(`db-show-not-owned`);t&&n&&(e===`owned`?(t.checked=!0,n.checked=!1):e===`unowned`?(t.checked=!1,n.checked=!0):(t.checked=!0,n.checked=!0));let r={owned:document.getElementById(`pill-show-owned`),unowned:document.getElementById(`pill-show-not-owned`),all:document.getElementById(`pill-show-all`)};Object.keys(r).forEach(t=>{let n=r[t];n&&n.classList.toggle(`active`,t===e)}),_r(),Z()}function G(){Gt()}async function vn(e,t){if(!w(`currentUser`)){alert(`Please log in to manage your collection.`);return}let n=w(`characters`).find(t=>t.id===e);n&&(n.is_owned=t),G(),Z(),B();let r=document.getElementById(`admin-owned-${w(`currentUser`).id}-${e}`);r&&(r.checked=t);let{error:i}=await S(w(`currentUser`).id,e,t);i&&(alert(`Error updating ownership: `+i.message),n&&(n.is_owned=!t),G(),B(),Z(),r&&(r.checked=!t))}async function yn(e,t){if(!w(`currentUser`)){alert(`Please log in to manage your collection.`);return}let n=w(`characters`);n.forEach(n=>{if(n.group_id===e){n.is_owned=t;let e=document.getElementById(`admin-owned-${w(`currentUser`).id}-${n.id}`);e&&(e.checked=t)}}),G(),Z(),B();let{error:r}=await te(n.filter(t=>t.group_id===e).map(e=>({user_id:w(`currentUser`).id,hero_id:e.id,is_owned:t})));r&&(alert(`Error updating group ownership: `+r.message),n.forEach(n=>{n.group_id===e&&(n.is_owned=!t)}),G(),B(),Z())}async function bn(){let e=document.getElementById(`charName`).value.trim(),t=document.getElementById(`charGroup`).value,n=document.getElementById(`charSlug`).value.trim(),r=document.getElementById(`charComplexity`).value.trim();if(!e)return alert(`Name is required`);if(!t)return alert(`Group is required`);let{error:i}=await ne({name:e,slug:n,complexity:r?parseInt(r):null,group_id:t,last_updated_by:w(`currentUser`).id});if(i)return alert(`Error saving: `+i.message);await $(),Cn()}function xn(e){T(`editIndex`,e),K(),document.getElementById(`adminSection`).classList.contains(`hidden`)&&W(`admin`);let t=w(`characters`),n=document.getElementById(`heroEditPanel-${t[e]?.id}`);n&&!Sn(n)&&n.scrollIntoView({behavior:`smooth`,block:`nearest`})}function Sn(e){let t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)}function Cn(){T(`editIndex`,-1),Kt()}function wn(){qt()}function Tn(){Jt()}function En(){Yt()}function K(){Xt()}function Dn(){T(`editIndex`,-1),K()}async function On(e,t){let n=document.getElementById(`heroName-${t}`).value.trim(),r=document.getElementById(`heroGroup-${t}`).value,i=document.getElementById(`heroSlug-${t}`).value.trim(),a=document.getElementById(`heroComplexity-${t}`).value.trim();if(!n)return alert(`Name is required`);if(!r)return alert(`Group is required`);let{error:o}=await re({id:e,name:n,slug:i,complexity:a?parseInt(a):null,group_id:r,last_updated_by:w(`currentUser`).id});if(o)return alert(`Error saving: `+o.message);T(`editIndex`,-1),await $()}async function kn(e){if(!await O(`Delete Hero`,`Delete this hero? This action cannot be undone.`))return;let{error:t}=await ie(e);if(t)return alert(`Error deleting hero: `+t.message);await $()}async function An(){let e=document.getElementById(`groupName`).value.trim(),t=document.getElementById(`groupOrder`).value.trim(),n=document.getElementById(`groupYear`).value.trim();if(!e)return alert(`Group name is required`);let{error:r}=await ae({name:e,order_index:t?parseInt(t):null,year:n?parseInt(n):null,is_active:!0});if(r)return alert(`Error saving group: `+r.message);Pn(),$()}function jn(e){let t=w(`groups`).find(t=>t.id===e);if(!t)return;let n=document.getElementById(`groupsListContainer`);n&&(n.classList.add(`group-edit-active`),n.querySelectorAll(`.group-row`).forEach(e=>e.classList.remove(`editing`)));let r=document.getElementById(`groupEditPanel-${e}`),i=document.getElementById(`groupRow-${e}`);!r||!i||(i.classList.add(`editing`),document.getElementById(`groupName-${e}`).value=t.name,document.getElementById(`groupOrder-${e}`).value=t.order_index||``,document.getElementById(`groupYear-${e}`).value=t.year||``,r.classList.remove(`hidden`))}function Mn(e){Zt(e)}async function Nn(e){let t=document.getElementById(`groupName-${e}`).value.trim(),n=document.getElementById(`groupOrder-${e}`).value.trim(),r=document.getElementById(`groupYear-${e}`).value.trim();if(!t)return alert(`Group name is required`);let{error:i}=await ae({id:e,name:t,order_index:n?parseInt(n):null,year:r?parseInt(r):null,is_active:!0});if(i)return alert(`Error saving group: `+i.message);$()}function Pn(){Qt()}function Fn(){$t()}function In(){en()}function Ln(e){let t=w(`players`).find(t=>t.id===e);if(!t)return;let n=document.getElementById(`playersListContainer`);n&&(n.classList.add(`player-edit-active`),n.querySelectorAll(`.player-admin-row`).forEach(e=>e.classList.remove(`editing`)));let r=document.getElementById(`playerEditPanel-${e}`),i=document.getElementById(`playerRow-${e}`);!r||!i||(i.classList.add(`editing`),document.getElementById(`playerName-${e}`).value=t.name,r.classList.remove(`hidden`))}function Rn(e){tn(e)}async function zn(e){let t=document.getElementById(`playerName-${e}`).value.trim();if(!t)return alert(`Player name is required`);let{error:n}=await x(e,t);if(n)return alert(`Error saving player: `+n.message);let r=w(`players`),i=w(`NAMES`),a=r.findIndex(t=>t.id===e);a!==-1&&(r[a].name=t,i[a]=t),Rn(e),In()}function Bn(){nn()}async function Vn(){let e=document.getElementById(`collectionsListContainer`);if(!e)return;e.innerHTML=`<p style="opacity: 0.7; font-style: italic; padding: 10px;">Loading collections...</p>`;let t=[];try{let{data:n,error:r}=await y();if(r){e.innerHTML=`<p style="color: var(--danger); padding: 10px;">Error loading collections: ${N(r.message)}</p>`;return}t=n||[]}catch(t){e.innerHTML=`<p style="color: var(--danger); padding: 10px;">Error connecting to database: ${N(t.message)}</p>`;return}let n=[],r=w(`players`);r.forEach(e=>{e.user_id&&n.push({user_id:e.user_id,name:e.name,isLinked:!0})}),t.forEach(e=>{n.some(t=>t.user_id===e.user_id)||n.push({user_id:e.user_id,name:`User (${e.user_id.substring(0,8)})`,isLinked:!1})});let i=w(`currentUser`);if(i&&!n.some(e=>e.user_id===i.id)){let e=r.find(e=>e.user_id===i.id),t=e?e.name:i.email?i.email.split(`@`)[0]:`Admin`;n.push({user_id:i.id,name:t,isLinked:!!e})}rn(n,t)}async function Hn(e,t,n){let r=w(`currentUser`);if(e===r?.id){let e=w(`characters`).find(e=>e.id===t);e&&(e.is_owned=n),G(),Z(),B()}let{error:i}=await S(e,t,n);if(i){if(alert(`Error updating user collection: `+i.message),e===r?.id){let e=w(`characters`).find(e=>e.id===t);e&&(e.is_owned=!n),G(),Z(),B()}Vn()}}async function Un(e){if(!await O(`Delete Group`,`Delete this group?`))return;let{error:t}=await oe(e);if(t)return alert(`Error deleting group: `+t.message);Pn(),$()}function q(){sn()}function Wn(){let e=document.getElementById(`games-search`),t=document.getElementById(`clear-games-search`);e&&t&&t.classList.toggle(`hidden`,e.value.trim().length===0),q()}function Gn(){let e=document.getElementById(`games-search`);e&&(e.value=``,e.focus()),Wn()}function Kn(e){E(`expandedGameIds`,`toggle`,e),q()}function qn(){T(`gamesHistoryStyle`,(w(`gamesHistoryStyle`)||`gorgeous`)===`gorgeous`?`admin`:`gorgeous`),q()}function Jn(e){an(e)}function Yn(){on()}async function Xn(e){let t=document.querySelector(`input[name="winner-selection"]:checked`);if(!t)return alert(`Please select a winner.`);let n=t.value,r=document.getElementById(`confirm-winner-btn`);r.disabled=!0,r.innerText=`Saving...`;try{let{error:t}=await ue(e,n,w(`currentUser`).id);if(t)throw t;Yn(),await $()}catch(e){alert(`Error updating winner: `+e.message)}finally{r.disabled=!1,r.innerText=`Save Result`}}async function Zn(e){if(!await O(`Delete Game Record`,`Are you sure you want to delete this game record? This cannot be undone.`))return;let{error:t}=await de(e);if(t)return console.error(`Error deleting game:`,t),alert(`Failed to delete game: `+t.message);await $()}function Qn(){let e=!0,t=!0,n=w(`activeFilterDataHistories`),r=n.has(`Normal only`),i=n.has(`Historical only`);r&&!i?(e=!0,t=!1):i&&!r&&(e=!1,t=!0);let a=w(`characters`);a.forEach(e=>{e.playCount=[0,0,0,0],e.lastPlayed=[`Never`,`Never`,`Never`,`Never`],e.winCount=[0,0,0,0]});let o=w(`games`);o&&o.forEach(n=>{let r=!!n.is_historical;r&&!t||!r&&!e||n.game_players.forEach(e=>{let t=parseInt(e.player_id?.substring(1)||`0`,10)-1;if(t>=0&&t<4){let r=a.find(t=>t.id===e.hero_id);if(!r)return;if(r.playCount[t]++,e.is_winner&&r.winCount[t]++,r.lastPlayed[t]===`Never`){let e=n.played_at||``;e&&!e.includes(`T`)&&(e=e.replace(` `,`T`)),e&&!e.includes(`Z`)&&!e.includes(`+`)&&(e+=`Z`);let i=new Date(e);r.lastPlayed[t]=i.getFullYear()<2026?`Unknown`:i.toLocaleDateString(`en-CA`)}}})})}function $n(e){T(`stagedGamesWinnerOnly`,e),Y()}function er(){T(`currentDrawerMode`,`history-filter`),T(`stagedSelectedGamePlayerIndex`,w(`selectedGamePlayerIndex`)),T(`stagedGamesWinnerOnly`,w(`gamesWinnerOnly`)),T(`stagedGamesUseHistorical`,w(`gamesUseHistorical`)),ke()}function tr(){T(`stagedFilterDataHistories`,new Set(w(`activeFilterDataHistories`))),T(`stagedFilterPlayers`,new Set(w(`activeFilterPlayers`))),T(`stagedFilterComplexities`,new Set(w(`activeFilterComplexities`))),T(`stagedFilterGroups`,new Set(w(`activeFilterGroups`))),Ae()}function nr(e=null,t=!1){je(e,t)}function rr(e){let t=e.getAttribute(`data-type`),n=e.value,r=e.checked;if(t===`data-history`)E(`stagedFilterDataHistories`,r?`add`:`delete`,n);else if(t===`player`)E(`stagedFilterPlayers`,r?`add`:`delete`,n);else if(t===`complexity`){let e=Number(n);E(`stagedFilterComplexities`,r?`add`:`delete`,e)}else t===`group`&&E(`stagedFilterGroups`,r?`add`:`delete`,n);Be(),Ve()}function ir(){w(`stagedFilterDataHistories`).clear(),w(`stagedFilterPlayers`).clear(),w(`stagedFilterComplexities`).clear(),w(`stagedFilterGroups`).clear(),document.querySelectorAll(`#filter-drawer-left input[type="checkbox"]`).forEach(e=>{e.checked=!1}),Be(),Ve()}function ar(){T(`activeFilterDataHistories`,new Set(w(`stagedFilterDataHistories`))),T(`activeFilterPlayers`,new Set(w(`stagedFilterPlayers`))),T(`activeFilterComplexities`,new Set(w(`stagedFilterComplexities`))),T(`activeFilterGroups`,new Set(w(`stagedFilterGroups`))),T(`dbUseHistorical`,!w(`activeFilterDataHistories`).has(`Normal only`)||w(`activeFilterDataHistories`).has(`Historical only`)),nr(null,!0),Z(),X(),Er()}function or(){let e=document.getElementById(`hero-search`)?.value.toLowerCase()||``,t=document.getElementById(`db-show-owned`)?.checked??!0,n=document.getElementById(`db-show-not-owned`)?.checked??!1,r=w(`characters`),i=w(`games`),a=w(`stagedFilterComplexities`),o=w(`stagedFilterGroups`),s=w(`stagedFilterDataHistories`),c=w(`stagedFilterPlayers`);return r.filter(r=>{let l=!0;a.size>0&&(l=a.has(Number(r.complexity)));let u=!0;o.size>0&&(u=o.has(r.group_id));let d=!0,f=s.has(`Normal only`),p=s.has(`Historical only`);f&&!p?d=i.filter(e=>e.game_players.some(e=>e.hero_id===r.id)).some(e=>!e.is_historical):p&&!f&&(d=i.filter(e=>e.game_players.some(e=>e.hero_id===r.id)).some(e=>e.is_historical));let m=!0;c.size>0&&(m=i.filter(e=>e.game_players.some(e=>e.hero_id===r.id)).some(e=>e.game_players.some(e=>e.hero_id===r.id&&c.has(e.player_id))));let h=M(r)&&t||!M(r)&&n;return kr(r,e)&&l&&u&&d&&m&&h}).length}function J(e=null,t=!1){Me(e,t)}function Y(){Ue()}function sr(e){w(`stagedSelectedGamePlayerIndex`)===e?T(`stagedSelectedGamePlayerIndex`,null):T(`stagedSelectedGamePlayerIndex`,e),w(`stagedSelectedGamePlayerIndex`)===null&&T(`stagedGamesWinnerOnly`,!1),Y()}function cr(e){T(`stagedGamesUseHistorical`,e),Y()}function lr(e){e===`name`?T(`stagedSort`,`name`):e===`group`?T(`stagedSort`,`group`):e===`probability`?T(`stagedSort`,`w${w(`stagedSortPlayerIndex`)}`):e===`lastPlayed`&&T(`stagedSort`,`d${w(`stagedSortPlayerIndex`)}`),T(`stagedSortAsc`,e===`name`||e===`group`),We(),Ge()}function ur(e){T(`stagedSortPlayerIndex`,e);let t=w(`stagedSort`);t.startsWith(`w`)?T(`stagedSort`,`w${e}`):t.startsWith(`d`)&&T(`stagedSort`,`d${e}`),Ge()}function dr(e){let t=w(`stagedPlayerIndices`),n=t.indexOf(e);n>-1?t.splice(n,1):t.push(e),T(`stagedPlayerIndices`,t),Y()}function fr(e){e===`all`?T(`stagedLevels`,w(`stagedLevels`).size===6?new Set:new Set([1,2,3,4,5,6])):E(`stagedLevels`,`toggle`,e),Ke(),Ye()}function pr(e){let t=w(`groups`);e===`all`?w(`stagedGroups`).size===t.length?E(`stagedGroups`,`clear`):t.forEach(e=>E(`stagedGroups`,`add`,e.id)):E(`stagedGroups`,`toggle`,e),Ke(),Ye()}function mr(){let e=w(`groups`),t=w(`currentDrawerMode`);t===`sort-filter`?(T(`stagedSort`,`name`),T(`stagedSortAsc`,!0),T(`stagedSortPlayerIndex`,0),T(`stagedLevels`,new Set([1,2,3,4,5,6])),T(`stagedGroups`,new Set(e.map(e=>e.id))),Y()):t===`columns`?(T(`stagedPlayerIndices`,[0,1,2,3]),T(`stagedUseHistorical`,!0),Y()):t===`history-filter`?(T(`stagedSelectedGamePlayerIndex`,null),T(`stagedGamesWinnerOnly`,!1),T(`stagedGamesUseHistorical`,!0),Y()):t===`roll-settings`&&(T(`stagedDraftModeEnabled`,!1),T(`stagedDraftCount`,3),T(`stagedBannedHeroIds`,new Set),T(`stagedBanSearchQuery`,``),Y())}function hr(){let e=w(`currentDrawerMode`);e===`sort-filter`?(T(`currentSort`,w(`stagedSort`)),T(`sortAsc`,w(`stagedSortAsc`)),T(`currentSortPlayerIndex`,w(`stagedSortPlayerIndex`)),T(`activeLevels`,new Set(w(`stagedLevels`))),T(`activeGroups`,new Set(w(`stagedGroups`))),X(),J(null,!0),Z()):e===`columns`?(T(`activePlayerIndices`,[...w(`stagedPlayerIndices`)]),T(`dbUseHistorical`,w(`stagedUseHistorical`)),X(),J(null,!0),Z()):e===`history-filter`?(T(`selectedGamePlayerIndex`,w(`stagedSelectedGamePlayerIndex`)),T(`gamesWinnerOnly`,w(`stagedGamesWinnerOnly`)),T(`gamesUseHistorical`,w(`stagedGamesUseHistorical`)),gr(),J(null,!0),q()):e===`roll-settings`&&(T(`draftModeEnabled`,w(`stagedDraftModeEnabled`)),T(`draftCount`,w(`stagedDraftCount`)),T(`bannedHeroIds`,new Set(w(`stagedBannedHeroIds`))),localStorage.setItem(`draftModeEnabled`,w(`draftModeEnabled`)),localStorage.setItem(`draftCount`,w(`draftCount`)),localStorage.setItem(`bannedHeroIds`,JSON.stringify(Array.from(w(`bannedHeroIds`)))),Tt(),J(null,!0))}function X(){Pe()}function gr(){Fe()}function _r(){R()}function vr(e){let t=w(`currentSort`),n=w(`sortAsc`);t===e?T(`sortAsc`,!n):(T(`currentSort`,e),T(`sortAsc`,!0)),yr(),Z()}function yr(){Ie()}function br(e){Re(e)}function xr(){ze()}function Sr(e,t){T(`currentSort`,e),T(`sortAsc`,t),(e.startsWith(`w`)||e.startsWith(`d`))&&T(`currentSortPlayerIndex`,parseInt(e.substring(1))),xr(),yr(),Z()}function Cr(){let e=document.getElementById(`hero-search`),t=document.getElementById(`clear-search`);e&&t&&t.classList.toggle(`hidden`,e.value.trim().length===0)}function wr(){let e=document.getElementById(`hero-search`);e&&(e.value=``,e.focus()),Cr(),Tr()}function Tr(){Z(),Er()}function Er(){Xe()}function Dr(e,t){e===`data-history`?(E(`activeFilterDataHistories`,`delete`,t),T(`dbUseHistorical`,!w(`activeFilterDataHistories`).has(`Normal only`)||w(`activeFilterDataHistories`).has(`Historical only`))):e===`player`?E(`activeFilterPlayers`,`delete`,t):e===`complexity`?E(`activeFilterComplexities`,`delete`,t):e===`group`&&E(`activeFilterGroups`,`delete`,t);let n=document.querySelector(`#filter-drawer-left input[value="${t}"][data-type="${e}"]`);n&&(n.checked=!1),Z(),Er(),X()}function Or(){wr()}function Z(){Ze()}function kr(e,t){if(!t)return!0;let n=t.trim().toLowerCase();return(e.name||``).toLowerCase().includes(n)||(e.group||``).toLowerCase().includes(n)}var Ar=null,Q=()=>(Ar||={adminNav:document.querySelector(`.bottom-nav .admin-only`),authBtn:document.getElementById(`auth-btn`),actionButtons:document.getElementById(`action-buttons`),rollBtnContainer:document.getElementById(`rollBtnContainer`),rollBtn:document.getElementById(`rollBtn`),loginModal:document.getElementById(`login-modal`),loginError:document.getElementById(`login-error`),updatePasswordModal:document.getElementById(`update-password-modal`),updatePasswordError:document.getElementById(`update-password-error`),updatePasswordUsername:document.getElementById(`update-password-username`),newPasswordInput:document.getElementById(`new-password`),playerTogglesContainer:document.getElementById(`player-toggle-zone-top`)},Ar);function jr(){let e=Q(),t=w(`currentUser`),n=w(`loggedInPlayerIndex`),r=w(`NAMES`);if(t){if(n!==-1&&r[n])e.authBtn&&(e.authBtn.innerText=`Logout (${r[n]})`);else{let n=t.email?t.email.split(`@`)[0]:`User`;e.authBtn&&(e.authBtn.innerText=`Logout (${n})`)}e.adminNav&&(e.adminNav.style.display=k()?`flex`:`none`)}else{e.authBtn&&(e.authBtn.innerText=`Login`),e.adminNav&&(e.adminNav.style.display=`none`);let t=document.getElementById(`adminSection`);t&&t.classList.add(`hidden`),e.actionButtons&&(e.actionButtons.style.display=`none`),e.rollBtnContainer&&(e.rollBtnContainer.style.display=`flex`),e.rollBtn&&(e.rollBtn.style.display=`block`)}}function Mr(){let e=Q(),t=w(`players`);!e.playerTogglesContainer||!t||t.length===0||(e.playerTogglesContainer.innerHTML=t.map((e,t)=>{let n=t<4?`checked`:``;return`
            <label class="player-card" style="--player-color: var(--${e.id})">
                <input type="checkbox" id="use${t}" ${n} data-action="toggle-player-slot" data-player-idx="${t}">
                <span class="player-card-name">${e.name}</span>
            </label>`}).join(``))}function Nr(){let e=Q();e.loginModal&&(e.loginModal.style.display=`flex`),e.loginError&&(e.loginError.style.display=`none`),document.body.style.overflow=`hidden`}function Pr(){let e=Q();e.loginModal&&(e.loginModal.style.display=`none`),document.body.style.overflow=`auto`}function Fr(e){let t=Q();t.loginError&&(t.loginError.innerText=e,t.loginError.style.color=`var(--danger)`,t.loginError.style.display=`block`)}function Ir(){let e=Q();e.updatePasswordModal&&(e.updatePasswordModal.style.display=`block`),e.updatePasswordError&&(e.updatePasswordError.style.display=`none`),document.body.style.overflow=`hidden`;let t=w(`currentUser`);e.updatePasswordUsername&&t&&(e.updatePasswordUsername.value=t.email||``)}function Lr(){let e=Q();e.updatePasswordModal&&(e.updatePasswordModal.style.display=`none`),document.body.style.overflow=`auto`}function Rr(e){let t=Q();t.updatePasswordError&&(t.updatePasswordError.innerText=e,t.updatePasswordError.style.color=`var(--danger)`,t.updatePasswordError.style.display=`block`)}function zr(){let e=Q();e.updatePasswordError&&(e.updatePasswordError.innerText=`Password reset email sent. Please check your inbox.`,e.updatePasswordError.style.color=`#4CAF50`,e.updatePasswordError.style.display=`block`,setTimeout(()=>{e.updatePasswordError&&(e.updatePasswordError.style.color=`var(--danger)`)},5e3))}function Br(){let e=Q();e.newPasswordInput&&(e.newPasswordInput.value=``)}var Vr=null;function Hr(){jr(),Z(),q(),K()}function Ur(){Mr()}function Wr(){Nr(),Vr=e=>{e.key===`Escape`&&Gr()},document.addEventListener(`keydown`,Vr)}function Gr(){Pr(),Vr&&document.removeEventListener(`keydown`,Vr)}async function Kr(){let e=document.getElementById(`login-email`).value,t=document.getElementById(`login-password`).value,{error:n}=await u({email:e,password:t});n&&Fr(n.message)}async function qr(){let e=document.getElementById(`login-email`).value;if(!e){Fr(`Please enter your email address first to reset password.`);return}let{error:t}=await d(e);t?Fr(t.message):zr()}function Jr(){Ir()}function Yr(){Lr()}async function Xr(){let e=document.getElementById(`new-password`).value;if(!e){Rr(`Please enter a new password.`);return}let{error:t}=await f({password:e});t?Rr(t.message):(alert(`Password updated successfully!`),Yr(),Br())}async function Zr(){await O(`Log Out`,`Log out now?`)&&await p()}function Qr(){let e=(e,t)=>{let n=document.getElementById(e);n&&n.addEventListener(`click`,t)};e(`rollBtn`,lt),e(`rollSettingsBtn`,yt),e(`cancelBtn`,vt),e(`confirmBtn`,_t),e(`clear-search`,wr),e(`hero-search-btn`,Tr),e(`btn-trigger-sort`,br),e(`btn-trigger-filter`,tr),e(`clear-games-search`,Gn),e(`btn-trigger-games-filter`,er),document.querySelectorAll(`.bottom-nav .nav-item`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.getAttribute(`data-section`);n&&W(n)})});let t=document.getElementById(`version-number`);t&&t.addEventListener(`click`,un);let n=document.querySelector(`.close-button`);n&&n.addEventListener(`click`,dn),e(`whats-new-close`,pn),e(`whats-new-got-it`,pn),e(`winner-close`,Yn),e(`winner-cancel`,Yn),e(`login-close`,Gr),e(`forgot-password-btn`,qr),e(`update-password-close`,Yr),e(`hero-select-close`,V);let r=document.getElementById(`hero-search`);r&&(r.addEventListener(`keydown`,e=>{e.key===`Enter`&&Tr()}),r.addEventListener(`input`,Cr));let i=document.getElementById(`games-search`);i&&i.addEventListener(`input`,Wn);let a=document.getElementById(`hero-select-search`);a&&a.addEventListener(`input`,ft);let o=document.getElementById(`modal-sort-name`);o&&o.addEventListener(`click`,()=>dt(`name`));let s=document.getElementById(`modal-sort-weight`);s&&s.addEventListener(`click`,()=>dt(`weight`));let c=document.getElementById(`sort-filter-drawer`);c&&c.addEventListener(`click`,e=>{J(e)});let l=document.getElementById(`filter-drawer-left`);l&&l.addEventListener(`click`,e=>{nr(e)}),e(`drawer-close`,()=>J(null,!0)),e(`drawer-reset`,mr),e(`drawer-apply`,hr),e(`filter-drawer-close-btn`,ar),e(`filter-drawer-reset`,ir),e(`filter-drawer-apply`,ar),document.querySelectorAll(`.ownership-segmented-control .segmented-pill`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-filter`);t&&_n(t)})}),e(`addGroupBtn`,Fn),e(`saveGroupBtn`,An);let u=document.getElementById(`cancelGroupBtn`);u&&u.addEventListener(`click`,async()=>{document.getElementById(`groupName`).value&&!await O(`Discard Changes`,`Discard unsaved changes?`)||Pn()}),e(`addHeroBtn`,wn),e(`saveBtn`,bn);let d=document.getElementById(`cancelHeroBtn`);d&&d.addEventListener(`click`,async()=>{document.getElementById(`charName`).value&&!await O(`Discard Changes`,`Discard unsaved changes?`)||Cn()}),document.querySelectorAll(`#adminSection .panel-header`).forEach(e=>{e.addEventListener(`click`,t=>{let n=e.getAttribute(`data-panel`);n&&mn(t,n)})});let f=document.getElementById(`login-form`);f&&f.addEventListener(`submit`,e=>{e.preventDefault(),Kr()});let p=document.getElementById(`update-password-form`);p&&p.addEventListener(`submit`,e=>{e.preventDefault(),Xr()});let m=document.getElementById(`auth-btn`);m&&m.addEventListener(`click`,()=>{w(`currentUser`)?Zr():Wr()});let h=document.getElementById(`confirm-winner-btn`);h&&h.addEventListener(`click`,()=>{let e=h.getAttribute(`data-game-id`);e&&Xn(e)});let g=document.getElementById(`sort-dropdown-menu`);g&&g.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="select-sort"]`);t&&Sr(t.getAttribute(`data-sort-key`),t.getAttribute(`data-sort-asc`)===`true`)});let _=document.getElementById(`filter-drawer-left`);_&&_.addEventListener(`change`,e=>{let t=e.target.closest(`input[type="checkbox"][data-type]`);t&&rr(t)});let v=document.getElementById(`drawer-body-content`);v&&(v.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-drawer-player-filter"]`);if(n){dr(parseInt(n.getAttribute(`data-player-idx`),10));return}let r=t.closest(`[data-action="toggle-staged-player-game-filter"]`);if(r){sr(parseInt(r.getAttribute(`data-player-idx`),10));return}let i=t.closest(`[data-action="set-staged-draft-count"]`);if(i){St(parseInt(i.getAttribute(`data-count`),10));return}let a=t.closest(`[data-action="switch-roll-settings-tab"]`);if(a){bt(a.getAttribute(`data-tab`));return}let o=t.closest(`[data-action="drawer-sort-player-change"]`);if(o){ur(parseInt(o.getAttribute(`data-player-idx`),10));return}let s=t.closest(`[data-action="toggle-drawer-level"]`);if(s){if(s.getAttribute(`data-disabled`)===`true`)return;let e=s.getAttribute(`data-level`);fr(e===`all`?`all`:parseInt(e,10));return}let c=t.closest(`[data-action="toggle-drawer-group"]`);if(c){if(c.getAttribute(`data-disabled`)===`true`)return;pr(c.getAttribute(`data-group-id`));return}}),v.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-use-historical"]`);if(n){cr(n.checked);return}let r=t.closest(`[data-action="toggle-staged-draft-mode"]`);if(r){xt(r.checked);return}let i=t.closest(`[data-action="toggle-staged-winner-only"]`);if(i){$n(i.checked);return}let a=t.closest(`[data-action="drawer-sort-type-change"]`);if(a){lr(a.value);return}let o=t.closest(`[data-action="toggle-staged-ban"]`);if(o){Ct(o.getAttribute(`data-hero-id`));return}}),v.addEventListener(`input`,e=>{let t=e.target.closest(`[data-action="ban-search-input"]`);t&&wt(t.value)}));let ee=document.getElementById(`active-filters-container`);ee&&ee.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-action="clear-search-filter"]`)){Or();return}let n=t.closest(`[data-action="remove-filter-chip"]`);if(n){let e=n.getAttribute(`data-type`),t=n.getAttribute(`data-value`);e===`complexity`&&(t=parseInt(t,10)),Dr(e,t);return}});let y=document.getElementById(`results`);y&&y.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="open-hero-select"]`);if(n){ut(parseInt(n.getAttribute(`data-player-idx`),10));return}let r=t.closest(`[data-action="select-draft-hero"]`);if(r){Nt(parseInt(r.getAttribute(`data-player-idx`),10),r.getAttribute(`data-hero-name`),r.getAttribute(`data-hero-slug`),r.getAttribute(`data-hero-id`),parseFloat(r.getAttribute(`data-angle`)),parseInt(r.getAttribute(`data-card-idx`),10));return}if(t.closest(`[data-action="cancel-roll"]`)){vt();return}let i=t.closest(`[data-action="rotate-draft"]`);if(i){H(parseInt(i.getAttribute(`data-player-idx`),10),parseInt(i.getAttribute(`data-direction`),10),parseInt(i.getAttribute(`data-draft-count`),10));return}let a=t.closest(`[data-action="confirm-draft"]`);if(a){Ft(parseInt(a.getAttribute(`data-player-idx`),10));return}});let b=document.getElementById(`hero-select-options-container`);b&&b.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="select-hero-option"]`);t&&pt(t.getAttribute(`data-hero-name`))});let x=document.getElementById(`heroContainer`);x&&x.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="toggle-hero-panel"]`);if(t){if(e.target.closest(`a`)||e.target.closest(`.complexity-dice-bar`))return;hn(t)}});let S=document.getElementById(`groupsListContainer`);S&&S.addEventListener(`click`,e=>{let t=e.target,n=t.getAttribute(`data-group-id`);t.closest(`[data-action="edit-group"]`)?jn(n):t.closest(`[data-action="delete-group"]`)?Un(n):t.closest(`[data-action="save-group-inline"]`)?Nn(n):t.closest(`[data-action="cancel-group-edit"]`)&&Mn(n)});let te=document.getElementById(`heroesListContainer`);te&&te.addEventListener(`click`,e=>{let t=e.target;t.closest(`[data-action="edit-hero"]`)?xn(parseInt(t.getAttribute(`data-hero-idx`),10)):t.closest(`[data-action="delete-hero"]`)?kn(t.getAttribute(`data-hero-id`)):t.closest(`[data-action="save-hero-inline"]`)?On(t.getAttribute(`data-hero-id`),parseInt(t.getAttribute(`data-hero-idx`),10)):t.closest(`[data-action="cancel-hero-edit"]`)&&Dn()});let ne=document.getElementById(`playersListContainer`);ne&&(ne.addEventListener(`click`,e=>{let t=e.target,n=t.getAttribute(`data-player-id`);t.closest(`[data-action="edit-player"]`)?Ln(n):t.closest(`[data-action="save-player-inline"]`)?zn(n):t.closest(`[data-action="cancel-player-edit"]`)&&Rn(n)}),ne.addEventListener(`change`,e=>{let t=e.target.closest(`[data-action="player-color-change"]`);t&&we(t.getAttribute(`data-player-id`),t)}));let re=document.getElementById(`usersListContainer`);re&&re.addEventListener(`change`,e=>{e.target.closest(`[data-action="user-role-change"]`)&&(alert(`User roles must be modified directly in the Supabase Dashboard for security reasons.`),Bn())});let ie=e=>{e&&(e.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-hero-owned"]`);if(n){vn(n.getAttribute(`data-hero-id`),n.getAttribute(`data-selected`)!==`true`);return}let r=t.closest(`[data-action="toggle-collection-group"]`);if(r){if(e.target.closest(`input[type="checkbox"]`)||e.target.closest(`label`))return;gn(r.getAttribute(`data-group-id`),e);return}}),e.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-group-owned"]`);if(n){yn(n.getAttribute(`data-group-id`),n.checked);return}let r=t.closest(`[data-action="toggle-user-hero-owned"]`);if(r){Hn(r.getAttribute(`data-user-id`),r.getAttribute(`data-hero-id`),r.checked);return}}))};ie(document.getElementById(`collectionsListContainer`)),ie(document.getElementById(`collectionContainer`));let ae=document.getElementById(`gamesSection`);ae&&ae.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-action="toggle-history-view-style"]`)){qn();return}let n=t.closest(`[data-action="toggle-game-expansion"]`);if(n){Kn(n.getAttribute(`data-game-id`));return}let r=t.closest(`[data-action="select-winner"]`);if(r){Jn(r.getAttribute(`data-game-id`));return}let i=t.closest(`[data-action="delete-game"]`);if(i){Zn(i.getAttribute(`data-game-id`));return}let a=t.closest(`[data-action="open-winner-modal"]`);if(a){(void 0)(a.getAttribute(`data-game-id`));return}});let oe=document.getElementById(`winner-selection-container`);oe&&oe.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="winner-card-click"]`);if(t){let e=t.querySelector(`input[name="winner-selection"]`);if(e){e.checked=!0,oe.querySelectorAll(`.winner-card, .winner-draw-card`).forEach(e=>{e.classList.toggle(`selected`,e===t)});let n=document.getElementById(`confirm-winner-btn`);n&&(n.disabled=!1)}}}),window.addEventListener(`click`,e=>{let t=document.getElementById(`changelog-modal`),n=document.getElementById(`login-modal`),r=document.getElementById(`whats-new-modal`),i=document.getElementById(`update-password-modal`),a=document.getElementById(`hero-select-modal`);e.target===t&&dn(),e.target===n&&Gr(),e.target===r&&pn(),e.target===i&&Yr(),e.target===a&&V();let o=document.getElementById(`sort-dropdown-menu`),s=document.getElementById(`sort-dropdown-container`);o&&o.classList.contains(`show`)&&s&&!s.contains(e.target)&&xr()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&V()})}async function $(){T(`draftModeEnabled`,localStorage.getItem(`draftModeEnabled`)===`true`);let e=parseInt(localStorage.getItem(`draftCount`)||`3`,10);e!==2&&e!==3&&(e=3),T(`draftCount`,e);let t=localStorage.getItem(`bannedHeroIds`);T(`bannedHeroIds`,t?new Set(JSON.parse(t)):new Set),Tt();let{data:n,error:r}=await g();if(!r&&n){T(`groups`,n),Tn(),En();let e=new Set(n.map(e=>e.id));if(w(`activeGroups`).size===0)n.forEach(e=>E(`activeGroups`,`add`,e.id));else for(let t of w(`activeGroups`))e.has(t)||E(`activeGroups`,`delete`,t);X()}let{data:i,error:a}=await _();if(!a&&i){T(`players`,i),i.forEach(e=>{e.player_color&&Ce(e.id,P(e.player_color))});let e=i.map(e=>e.name),t=-1,n=w(`currentUser`);i.forEach((r,i)=>{i<6&&(e[i]=r.name,n&&r.user_id===n.id&&(t=i))}),T(`NAMES`,e),T(`loggedInPlayerIndex`,t),Hr(),Ur()}let{data:o,error:s}=await v();if(s)return console.error(`Error fetching heroes:`,s);T(`characters`,o.map(e=>{let t=e.user_heroes?.find(e=>e.user_id===w(`currentUser`)?.id),n=t?t.is_owned:!0,r={id:e.id,name:e.name,slug:e.slug,complexity:e.complexity,group_id:e.group_id,is_owned:n,group:e.groups?.name||`Unknown`,weights:[,,,,].fill(250),playCount:[,,,,].fill(0),lastPlayed:[,,,,].fill(`Never`),winCount:[,,,,].fill(0)};return e.player_hero_stats?.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1;t>=0&&t<4&&(r.weights[t]=e.weight)}),r}));let{data:c,error:l}=await ee();l?console.error(`Error fetching games:`,l):T(`games`,c.map(e=>({...e,game_players:(e.game_players||[]).slice().sort((e,t)=>parseInt(e.player_id?.substring(1)||`0`,10)-parseInt(t.player_id?.substring(1)||`0`,10))}))),ln(),En(),q(),K(),In(),Bn(),k()&&Vn(),G();let u=w(`currentSort`);T(`currentSort`,null),vr(u)}async function $r(){try{let{data:{session:e}}=await m();T(`currentUser`,e?.user||null),Hr(),await $(),T(`cachedChangelog`,await(await fetch(`changelog.json`)).json());let t=w(`cachedChangelog`);if(t&&t.length>0){let e=t[0],n=document.getElementById(`version-number`);n&&(n.innerText=e.version),localStorage.getItem(`lastSeenVersion`)!==e.version&&fn(e)}fe($),me((e,t)=>{console.log(`[stateStore] Update: ${e} =`,t)})}catch(e){console.error(`Could not load version number:`,e);let t=document.getElementById(`version-number`);t&&(t.innerText=`Error`)}finally{ei()}}function ei(){let e=document.getElementById(`preloader`);e&&(e.classList.add(`fade-out`),document.body.classList.add(`loaded`),e.addEventListener(`animationend`,()=>e.remove(),{once:!0}))}window.addEventListener(`DOMContentLoaded`,()=>{Qr(),$r()}),h((e,t)=>{T(`currentUser`,t?.user||null),(e===`SIGNED_IN`||e===`SIGNED_OUT`)&&$(),e===`PASSWORD_RECOVERY`&&Jr(),Hr(),e===`SIGNED_IN`&&Gr()});