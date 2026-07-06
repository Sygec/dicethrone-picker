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
        `).order(`played_at`,{ascending:!1}).order(`player_id`,{foreignTable:`game_players`,ascending:!0})}async function ee(){return s.from(`user_heroes`).select(`*`)}async function te(e,t){return s.from(`players`).update({player_color:t}).eq(`id`,e).select().single()}async function v(e,t){return s.from(`players`).update({name:t}).eq(`id`,e).select().single()}async function y(e,t,n){return s.from(`user_heroes`).upsert({user_id:e,hero_id:t,is_owned:n})}async function b(e){return s.from(`user_heroes`).upsert(e)}async function ne(e){return s.from(`heroes`).insert(e).select().single()}async function re(e){return s.from(`heroes`).upsert(e).select().single()}async function ie(e){return s.from(`heroes`).delete().eq(`id`,e)}async function ae(e){return s.from(`groups`).upsert(e).select().single()}async function oe(e){return s.from(`groups`).delete().eq(`id`,e)}async function se(e,t){return s.from(`games`).insert({last_updated_by:e,game_type:t}).select().single()}async function ce(e){return s.from(`game_players`).insert(e)}async function le(e){return s.from(`player_hero_stats`).upsert(e)}async function ue(e,t,n){if(t===`draw`)return s.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e);{let r=await s.from(`game_players`).update({is_winner:!0,last_updated_by:n}).eq(`game_id`,e).eq(`player_id`,t);return r.error?r:s.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e).neq(`player_id`,t)}}async function de(e){return s.from(`games`).delete().eq(`id`,e)}function fe(e){return s.channel(`schema-db-changes`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`user_heroes`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`player_hero_stats`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`heroes`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`games`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`game_players`},e).subscribe()}var x={NAMES:[],characters:[],games:[],players:[],invitees:[],selectedGameType:null,rollModeChosen:!1,teamAssignments:null,teamSwapSource:null,groups:[],authUsers:[],cachedChangelog:null,activeLevels:new Set([1,2,3,4,5,6]),activeGroups:new Set,selectedGamePlayerIndex:null,expandedGameIds:new Set,currentSort:`name`,sortAsc:!0,currentSortPlayerIndex:0,editIndex:-1,activePlayerIndices:[0,1,2,3],currentDrawerMode:`sort-filter`,stagedSort:``,stagedSortAsc:!0,stagedSortPlayerIndex:0,stagedLevels:new Set,stagedGroups:new Set,stagedPlayerIndices:[],stagedUseHistorical:!0,dbUseHistorical:!0,activeFilterDataHistories:new Set,activeFilterPlayers:new Set,activeFilterComplexities:new Set,activeFilterGroups:new Set,stagedFilterDataHistories:new Set,stagedFilterPlayers:new Set,stagedFilterComplexities:new Set,stagedFilterGroups:new Set,activeOwnershipFilter:`owned`,stagedOwnershipFilter:`owned`,gamesWinnerOnly:!1,gamesUseHistorical:!0,stagedSelectedGamePlayerIndex:null,stagedGamesWinnerOnly:!1,stagedGamesUseHistorical:!0,currentUser:null,loggedInPlayerIndex:-1,isRollActive:!1,expandedCollectionGroups:new Set,scrambleIntervals:{},activeSelectPlayerIdx:null,modalSortMode:`name`,draftModeEnabled:!1,draftCount:3,bannedHeroIds:new Set,stagedBannedHeroIds:new Set,stagedBanSearchQuery:``,activeDraftOrder:[],activeDraftStep:0,selectedDraftHeroes:{},activeDraftCandidates:{},activeRollParticipants:[],gamesHistoryStyle:`gorgeous`},pe=new Set;function me(e){return pe.add(e),()=>{pe.delete(e)}}function he(e,t){pe.forEach(n=>{try{n(e,t,x)}catch(e){console.error(`Error in stateStore listener:`,e)}})}function S(e){return x[e]}function C(e,t){x[e]=t,he(e,t)}function w(e,t,n){let r=x[e];if(!(r instanceof Set)){console.warn(`stateStore: ${e} is not an instance of Set.`);return}t===`add`?r.add(n):t===`delete`?r.delete(n):t===`clear`?r.clear():t===`toggle`&&(r.has(n)?r.delete(n):r.add(n)),he(e,r)}function ge(e,t,n){let r=x[e];if(typeof r!=`object`||!r){console.warn(`stateStore: ${e} is not an object.`);return}n===void 0?delete r[t]:r[t]=n,he(e,r)}function _e(e,t=`info`){let n=document.getElementById(`toast-container`);n||(n=document.createElement(`div`),n.id=`toast-container`,document.body.appendChild(n));let r=document.createElement(`div`);r.className=`toast toast-${t}`,r.innerHTML=`
        <span class="toast-message"></span>
        <button class="toast-close" aria-label="Close">&times;</button>
    `,r.querySelector(`.toast-message`).textContent=e,n.appendChild(r),requestAnimationFrame(()=>{r.classList.add(`show`)});let i=()=>{r.parentNode&&(r.classList.remove(`show`),r.addEventListener(`transitionend`,()=>{r.parentNode&&r.parentNode.removeChild(r)}))},a=setTimeout(i,4e3);r.querySelector(`.toast-close`).addEventListener(`click`,()=>{clearTimeout(a),i()})}function T(e,t){return new Promise(n=>{let r=document.createElement(`div`);r.id=`confirm-modal-overlay`,r.innerHTML=`
            <div class="confirm-modal-content">
                <h3 class="confirm-modal-title"></h3>
                <p class="confirm-modal-message"></p>
                <div class="confirm-modal-actions">
                    <button class="confirm-btn confirm-btn-cancel" id="confirm-cancel-btn">Cancel</button>
                    <button class="confirm-btn confirm-btn-confirm" id="confirm-confirm-btn">Confirm</button>
                </div>
            </div>
        `,r.querySelector(`.confirm-modal-title`).textContent=e,r.querySelector(`.confirm-modal-message`).textContent=t,document.body.appendChild(r),requestAnimationFrame(()=>{r.classList.add(`show`)});let i=()=>{r.classList.remove(`show`),r.addEventListener(`transitionend`,()=>{r.parentNode&&r.parentNode.removeChild(r)})};r.querySelector(`#confirm-cancel-btn`).addEventListener(`click`,()=>{i(),n(!1)}),r.querySelector(`#confirm-confirm-btn`).addEventListener(`click`,()=>{i(),n(!0)}),r.addEventListener(`click`,e=>{e.target===r&&(i(),n(!1))})})}var ve=null,E=()=>(ve||={adminNav:document.querySelector(`.bottom-nav .admin-only`),authBtn:document.getElementById(`auth-btn`),actionButtons:document.getElementById(`action-buttons`),avatarBtn:document.getElementById(`header-avatar-btn`),accountModal:document.getElementById(`account-modal`),loginModal:document.getElementById(`login-modal`),loginError:document.getElementById(`login-error`),loginEmailInput:document.getElementById(`login-email`),updatePasswordModal:document.getElementById(`update-password-modal`),updatePasswordError:document.getElementById(`update-password-error`),updatePasswordUsername:document.getElementById(`update-password-username`),newPasswordInput:document.getElementById(`new-password`),confirmPasswordInput:document.getElementById(`confirm-password`),playerTogglesContainer:document.getElementById(`player-toggle-zone-top`)},ve);function ye(){let e=E(),t=S(`currentUser`),n=S(`loggedInPlayerIndex`),r=S(`NAMES`),i=S(`players`);if(t){if(n!==-1&&r[n])e.authBtn&&(e.authBtn.innerText=`Logout (${r[n]})`);else{let n=t.email?t.email.split(`@`)[0]:`User`;e.authBtn&&(e.authBtn.innerText=`Logout (${n})`)}e.adminNav&&(e.adminNav.style.display=K()?`flex`:`none`);let a=n===-1?null:i[n];e.avatarBtn&&(a?(e.avatarBtn.classList.add(`logged-in`),e.avatarBtn.style.setProperty(`--avatar-color`,`var(--${a.id})`)):(e.avatarBtn.classList.remove(`logged-in`),e.avatarBtn.style.removeProperty(`--avatar-color`)))}else{e.authBtn&&(e.authBtn.innerText=`Login`),e.adminNav&&(e.adminNav.style.display=`none`);let t=document.getElementById(`adminSection`);t&&t.classList.add(`hidden`),e.actionButtons&&(e.actionButtons.style.display=`none`),e.avatarBtn&&(e.avatarBtn.classList.remove(`logged-in`),e.avatarBtn.style.removeProperty(`--avatar-color`))}}function be(){let e=E();e.accountModal&&(e.accountModal.style.display=`flex`),document.body.style.overflow=`hidden`}function xe(){let e=E();e.accountModal&&(e.accountModal.style.display=`none`),document.body.style.overflow=`auto`}function Se(){let e=E(),t=S(`players`);!e.playerTogglesContainer||!t||t.length===0||(e.playerTogglesContainer.innerHTML=t.slice(0,4).map((e,t)=>`
            <label class="player-card" style="--player-color: var(--${e.id})">
                <input type="checkbox" id="use${t}" data-action="toggle-player-slot" data-player-idx="${t}">
                <span class="player-card-name">${e.name}</span>
            </label>`).join(``))}function Ce(){let e=E();e.loginModal&&(e.loginModal.style.display=`flex`),e.loginError&&(e.loginError.style.display=`none`),De(),document.body.style.overflow=`hidden`}function we(){let e=E();e.loginModal&&(e.loginModal.style.display=`none`),De(),document.body.style.overflow=`auto`}function Te(e){let t=E();t.loginError&&(t.loginError.innerText=e,t.loginError.style.color=`var(--danger)`,t.loginError.style.fontSize=`0.95rem`,t.loginError.style.fontWeight=`600`,t.loginError.style.display=`block`)}function Ee(e){Te(e);let t=E();t.loginEmailInput&&(t.loginEmailInput.style.borderColor=`var(--danger)`,t.loginEmailInput.style.boxShadow=`0 0 0 2px color-mix(in srgb, var(--danger) 25%, transparent)`)}function De(){let e=E();e.loginEmailInput&&(e.loginEmailInput.style.borderColor=`#ccc`,e.loginEmailInput.style.boxShadow=``)}function Oe(){let e=E();e.updatePasswordModal&&(e.updatePasswordModal.style.display=`block`),e.updatePasswordError&&(e.updatePasswordError.style.display=`none`),document.body.style.overflow=`hidden`;let t=S(`currentUser`);e.updatePasswordUsername&&t&&(e.updatePasswordUsername.value=t.email||``)}function ke(){let e=E();e.updatePasswordModal&&(e.updatePasswordModal.style.display=`none`),document.body.style.overflow=`auto`}function Ae(e){let t=E();t.updatePasswordError&&(t.updatePasswordError.innerText=e,t.updatePasswordError.style.color=`var(--danger)`,t.updatePasswordError.style.display=`block`)}function je(){let e=E();e.loginError&&(e.loginError.innerText=`Password reset email sent. Please check your inbox.`,e.loginError.style.color=`#4CAF50`,e.loginError.style.fontSize=`0.95rem`,e.loginError.style.fontWeight=`600`,e.loginError.style.display=`block`,setTimeout(()=>{e.loginError&&(e.loginError.style.display=`none`,e.loginError.innerText=``,e.loginError.style.color=`var(--danger)`)},5e3))}function Me(){let e=E();e.newPasswordInput&&(e.newPasswordInput.value=``),e.confirmPasswordInput&&(e.confirmPasswordInput.value=``)}var D=null;function Ne(){ye(),H(),G(),ii()}function Pe(){Se()}function Fe(){Ce(),D=e=>{e.key===`Escape`&&Ie()},document.addEventListener(`keydown`,D)}function Ie(){we(),D&&document.removeEventListener(`keydown`,D)}function Le(){be()}function Re(){xe()}async function ze(){let e=document.getElementById(`login-email`).value,t=document.getElementById(`login-password`).value,{error:n}=await c({email:e,password:t});n&&Te(n.message)}async function Be(){let e=document.getElementById(`login-email`).value;if(!e){Ee(`Please enter your email address first.`);return}De();let{error:t}=await l(e);t?Te(t.message||`Failed to send reset email. Please try again.`):je()}function Ve(){Oe()}function He(){ke()}async function Ue(){let e=document.getElementById(`new-password`).value,t=document.getElementById(`confirm-password`).value;if(!e){Ae(`Please enter a new password.`);return}if(e!==t){Ae(`Passwords do not match.`);return}let{error:n}=await u({password:e});n?Ae(n.message):(alert(`Password updated successfully!`),He(),Me())}async function We(){await T(`Log Out`,`Log out now?`)&&await d()}var Ge=`<rect x="0" y="-1.5" width="9" height="3"></rect><rect x="8" y="-2.3" width="1" height="0.8"></rect><path d="M0 1.5 L-1.2 7 L3.5 7 L2.5 1.5 Z"></path><path d="M2.5 2 q2 2 0 4"></path>`,O={duel:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(12,12) rotate(-45)">${Ge}</g><g transform="translate(12,12) rotate(45) scale(-1,1)">${Ge}</g></svg>`,teams:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,ffa:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"></line><path d="M5 5 L8 5 M5 5 L5 8"></path><line x1="19" y1="5" x2="5" y2="19"></line><path d="M19 5 L16 5 M19 5 L19 8"></path></svg>`,koth:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4 4 5-7 5 7 4-4-2 10H5z"></path></svg>`},Ke=`<svg class="setup-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,qe=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="13 6 19 12 13 18"></polyline></svg>`,Je={duel:`1v1`,"2v2":`2v2`,"3v3":`3v3`,ffa:`FFA`,koth:`KotH`},Ye={duel:`Standard health pools (50 HP), each player has their CP.`,"2v2":`Teams share a single health pool (50 HP for 2v2), each player has their CP.`,"3v3":`Teams share a single health pool (60 HP for 3v3), each player has their CP.`,ffa:`Standard health pools (50 HP), each player has their CP, targeting using dice (1/2 left, 3/4 across, 5/6 right). With 3 players, 3/4 is player's choice.`,koth:`Free For All variant when you may freely choose any opponent, but if you attack the highest health player, you immediately draw a bonus card.`},Xe=null,k=()=>(Xe||={gameTypeStep:document.getElementById(`setup-step-gametype`),gameTypeGrid:document.getElementById(`game-type-grid`),gameTypeHint:document.getElementById(`game-type-hint`),inviteeZone:document.getElementById(`invitee-zone`),teamsStep:document.getElementById(`setup-step-teams`),teamsGrid:document.getElementById(`teams-grid`),randomizeTeamsBtn:document.getElementById(`randomize-teams-btn`),teamSwapQuestion:document.getElementById(`team-swap-question`),teamSwapScrim:document.getElementById(`team-swap-scrim`),rollModeStep:document.getElementById(`setup-step-rollmode`),rollModeGrid:document.getElementById(`roll-mode-grid`),draftCountSection:document.getElementById(`draft-count-section`),draftCountGrid:document.getElementById(`draft-count-grid`),rollStep:document.getElementById(`setup-step-roll`),rollFinalBtn:document.getElementById(`roll-final-btn`)},Xe);function A(){let e=k();if(!e.inviteeZone)return;let t=S(`invitees`).map(e=>`
            <label class="player-card invitee-card" style="--player-color: var(--p5)">
                <input type="checkbox" checked data-invitee-id="${e.id}">
                <span class="player-card-name">${e.name}</span>
            </label>`).join(``),n=ut()?`
            <button type="button" class="player-card invitee-add-btn" data-action="add-invitee">
                <span class="invitee-add-icon" aria-hidden="true">+</span>
            </button>`:``;e.inviteeZone.innerHTML=t+n}function Ze(e=P()){let t=k();t.gameTypeStep&&t.gameTypeStep.classList.toggle(`step-locked`,e<2)}function Qe(){let e=k();if(!e.gameTypeGrid)return;let t=pt(P()),n=S(`selectedGameType`),r=[{type:`duel`,label:`1v1 Duel`,enabled:t.duel,icon:O.duel},{type:t.teamsValue,label:`Teams ${t.teamsValue}`,enabled:t.teams,icon:O.teams},{type:`ffa`,label:`Free For All`,enabled:t.ffa,icon:O.ffa},{type:`koth`,label:`King of the Hill`,enabled:t.koth,icon:O.koth}];e.gameTypeGrid.innerHTML=r.map(e=>`
            <button type="button"
                class="game-type-btn${e.type===n?` active`:``}"
                data-action="select-game-type"
                data-type="${e.type}"
                ${e.enabled?``:`disabled`}>
                <span class="game-type-icon">${e.icon}</span>
                <span class="game-type-label">${e.label}</span>
            </button>`).join(``),$e(n)}function $e(e=S(`selectedGameType`)){let t=k();if(!t.gameTypeHint)return;let n=e&&Ye[e];if(!n){t.gameTypeHint.style.display=`none`,t.gameTypeHint.innerHTML=``;return}t.gameTypeHint.style.display=`flex`,t.gameTypeHint.innerHTML=`${Ke}<span>${n}</span>`}function et(e,t,n,r){let i=!!r&&r.team!==e,a=t.map(t=>{let a=n.get(t);if(!a)return``;if(i)return`
                <button type="button" class="team-player-row swap-candidate" data-action="complete-team-swap" data-participant-id="${a.id}" style="--player-color: var(--${a.colorVar})">
                    <span class="team-player-dot"></span>
                    <span class="team-player-name">${a.name}</span>
                </button>`;let o=!!r&&r.id===a.id,s=e===`B`,c=`<span class="team-player-arrow" aria-hidden="true">${qe}</span>`,l=`<span class="team-player-dot"></span><span class="team-player-name">${a.name}</span>`;return`
                <button type="button" class="team-player-row${o?` swap-source`:``}${s?` reversed`:``}" data-action="initiate-team-swap" data-participant-id="${a.id}" data-team="${e}" aria-label="Swap ${a.name}" style="--player-color: var(--${a.colorVar})">
                    ${s?c+l:l+c}
                </button>`}).join(``);return`
        <div class="team-panel${i?` swap-target`:``}" data-team="${e}">
            <div class="team-panel-title">Team ${e}</div>
            <div class="team-panel-players">${a}</div>
        </div>`}function j(){let e=k();if(!e.teamsStep)return;if(!lt(S(`selectedGameType`))){e.teamsStep.style.display=`none`,e.teamSwapScrim.style.display=`none`;return}e.teamsStep.style.display=`block`;let t=S(`teamAssignments`);if(!t){e.teamsGrid.innerHTML=``;return}let n=S(`teamSwapSource`),r=new Map(dt().map(e=>[e.id,e]));e.teamsGrid.innerHTML=et(`A`,t.teamA,r,n)+et(`B`,t.teamB,r,n),e.randomizeTeamsBtn.style.display=n?`none`:`block`,e.teamSwapQuestion.style.display=n?`block`:`none`,e.teamSwapQuestion.classList.toggle(`swap-active`,!!n),e.teamSwapScrim.style.display=n?`block`:`none`}var tt=[2,3,4,5];function nt(){let e=k();e.rollModeStep&&e.rollModeStep.classList.toggle(`step-locked`,!S(`selectedGameType`))}function M(){let e=k();if(!e.rollModeGrid)return;let t=S(`rollModeChosen`),n=S(`draftModeEnabled`),r=S(`draftCount`),i=!S(`selectedGameType`);e.rollModeGrid.innerHTML=`
        <button type="button" class="roll-mode-btn${t&&!n?` active`:``}" data-action="select-roll-mode" data-mode="quick" ${i?`disabled`:``}>
            <span class="roll-mode-title">Quick Roll</span>
            <span class="roll-mode-subtitle">1 hero per player</span>
        </button>
        <button type="button" class="roll-mode-btn${t&&n?` active`:``}" data-action="select-roll-mode" data-mode="draft" ${i?`disabled`:``}>
            <span class="roll-mode-title">Draft Roll</span>
            <span class="roll-mode-subtitle">Pick 1 of N options</span>
        </button>`,e.draftCountSection.style.display=t&&n?`block`:`none`,e.draftCountGrid.innerHTML=tt.map(e=>`
        <button type="button" class="draft-count-btn${r===e?` active`:``}" data-action="select-draft-count" data-count="${e}">${e}</button>`).join(``)}function N(){let e=k();if(!e.rollStep||!e.rollFinalBtn)return;let t=S(`selectedGameType`),n=S(`rollModeChosen`);if(e.rollStep.classList.toggle(`step-locked`,!t||!n),!t){e.rollFinalBtn.disabled=!0,e.rollFinalBtn.innerHTML=`<span>ROLL &middot; Complete the steps above</span>`;return}if(!n){e.rollFinalBtn.disabled=!0,e.rollFinalBtn.innerHTML=`<span>ROLL &middot; Finish selecting your options above</span>`;return}e.rollFinalBtn.disabled=!1;let r=lt(t)?O.teams:O[t],i=Je[t],a=P();e.rollFinalBtn.innerHTML=`${r}<span>ROLL &middot; ${i} &middot; ${a} PLAYER${a===1?``:`S`}</span>`}function rt(){let e=document.getElementById(`randomizer-setup`);e&&(e.style.display=`none`);let t=document.getElementById(`team-swap-scrim`);t&&(t.style.display=`none`)}function it(){let e=document.getElementById(`randomizer-setup`);e&&(e.style.display=`block`);let t=document.getElementById(`results-title`);t&&(t.style.display=`none`)}var at={draft:`ROLL &middot; DRAFT`,confirmation:`ROLL &middot; CONFIRMATION`};function ot(e){let t=document.getElementById(`results-title`);t&&(t.innerHTML=at[e]||``,t.style.display=`block`)}function st(){A(),Ze(),Qe(),j(),nt(),M(),N()}var ct=6;function lt(e){return e===`2v2`||e===`3v3`}function P(){return document.querySelectorAll(`#player-toggle-zone-top input:checked, #invitee-zone input:checked`).length}function ut(){return document.querySelectorAll(`#player-toggle-zone-top input:checked`).length+S(`invitees`).length<ct}function dt(){let e=S(`players`).slice(0,4),t=S(`invitees`),n=[];return e.forEach((e,t)=>{document.getElementById(`use${t}`)?.checked&&n.push({id:e.id,name:e.name,colorVar:e.id})}),t.forEach(e=>{document.querySelector(`#invitee-zone input[data-invitee-id="${e.id}"]`)?.checked&&n.push({id:e.id,name:e.name,colorVar:`p5`})}),n}function ft(){let e=S(`players`).slice(0,4),t=S(`invitees`),n=[];e.forEach((e,t)=>{document.getElementById(`use${t}`)?.checked&&n.push({pIdx:t,name:e.name,colorVar:e.id,isInvitee:!1})});let r=0;return t.forEach(e=>{document.querySelector(`#invitee-zone input[data-invitee-id="${e.id}"]`)?.checked&&(n.push({pIdx:4+r,name:e.name,colorVar:`p5`,isInvitee:!0}),r++)}),n}function pt(e){return{duel:e===2,teams:e===4||e===6,ffa:e>=3&&e<=6,koth:e>=3&&e<=6,teamsValue:e===6?`3v3`:`2v2`}}function mt(){if(!ut())return;let e=S(`invitees`);C(`invitees`,[...e,{id:`invitee-${Date.now()}`,name:`Invitee ${e.length+1}`}]),A(),F()}function ht(e){C(`invitees`,S(`invitees`).filter(t=>t.id!==e).map((e,t)=>({...e,name:`Invitee ${t+1}`}))),A(),F()}function gt(){C(`invitees`,[]),A(),F()}function _t(){C(`invitees`,[]),C(`selectedGameType`,null),C(`teamAssignments`,null),C(`teamSwapSource`,null),C(`rollModeChosen`,!1),A(),F()}function vt(e){if(!e)return;let t=pt(P());(e===`duel`&&t.duel||e===t.teamsValue&&t.teams||e===`ffa`&&t.ffa||e===`koth`&&t.koth)&&(C(`selectedGameType`,e),C(`teamSwapSource`,null),lt(e)?xt():C(`teamAssignments`,null),Qe(),j(),nt(),M(),N())}function F(){let e=P(),t=pt(e),n=S(`selectedGameType`),r=n===`duel`&&t.duel||n===t.teamsValue&&t.teams||n===`ffa`&&t.ffa||n===`koth`&&t.koth;n&&!r&&C(`selectedGameType`,null);let i=S(`selectedGameType`);C(`teamSwapSource`,null),lt(i)?xt():C(`teamAssignments`,null),Ze(e),Qe(),j(),nt(),M(),N()}function yt(e){let t=e===`draft`;C(`rollModeChosen`,!0),C(`draftModeEnabled`,t),localStorage.setItem(`draftModeEnabled`,t),M(),N()}function bt(e){C(`draftCount`,e),localStorage.setItem(`draftCount`,e),M()}function xt(){let e=[...dt()].sort(()=>Math.random()-.5),t=e.length/2;C(`teamAssignments`,{teamA:e.slice(0,t).map(e=>e.id),teamB:e.slice(t).map(e=>e.id)}),C(`teamSwapSource`,null),j()}function St(e,t){C(`teamSwapSource`,{id:e,team:t}),j()}function Ct(){C(`teamSwapSource`,null),j()}function wt(e){let t=S(`teamSwapSource`),n=S(`teamAssignments`);if(!t||!n)return;let{teamA:r,teamB:i}=n,a=t.team===`A`?r:i,o=t.team===`A`?i:r,s=a.indexOf(t.id),c=o.indexOf(e);s===-1||c===-1||(a[s]=e,o[c]=t.id,C(`teamAssignments`,{teamA:r,teamB:i}),C(`teamSwapSource`,null),j())}var Tt=null,I=()=>(Tt||={sortSection:document.getElementById(`sort-section`),sortToggleBtn:document.getElementById(`sort-panel-toggle`),filterSection:document.getElementById(`filter-section`),filterToggleBtn:document.getElementById(`filter-panel-toggle`),sortFilterDrawer:document.getElementById(`sort-filter-drawer`),drawerTitle:document.getElementById(`drawer-title-text`),drawerFooter:document.getElementById(`drawer-footer-content`),drawerBody:document.getElementById(`drawer-body-content`),leftFilterDrawer:document.getElementById(`filter-drawer-left`),leftPlayersContainer:document.getElementById(`filter-options-players`),leftGroupsContainer:document.getElementById(`filter-options-groups`),leftHeroCountLabel:document.getElementById(`filter-drawer-hero-count`),leftTitleDataHistory:document.getElementById(`title-data-history`),leftTitlePlayers:document.getElementById(`title-players`),leftTitleComplexity:document.getElementById(`title-complexity`),leftTitleGroups:document.getElementById(`title-groups`),filterActiveBadge:document.getElementById(`filter-active-badge`),gamesFilterActiveBadge:document.getElementById(`games-filter-active-badge`),sortTriggerBtn:document.getElementById(`btn-trigger-sort`),sortDropdownMenu:document.getElementById(`sort-dropdown-menu`),activeFiltersContainer:document.getElementById(`active-filters-container`),heroContainer:document.getElementById(`heroContainer`),countStatsLabel:document.getElementById(`count-stats`),heroSearchInput:document.getElementById(`hero-search`),dbShowOwnedCheckbox:document.getElementById(`db-show-owned`),dbShowNotOwnedCheckbox:document.getElementById(`db-show-not-owned`)},Tt);function Et(){let e=I();e.sortFilterDrawer&&(e.drawerTitle&&(e.drawerTitle.innerText=`Filter History`),e.drawerFooter&&(e.drawerFooter.style.display=`flex`),Ht(),e.sortFilterDrawer.classList.add(`open`),document.body.style.overflow=`hidden`)}function Dt(){let e=S(`stagedOwnershipFilter`);Object.entries({owned:`pill-show-owned`,unowned:`pill-show-not-owned`,all:`pill-show-all`}).forEach(([t,n])=>{document.getElementById(n)?.classList.toggle(`active`,t===e)}),Pt()}function Ot(){jt(),Dt(),zt(),Bt();let e=I();e.leftFilterDrawer&&(e.leftFilterDrawer.classList.add(`open`),document.body.style.overflow=`hidden`)}function kt(e=null,t=!1){if(e&&e.target!==e.currentTarget&&!t)return;let n=I();n.leftFilterDrawer&&(n.leftFilterDrawer.classList.remove(`open`),document.body.style.overflow=`auto`)}function At(e=null,t=!1){if(e&&e.target!==e.currentTarget&&!t)return;let n=I();n.sortFilterDrawer&&(n.sortFilterDrawer.classList.remove(`open`),document.body.style.overflow=`auto`)}function jt(){let e=I(),t=S(`players`),n=S(`groups`),r=S(`stagedFilterPlayers`),i=S(`stagedFilterGroups`),a=S(`stagedFilterDataHistories`),o=S(`stagedFilterComplexities`);if(e.leftPlayersContainer&&t){let n=t.filter(e=>e.name&&!e.name.toLowerCase().includes(`invitee`)).slice().sort((e,t)=>e.name.localeCompare(t.name));e.leftPlayersContainer.innerHTML=n.map(e=>{let t=r.has(e.id)?`checked`:``;return`
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${e.id}" data-type="player" ${t} />
                    ${e.name}
                </label>
            `}).join(``)}if(e.leftGroupsContainer&&n){let t=n.slice().sort((e,t)=>(e.order_index??0)-(t.order_index??0));e.leftGroupsContainer.innerHTML=t.map(e=>{let t=i.has(e.id)?`checked`:``;return`
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${e.id}" data-type="group" ${t} />
                    ${e.name}
                </label>
            `}).join(``)}document.querySelectorAll(`#filter-drawer-left input[data-type="data-history"]`).forEach(e=>{e.checked=a.has(e.value)}),document.querySelectorAll(`#filter-drawer-left input[data-type="complexity"]`).forEach(e=>{e.checked=o.has(Number(e.value))})}function Mt(){let e=I();if(!e.filterActiveBadge)return;let t=S(`activeFilterDataHistories`),n=S(`activeFilterPlayers`),r=S(`activeFilterComplexities`),i=S(`activeFilterGroups`),a=S(`activeOwnershipFilter`),o=0;t&&(o+=t.size),n&&(o+=n.size),r&&(o+=r.size),i&&(o+=i.size),a&&a!==`all`&&o++,o>0?(e.filterActiveBadge.innerText=o,e.filterActiveBadge.style.display=`inline-block`):e.filterActiveBadge.style.display=`none`}function Nt(){let e=I();if(!e.gamesFilterActiveBadge)return;let t=S(`selectedGamePlayerIndex`),n=S(`gamesWinnerOnly`),r=S(`gamesUseHistorical`),i=0;t!==null&&i++,n&&i++,r||i++,i>0?(e.gamesFilterActiveBadge.innerText=i,e.gamesFilterActiveBadge.style.display=`inline-block`):e.gamesFilterActiveBadge.style.display=`none`}function Pt(){document.querySelectorAll(`.ownership-segmented-control, .segmented-control`).forEach(e=>{let t=e.querySelector(`.segmented-pill.active`),n=e.querySelector(`.segmented-highlight`);n||(n=document.createElement(`div`),n.className=`segmented-highlight`,e.insertBefore(n,e.firstChild)),t&&(n.style.width=`${t.offsetWidth}px`,n.style.transform=`translateX(${t.offsetLeft}px)`,n.style.height=`${t.offsetHeight}px`)})}function Ft(){let e=I();if(!e.sortTriggerBtn)return;let t=S(`currentSort`),n=S(`sortAsc`),r=S(`currentSortPlayerIndex`),i=S(`NAMES`),a=`Hero (A-Z)`;if(t===`name`)a=n?`Hero (A-Z)`:`Hero (Z-A)`;else if(t===`complexity`)a=n?`Complexity (1-6)`:`Complexity (6-1)`;else if(t.startsWith(`w`)){let e=i[r]||`Player ${r+1}`;a=n?`${e} % (Low to High)`:`${e} % (High to Low)`}else if(t.startsWith(`d`)){let e=i[r]||`Player ${r+1}`;a=n?`${e} Played (Oldest)`:`${e} Played (Newest)`}else t===`group`&&(a=n?`Group (A-Z)`:`Group (Z-A)`);e.sortTriggerBtn.innerHTML=`<span class="action-icon">⇅</span> <strong style="font-weight: 700;">SORT:</strong> <span style="font-weight: 400; text-transform: none; margin-left: 2px;">${a}</span>`}function It(){let e=I();if(!e.sortDropdownMenu)return;let t=S(`currentSort`),n=S(`sortAsc`),r=S(`activePlayerIndices`),i=S(`NAMES`),a=`
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
            `})),e.sortDropdownMenu.innerHTML=a}function Lt(e){let t=I();t.sortDropdownMenu&&(e.stopPropagation(),t.sortDropdownMenu.classList.toggle(`show`)?(t.sortTriggerBtn&&t.sortTriggerBtn.classList.add(`active`),It()):t.sortTriggerBtn&&t.sortTriggerBtn.classList.remove(`active`))}function Rt(){let e=I();e.sortDropdownMenu&&e.sortDropdownMenu.classList.remove(`show`),e.sortTriggerBtn&&e.sortTriggerBtn.classList.remove(`active`)}function zt(){let e=I();if(!e.leftHeroCountLabel)return;let t=Un();e.leftHeroCountLabel.innerText=`${t} heroes match`}function Bt(){let e=I(),t=S(`stagedFilterDataHistories`),n=S(`stagedFilterPlayers`),r=S(`stagedFilterComplexities`),i=S(`stagedFilterGroups`);if(e.leftTitleDataHistory){let n=t.size;e.leftTitleDataHistory.innerHTML=`Data Type ${n>0?`<span class="filter-count-bubble">${n}</span>`:``}`}if(e.leftTitlePlayers){let t=n.size;e.leftTitlePlayers.innerHTML=`Players ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}if(e.leftTitleComplexity){let t=r.size;e.leftTitleComplexity.innerHTML=`Complexity ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}if(e.leftTitleGroups){let t=i.size;e.leftTitleGroups.innerHTML=`Group / Season ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}}function Vt(e){let t=S(`players`),n=S(`games`);S(`NAMES`);let r=S(`stagedGamesUseHistorical`),i=S(`stagedSelectedGamePlayerIndex`),a=S(`stagedGamesWinnerOnly`),o=r,s=t.map(()=>({played:0,won:0})),c=0,l=0;n&&n.forEach(e=>{!o&&e.is_historical||e.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1;t>=0&&t<4?(s[t].played++,e.is_winner&&s[t].won++):(t===4||t===5)&&(c++,e.is_winner&&l++)})});let u=``;for(let e=0;e<4;e++){let n=t[e];n&&(u+=`
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
    `}function Ht(){let e=I();if(!e.drawerBody)return;let t=S(`currentDrawerMode`),n=S(`stagedSort`);S(`stagedSortPlayerIndex`);let r=S(`stagedPlayerIndices`),i=S(`stagedUseHistorical`),a=S(`NAMES`);S(`activePlayerIndices`);let o=S(`stagedBanSearchQuery`);if(e.drawerBody.style.overflowY=`auto`,t===`sort-filter`){e.drawerBody.innerHTML=`
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
        `;let t=`name`;n===`group`?t=`group`:n.startsWith(`w`)?t=`probability`:n.startsWith(`d`)&&(t=`lastPlayed`);let r=document.getElementById(`drawer-sort-type-select`);r&&(r.value=t),Ut(),Wt(),Gt(),Jt()}else if(t===`columns`){let t=a.slice(0,4).map((e,t)=>`
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
        `}else t===`history-filter`?Vt(e.drawerBody):t===`roll-settings`&&(e.drawerBody.style.overflowY=`hidden`,e.drawerBody.innerHTML=`
            <div id="roll-settings-ban-tab" style="display: flex; flex-direction: column; flex: 1; min-height: 0; font-size: 1rem;">
                <div class="panel-row-new" style="display: flex; flex-direction: column; flex: 1; min-height: 0; margin-top: 8px;">
                    <input type="text" id="ban-search-input" class="ban-search-input" placeholder="Search heroes to ban..." data-action="ban-search-input" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #fff; margin-bottom: 15px; flex-shrink: 0;" value="${o||``}">
                    <div id="drawer-ban-list-container" class="ban-list-container" style="flex: 1; min-height: 0; overflow-y: auto; padding-right: 4px; max-height: 350px;">
                    </div>
                </div>
            </div>
        `,fn())}function Ut(){let e=document.getElementById(`drawer-sort-direction-text`),t=document.getElementById(`drawer-sort-direction-arrow`),n=S(`stagedSortAsc`);e&&t&&(e.innerText=n?`Ascending`:`Descending`,t.innerText=n?`▲`:`▼`)}function Wt(){let e=document.getElementById(`drawer-player-sort-sub-section`),t=document.getElementById(`drawer-player-sort-pills`);if(!e||!t)return;let n=S(`stagedSort`),r=S(`stagedSortPlayerIndex`),i=S(`activePlayerIndices`),a=S(`NAMES`),o=n.startsWith(`w`)||n.startsWith(`d`);e.style.display=o?`block`:`none`,o&&(t.innerHTML=a.slice(0,4).map((e,t)=>`
                <button type="button" class="pill-toggle ${r===t?`active p${t+1}-color`:``}" style="${i.includes(t)?``:`opacity: 0.5;`}" data-action="drawer-sort-player-change" data-player-idx="${t}">
                    ${e}
                </button>
            `).join(``))}function Gt(){let e=document.getElementById(`drawer-complexity-filter-bar`);if(!e)return;let t=document.getElementById(`hero-search`),n=t?t.value.toLowerCase():``,r=document.getElementById(`db-show-owned`)?.checked??!0,i=document.getElementById(`db-show-not-owned`)?.checked??!1,a=S(`stagedGroups`),o=S(`stagedLevels`),s=S(`characters`),c=(e,t)=>t?e.name.toLowerCase().includes(t)||e.group&&e.group.toLowerCase().includes(t):!0,l=``;for(let e=1;e<=6;e++){let t=s.filter(t=>{if(Number(t.complexity)!==e)return!1;let o=a.has(t.group_id),s=X(t)&&r||!X(t)&&i;return c(t,n)&&o&&s}).length,u=t===0,d=o.has(e)&&!u?`active-die`:``;l+=`
            <div class="group-badge-card group-complexity ${d} ${u?`disabled`:``}" 
                 data-action="toggle-drawer-level" data-level="${e}" data-disabled="${u}"
                 title="Level ${e} (${t} heroes)">
                <img src="images/dice/d${e}.png" class="complexity-dice-img" alt="Level ${e}">
                <span class="group-badge-count">${t}</span>
            </div>`}let u=s.filter(e=>{let t=a.has(e.group_id),o=X(e)&&r||!X(e)&&i;return c(e,n)&&t&&o}).length,d=u===0,f=o.size===6&&!d?`active-die`:``;l+=`
        <div class="group-badge-card group-complexity group-complexity-all ${f} ${d?`disabled`:``}" 
             data-action="toggle-drawer-level" data-level="all" data-disabled="${d}"
             title="All Levels (${u} heroes)">
            <img src="images/dice/d_all.png" class="complexity-dice-img" alt="All">
            <span class="group-badge-count">${u}</span>
        </div>`,e.innerHTML=l}function Kt(e){let t=(e||``).toLowerCase();return t.includes(`season 1`)||t.includes(`s1`)?`group-s1`:t.includes(`season 2`)||t.includes(`s2`)?`group-s2`:t.includes(`marvel`)?`group-marvel`:t.includes(`x-men`)||t.includes(`xmen`)?`group-xmen`:t.includes(`adventures`)?`group-adventures`:t.includes(`solo`)?`group-solo`:t.includes(`outcast`)?`group-outcast`:t.includes(`santa`)||t.includes(`krampus`)||t.includes(`svk`)?`group-svk`:t.includes(`vanguard`)?`group-vanguard`:`group-default`}function qt(e){if(!e)return`?`;let t=e.trim().toLowerCase();if(t.includes(`season 1`))return`S1`;if(t.includes(`season 2`))return`S2`;if(t.includes(`marvel`))return`MRVL`;if(t.includes(`x-men`)||t.includes(`xmen`))return`XMEN`;if(t.includes(`adventure`))return`ADV`;if(t.includes(`santa`)&&t.includes(`krampus`))return`SvK`;if(t.includes(`solo`))return`SOLO`;if(t.includes(`outcast`))return`OUTC`;if(t.includes(`vanguard`))return`VNGD`;let n=e.split(/\s+/);return n.length>1?n.map(e=>e[0]).join(``).toUpperCase().substring(0,3):e.substring(0,3).toUpperCase()}function Jt(){let e=document.getElementById(`drawer-group-filter-bar`);if(!e)return;let t=document.getElementById(`hero-search`),n=t?t.value.toLowerCase():``,r=document.getElementById(`db-show-owned`)?.checked??!0,i=document.getElementById(`db-show-not-owned`)?.checked??!1,a=S(`stagedLevels`),o=S(`stagedGroups`),s=S(`groups`),c=S(`characters`),l=(e,t)=>t?e.name.toLowerCase().includes(t)||e.group&&e.group.toLowerCase().includes(t):!0,u=s.map(e=>{let t=qt(e.name),s=o.has(e.id),u=Kt(e.name),d=c.filter(t=>{if(t.group_id!==e.id)return!1;let o=a.has(Number(t.complexity)),s=X(t)&&r||!X(t)&&i;return l(t,n)&&o&&s}).length,f=d===0;return`
                <div class="group-badge-card ${u} ${s&&!f?`active-die`:``} ${f?`disabled`:``}" 
                     data-action="toggle-drawer-group" data-group-id="${e.id}" data-disabled="${f}"
                     title="${Z(e.name)} (${d} heroes)">
                    <span class="group-badge-initials">${t}</span>
                    <span class="group-badge-count">${d}</span>
                </div>`}).join(``),d=c.filter(e=>{let t=a.has(Number(e.complexity)),o=X(e)&&r||!X(e)&&i;return l(e,n)&&t&&o}).length,f=d===0;e.innerHTML=`
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
    `}function Yt(){let e=I();if(!e.activeFiltersContainer)return;let t=e.heroSearchInput,n=t?t.value.trim():``,r=S(`activeOwnershipFilter`),i=S(`activeFilterDataHistories`),a=S(`activeFilterPlayers`),o=S(`activeFilterComplexities`),s=S(`activeFilterGroups`),c=S(`players`),l=S(`groups`),u=``;n&&(u+=`
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
            `}),e.activeFiltersContainer.innerHTML=u,e.activeFiltersContainer.classList.toggle(`has-chips`,!!u.trim())}function Xt(){let e=I();if(!e.heroContainer)return;Ai();let t=e.heroSearchInput?.value.toLowerCase()||``,n=e.dbShowOwnedCheckbox?.checked??!0,r=e.dbShowNotOwnedCheckbox?.checked??!1,i=S(`NAMES`),a=S(`characters`),o=S(`activeFilterComplexities`),s=S(`activeFilterGroups`),c=S(`activeFilterDataHistories`),l=S(`activeFilterPlayers`),u=S(`games`),d=S(`activePlayerIndices`),f=S(`currentSort`),p=S(`sortAsc`);S(`currentSortPlayerIndex`);let m=(e,t)=>{if(!t)return!0;let n=t.trim().toLowerCase();return(e.name||``).toLowerCase().includes(n)||(e.group||``).toLowerCase().includes(n)},h=[];t&&i.forEach((e,n)=>{e&&e.toLowerCase().includes(t)&&h.push(n)});let g=[,,,,].fill(0);a.filter(X).forEach(e=>{for(let t=0;t<4;t++)g[t]+=Q(e,t)});let _=a.map((e,t)=>({...e,originalIndex:t})).filter(e=>{let i=!0;o.size>0&&(i=o.has(Number(e.complexity)));let a=!0;s.size>0&&(a=s.has(e.group_id));let d=!0,f=c.has(`Normal only`),p=c.has(`Historical only`);f&&!p?d=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(e=>!e.is_historical):p&&!f&&(d=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(e=>e.is_historical));let h=!0;l.size>0&&(h=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(t=>t.game_players.some(t=>t.hero_id===e.id&&l.has(t.player_id))));let g=X(e)&&n||!X(e)&&r;return m(e,t)&&i&&a&&d&&h&&g});e.countStatsLabel&&(e.countStatsLabel.innerText=`Showing ${_.length} of ${a.length} heroes`),_.sort((e,t)=>{let n,r;if(f.startsWith(`w`)){let i=parseInt(f[1]);n=Q(e,i),r=Q(t,i)}else if(f.startsWith(`d`)){let i=parseInt(f[1]);n=e.lastPlayed&&e.lastPlayed[i]||``,r=t.lastPlayed&&t.lastPlayed[i]||``,(n===`Never`||n===`Unknown`)&&(n=``),(r===`Never`||r===`Unknown`)&&(r=``)}else if(f===`group`){if(n=(e.group||``).toLowerCase(),r=(t.group||``).toLowerCase(),n===r){let n=(e.name||``).toLowerCase(),r=(t.name||``).toLowerCase();return p?n.localeCompare(r):r.localeCompare(n)}}else if(f===`complexity`){if(n=Number(e.complexity)||0,r=Number(t.complexity)||0,n===r){let n=(e.name||``).toLowerCase(),r=(t.name||``).toLowerCase();return n.localeCompare(r)}}else n=(e[f]||``).toLowerCase(),r=(t[f]||``).toLowerCase();if(n===r)return 0;let i=n<r?-1:1;return p?i:-i}),e.heroContainer.innerHTML=_.map(e=>{let t=d;l.size>0?t=Array.from(l).map(e=>parseInt(e.substring(1))-1).filter(e=>e>=0&&e<4):h.length>0&&(t=d.filter(e=>h.includes(e)));let n=t.map(t=>{let n=Q(e,t),r=X(e)&&g[t]>0?(n/g[t]*100).toFixed(2):`0.00`,i=e.playCount&&e.playCount[t]||0,a=e.lastPlayed&&e.lastPlayed[t]||`Never`,o=e.winCount&&e.winCount[t]||0,s=i>0?(o/i*100).toFixed(1):`0.0`;return{p:t,percentage:parseFloat(r),percentageStr:r,playCount:i,lastPlayed:a,winCount:o,winRate:s}});n.sort((e,t)=>{let n=(i[e.p]||``).toLowerCase(),r=(i[t.p]||``).toLowerCase();return n.localeCompare(r)});let r=n.map(e=>{let t=zi(e.lastPlayed);return`
                <div class="collapsed-player-row-simple">
                    <span class="collapsed-player-name" style="color: var(--p${e.p+1});">${i[e.p]}</span>
                    <span class="collapsed-player-prob">${e.percentageStr}%</span>
                    <span class="collapsed-player-plays">🎲 ${e.playCount}</span>
                    <span class="collapsed-player-wins">🏆 ${e.winCount} <span class="collapsed-player-rate">(${e.winRate}%)</span></span>
                    <span class="collapsed-player-recency" title="Last played: ${e.lastPlayed}">${t}</span>
                </div>`}).join(``),a=n.map(e=>{let t=Ri(e.lastPlayed),n=zi(e.lastPlayed),r=t?`<span class="expanded-player-relative">${t} ${n}</span>`:``;return`
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
                <img src="${J(e.slug)}" class="char-bg-img" alt="${e.name}">
                
                <div class="hero-header" data-action="toggle-hero-panel">
                    <div class="header-title-collapsed">
                        <a href="${Y(e.slug)}" target="_blank" class="hero-name-link">
                            <span class="hero-name">${e.name}</span>
                        </a>
                    </div>
                    
                    <div class="header-title-expanded">
                        <a href="${Y(e.slug)}" target="_blank" class="hero-name-link">
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
            </div>`}).join(``)}var L=()=>({resultsDiv:document.getElementById(`results`),actionButtons:document.getElementById(`action-buttons`),heroSelectModal:document.getElementById(`hero-select-modal`),heroSelectModalTitle:document.getElementById(`hero-select-modal-title`),heroSelectSearch:document.getElementById(`hero-select-search`),modalSortName:document.getElementById(`modal-sort-name`),modalSortWeight:document.getElementById(`modal-sort-weight`),heroSelectOptionsContainer:document.getElementById(`hero-select-options-container`),confirmBtn:document.getElementById(`confirmBtn`),errorMsg:document.getElementById(`error-msg`),rollSettingsBadge:document.getElementById(`roll-settings-badge`),rollSettingsBtn:document.getElementById(`rollSettingsBtn`),drawerBanListContainer:document.getElementById(`drawer-ban-list-container`)});function Zt(e){let t=Number(e)||1;return`<img src="images/dice/d${t}.png" class="complexity-die-solo" alt="Complexity ${t}">`}function Qt(e){let t=L();if(!t.resultsDiv)return;let n=q(e),r=n?.name||`Player ${e+1}`,i=n?.colorVar||`p${e+1}`,a=e<4?`
                    <div class="hero-stats-row scramble-hidden opacity-0" id="stats-row-${e}">
                        <span>Plays: --</span>
                        <span class="stats-divider">|</span>
                        <span>Last: --</span>
                        <span class="stats-divider">|</span>
                        <span id="hero-prob-${e}">Prob: --</span>
                    </div>`:`<div class="hero-stats-row" id="stats-row-${e}"></div>`;t.resultsDiv.innerHTML+=`
        <div class="player-row randomizing" id="player-row-${e}" style="--player-color: var(--${i}); border-color: var(--${i});">
            <img src="" class="char-bg-img scramble-img" id="bg-img-${e}" alt="Randomizing">

            <div class="player-row-content">
                <div class="hero-info-container" id="info-container-${e}">
                    <div class="hero-header-row">
                        <div class="hero-header-left">
                            <span class="player-name-caps" style="color: var(--player-color);">${r.toUpperCase()}</span>
                            <span class="hero-name-divider">:</span>
                            <a href="#" target="_blank" class="hero-name hero-name-link scramble-text" id="hero-name-title-${e}">ROLLING...</a>
                        </div>
                        <div class="complexity-dice-bar player-row-dice-bar scramble-hidden opacity-0" id="complexity-dice-${e}"></div>
                    </div>

                    <span class="expanded-group scramble-hidden opacity-0" id="hero-group-${e}">Group</span>

                    <div class="hero-footer-row">
                        ${a}
                        <button class="edit-icon-btn scramble-hidden opacity-0" id="edit-btn-${e}" type="button" data-action="open-hero-select" data-player-idx="${e}" aria-label="Select hero">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="hero-select-container" id="select-container-${e}">
                    <input type="hidden" class="char-select" data-player="${e}" id="select-${e}">
                </div>
            </div>
        </div>
    `}function $t(e){let t=L();if(!t.heroSelectModal)return;t.heroSelectModal.style.display=`flex`,document.body.style.overflow=`hidden`;let n=q(e);t.heroSelectModalTitle&&n?.name&&(t.heroSelectModalTitle.innerText=`Select Hero for ${n.name}`),t.heroSelectSearch&&(t.heroSelectSearch.value=``),C(`modalSortMode`,`name`),tn(`name`),nn(),setTimeout(Pt,50)}function en(){let e=L();e.heroSelectModal&&(e.heroSelectModal.style.display=`none`),document.body.style.overflow=``}function tn(e){let t=L();t.modalSortName&&t.modalSortName.classList.toggle(`active`,e===`name`),t.modalSortWeight&&t.modalSortWeight.classList.toggle(`active`,e===`weight`),Pt()}function nn(){let e=L();if(!e.heroSelectOptionsContainer)return;let t=S(`activeSelectPlayerIdx`),n=S(`modalSortMode`),r=e.heroSelectSearch,i=r?r.value.toLowerCase().trim():``,a=S(`characters`),o=S(`bannedHeroIds`);if(t===null)return;let s=a.filter(e=>X(e)&&!o.has(e.id));i&&(s=s.filter(e=>e.name.toLowerCase().includes(i)||e.group&&e.group.toLowerCase().includes(i))),n===`name`?s.sort((e,t)=>e.name.localeCompare(t.name)):n===`weight`&&s.sort((e,n)=>{let r=Q(e,t),i=Q(n,t);return r===i?e.name.localeCompare(n.name):i-r});let c=document.getElementById(`select-${t}`)?.value;if(s.length===0){e.heroSelectOptionsContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic; grid-column: 1 / -1; text-align: center; padding: 20px;">No available heroes found.</p>`;return}e.heroSelectOptionsContainer.innerHTML=s.map(e=>{let n=c===e.name,r=Fi(e,t);return`
            <div class="hero-select-card ${n?`selected`:``}" data-action="select-hero-option" data-hero-name="${e.name.replace(/"/g,`&quot;`)}" data-hero-slug="${e.slug}" data-hero-id="${e.id}">
                <img src="${J(e.slug)}" class="hero-select-card-img" alt="${e.name}">
                <div class="hero-select-card-info">
                    <div class="hero-select-card-name">${e.name}</div>
                    <div class="hero-select-card-prob">${r}</div>
                </div>
            </div>`}).join(``)}function rn(e,t){let n=document.getElementById(`player-row-${e}`),r=document.getElementById(`select-${e}`),i=document.getElementById(`bg-img-${e}`),a=document.getElementById(`hero-name-title-${e}`),o=document.getElementById(`hero-group-${e}`),s=document.getElementById(`stats-row-${e}`),c=document.getElementById(`complexity-dice-${e}`);if(r&&(r.value=t.name),i&&(i.src=J(t.slug),i.style.opacity=`0.25`,i.classList.remove(`scramble-img`)),a&&(a.innerText=t.name,a.href=Y(t.slug),a.classList.remove(`scramble-text`)),o&&(o.innerText=t.group||`Unknown`),c&&(c.innerHTML=Zt(t.complexity)),s)if(e<4){let n=`Prob: <b>${Fi(t,e)}</b>`;s.innerHTML=`
                <span>Plays: <b>${t.playCount[e]||0}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                <span class="stats-divider">|</span>
                <span>${n}</span>
            `}else s.innerHTML=``;if(n){n.classList.remove(`randomizing`),n.classList.add(`revealed`),o&&(o.classList.remove(`scramble-hidden`,`opacity-0`),o.classList.add(`fade-in-resolve`)),s&&(s.classList.remove(`scramble-hidden`,`opacity-0`),s.classList.add(`fade-in-resolve`)),c&&(c.classList.remove(`scramble-hidden`,`opacity-0`),c.classList.add(`fade-in-resolve`));let t=document.getElementById(`edit-btn-${e}`);t&&(t.classList.remove(`scramble-hidden`,`opacity-0`),t.classList.add(`fade-in-resolve`))}}function an(e,t){let n=L(),r=document.getElementById(`player-row-${e}`);if(!r){if(!n.resultsDiv)return;r=document.createElement(`div`),r.id=`player-row-${e}`,n.resultsDiv.appendChild(r)}let i=q(e),a=i?.name||`Player ${e+1}`,o=i?.colorVar||`p${e+1}`;r.className=`player-row revealed`,r.style.cssText=`--player-color: var(--${o}); border-color: var(--${o});`,r.innerHTML=`
        <img src="${J(t.slug)}" class="char-bg-img" id="bg-img-${e}" alt="${t.name}" style="opacity: 0.25;">
        <div class="player-row-content">
            <div class="hero-info-container" id="info-container-${e}">
                <div class="hero-header-row">
                    <div class="hero-header-left">
                        <span class="player-name-caps" style="color: var(--player-color);">${a.toUpperCase()}</span>
                        <span class="hero-name-divider">:</span>
                        <a href="${Y(t.slug)}" target="_blank" class="hero-name hero-name-link resolved" id="hero-name-title-${e}">${t.name}</a>
                    </div>
                    <div class="complexity-dice-bar player-row-dice-bar" id="complexity-dice-${e}">${Zt(t.complexity)}</div>
                </div>
                <span class="expanded-group" id="hero-group-${e}">${t.group||`Unknown`}</span>
                <div class="hero-footer-row">
                    <div class="hero-stats-row" id="stats-row-${e}"></div>
                    <button class="edit-icon-btn" id="edit-btn-${e}" type="button" data-action="open-hero-select" data-player-idx="${e}" aria-label="Select hero">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="hero-select-container" id="select-container-${e}">
                <input type="hidden" class="char-select" data-player="${e}" id="select-${e}" value="${t.name}">
            </div>
        </div>
    `;let s=document.getElementById(`stats-row-${e}`);if(s)if(e<4){let n=`Prob: <b>${Fi(t,e)}</b>`;s.innerHTML=`
                <span>Plays: <b>${t.playCount[e]||0}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                <span class="stats-divider">|</span>
                <span>${n}</span>
            `}else s.innerHTML=``}function on(e,t){let n=L();if(!n.resultsDiv)return;let r=e[t],i=q(r)?.name||`Player ${r+1}`,a=e.map((e,n)=>{let r=q(e),i=r?.name||`Player ${e+1}`,a=r?.colorVar||`p${e+1}`,o=n===t;return`
                <span class="draft-pip${o?` active`:``}${n<t?` done`:``}" style="--player-color: var(--${a})">
                    ${i}${o?` <em class="draft-pip-status">picking...</em>`:``}
                </span>`}).join(``);n.resultsDiv.innerHTML=`
        <div class="draft-pip-row">${a}</div>
        <div class="draft-instruction-row">
            <p class="draft-instruction"><strong>${i}</strong>, pick your hero</p>
            <button class="btn-cancel-roll" type="button" data-action="cancel-roll" aria-label="Cancel roll">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <p class="draft-instruction-sub">Tap a card to select</p>
        <div class="draft-card-list" id="draft-card-list"></div>
        <button type="button" class="btn-confirm-draft" id="draft-confirm-btn" data-action="confirm-draft" data-player-idx="${r}" disabled>
            SELECT A HERO
        </button>
    `}function sn(e,t){let n=document.getElementById(`draft-card-list`);if(!n)return;let r=``;for(let n=0;n<t;n++)r+=`
            <div class="draft-card" id="draft-card-${e}-${n}">
                <img src="" class="char-bg-img scramble-img" id="draft-card-img-${e}-${n}" style="opacity: 0.15;">
                <div class="draft-card-content">
                    <div class="draft-card-header">
                        <span class="draft-hero-name scramble-text" id="draft-card-name-${e}-${n}">ROLLING...</span>
                    </div>
                    <span class="draft-card-group" id="draft-card-group-${e}-${n}">Group</span>
                </div>
            </div>`;n.innerHTML=r}function cn(e,t){let n=document.getElementById(`draft-card-list`);n&&(n.innerHTML=t.map((t,n)=>{let r=e<4?`
                <div class="hero-stats-row">
                    <span>Plays: <b>${t.playCount[e]||0}</b></span>
                    <span class="stats-divider">|</span>
                    <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                    <span class="stats-divider">|</span>
                    <span>Prob: <b>${Fi(t,e)}</b></span>
                </div>`:`<span></span>`;return`
            <div class="draft-card" id="draft-card-${e}-${n}" data-action="select-draft-candidate" data-player-idx="${e}" data-hero-id="${t.id}">
                <img src="${J(t.slug)}" alt="${t.name}" class="char-bg-img" style="opacity: 0.2;">
                <div class="draft-card-content">
                    <div class="draft-card-header">
                        <span class="draft-hero-name">${t.name}</span>
                        <div class="complexity-dice-bar player-row-dice-bar">${Zt(t.complexity)}</div>
                    </div>
                    <span class="draft-card-group">${t.group||`Unknown`}</span>
                    <div class="hero-footer-row">
                        ${r}
                        <span class="draft-selected-badge">SELECTED</span>
                    </div>
                </div>
            </div>`}).join(``))}function ln(e,t){document.querySelectorAll(`.draft-card[data-player-idx="${e}"]`).forEach(e=>{e.classList.toggle(`selected`,e.dataset.heroId===String(t))})}function un(e,t){let n=document.getElementById(`draft-confirm-btn`);if(n)if(!t)n.disabled=!0,n.innerText=`SELECT A HERO`;else{let r=q(e)?.name||`Player ${e+1}`;n.disabled=!1,n.innerHTML=`${Z(r.toUpperCase())} picks ${Z(t.name.toUpperCase())} &rarr;`}}function dn(){let e=L();if(!e.rollSettingsBadge||!e.rollSettingsBtn)return;let t=S(`draftModeEnabled`),n=S(`bannedHeroIds`),r=0;t&&r++,n&&n.size>0&&(r+=n.size),r>0?(e.rollSettingsBadge.innerText=r,e.rollSettingsBadge.style.display=`inline-block`,e.rollSettingsBtn.classList.add(`has-settings`)):(e.rollSettingsBadge.style.display=`none`,e.rollSettingsBtn.classList.remove(`has-settings`))}function fn(){let e=L();if(!e.drawerBanListContainer)return;let t=S(`characters`),n=S(`stagedBannedHeroIds`),r=S(`stagedBanSearchQuery`)||``,i=r.toLowerCase().trim(),a=t;i&&(a=t.filter(e=>e.name.toLowerCase().includes(i)||e.group&&e.group.toLowerCase().includes(i)));let o=[...a].sort((e,t)=>e.name.localeCompare(t.name));if(o.length===0){e.drawerBanListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic; text-align: center; padding: 20px;">No heroes found matching "${r}"</p>`;return}e.drawerBanListContainer.innerHTML=o.map(e=>{let t=n.has(e.id);return`
            <label class="ban-list-item ${t?`banned`:``}">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" ${t?`checked`:``} data-action="toggle-staged-ban" data-hero-id="${e.id}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--danger);">
                    <span>${e.name}</span>
                </div>
                <span class="ban-item-group">${e.group||`Unknown`}</span>
            </label>
        `}).join(``)}var pn=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;function mn(){let e=S(`characters`),t=S(`bannedHeroIds`),n=ft();if(console.log(`[randomizer] pickCharacters participants:`,n),console.log(`[randomizer] draftModeEnabled:`,S(`draftModeEnabled`)),n.length===0)return alert(`Select players!`);C(`activeRollParticipants`,n);let r=n.map(e=>e.pIdx),i=[...r].sort(()=>Math.random()-.5),a=document.getElementById(`results`);a&&(a.innerHTML=``);let o=e.filter(e=>X(e)&&!t.has(e.id)).map(e=>structuredClone(e));if(console.log(`[randomizer] Owned/non-banned heroes pool count:`,o.length),o.length<r.length)return alert(`Not enough available (owned & non-banned) heroes (${o.length}) in your collection for ${r.length} players!`);if(rt(),S(`draftModeEnabled`)){let e=document.getElementById(`action-buttons`);e&&(e.style.display=`none`),C(`activeDraftOrder`,i),C(`activeDraftStep`,0),C(`selectedDraftHeroes`,{}),C(`activeDraftCandidates`,{}),Wr(`roll`),ot(`draft`),a&&a.scrollIntoView({behavior:`smooth`,block:`start`}),kn();return}let s={};i.forEach(e=>{let t=null;if(e>=4){let e=Math.floor(Math.random()*o.length);t=o[e],o.splice(e,1)}else{let n=o.filter(t=>t.weights[e]>0);if(n.length===0){if(o.length>0){let e=Math.floor(Math.random()*o.length);t=o[e],o.splice(e,1)}}else{let r=n.reduce((t,n)=>t+Q(n,e),0),i=Math.random()*r;for(let r of n){let n=Q(r,e);if(i<n){t=r,o.splice(o.findIndex(e=>e.name===r.name),1);break}i-=n}}}s[e]=t});let c=document.getElementById(`action-buttons`);c&&(c.style.display=`none`),C(`isRollActive`,!1);let l=[...r].sort((e,t)=>e-t);l.forEach(e=>{Qt(e)}),Wr(`roll`),ot(`confirmation`),a&&a.scrollIntoView({behavior:`smooth`,block:`start`});let u=e.filter(e=>X(e)&&!t.has(e.id));l.forEach(e=>{bn(e,u)});let d=0;function f(){if(d>=i.length){Sn(),ji()?c&&(c.style.display=`flex`):(it(),gt()),C(`isRollActive`,!0);return}let e=i[d],t=s[e],n=500+Math.random()*500;setTimeout(()=>{xn(e,t),d++,setTimeout(f,400)},n)}f()}function R(){Sn()}function hn(e){C(`activeSelectPlayerIdx`,e),$t(e)}function gn(){en(),C(`activeSelectPlayerIdx`,null)}function _n(e){C(`modalSortMode`,e),tn(e),vn()}function vn(){nn()}function yn(e){let t=S(`activeSelectPlayerIdx`);if(t===null)return;let n=S(`characters`).find(t=>t.name===e);n&&(S(`draftModeEnabled`)&&(S(`selectedDraftHeroes`)[t]=n),rn(t,n),Sn(),gn())}function bn(e,t){if(t.length===0)return;let n=document.getElementById(`bg-img-${e}`),r=document.getElementById(`hero-name-title-${e}`);ge(`scrambleIntervals`,e,setInterval(()=>{let e=t[Math.floor(Math.random()*t.length)];if(n&&(n.src=J(e.slug)),r){let e=``;for(let t=0;t<8;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*`[Math.floor(Math.random()*32)];r.innerText=e}},70))}function xn(e,t){let n=S(`scrambleIntervals`);n[e]&&(clearInterval(n[e]),ge(`scrambleIntervals`,e,void 0)),t&&rn(e,t)}function Sn(){let e=document.querySelectorAll(`.char-select`),t=Array.from(e).map(e=>e.value),n=t.reduce((e,t)=>(e[t]=(e[t]||0)+1,e),{}),r=Object.values(n).some(e=>e>1),i=S(`characters`),a=t.filter(e=>{let t=i.find(t=>t.name===e);return t&&!X(t)}),o=a.length>0,s=document.getElementById(`confirmBtn`),c=document.getElementById(`error-msg`);!s||!c||(s.classList.remove(`disabled`,`warning`),s.disabled=!1,s.innerHTML=`${pn} LOCK IN SESSION`,c.style.display=`none`,r?(s.classList.add(`disabled`),s.disabled=!0,c.style.display=`block`,c.innerText=`⚠ Duplicate hero selected! Each player must have a unique character.`):o&&(s.classList.add(`warning`),s.innerHTML=`⚠️ LOCK IN SESSION`,c.style.display=`block`,c.innerText=`⚠️ You have selected unowned heroes: ${a.join(`, `)}.`),e.forEach(e=>{let t=e.closest(`.player-row`);t&&t.classList.toggle(`error`,n[e.value]>1)}))}async function Cn(){let e=document.getElementById(`confirmBtn`),t=e?e.innerHTML:`Lock In`;e&&(e.disabled=!0,e.innerText=`Saving...`);let n=Array.from(document.querySelectorAll(`.char-select`)).map(e=>e.value),r=S(`characters`),i=n.filter(e=>{let t=r.find(t=>t.name===e);return t&&!X(t)});if(i.length>0&&!await T(`Unowned Heroes Selected`,`You have selected unowned heroes: ${i.join(`, `)}. Do you want to proceed?`)){e&&(e.disabled=!1,e.innerHTML=t);return}let a=document.querySelectorAll(`.char-select`),o=[],s=[],c=new Map(Array.from(a).map(e=>[parseInt(e.dataset.player),e.value]).filter(([e])=>e<4)),l=S(`selectedGameType`),{data:u,error:d}=await se(S(`currentUser`).id,l);if(d)return e&&(e.disabled=!1,e.innerHTML=t),alert(`Error creating game: `+d.message);r.forEach(e=>{for(let t=0;t<4;t++){let n=c.get(t);if(n===void 0)continue;n===e.name&&s.push({game_id:u.id,player_id:`p${t+1}`,hero_id:e.id,is_winner:null,last_updated_by:S(`currentUser`).id});let r=n===e.name?20:(e.weights[t]||250)+10;o.push({hero_id:e.id,player_id:`p${t+1}`,weight:r,last_updated_by:S(`currentUser`).id})}});let{error:f}=await ce(s);if(f)return e&&(e.disabled=!1,e.innerHTML=t),alert(`Error logging game participants: `+f.message);let{error:p}=await le(o);if(p)return e&&(e.disabled=!1,e.innerHTML=t),alert(`Error saving results: `+p.message);await $();let m=document.getElementById(`action-buttons`);m&&(m.style.display=`none`),it(),gt();let h=document.getElementById(`results`);h&&(h.innerHTML=`
            <p style="color:#28a745; text-align:center; font-weight:bold;">
                Session Logged! Game record created and stats updated.
            </p>`),C(`isRollActive`,!1)}function wn(){let e=document.getElementById(`results`);e&&(e.innerHTML=``);let t=document.getElementById(`action-buttons`);t&&(t.style.display=`none`);let n=S(`scrambleIntervals`);n&&(Object.keys(n).forEach(e=>{n[e]&&clearInterval(n[e])}),C(`scrambleIntervals`,{})),C(`activeDraftOrder`,[]),C(`activeDraftStep`,0),C(`selectedDraftHeroes`,{}),C(`activeDraftCandidates`,{}),it(),Pe(),_t(),C(`isRollActive`,!1)}function Tn(e){w(`stagedBannedHeroIds`,`toggle`,e),fn()}function En(e){C(`stagedBanSearchQuery`,e),fn()}function Dn(){dn()}function On(){let e=document.getElementById(`results`);e&&(e.innerHTML=``);let t=S(`selectedDraftHeroes`);[...S(`activeDraftOrder`)].sort((e,t)=>e-t).forEach(e=>{let n=t[e];n&&an(e,n)})}function kn(){let e=S(`activeDraftStep`),t=S(`activeDraftOrder`),n=S(`characters`),r=S(`bannedHeroIds`),i=S(`selectedDraftHeroes`);if(e>=t.length){On(),ot(`confirmation`),Sn();let e=document.getElementById(`action-buttons`);ji()?e&&(e.style.display=`flex`):(it(),gt()),C(`isRollActive`,!0);return}let a=t[e];on(t,e),un(a,null);let o=Object.values(i).map(e=>e?.name),s=n.filter(e=>X(e)&&!r.has(e.id)&&!o.includes(e.name)),c=S(`draftCount`),l=Math.min(c,s.length);sn(a,l),jn(a,s,l),setTimeout(()=>{let e=An(a,s);S(`activeDraftCandidates`)[a]=e,Mn(a),cn(a,e)},1e3)}function An(e,t){let n=[],r=[...t],i=S(`draftCount`),a=Math.min(i,r.length);for(let t=0;t<a;t++){let t=null;if(e>=4){let e=Math.floor(Math.random()*r.length);t=r[e],r.splice(e,1)}else{let n=r.filter(t=>t.weights[e]>0);if(n.length===0){if(r.length>0){let e=Math.floor(Math.random()*r.length);t=r[e],r.splice(e,1)}}else{let i=n.reduce((t,n)=>t+Q(n,e),0),a=Math.random()*i;for(let i of n){let n=Q(i,e);if(a<n){t=i,r.splice(r.findIndex(e=>e.name===i.name),1);break}a-=n}}}t&&n.push(t)}return n}function jn(e,t,n){t.length===0||n===0||ge(`scrambleIntervals`,e,setInterval(()=>{for(let r=0;r<n;r++){let n=t[Math.floor(Math.random()*t.length)];if(!n)continue;let i=document.getElementById(`draft-card-img-${e}-${r}`),a=document.getElementById(`draft-card-name-${e}-${r}`),o=document.getElementById(`draft-card-group-${e}-${r}`);if(i&&(i.src=J(n.slug)),a){let e=``;for(let t=0;t<6;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZ`[Math.floor(Math.random()*26)];a.innerText=e}o&&(o.innerText=n.group||``)}},70))}function Mn(e){let t=S(`scrambleIntervals`);t[e]&&(clearInterval(t[e]),ge(`scrambleIntervals`,e,void 0))}function Nn(e,t){let n=(S(`activeDraftCandidates`)[e]||[]).find(e=>String(e.id)===String(t));if(!n)return;let r=S(`selectedDraftHeroes`);if(r[e]?.id===n.id){r[e]=null,ln(e,null),un(e,null);return}r[e]=n,ln(e,n.id),un(e,n)}function Pn(e){S(`selectedDraftHeroes`)[e]&&(C(`activeDraftStep`,S(`activeDraftStep`)+1),kn())}function Fn(e){C(`stagedGamesWinnerOnly`,e),B()}function In(){C(`currentDrawerMode`,`history-filter`),C(`stagedSelectedGamePlayerIndex`,S(`selectedGamePlayerIndex`)),C(`stagedGamesWinnerOnly`,S(`gamesWinnerOnly`)),C(`stagedGamesUseHistorical`,S(`gamesUseHistorical`)),Et()}function Ln(){C(`stagedFilterDataHistories`,new Set(S(`activeFilterDataHistories`))),C(`stagedFilterPlayers`,new Set(S(`activeFilterPlayers`))),C(`stagedFilterComplexities`,new Set(S(`activeFilterComplexities`))),C(`stagedFilterGroups`,new Set(S(`activeFilterGroups`))),C(`stagedOwnershipFilter`,S(`activeOwnershipFilter`)),Ot()}function Rn(e){C(`stagedOwnershipFilter`,e),Dt(),zt()}function zn(e=null,t=!1){kt(e,t)}function Bn(e){let t=e.getAttribute(`data-type`),n=e.value,r=e.checked;if(t===`data-history`)w(`stagedFilterDataHistories`,r?`add`:`delete`,n);else if(t===`player`)w(`stagedFilterPlayers`,r?`add`:`delete`,n);else if(t===`complexity`){let e=Number(n);w(`stagedFilterComplexities`,r?`add`:`delete`,e)}else t===`group`&&w(`stagedFilterGroups`,r?`add`:`delete`,n);zt(),Bt()}function Vn(){S(`stagedFilterDataHistories`).clear(),S(`stagedFilterPlayers`).clear(),S(`stagedFilterComplexities`).clear(),S(`stagedFilterGroups`).clear(),C(`stagedOwnershipFilter`,`all`),document.querySelectorAll(`#filter-drawer-left input[type="checkbox"]`).forEach(e=>{e.checked=!1}),Dt(),zt(),Bt()}function Hn(){C(`activeFilterDataHistories`,new Set(S(`stagedFilterDataHistories`))),C(`activeFilterPlayers`,new Set(S(`stagedFilterPlayers`))),C(`activeFilterComplexities`,new Set(S(`stagedFilterComplexities`))),C(`activeFilterGroups`,new Set(S(`stagedFilterGroups`))),C(`dbUseHistorical`,!S(`activeFilterDataHistories`).has(`Normal only`)||S(`activeFilterDataHistories`).has(`Historical only`));let e=S(`stagedOwnershipFilter`);C(`activeOwnershipFilter`,e),Jr(e),zn(null,!0),H(),V(),cr()}function Un(){let e=document.getElementById(`hero-search`)?.value.toLowerCase()||``,t=S(`stagedOwnershipFilter`),n=t===`owned`||t===`all`,r=t===`unowned`||t===`all`,i=S(`characters`),a=S(`games`),o=S(`stagedFilterComplexities`),s=S(`stagedFilterGroups`),c=S(`stagedFilterDataHistories`),l=S(`stagedFilterPlayers`);return i.filter(t=>{let i=!0;o.size>0&&(i=o.has(Number(t.complexity)));let u=!0;s.size>0&&(u=s.has(t.group_id));let d=!0,f=c.has(`Normal only`),p=c.has(`Historical only`);f&&!p?d=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>!e.is_historical):p&&!f&&(d=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>e.is_historical));let m=!0;l.size>0&&(m=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>e.game_players.some(e=>e.hero_id===t.id&&l.has(e.player_id))));let h=X(t)&&n||!X(t)&&r;return dr(t,e)&&i&&u&&d&&m&&h}).length}function z(e=null,t=!1){At(e,t)}function B(){Ht()}function Wn(e){S(`stagedSelectedGamePlayerIndex`)===e?C(`stagedSelectedGamePlayerIndex`,null):C(`stagedSelectedGamePlayerIndex`,e),S(`stagedSelectedGamePlayerIndex`)===null&&C(`stagedGamesWinnerOnly`,!1),B()}function Gn(e){C(`stagedGamesUseHistorical`,e),B()}function Kn(e){e===`name`?C(`stagedSort`,`name`):e===`group`?C(`stagedSort`,`group`):e===`probability`?C(`stagedSort`,`w${S(`stagedSortPlayerIndex`)}`):e===`lastPlayed`&&C(`stagedSort`,`d${S(`stagedSortPlayerIndex`)}`),C(`stagedSortAsc`,e===`name`||e===`group`),Ut(),Wt()}function qn(e){C(`stagedSortPlayerIndex`,e);let t=S(`stagedSort`);t.startsWith(`w`)?C(`stagedSort`,`w${e}`):t.startsWith(`d`)&&C(`stagedSort`,`d${e}`),Wt()}function Jn(e){let t=S(`stagedPlayerIndices`),n=t.indexOf(e);n>-1?t.splice(n,1):t.push(e),C(`stagedPlayerIndices`,t),B()}function Yn(e){e===`all`?C(`stagedLevels`,S(`stagedLevels`).size===6?new Set:new Set([1,2,3,4,5,6])):w(`stagedLevels`,`toggle`,e),Gt(),Jt()}function Xn(e){let t=S(`groups`);e===`all`?S(`stagedGroups`).size===t.length?w(`stagedGroups`,`clear`):t.forEach(e=>w(`stagedGroups`,`add`,e.id)):w(`stagedGroups`,`toggle`,e),Gt(),Jt()}function Zn(){let e=S(`groups`),t=S(`currentDrawerMode`);t===`sort-filter`?(C(`stagedSort`,`name`),C(`stagedSortAsc`,!0),C(`stagedSortPlayerIndex`,0),C(`stagedLevels`,new Set([1,2,3,4,5,6])),C(`stagedGroups`,new Set(e.map(e=>e.id))),B()):t===`columns`?(C(`stagedPlayerIndices`,[0,1,2,3]),C(`stagedUseHistorical`,!0),B()):t===`history-filter`?(C(`stagedSelectedGamePlayerIndex`,null),C(`stagedGamesWinnerOnly`,!1),C(`stagedGamesUseHistorical`,!0),B()):t===`roll-settings`&&(C(`stagedBannedHeroIds`,new Set),C(`stagedBanSearchQuery`,``),B())}function Qn(){let e=S(`currentDrawerMode`);e===`sort-filter`?(C(`currentSort`,S(`stagedSort`)),C(`sortAsc`,S(`stagedSortAsc`)),C(`currentSortPlayerIndex`,S(`stagedSortPlayerIndex`)),C(`activeLevels`,new Set(S(`stagedLevels`))),C(`activeGroups`,new Set(S(`stagedGroups`))),V(),z(null,!0),H()):e===`columns`?(C(`activePlayerIndices`,[...S(`stagedPlayerIndices`)]),C(`dbUseHistorical`,S(`stagedUseHistorical`)),V(),z(null,!0),H()):e===`history-filter`?(C(`selectedGamePlayerIndex`,S(`stagedSelectedGamePlayerIndex`)),C(`gamesWinnerOnly`,S(`stagedGamesWinnerOnly`)),C(`gamesUseHistorical`,S(`stagedGamesUseHistorical`)),$n(),z(null,!0),G()):e===`roll-settings`&&(C(`bannedHeroIds`,new Set(S(`stagedBannedHeroIds`))),localStorage.setItem(`bannedHeroIds`,JSON.stringify(Array.from(S(`bannedHeroIds`)))),Dn(),z(null,!0))}function V(){Mt()}function $n(){Nt()}function er(e){let t=S(`currentSort`),n=S(`sortAsc`);t===e?C(`sortAsc`,!n):(C(`currentSort`,e),C(`sortAsc`,!0)),tr(),H()}function tr(){Ft()}function nr(e){Lt(e)}function rr(){Rt()}function ir(e,t){C(`currentSort`,e),C(`sortAsc`,t),(e.startsWith(`w`)||e.startsWith(`d`))&&C(`currentSortPlayerIndex`,parseInt(e.substring(1))),rr(),tr(),H()}function ar(){let e=document.getElementById(`hero-search`),t=document.getElementById(`clear-search`);e&&t&&t.classList.toggle(`hidden`,e.value.trim().length===0)}function or(){let e=document.getElementById(`hero-search`);e&&(e.value=``,e.focus()),ar(),sr()}function sr(){H(),cr()}function cr(){Yt()}function lr(e,t){if(e===`data-history`)w(`activeFilterDataHistories`,`delete`,t),C(`dbUseHistorical`,!S(`activeFilterDataHistories`).has(`Normal only`)||S(`activeFilterDataHistories`).has(`Historical only`));else if(e===`player`)w(`activeFilterPlayers`,`delete`,t);else if(e===`complexity`)w(`activeFilterComplexities`,`delete`,t);else if(e===`group`)w(`activeFilterGroups`,`delete`,t);else if(e===`ownership`){C(`activeOwnershipFilter`,`all`),C(`stagedOwnershipFilter`,`all`);let e=document.getElementById(`db-show-owned`),t=document.getElementById(`db-show-not-owned`);e&&(e.checked=!0),t&&(t.checked=!0)}if(e!==`ownership`){let n=document.querySelector(`#filter-drawer-left input[value="${t}"][data-type="${e}"]`);n&&(n.checked=!1)}H(),cr(),V()}function ur(){or()}function H(){Xt()}function dr(e,t){if(!t)return!0;let n=t.trim().toLowerCase();return(e.name||``).toLowerCase().includes(n)||(e.group||``).toLowerCase().includes(n)}var fr=null,U=()=>(fr||={buildInfoDiv:document.getElementById(`admin-build-info`),changelogModal:document.getElementById(`changelog-modal`),changelogContainer:document.getElementById(`changelog-container`),whatsNewModal:document.getElementById(`whats-new-modal`),whatsNewContainer:document.getElementById(`whats-new-container`),collectionContainer:document.getElementById(`collectionContainer`),collectionCountLabel:document.getElementById(`collection-count-stats`),heroForm:document.getElementById(`heroForm`),addHeroBtn:document.getElementById(`addHeroBtn`),groupSelect:document.getElementById(`charGroup`),formTitle:document.getElementById(`formTitle`),charNameInput:document.getElementById(`charName`),charSlugInput:document.getElementById(`charSlug`),charComplexitySelect:document.getElementById(`charComplexity`),groupsListContainer:document.getElementById(`groupsListContainer`),heroesListContainer:document.getElementById(`heroesListContainer`),playersListContainer:document.getElementById(`playersListContainer`),usersListContainer:document.getElementById(`usersListContainer`),collectionsListContainer:document.getElementById(`collectionsListContainer`),gamesListContainer:document.getElementById(`gamesContainer`),winnerModal:document.getElementById(`winner-modal`),winnerContainer:document.getElementById(`winner-selection-container`),confirmWinnerBtn:document.getElementById(`confirm-winner-btn`),groupForm:document.getElementById(`groupForm`),addGroupBtn:document.getElementById(`addGroupBtn`)},fr);function pr(){let t=U();if(!t.buildInfoDiv)return;let n=window.location.hostname,r=`Localhost`;n.includes(`github.io`)?r=`GitHub Pages`:n.includes(`workers.dev`)&&(r=`Cloudflare Workers`);let i=e?`Production`:`Development`,a=e?`Supabase PROD`:`Supabase DEV`,o=e?`main`:`dev/local`;t.buildInfoDiv.innerHTML=`
        <div><b>Platform:</b> ${r} (${n})</div>
        <div><b>Environment:</b> ${i} (Targeting: ${o})</div>
        <div><b>Database:</b> ${a}</div>
        ${e?``:`<div style="margin-top:5px; color:var(--danger); font-style:italic;">Note: Dev heroes are prefixed with "DEV-" in this database.</div>`}
    `}function mr(){let e=U(),t=S(`cachedChangelog`);!t||!e.changelogContainer||!e.changelogModal||(e.changelogContainer.innerHTML=t.map(e=>`
        <div>
            <h3>v${e.version}</h3>
            <ul>
                ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
        </div>
    `).join(``),e.changelogModal.style.display=`flex`,document.body.style.overflow=`hidden`)}function hr(){let e=U();e.changelogModal&&(e.changelogModal.style.display=`none`),document.body.style.overflow=`auto`}function gr(e){let t=U();!t.whatsNewContainer||!t.whatsNewModal||(t.whatsNewContainer.innerHTML=`
        <div>
            <h3>v${e.version}</h3>
            <ul style="text-align: left;">
                ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
        </div>
    `,t.whatsNewModal.style.display=`flex`,document.body.style.overflow=`hidden`)}function _r(){let e=U();e.whatsNewModal&&(e.whatsNewModal.style.display=`none`),document.body.style.overflow=`auto`}var vr={roll:{title:`Randomizer`},database:{title:`Heroes`},history:{title:`History`},collection:{title:`Collection`},admin:{title:`Admin`}};function yr(e){let t=vr[e];if(!t)return;let n=document.getElementById(`header-section-title`);n&&(n.innerText=t.title)}function br(e){if(e===`admin`&&!K())return;let t={roll:`rollSection`,database:`dbSection`,history:`gamesSection`,collection:`collectionSection`,admin:`adminSection`},n=t[e];n&&(Object.values(t).forEach(e=>{let t=document.getElementById(e);t&&(e===n?t.classList.remove(`hidden`):t.classList.add(`hidden`))}),yr(e),e===`database`?setTimeout(Pt,50):e===`history`?Rr():e===`collection`&&Cr())}function xr(e,t){let n=document.getElementById(t),r=(e.currentTarget.closest(`.panel-header`)||e.currentTarget).querySelector(`.panel-toggle`);if(!n||!r)return;let i=n.classList.toggle(`hidden`);r.classList.toggle(`open`,!i),r.setAttribute(`aria-expanded`,String(!i))}function Sr(e){let t=e.closest(`.hero-item`),n=e.querySelector(`.panel-toggle`);if(!t||!n)return;let r=t.classList.toggle(`collapsed`);n.classList.toggle(`open`,!r),n.setAttribute(`aria-expanded`,String(!r))}function Cr(){let e=U();if(!e.collectionContainer)return;let t=S(`characters`),n=S(`groups`),r=S(`currentUser`),i=S(`expandedCollectionGroups`),a=t.length,o=t.filter(S(`isHeroOwned`)||(e=>e.is_owned)).length;e.collectionCountLabel&&(e.collectionCountLabel.innerText=`Owned ${o} of ${a} heroes`);let s=[...n].sort((e,t)=>{let n=e.order_index??2**53-1,r=t.order_index??2**53-1;return n===r?e.name.localeCompare(t.name):n-r}),c=r?``:`disabled`,l=[];e.collectionContainer.innerHTML=s.map(e=>{let n=t.filter(t=>t.group_id===e.id).sort((e,t)=>e.name.localeCompare(t.name));if(n.length===0)return``;let r=n.every(S(`isHeroOwned`)||(e=>e.is_owned)),a=n.map(e=>{let t=e.is_owned;return`
            <div class="collection-hero-card ${t?`selected`:``} ${c?`disabled`:``}" data-action="toggle-hero-owned" data-hero-id="${e.id}" data-selected="${t}">
                <img src="${J(e.slug)}" class="collection-hero-card-img" alt="${e.name}">
                <div class="collection-hero-card-name">${e.name}</div>
            </div>
        `}).join(``),o=i.has(e.id),s=n.length,u=n.filter(e=>e.is_owned).length;return u>0&&u<s&&l.push(e.id),`
            <div class="collection-group${o?``:` collapsed`}">
                <div class="collection-group-header" data-action="toggle-collection-group" data-group-id="${e.id}" style="cursor: pointer;">
                    <input type="checkbox" id="owned-group-${e.id}" ${r?`checked`:``} ${c} data-action="toggle-group-owned" data-group-id="${e.id}">
                    <label for="owned-group-${e.id}">
                        <strong>${e.name}</strong>
                        ${e.year?` <span style="opacity: 0.6; font-size: 0.85em;">(${e.year})</span>`:``}
                        <span class="stats-divider" style="margin: 0 8px;">|</span>
                        <span style="opacity: 0.6; font-size: 0.85em;">Owned: <strong style="color: #fff;">${u}</strong>/<strong style="color: #fff;">${s}</strong></span>
                    </label>
                    <button type="button" class="panel-toggle${o?` open`:``}" aria-expanded="${o}">V</button>
                </div>
                <div class="collection-heroes-list">
                    ${a}
                </div>
            </div>
        `}).join(``),l.forEach(e=>{let t=document.getElementById(`owned-group-${e}`);t&&(t.indeterminate=!0)})}function wr(){let e=U();e.charNameInput&&(e.charNameInput.value=``),e.charSlugInput&&(e.charSlugInput.value=``),e.groupSelect&&(e.groupSelect.value=``),e.charComplexitySelect&&(e.charComplexitySelect.value=``),e.formTitle&&(e.formTitle.innerText=`Add New Hero`),e.heroForm&&e.addHeroBtn&&(e.heroForm.classList.add(`hidden`),e.addHeroBtn.innerText=`Add Hero`)}function Tr(){let e=U();if(!e.heroForm||!e.addHeroBtn)return;let t=e.heroForm.classList.toggle(`hidden`);e.addHeroBtn.innerText=t?`Add Hero`:`Hide Hero Form`,!t&&e.charNameInput&&e.charNameInput.focus()}function Er(){let e=U();if(!e.groupSelect)return;let t=S(`groups`).map(e=>`<option value="${e.id}">${e.name}</option>`).join(``);e.groupSelect.innerHTML=`<option value="">-- Select Group --</option>`+t}function Dr(){let e=U();if(!e.groupsListContainer)return;let t=S(`groups`);if(t.length===0){e.groupsListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No groups yet. Create one above.</p>`;return}let n=t.map(e=>`
        <div id="groupRow-${e.id}" class="group-row" style="margin: 5px 0; background: rgba(255,255,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                <div>
                    <strong>${Z(e.name)}</strong>
                    ${e.year?` <span style="opacity: 0.6;">(${e.year})</span>`:``}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-save btn-inline" data-action="edit-group" data-group-id="${e.id}">Edit</button>
                    <button type="button" class="btn-cancel btn-inline" data-action="delete-group" data-group-id="${e.id}">Delete</button>
                </div>
            </div>
            <div id="groupEditPanel-${e.id}" class="group-edit-panel hidden">
                <div class="form-grid">
                    <input type="text" id="groupName-${e.id}" placeholder="Group Name" value="${Z(e.name)}">
                    <input type="number" id="groupOrder-${e.id}" placeholder="Order Index" value="${e.order_index??``}">
                    <input type="number" id="groupYear-${e.id}" placeholder="Release Year" value="${e.year??``}">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn-save" data-action="save-group-inline" data-group-id="${e.id}">Save</button>
                    <button type="button" class="btn-cancel" data-action="cancel-group-edit" data-group-id="${e.id}">Cancel</button>
                </div>
            </div>
        </div>
    `).join(``);e.groupsListContainer.innerHTML=n}function Or(){let e=U();if(!e.heroesListContainer)return;let t=S(`characters`),n=S(`editIndex`),r=S(`groups`);if(t.length===0){e.heroesListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No heroes yet. Add one above.</p>`;return}let i=t.map((e,t)=>{let i=n===t,a=K()?`<button class="btn-save btn-inline" data-action="edit-hero" data-hero-idx="${t}">Edit</button>`:``,o=K()?`<button class="btn-cancel btn-inline" data-action="delete-hero" data-hero-id="${e.id}">Delete</button>`:``,s=r.map(t=>`<option value="${t.id}" ${t.id===e.group_id?`selected`:``}>${Z(t.name)}</option>`).join(``);return`
            <div id="heroRow-${e.id}" class="group-row hero-admin-row${i?` editing`:``}">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div>
                        <strong>${Z(e.name)}</strong>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${a}
                        ${o}
                    </div>
                </div>
                <div id="heroEditPanel-${e.id}" class="group-edit-panel${i?``:` hidden`}">
                    <div class="form-grid">
                        <input type="text" id="heroName-${t}" placeholder="Hero Name" value="${Z(e.name)}">
                        <select id="heroGroup-${t}">
                            <option value="">-- Select Group --</option>
                            ${s}
                        </select>
                    </div>
                    <div class="form-grid">
                        <input type="text" id="heroSlug-${t}" placeholder="Slug (for image)" value="${Z(e.slug)}">
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
            </div>`}).join(``);e.heroesListContainer.innerHTML=i,n===-1?e.heroesListContainer.classList.remove(`group-edit-active`):e.heroesListContainer.classList.add(`group-edit-active`)}function kr(e){let t=document.getElementById(`groupEditPanel-${e}`),n=document.getElementById(`groupRow-${e}`);t&&t.classList.add(`hidden`),n&&n.classList.remove(`editing`);let r=U().groupsListContainer;r&&(r.querySelectorAll(`.group-row.editing`).length>0||r.classList.remove(`group-edit-active`))}function Ar(){let e=document.getElementById(`groupName`),t=document.getElementById(`groupOrder`),n=document.getElementById(`groupYear`);e&&(e.value=``),t&&(t.value=``),n&&(n.value=``);let r=U().groupForm,i=U().addGroupBtn;r&&i&&(r.classList.add(`hidden`),i.innerText=`Add Group`)}function jr(){let e=U().groupForm,t=U().addGroupBtn;if(!e||!t)return;let n=e.classList.toggle(`hidden`);if(t.innerText=n?`Add Group`:`Hide Group Form`,!n){let e=document.getElementById(`groupName`);e&&e.focus()}}function Mr(){let e=U();if(!e.playersListContainer)return;let t=S(`players`);if(t.length===0){e.playersListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No players loaded.</p>`;return}let n=t.map((e,t)=>{let n=Ni(e);return`
            <div id="playerRow-${e.id}" class="group-row player-admin-row">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: ${n}; border: 1px solid rgba(255,255,255,0.2);"></span>
                        <strong>${Z(e.name)}</strong>
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
                        <input type="text" id="playerName-${e.id}" placeholder="Player Name" value="${Z(e.name)}">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-save" data-action="save-player-inline" data-player-id="${e.id}">Save</button>
                        <button class="btn-cancel" data-action="cancel-player-edit" data-player-id="${e.id}">Cancel</button>
                    </div>
                </div>
            </div>`}).join(``);e.playersListContainer.innerHTML=n}function Nr(e){let t=document.getElementById(`playerEditPanel-${e}`),n=document.getElementById(`playerRow-${e}`);t&&t.classList.add(`hidden`),n&&n.classList.remove(`editing`);let r=U().playersListContainer;r&&(r.querySelectorAll(`.player-admin-row.editing`).length>0||r.classList.remove(`player-edit-active`))}function Pr(){let e=U();if(!e.usersListContainer)return;let t=S(`authUsers`);if(t.length===0){e.usersListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No system users loaded.</p>`;return}let n=t.map(e=>{let t=e.role||`user`,n=t===`admin`;return`
            <div class="user-row" style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div>
                    <div><strong>${Z(e.email||`No Email`)}</strong></div>
                    <div style="font-size: 0.8em; opacity: 0.6;">Role: ${t.toUpperCase()}</div>
                </div>
                <div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${n?`checked`:``} data-action="user-role-change" data-user-id="${e.id}">
                        <span class="toggle-slider"></span>
                    </label>
                    <span style="font-size: 0.75rem; opacity: 0.7; margin-left: 5px;">Admin</span>
                </div>
            </div>`}).join(``);e.usersListContainer.innerHTML=n}function Fr(e,t){let n=U();if(!n.collectionsListContainer)return;if(e.length===0){n.collectionsListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No collections loaded.</p>`;return}let r=S(`characters`),i={};t.forEach(e=>{i[`${e.user_id}_${e.hero_id}`]=e.is_owned});let a=document.createElement(`div`);a.style.overflowX=`auto`,a.style.marginTop=`10px`,a.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr>
                    <th style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">Hero</th>
                    ${e.map(e=>`<th style="padding: 10px; font-weight: 600; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">${Z(e.name)}</th>`).join(``)}
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
                        ${Z(t.name)}
                    </td>
                    ${n}
                </tr>
            `}).join(``)}
            </tbody>
        </table>
    `,n.collectionsListContainer.innerHTML=``,n.collectionsListContainer.appendChild(a)}function Ir(e){let t=U(),n=S(`games`);S(`players`);let r=S(`NAMES`);if(!t.winnerModal||!t.winnerContainer||!t.confirmWinnerBtn)return;let i=n.find(t=>t.id===e);if(!i)return;t.confirmWinnerBtn.setAttribute(`data-game-id`,e),t.confirmWinnerBtn.disabled=!0;let a=i.game_players.filter(e=>e.is_winner===!0),o=i.game_players.filter(e=>e.is_winner===!1),s=a.length===0&&o.length>0&&o.length===i.game_players.length,c=`<div class="${i.game_players.length>3?`winner-select-grid two-rows`:`winner-select-grid`}">`;i.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1,n=e.heroes?.name||`Unknown`,i=e.heroes?.slug||``,a=e.is_winner===!0,o=a?`checked`:``,s=a?`selected`:``,l=r[t]||`Invitee`;t>=4&&(l=`Invitee (${e.player_id===`p5`?`1`:`2`})`),c+=`
            <div class="winner-card ${s}" data-action="winner-card-click" data-value="${e.player_id}">
                <input type="radio" name="winner-selection" value="${e.player_id}" ${o} style="display: none;">
                <img src="${J(i)}" class="winner-card-img" alt="${n}">
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
    `,t.winnerContainer.innerHTML=c,t.winnerModal.style.display=`flex`,document.body.style.overflow=`hidden`}function Lr(){let e=U();e.winnerModal&&(e.winnerModal.style.display=`none`),document.body.style.overflow=`auto`}function Rr(){let e=U();if(!e.gamesListContainer)return;let t=S(`games`);S(`players`);let n=S(`NAMES`),r=S(`expandedGameIds`),i=S(`selectedGamePlayerIndex`),a=S(`gamesWinnerOnly`),o=S(`gamesUseHistorical`),s=S(`gamesHistoryStyle`)||`gorgeous`,c=document.getElementById(`games-search`),l=c?c.value.toLowerCase().trim():``,u=s===`gorgeous`,d=e=>{let n=document.getElementById(`game-count-stats`);n&&(n.innerText=`Showing ${e} of ${t?t.filter(e=>u?!e.is_historical:o||!e.is_historical).length:0} games`)},f=``;if(K()&&(f=`
            <div class="admin-view-toggle-row" style="display: flex; justify-content: flex-end; margin-bottom: 15px; padding: 0 5px;">
                <button type="button" class="btn-save btn-inline" data-action="toggle-history-view-style" style="font-size: 0.85em; padding: 6px 12px; height: auto;">
                    ${u?`Switch to Admin List View`:`Switch to Gorgeous View`}
                </button>
            </div>
        `),!t||t.length===0){e.gamesListContainer.innerHTML=f+`<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No games played yet.</p>`,d(0);return}let p=t.filter(e=>{if(u&&e.is_historical||!u&&!o&&e.is_historical)return!1;let t=!0;return i!==null&&(t=e.game_players.some(e=>{let t=parseInt(e.player_id.substring(1))-1,n=!1;return i>=0&&i<4?n=t===i:i===4&&(n=t===4||t===5),n&&a?e.is_winner===!0:n})),!(!t||l&&!(e.game_players||[]).map(e=>e.heroes?.name||``).join(` `).toLowerCase().includes(l))});if(p.length===0){e.gamesListContainer.innerHTML=f+`<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No matches found matching filter criteria.</p>`,d(0);return}d(p.length),u?e.gamesListContainer.innerHTML=f+p.map(e=>{let a=e.played_at||``;a&&!a.includes(`T`)&&(a=a.replace(` `,`T`)),a&&!a.includes(`Z`)&&!a.includes(`+`)&&(a+=`Z`);let o=new Date(a).toLocaleString(void 0,{dateStyle:`medium`,timeStyle:`short`}),s=e.game_players.filter(e=>e.is_winner===!0),c=e.game_players.filter(e=>e.is_winner===!1),u=s.length===0&&c.length>0&&c.length===e.game_players.length,d=s.length===0&&!u,f=r.has(e.id)?`expanded`:``,p=``;s.length>0&&s[0].heroes?.slug&&(p=`<img src="${J(s[0].heroes.slug)}" class="game-card-bg-img" alt="">`);let m={};e.game_players.forEach(e=>{let t=n[parseInt(e.player_id.substring(1))-1]||`Unknown`;t.toLowerCase().startsWith(`player `)&&t.length>7&&(t=`P`+t.substring(7)),m[e.player_id]=t});let h=Object.values(m).map(e=>e.charAt(0).toUpperCase()),g={};e.game_players.forEach(e=>{let t=m[e.player_id],n=t.charAt(0).toUpperCase(),r=h.filter(e=>e===n).length,i=n;r>1&&t.length>1&&(i=n+t.charAt(1).toLowerCase()),g[e.player_id]=i});let _=[...e.game_players].sort((e,t)=>e.is_winner&&!t.is_winner?-1:!e.is_winner&&t.is_winner?1:0).map(e=>{let t=parseInt(e.player_id.substring(1))-1,n=e.heroes?.slug||``,r=e.heroes?.name||`Unknown`,i=e.is_winner===!0,a=i?`winner-highlight`:``,o=i?`<span class="mini-winner-trophy">🏆</span>`:``,s=g[e.player_id];return`
                            <a href="${Y(n)}" target="_blank" class="mini-portrait-wrapper ${a}" title="${r}">
                                ${o}
                                <img src="${J(n)}" class="mini-portrait-img" alt="${r}">
                                <div class="mini-portrait-pill" style="background-color: var(--p${t+1});">${s}</div>
                            </a>
                        `}).join(``),ee=d?`<span class="game-card-status-badge">In Progress</span>`:``,te=u?`<div class="player-plate-draw-badge">DRAW</div>`:``,v=`
                <div class="game-card-header" data-action="toggle-game-expansion" data-game-id="${e.id}">
                    <div class="game-card-title-group">
                        <span class="game-card-date">${o}</span>
                        ${ee}
                    </div>
                    <div class="game-card-collapsed-summary">
                        <div class="mini-portrait-strip">
                            ${_}
                            ${te}
                        </div>
                        <span class="chevron-icon">▼</span>
                    </div>
                </div>`,y=K()||e.last_updated_by===S(`currentUser`)?.id?`
                    <div class="game-card-actions">
                        <button class="btn-game-action" data-action="select-winner" data-game-id="${e.id}" title="Select Winner">🏆</button>
                        <button class="btn-game-action delete" data-action="delete-game" data-game-id="${e.id}" title="Delete Game">🗑️</button>
                    </div>
                `:``,b=e.game_players.map(e=>{let r=parseInt(e.player_id.substring(1))-1,a=e.heroes?.name||`Unknown`,o=e.heroes?.slug||``,c=!!(l&&a.toLowerCase().includes(l)),f=!1;i!==null&&(i>=0&&i<4?f=r===i:i===4&&(f=r===4||r===5));let p=`draw`;p=s.length>0?e.is_winner?`winner`:`loser`:u?`draw`:d?`in-progress`:e.is_winner===!1?`loser`:`draw`;let m=``;(c||f)&&(m=`box-shadow: 0 0 8px var(--accent), 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);`);let h=e.is_winner?`<div class="player-plate-trophy">🏆</div>`:``,g=u?`<div class="player-plate-draw-badge">DRAW</div>`:``,_=``;if(e.is_winner){let n=0,r=0,i=S(`gamesUseHistorical`);t.forEach(t=>{!i&&t.is_historical||t.game_players.forEach(t=>{t.player_id===e.player_id&&t.hero_id===e.hero_id&&(n++,t.is_winner&&r++)})});let a=n>0?(r/n).toFixed(3):`.000`,o=a.startsWith(`0`)?a.substring(1):a;_=`
                                <div class="player-plate-winner-stats">${r}🏆 / ${n}🎲</div>
                                <div class="player-plate-winner-pct">( ${o})</div>
                            `}return`
                        <a href="${Y(o)}" target="_blank" class="player-plate ${p}" style="${m}">
                            <img src="${J(o)}" class="player-plate-bg-art" alt="${a}">
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
                    ${v}
                    <div class="game-card-body">
                        <div class="player-responsive-grid">
                            ${b}
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
                    `});let f=ji()&&d?`<button type="button" class="btn-save btn-inline" data-action="open-winner-modal" data-game-id="${e.id}">Select Winner</button>`:``,p=K()?`<button type="button" class="btn-cancel btn-inline" data-action="delete-game" data-game-id="${e.id}">Delete</button>`:``,m=e.is_historical?`<span style="font-size: 0.7em; letter-spacing: 0.5px; opacity: 0.5; padding: 2px 6px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; font-weight: 500; font-family: monospace;">HISTORICAL</span>`:``;return`
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
                </div>`}).join(``)}function zr(){pr()}function Br(){mr()}function Vr(){hr()}function Hr(e){gr(e),localStorage.setItem(`lastSeenVersion`,e.version)}function Ur(){_r()}function Wr(e){br(e)}function Gr(e,t){xr(e,t)}function Kr(e){Sr(e)}function qr(e,t){t.target.tagName===`INPUT`||t.target.tagName===`LABEL`||t.target.closest(`label`)||(w(`expandedCollectionGroups`,`toggle`,e),W())}function Jr(e){let t=document.getElementById(`db-show-owned`),n=document.getElementById(`db-show-not-owned`);t&&n&&(e===`owned`?(t.checked=!0,n.checked=!1):e===`unowned`?(t.checked=!1,n.checked=!0):(t.checked=!0,n.checked=!0)),H()}function W(){Cr()}async function Yr(e,t){if(!S(`currentUser`)){alert(`Please log in to manage your collection.`);return}let n=S(`characters`).find(t=>t.id===e);n&&(n.is_owned=t),W(),H(),R();let r=document.getElementById(`admin-owned-${S(`currentUser`).id}-${e}`);r&&(r.checked=t);let{error:i}=await y(S(`currentUser`).id,e,t);i&&(alert(`Error updating ownership: `+i.message),n&&(n.is_owned=!t),W(),R(),H(),r&&(r.checked=!t))}async function Xr(e,t){if(!S(`currentUser`)){alert(`Please log in to manage your collection.`);return}let n=S(`characters`);n.forEach(n=>{if(n.group_id===e){n.is_owned=t;let e=document.getElementById(`admin-owned-${S(`currentUser`).id}-${n.id}`);e&&(e.checked=t)}}),W(),H(),R();let{error:r}=await b(n.filter(t=>t.group_id===e).map(e=>({user_id:S(`currentUser`).id,hero_id:e.id,is_owned:t})));r&&(alert(`Error updating group ownership: `+r.message),n.forEach(n=>{n.group_id===e&&(n.is_owned=!t)}),W(),R(),H())}async function Zr(){let e=document.getElementById(`charName`).value.trim(),t=document.getElementById(`charGroup`).value,n=document.getElementById(`charSlug`).value.trim(),r=document.getElementById(`charComplexity`).value.trim();if(!e)return alert(`Name is required`);if(!t)return alert(`Group is required`);let{error:i}=await ne({name:e,slug:n,complexity:r?parseInt(r):null,group_id:t,last_updated_by:S(`currentUser`).id});if(i)return alert(`Error saving: `+i.message);await $(),ei()}function Qr(e){C(`editIndex`,e),ii(),document.getElementById(`adminSection`).classList.contains(`hidden`)&&Wr(`admin`);let t=S(`characters`),n=document.getElementById(`heroEditPanel-${t[e]?.id}`);n&&!$r(n)&&n.scrollIntoView({behavior:`smooth`,block:`nearest`})}function $r(e){let t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)}function ei(){C(`editIndex`,-1),wr()}function ti(){Tr()}function ni(){Er()}function ri(){Dr()}function ii(){Or()}function ai(){C(`editIndex`,-1),ii()}async function oi(e,t){let n=document.getElementById(`heroName-${t}`).value.trim(),r=document.getElementById(`heroGroup-${t}`).value,i=document.getElementById(`heroSlug-${t}`).value.trim(),a=document.getElementById(`heroComplexity-${t}`).value.trim();if(!n)return alert(`Name is required`);if(!r)return alert(`Group is required`);let{error:o}=await re({id:e,name:n,slug:i,complexity:a?parseInt(a):null,group_id:r,last_updated_by:S(`currentUser`).id});if(o)return alert(`Error saving: `+o.message);C(`editIndex`,-1),await $()}async function si(e){if(!await T(`Delete Hero`,`Delete this hero? This action cannot be undone.`))return;let{error:t}=await ie(e);if(t)return alert(`Error deleting hero: `+t.message);await $()}async function ci(){let e=document.getElementById(`groupName`).value.trim(),t=document.getElementById(`groupOrder`).value.trim(),n=document.getElementById(`groupYear`).value.trim();if(!e)return alert(`Group name is required`);let{error:r}=await ae({name:e,order_index:t?parseInt(t):null,year:n?parseInt(n):null,is_active:!0});if(r)return alert(`Error saving group: `+r.message);fi(),$()}function li(e){let t=S(`groups`).find(t=>t.id===e);if(!t)return;let n=document.getElementById(`groupsListContainer`);n&&(n.classList.add(`group-edit-active`),n.querySelectorAll(`.group-row`).forEach(e=>e.classList.remove(`editing`)));let r=document.getElementById(`groupEditPanel-${e}`),i=document.getElementById(`groupRow-${e}`);!r||!i||(i.classList.add(`editing`),document.getElementById(`groupName-${e}`).value=t.name,document.getElementById(`groupOrder-${e}`).value=t.order_index||``,document.getElementById(`groupYear-${e}`).value=t.year||``,r.classList.remove(`hidden`))}function ui(e){kr(e)}async function di(e){let t=document.getElementById(`groupName-${e}`).value.trim(),n=document.getElementById(`groupOrder-${e}`).value.trim(),r=document.getElementById(`groupYear-${e}`).value.trim();if(!t)return alert(`Group name is required`);let{error:i}=await ae({id:e,name:t,order_index:n?parseInt(n):null,year:r?parseInt(r):null,is_active:!0});if(i)return alert(`Error saving group: `+i.message);$()}function fi(){Ar()}function pi(){jr()}function mi(){Mr()}function hi(e){let t=S(`players`).find(t=>t.id===e);if(!t)return;let n=document.getElementById(`playersListContainer`);n&&(n.classList.add(`player-edit-active`),n.querySelectorAll(`.player-admin-row`).forEach(e=>e.classList.remove(`editing`)));let r=document.getElementById(`playerEditPanel-${e}`),i=document.getElementById(`playerRow-${e}`);!r||!i||(i.classList.add(`editing`),document.getElementById(`playerName-${e}`).value=t.name,r.classList.remove(`hidden`))}function gi(e){Nr(e)}async function _i(e){let t=document.getElementById(`playerName-${e}`).value.trim();if(!t)return alert(`Player name is required`);let{error:n}=await v(e,t);if(n)return alert(`Error saving player: `+n.message);let r=S(`players`),i=S(`NAMES`),a=r.findIndex(t=>t.id===e);a!==-1&&(r[a].name=t,i[a]=t),gi(e),mi()}function vi(){Pr()}async function yi(){let e=document.getElementById(`collectionsListContainer`);if(!e)return;e.innerHTML=`<p style="opacity: 0.7; font-style: italic; padding: 10px;">Loading collections...</p>`;let t=[];try{let{data:n,error:r}=await ee();if(r){e.innerHTML=`<p style="color: var(--danger); padding: 10px;">Error loading collections: ${Z(r.message)}</p>`;return}t=n||[]}catch(t){e.innerHTML=`<p style="color: var(--danger); padding: 10px;">Error connecting to database: ${Z(t.message)}</p>`;return}let n=[],r=S(`players`);r.forEach(e=>{e.user_id&&n.push({user_id:e.user_id,name:e.name,isLinked:!0})}),t.forEach(e=>{n.some(t=>t.user_id===e.user_id)||n.push({user_id:e.user_id,name:`User (${e.user_id.substring(0,8)})`,isLinked:!1})});let i=S(`currentUser`);if(i&&!n.some(e=>e.user_id===i.id)){let e=r.find(e=>e.user_id===i.id),t=e?e.name:i.email?i.email.split(`@`)[0]:`Admin`;n.push({user_id:i.id,name:t,isLinked:!!e})}Fr(n,t)}async function bi(e,t,n){let r=S(`currentUser`);if(e===r?.id){let e=S(`characters`).find(e=>e.id===t);e&&(e.is_owned=n),W(),H(),R()}let{error:i}=await y(e,t,n);if(i){if(alert(`Error updating user collection: `+i.message),e===r?.id){let e=S(`characters`).find(e=>e.id===t);e&&(e.is_owned=!n),W(),H(),R()}yi()}}async function xi(e){if(!await T(`Delete Group`,`Delete this group?`))return;let{error:t}=await oe(e);if(t)return alert(`Error deleting group: `+t.message);fi(),$()}function G(){Rr()}function Si(){let e=document.getElementById(`games-search`),t=document.getElementById(`clear-games-search`);e&&t&&t.classList.toggle(`hidden`,e.value.trim().length===0),G()}function Ci(){let e=document.getElementById(`games-search`);e&&(e.value=``,e.focus()),Si()}function wi(e){w(`expandedGameIds`,`toggle`,e),G()}function Ti(){C(`gamesHistoryStyle`,(S(`gamesHistoryStyle`)||`gorgeous`)===`gorgeous`?`admin`:`gorgeous`),G()}function Ei(e){Ir(e)}function Di(){Lr()}async function Oi(e){let t=document.querySelector(`input[name="winner-selection"]:checked`);if(!t)return alert(`Please select a winner.`);let n=t.value,r=document.getElementById(`confirm-winner-btn`);r.disabled=!0,r.innerText=`Saving...`;try{let{error:t}=await ue(e,n,S(`currentUser`).id);if(t)throw t;Di(),await $()}catch(e){alert(`Error updating winner: `+e.message)}finally{r.disabled=!1,r.innerText=`Save Result`}}async function ki(e){if(!await T(`Delete Game Record`,`Are you sure you want to delete this game record? This cannot be undone.`))return;let{error:t}=await de(e);if(t)return console.error(`Error deleting game:`,t),alert(`Failed to delete game: `+t.message);await $()}function Ai(){let e=!0,t=!0,n=S(`activeFilterDataHistories`),r=n.has(`Normal only`),i=n.has(`Historical only`);r&&!i?(e=!0,t=!1):i&&!r&&(e=!1,t=!0);let a=S(`characters`);a.forEach(e=>{e.playCount=[0,0,0,0],e.lastPlayed=[`Never`,`Never`,`Never`,`Never`],e.winCount=[0,0,0,0]});let o=S(`games`);o&&o.forEach(n=>{let r=!!n.is_historical;r&&!t||!r&&!e||n.game_players.forEach(e=>{let t=parseInt(e.player_id?.substring(1)||`0`,10)-1;if(t>=0&&t<4){let r=a.find(t=>t.id===e.hero_id);if(!r)return;if(r.playCount[t]++,e.is_winner&&r.winCount[t]++,r.lastPlayed[t]===`Never`){let e=n.played_at||``;e&&!e.includes(`T`)&&(e=e.replace(` `,`T`)),e&&!e.includes(`Z`)&&!e.includes(`+`)&&(e+=`Z`);let i=new Date(e);r.lastPlayed[t]=i.getFullYear()<2026?`Unknown`:i.toLocaleDateString(`en-CA`)}}})})}window.alert=function(e){_e(e,e&&(e.toLowerCase().includes(`error`)||e.toLowerCase().includes(`failed`))?`error`:`warning`)};function K(){return S(`currentUser`)?.app_metadata?.role===`admin`}function ji(){return!!S(`currentUser`)}function q(e){return S(`activeRollParticipants`).find(t=>t.pIdx===e)}var J=e=>e?`https://dice-throne.rulepop.com/heroes/${e}.webp`:``,Y=e=>`https://dice-throne.rulepop.com/#hero/${e}`,X=e=>!!e?.is_owned,Z=e=>String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),Mi=e=>{if(!e)return`#ffffff`;if(e=e.trim(),e.startsWith(`#`))return e;let t=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(t){let e=parseInt(t[1],10),n=parseInt(t[2],10),r=parseInt(t[3],10);return`#${(1<<24|e<<16|n<<8|r).toString(16).slice(1)}`}return e},Ni=e=>e?.player_color?Mi(e.player_color):Mi(getComputedStyle(document.documentElement).getPropertyValue(`--${e?.id}`).trim()),Pi=(e,t)=>{document.documentElement.style.setProperty(`--${e}`,t)};function Q(e,t){return e.weights[t]/(e.playCount[t]*3+1)**2}function Fi(e,t){if(!e)return`0.00%`;let n=S(`characters`).filter(X).length;if(n===0)return`0.00%`;if(t>=4)return`${(100/n).toFixed(2)}%`;let r=0;if(S(`characters`).filter(X).forEach(e=>r+=Q(e,t)),r===0)return`0.00%`;let i=X(e),a=Q(e,t);return`${i?(a/r*100).toFixed(2):`0.00`}%`}async function Ii(e,t){let n=S(`players`).find(t=>t.id===e);if(!n)return;let r=Ni(n),i=Mi(t.value);if(i.toLowerCase()===r.toLowerCase())return;if(!await T(`Change Player Color`,`Change ${n.name}'s color from ${r} to ${i}?`)){t.value=r;return}let{error:a}=await te(e,i);if(a){alert(`Error saving player color: `+a.message),t.value=r;return}let o=S(`players`).findIndex(t=>t.id===e);o!==-1&&(S(`players`)[o].player_color=i),Pi(e,i),mi()}function Li(e){if(!e)return null;try{let t=e.trim();t&&!t.includes(`T`)&&(t=t.replace(` `,`T`)),t&&t.includes(`:`)&&!t.includes(`Z`)&&!t.includes(`+`)&&(t+=`Z`);let n=new Date(t);return isNaN(n.getTime())?null:n}catch{return null}}function Ri(e){if(!e||e===`Never`)return``;if(e===`Unknown`)return`Date unknown (historical)`;let t=Li(e);if(!t)return``;try{let e=new Date;t.setHours(0,0,0,0),e.setHours(0,0,0,0);let n=e-t,r=Math.floor(n/(1e3*60*60*24));return r<0?``:r===0?`today`:r===1?`yesterday`:`${r} days ago`}catch{return``}}function zi(e){let t=`⚫`;if(e&&e===`Unknown`)t=`🔴`;else if(e&&e!==`Never`&&e!==`Unknown`){let n=Li(e);if(n)try{let e=new Date;n.setHours(0,0,0,0),e.setHours(0,0,0,0);let r=e-n,i=Math.floor(r/(1e3*60*60*24));t=i<=15?`🟢`:i<=60?`🟡`:`🔴`}catch{t=`⚪`}else t=`⚪`}return t}function Bi(){let e=(e,t)=>{let n=document.getElementById(e);n&&n.addEventListener(`click`,t)};e(`roll-final-btn`,mn),e(`cancelBtn`,wn),e(`confirmBtn`,Cn),e(`clear-search`,or),e(`hero-search-btn`,sr),e(`btn-trigger-sort`,nr),e(`btn-trigger-filter`,Ln),e(`clear-games-search`,Ci),e(`btn-trigger-games-filter`,In);let t=document.getElementById(`randomizer-setup`);t&&(t.addEventListener(`change`,e=>{let t=e.target.closest(`#invitee-zone input[data-invitee-id]`);if(t&&!t.checked)return ht(t.dataset.inviteeId);e.target.closest(`#player-toggle-zone-top, #invitee-zone`)&&F()}),t.addEventListener(`click`,e=>{if(e.target.closest(`[data-action="add-invitee"]`))return mt();let t=e.target.closest(`[data-action="select-game-type"]`);if(t&&!t.disabled)return vt(t.dataset.type);if(e.target.closest(`[data-action="randomize-teams"]`))return xt();let n=e.target.closest(`[data-action="initiate-team-swap"]`);if(n)return St(n.dataset.participantId,n.dataset.team);let r=e.target.closest(`[data-action="complete-team-swap"]`);if(r)return wt(r.dataset.participantId);let i=e.target.closest(`[data-action="select-roll-mode"]`);if(i&&!i.disabled)return yt(i.dataset.mode);let a=e.target.closest(`[data-action="select-draft-count"]`);if(a)return bt(parseInt(a.dataset.count,10))}));let n=document.getElementById(`team-swap-scrim`);n&&n.addEventListener(`click`,()=>Ct()),document.querySelectorAll(`.bottom-nav .nav-item`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.getAttribute(`data-section`);n&&Wr(n)})});let r=document.getElementById(`version-number`);r&&r.addEventListener(`click`,()=>{Re(),Br()});let i=document.querySelector(`.close-button`);i&&i.addEventListener(`click`,Vr),e(`whats-new-close`,Ur),e(`whats-new-got-it`,Ur),e(`winner-close`,Di),e(`winner-cancel`,Di),e(`login-close`,Ie),e(`forgot-password-btn`,Be),e(`update-password-close`,He),e(`hero-select-close`,gn),e(`header-avatar-btn`,Le),e(`account-close`,Re);let a=document.getElementById(`hero-search`);a&&(a.addEventListener(`keydown`,e=>{e.key===`Enter`&&sr()}),a.addEventListener(`input`,ar));let o=document.getElementById(`games-search`);o&&o.addEventListener(`input`,Si);let s=document.getElementById(`hero-select-search`);s&&s.addEventListener(`input`,vn);let c=document.getElementById(`modal-sort-name`);c&&c.addEventListener(`click`,()=>_n(`name`));let l=document.getElementById(`modal-sort-weight`);l&&l.addEventListener(`click`,()=>_n(`weight`));let u=document.getElementById(`sort-filter-drawer`);u&&u.addEventListener(`click`,e=>{z(e)});let d=document.getElementById(`filter-drawer-left`);d&&d.addEventListener(`click`,e=>{let t=e.target.closest(`.segmented-pill[data-filter]`);if(t){let e=t.getAttribute(`data-filter`);e&&Rn(e);return}zn(e)}),e(`drawer-close`,()=>z(null,!0)),e(`drawer-reset`,Zn),e(`drawer-apply`,Qn),e(`filter-drawer-close-btn`,Hn),e(`filter-drawer-reset`,Vn),e(`filter-drawer-apply`,Hn),e(`addGroupBtn`,pi),e(`saveGroupBtn`,ci);let f=document.getElementById(`cancelGroupBtn`);f&&f.addEventListener(`click`,async()=>{document.getElementById(`groupName`).value&&!await T(`Discard Changes`,`Discard unsaved changes?`)||fi()}),e(`addHeroBtn`,ti),e(`saveBtn`,Zr);let p=document.getElementById(`cancelHeroBtn`);p&&p.addEventListener(`click`,async()=>{document.getElementById(`charName`).value&&!await T(`Discard Changes`,`Discard unsaved changes?`)||ei()}),document.querySelectorAll(`#adminSection .panel-header`).forEach(e=>{e.addEventListener(`click`,t=>{let n=e.getAttribute(`data-panel`);n&&Gr(t,n)})});let m=document.getElementById(`login-form`);m&&m.addEventListener(`submit`,e=>{e.preventDefault(),ze()});let h=document.getElementById(`update-password-form`);h&&h.addEventListener(`submit`,e=>{e.preventDefault(),Ue()});let g=document.getElementById(`auth-btn`);g&&g.addEventListener(`click`,()=>{S(`currentUser`)?We():(Re(),Fe())});let _=document.getElementById(`confirm-winner-btn`);_&&_.addEventListener(`click`,()=>{let e=_.getAttribute(`data-game-id`);e&&Oi(e)});let ee=document.getElementById(`sort-dropdown-menu`);ee&&ee.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="select-sort"]`);t&&ir(t.getAttribute(`data-sort-key`),t.getAttribute(`data-sort-asc`)===`true`)});let te=document.getElementById(`filter-drawer-left`);te&&te.addEventListener(`change`,e=>{let t=e.target.closest(`input[type="checkbox"][data-type]`);t&&Bn(t)});let v=document.getElementById(`drawer-body-content`);v&&(v.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-drawer-player-filter"]`);if(n){Jn(parseInt(n.getAttribute(`data-player-idx`),10));return}let r=t.closest(`[data-action="toggle-staged-player-game-filter"]`);if(r){Wn(parseInt(r.getAttribute(`data-player-idx`),10));return}let i=t.closest(`[data-action="drawer-sort-player-change"]`);if(i){qn(parseInt(i.getAttribute(`data-player-idx`),10));return}let a=t.closest(`[data-action="toggle-drawer-level"]`);if(a){if(a.getAttribute(`data-disabled`)===`true`)return;let e=a.getAttribute(`data-level`);Yn(e===`all`?`all`:parseInt(e,10));return}let o=t.closest(`[data-action="toggle-drawer-group"]`);if(o){if(o.getAttribute(`data-disabled`)===`true`)return;Xn(o.getAttribute(`data-group-id`));return}}),v.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-use-historical"]`);if(n){Gn(n.checked);return}let r=t.closest(`[data-action="toggle-staged-winner-only"]`);if(r){Fn(r.checked);return}let i=t.closest(`[data-action="drawer-sort-type-change"]`);if(i){Kn(i.value);return}let a=t.closest(`[data-action="toggle-staged-ban"]`);if(a){Tn(a.getAttribute(`data-hero-id`));return}}),v.addEventListener(`input`,e=>{let t=e.target.closest(`[data-action="ban-search-input"]`);t&&En(t.value)}));let y=document.getElementById(`active-filters-container`);y&&y.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-action="clear-search-filter"]`)){ur();return}let n=t.closest(`[data-action="remove-filter-chip"]`);if(n){let e=n.getAttribute(`data-type`),t=n.getAttribute(`data-value`);e===`complexity`&&(t=parseInt(t,10)),lr(e,t);return}});let b=document.getElementById(`results`);b&&b.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="open-hero-select"]`);if(n){hn(parseInt(n.getAttribute(`data-player-idx`),10));return}let r=t.closest(`[data-action="select-draft-candidate"]`);if(r){Nn(parseInt(r.getAttribute(`data-player-idx`),10),r.getAttribute(`data-hero-id`));return}if(t.closest(`[data-action="cancel-roll"]`)){wn();return}let i=t.closest(`[data-action="confirm-draft"]`);if(i){Pn(parseInt(i.getAttribute(`data-player-idx`),10));return}});let ne=document.getElementById(`hero-select-options-container`);ne&&ne.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="select-hero-option"]`);t&&yn(t.getAttribute(`data-hero-name`))});let re=document.getElementById(`heroContainer`);re&&re.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="toggle-hero-panel"]`);if(t){if(e.target.closest(`a`)||e.target.closest(`.complexity-dice-bar`))return;Kr(t)}});let ie=document.getElementById(`groupsListContainer`);ie&&ie.addEventListener(`click`,e=>{let t=e.target,n=t.getAttribute(`data-group-id`);t.closest(`[data-action="edit-group"]`)?li(n):t.closest(`[data-action="delete-group"]`)?xi(n):t.closest(`[data-action="save-group-inline"]`)?di(n):t.closest(`[data-action="cancel-group-edit"]`)&&ui(n)});let ae=document.getElementById(`heroesListContainer`);ae&&ae.addEventListener(`click`,e=>{let t=e.target;t.closest(`[data-action="edit-hero"]`)?Qr(parseInt(t.getAttribute(`data-hero-idx`),10)):t.closest(`[data-action="delete-hero"]`)?si(t.getAttribute(`data-hero-id`)):t.closest(`[data-action="save-hero-inline"]`)?oi(t.getAttribute(`data-hero-id`),parseInt(t.getAttribute(`data-hero-idx`),10)):t.closest(`[data-action="cancel-hero-edit"]`)&&ai()});let oe=document.getElementById(`playersListContainer`);oe&&(oe.addEventListener(`click`,e=>{let t=e.target,n=t.getAttribute(`data-player-id`);t.closest(`[data-action="edit-player"]`)?hi(n):t.closest(`[data-action="save-player-inline"]`)?_i(n):t.closest(`[data-action="cancel-player-edit"]`)&&gi(n)}),oe.addEventListener(`change`,e=>{let t=e.target.closest(`[data-action="player-color-change"]`);t&&Ii(t.getAttribute(`data-player-id`),t)}));let se=document.getElementById(`usersListContainer`);se&&se.addEventListener(`change`,e=>{e.target.closest(`[data-action="user-role-change"]`)&&(alert(`User roles must be modified directly in the Supabase Dashboard for security reasons.`),vi())});let ce=e=>{e&&(e.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-hero-owned"]`);if(n){Yr(n.getAttribute(`data-hero-id`),n.getAttribute(`data-selected`)!==`true`);return}let r=t.closest(`[data-action="toggle-collection-group"]`);if(r){if(e.target.closest(`input[type="checkbox"]`)||e.target.closest(`label`))return;qr(r.getAttribute(`data-group-id`),e);return}}),e.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-group-owned"]`);if(n){Xr(n.getAttribute(`data-group-id`),n.checked);return}let r=t.closest(`[data-action="toggle-user-hero-owned"]`);if(r){bi(r.getAttribute(`data-user-id`),r.getAttribute(`data-hero-id`),r.checked);return}}))};ce(document.getElementById(`collectionsListContainer`)),ce(document.getElementById(`collectionContainer`));let le=document.getElementById(`gamesSection`);le&&le.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-action="toggle-history-view-style"]`)){Ti();return}let n=t.closest(`[data-action="toggle-game-expansion"]`);if(n){wi(n.getAttribute(`data-game-id`));return}let r=t.closest(`[data-action="select-winner"]`);if(r){Ei(r.getAttribute(`data-game-id`));return}let i=t.closest(`[data-action="delete-game"]`);if(i){ki(i.getAttribute(`data-game-id`));return}let a=t.closest(`[data-action="open-winner-modal"]`);if(a){Ei(a.getAttribute(`data-game-id`));return}});let ue=document.getElementById(`winner-selection-container`);ue&&ue.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="winner-card-click"]`);if(t){let e=t.querySelector(`input[name="winner-selection"]`);if(e){e.checked=!0,ue.querySelectorAll(`.winner-card, .winner-draw-card`).forEach(e=>{e.classList.toggle(`selected`,e===t)});let n=document.getElementById(`confirm-winner-btn`);n&&(n.disabled=!1)}}}),window.addEventListener(`click`,e=>{let t=document.getElementById(`changelog-modal`),n=document.getElementById(`login-modal`),r=document.getElementById(`whats-new-modal`),i=document.getElementById(`update-password-modal`),a=document.getElementById(`hero-select-modal`),o=document.getElementById(`account-modal`);e.target===t&&Vr(),e.target===n&&Ie(),e.target===r&&Ur(),e.target===i&&He(),e.target===a&&gn(),e.target===o&&Re();let s=document.getElementById(`sort-dropdown-menu`),c=document.getElementById(`sort-dropdown-container`);s&&s.classList.contains(`show`)&&c&&!c.contains(e.target)&&rr()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&gn()})}async function $(){C(`draftModeEnabled`,localStorage.getItem(`draftModeEnabled`)===`true`);let e=parseInt(localStorage.getItem(`draftCount`)||`3`,10);[2,3,4,5].includes(e)||(e=3),C(`draftCount`,e);let t=localStorage.getItem(`bannedHeroIds`);C(`bannedHeroIds`,t?new Set(JSON.parse(t)):new Set),Dn();let{data:n,error:r}=await m();if(!r&&n){C(`groups`,n),ni(),ri();let e=new Set(n.map(e=>e.id));if(S(`activeGroups`).size===0)n.forEach(e=>w(`activeGroups`,`add`,e.id));else for(let t of S(`activeGroups`))e.has(t)||w(`activeGroups`,`delete`,t);V(),cr()}let{data:i,error:a}=await h();if(!a&&i){C(`players`,i),i.forEach(e=>{e.player_color&&Pi(e.id,Mi(e.player_color))});let e=i.map(e=>e.name),t=-1,n=S(`currentUser`);i.forEach((r,i)=>{i<6&&(e[i]=r.name,n&&r.user_id===n.id&&(t=i))}),C(`NAMES`,e),C(`loggedInPlayerIndex`,t),Ne(),Pe(),st()}let{data:o,error:s}=await g();if(s)return console.error(`Error fetching heroes:`,s);C(`characters`,o.map(e=>{let t=e.user_heroes?.find(e=>e.user_id===S(`currentUser`)?.id),n=t?t.is_owned:!0,r={id:e.id,name:e.name,slug:e.slug,complexity:e.complexity,group_id:e.group_id,is_owned:n,group:e.groups?.name||`Unknown`,weights:[,,,,].fill(250),playCount:[,,,,].fill(0),lastPlayed:[,,,,].fill(`Never`),winCount:[,,,,].fill(0)};return e.player_hero_stats?.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1;t>=0&&t<4&&(r.weights[t]=e.weight)}),r}));let{data:c,error:l}=await _();l?console.error(`Error fetching games:`,l):C(`games`,c.map(e=>({...e,game_players:(e.game_players||[]).slice().sort((e,t)=>parseInt(e.player_id?.substring(1)||`0`,10)-parseInt(t.player_id?.substring(1)||`0`,10))}))),zr(),ri(),G(),ii(),mi(),vi(),K()&&yi(),W();let u=S(`currentSort`);C(`currentSort`,null),er(u)}async function Vi(){try{let{data:{session:e}}=await f();C(`currentUser`,e?.user||null),Ne(),await $(),C(`cachedChangelog`,await(await fetch(`changelog.json`)).json());let t=S(`cachedChangelog`);if(t&&t.length>0){let e=t[0],n=document.getElementById(`version-number`);n&&(n.innerText=e.version),localStorage.getItem(`lastSeenVersion`)!==e.version&&Hr(e)}fe($),me((e,t)=>{console.log(`[stateStore] Update: ${e} =`,t)})}catch(e){console.error(`Could not load version number:`,e);let t=document.getElementById(`version-number`);t&&(t.innerText=`Error`)}finally{Hi()}}function Hi(){let e=document.getElementById(`preloader`);e&&(e.classList.add(`fade-out`),document.body.classList.add(`loaded`),e.addEventListener(`animationend`,()=>e.remove(),{once:!0}))}window.addEventListener(`DOMContentLoaded`,()=>{Bi(),Vi(),p((e,t)=>{C(`currentUser`,t?.user||null),(e===`SIGNED_IN`||e===`SIGNED_OUT`)&&$(),e===`PASSWORD_RECOVERY`&&Ve(),Ne(),e===`SIGNED_IN`&&Ie()})});