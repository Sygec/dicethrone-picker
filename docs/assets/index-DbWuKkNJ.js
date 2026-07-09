(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=window.location.hostname===`sygec.github.io`||window.location.hostname===`dicethrone-prod.sygec.workers.dev`,t=`https://ojqkkixtvdtccuixishh.supabase.co`,n=`sb_publishable_AT9BZrEkq1IDrZmP1Y_pDQ_Qwnh57ZH`,r=`https://wmxrzjmadvivvpzbslgj.supabase.co`,i=`sb_publishable_Hohs2ojpVd5nmRJoi0upNg_PJv8M7x6`,a=e?t:r,o=e?n:i,s=supabase.createClient(a,o);async function c({email:e,password:t}){return s.auth.signInWithPassword({email:e,password:t})}async function l(e){return s.auth.resetPasswordForEmail(e,{redirectTo:window.location.origin})}async function u({password:e}){return s.auth.updateUser({password:e})}async function d(){return s.auth.signOut()}async function f(){return s.auth.getSession()}function p(e){return s.auth.onAuthStateChange(e)}async function m(){return s.from(`groups`).select(`*`).eq(`is_active`,!0).order(`order_index`,{ascending:!0})}async function h(){let e=await s.from(`players`).select(`*`);return e.data&&e.data.sort((e,t)=>parseInt(e.id.slice(1),10)-parseInt(t.id.slice(1),10)),e}async function g(){return s.from(`heroes`).select(`
            *,
            groups (name),
            player_hero_stats (*),
            user_heroes (*)
        `).order(`name`,{ascending:!0})}async function _(){return s.from(`games`).select(`
            id,
            played_at,
            last_updated_by,
            is_historical,
            game_type,
            game_players (
                hero_id,
                player_id,
                is_winner,
                team_id,
                teams (
                    team_label
                ),
                heroes (
                    name,
                    slug,
                    complexity
                )
            )
        `).order(`played_at`,{ascending:!1}).order(`player_id`,{foreignTable:`game_players`,ascending:!0})}async function v(){return s.from(`user_heroes`).select(`*`)}async function y(e,t){return s.from(`players`).update({player_color:t}).eq(`id`,e).select().single()}async function b(e,t){return s.from(`players`).update({name:t}).eq(`id`,e).select().single()}async function x(e,t,n){return s.from(`user_heroes`).upsert({user_id:e,hero_id:t,is_owned:n})}async function ee(e){return s.from(`user_heroes`).upsert(e)}async function te(e){return s.from(`heroes`).insert(e).select().single()}async function ne(e){return s.from(`heroes`).upsert(e).select().single()}async function re(e){return s.from(`heroes`).delete().eq(`id`,e)}async function ie(e){return s.from(`groups`).upsert(e).select().single()}async function S(e){return s.from(`groups`).delete().eq(`id`,e)}async function C(e,t){return s.from(`games`).insert({last_updated_by:e,game_type:t}).select().single()}async function ae(e){return s.from(`teams`).insert(e).select()}async function oe(e){return s.from(`game_players`).insert(e)}async function se(e){return s.from(`player_hero_stats`).upsert(e)}async function ce(e,t,n){if(t===`draw`)return s.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e);{let r=await s.from(`game_players`).update({is_winner:!0,last_updated_by:n}).eq(`game_id`,e).eq(`player_id`,t);return r.error?r:s.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e).neq(`player_id`,t)}}async function le(e,t,n){if(t===`draw`){let t=await s.from(`teams`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e);return t.error?t:s.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e)}let{data:r,error:i}=await s.from(`teams`).select(`id, team_label`).eq(`game_id`,e);if(i)return{error:i};let a=r.find(e=>e.team_label===t),o=r.find(e=>e.team_label!==t);if(!a||!o)return{error:Error(`Could not resolve both teams for this game.`)};let c=await s.from(`teams`).update({is_winner:!0,last_updated_by:n}).eq(`id`,a.id);if(c.error)return c;let l=await s.from(`teams`).update({is_winner:!1,last_updated_by:n}).eq(`id`,o.id);if(l.error)return l;let u=await s.from(`game_players`).update({is_winner:!0,last_updated_by:n}).eq(`game_id`,e).eq(`team_id`,a.id);return u.error?u:s.from(`game_players`).update({is_winner:!1,last_updated_by:n}).eq(`game_id`,e).eq(`team_id`,o.id)}async function ue(e){return s.from(`games`).delete().eq(`id`,e)}function de(e){return s.channel(`schema-db-changes`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`user_heroes`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`player_hero_stats`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`heroes`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`games`},e).on(`postgres_changes`,{event:`*`,schema:`public`,table:`game_players`},e).subscribe()}var fe={NAMES:[],characters:[],games:[],players:[],invitees:[],selectedGameType:null,rollModeChosen:!1,teamAssignments:null,teamSwapSource:null,groups:[],authUsers:[],cachedChangelog:null,activeLevels:new Set([1,2,3,4,5,6]),activeGroups:new Set,selectedGamePlayerIndex:null,expandedGameIds:new Set,currentSort:`name`,sortAsc:!0,currentSortPlayerIndex:0,editIndex:-1,activePlayerIndices:[0,1,2,3],currentDrawerMode:`sort-filter`,stagedSort:``,stagedSortAsc:!0,stagedSortPlayerIndex:0,stagedLevels:new Set,stagedGroups:new Set,stagedPlayerIndices:[],stagedUseHistorical:!0,dbUseHistorical:!0,activeFilterDataHistories:new Set,activeFilterPlayers:new Set,activeFilterComplexities:new Set,activeFilterGroups:new Set,stagedFilterDataHistories:new Set,stagedFilterPlayers:new Set,stagedFilterComplexities:new Set,stagedFilterGroups:new Set,activeOwnershipFilter:`owned`,stagedOwnershipFilter:`owned`,gamesWinnerOnly:!1,gamesUseHistorical:!0,stagedSelectedGamePlayerIndex:null,stagedGamesWinnerOnly:!1,stagedGamesUseHistorical:!0,currentUser:null,loggedInPlayerIndex:-1,isRollActive:!1,expandedCollectionGroups:new Set,scrambleIntervals:{},activeSelectPlayerIdx:null,modalSortMode:`name`,draftModeEnabled:!1,draftCount:3,draftCountChosen:!1,bannedHeroIds:new Set,stagedBannedHeroIds:new Set,stagedBanSearchQuery:``,activeDraftOrder:[],activeDraftStep:0,selectedDraftHeroes:{},activeDraftCandidates:{},activeRollParticipants:[],gamesHistoryStyle:`gorgeous`},pe=new Set;function me(e){return pe.add(e),()=>{pe.delete(e)}}function he(e,t){pe.forEach(n=>{try{n(e,t,fe)}catch(e){console.error(`Error in stateStore listener:`,e)}})}function w(e){return fe[e]}function T(e,t){fe[e]=t,he(e,t)}function E(e,t,n){let r=fe[e];if(!(r instanceof Set)){console.warn(`stateStore: ${e} is not an instance of Set.`);return}t===`add`?r.add(n):t===`delete`?r.delete(n):t===`clear`?r.clear():t===`toggle`&&(r.has(n)?r.delete(n):r.add(n)),he(e,r)}function ge(e,t,n){let r=fe[e];if(typeof r!=`object`||!r){console.warn(`stateStore: ${e} is not an object.`);return}n===void 0?delete r[t]:r[t]=n,he(e,r)}function _e(e,t=`info`){let n=document.getElementById(`toast-container`);n||(n=document.createElement(`div`),n.id=`toast-container`,document.body.appendChild(n));let r=document.createElement(`div`);r.className=`toast toast-${t}`,r.innerHTML=`
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
        `,r.querySelector(`.confirm-modal-title`).textContent=e,r.querySelector(`.confirm-modal-message`).textContent=t,document.body.appendChild(r),requestAnimationFrame(()=>{r.classList.add(`show`)});let i=()=>{r.classList.remove(`show`),r.addEventListener(`transitionend`,()=>{r.parentNode&&r.parentNode.removeChild(r)})};r.querySelector(`#confirm-cancel-btn`).addEventListener(`click`,()=>{i(),n(!1)}),r.querySelector(`#confirm-confirm-btn`).addEventListener(`click`,()=>{i(),n(!0)}),r.addEventListener(`click`,e=>{e.target===r&&(i(),n(!1))})})}var ve=null,O=()=>(ve||={adminNav:document.querySelector(`.bottom-nav .admin-only`),authBtn:document.getElementById(`auth-btn`),actionButtons:document.getElementById(`action-buttons`),avatarBtn:document.getElementById(`header-avatar-btn`),accountModal:document.getElementById(`account-modal`),loginModal:document.getElementById(`login-modal`),loginError:document.getElementById(`login-error`),loginEmailInput:document.getElementById(`login-email`),updatePasswordModal:document.getElementById(`update-password-modal`),updatePasswordError:document.getElementById(`update-password-error`),updatePasswordUsername:document.getElementById(`update-password-username`),newPasswordInput:document.getElementById(`new-password`),confirmPasswordInput:document.getElementById(`confirm-password`),playerTogglesContainer:document.getElementById(`player-toggle-zone-top`)},ve);function ye(){let e=O(),t=w(`currentUser`),n=w(`loggedInPlayerIndex`),r=w(`NAMES`),i=w(`players`);if(t){if(n!==-1&&r[n])e.authBtn&&(e.authBtn.innerText=`Logout (${r[n]})`);else{let n=t.email?t.email.split(`@`)[0]:`User`;e.authBtn&&(e.authBtn.innerText=`Logout (${n})`)}e.adminNav&&(e.adminNav.style.display=K()?`flex`:`none`);let a=n===-1?null:i[n];e.avatarBtn&&(a?(e.avatarBtn.classList.add(`logged-in`),e.avatarBtn.style.setProperty(`--avatar-color`,`var(--${a.id})`)):(e.avatarBtn.classList.remove(`logged-in`),e.avatarBtn.style.removeProperty(`--avatar-color`)))}else{e.authBtn&&(e.authBtn.innerText=`Login`),e.adminNav&&(e.adminNav.style.display=`none`);let t=document.getElementById(`adminSection`);t&&t.classList.add(`hidden`),e.actionButtons&&(e.actionButtons.style.display=`none`),e.avatarBtn&&(e.avatarBtn.classList.remove(`logged-in`),e.avatarBtn.style.removeProperty(`--avatar-color`))}}function be(){let e=O();e.accountModal&&(e.accountModal.style.display=`flex`),document.body.style.overflow=`hidden`}function xe(){let e=O();e.accountModal&&(e.accountModal.style.display=`none`),document.body.style.overflow=`auto`}function Se(){let e=O(),t=w(`players`);!e.playerTogglesContainer||!t||t.length===0||(e.playerTogglesContainer.innerHTML=t.slice(0,4).map((e,t)=>`
            <label class="player-card" style="--player-color: var(--${e.id})">
                <input type="checkbox" id="use${t}" data-action="toggle-player-slot" data-player-idx="${t}">
                <span class="player-card-name">${e.name}</span>
            </label>`).join(``))}function Ce(){let e=O();e.loginModal&&(e.loginModal.style.display=`flex`),e.loginError&&(e.loginError.style.display=`none`),De(),document.body.style.overflow=`hidden`}function we(){let e=O();e.loginModal&&(e.loginModal.style.display=`none`),De(),document.body.style.overflow=`auto`}function Te(e){let t=O();t.loginError&&(t.loginError.innerText=e,t.loginError.style.color=`var(--danger)`,t.loginError.style.fontSize=`0.95rem`,t.loginError.style.fontWeight=`600`,t.loginError.style.display=`block`)}function Ee(e){Te(e);let t=O();t.loginEmailInput&&(t.loginEmailInput.style.borderColor=`var(--danger)`,t.loginEmailInput.style.boxShadow=`0 0 0 2px color-mix(in srgb, var(--danger) 25%, transparent)`)}function De(){let e=O();e.loginEmailInput&&(e.loginEmailInput.style.borderColor=`#ccc`,e.loginEmailInput.style.boxShadow=``)}function Oe(){let e=O();e.updatePasswordModal&&(e.updatePasswordModal.style.display=`block`),e.updatePasswordError&&(e.updatePasswordError.style.display=`none`),document.body.style.overflow=`hidden`;let t=w(`currentUser`);e.updatePasswordUsername&&t&&(e.updatePasswordUsername.value=t.email||``)}function ke(){let e=O();e.updatePasswordModal&&(e.updatePasswordModal.style.display=`none`),document.body.style.overflow=`auto`}function Ae(e){let t=O();t.updatePasswordError&&(t.updatePasswordError.innerText=e,t.updatePasswordError.style.color=`var(--danger)`,t.updatePasswordError.style.display=`block`)}function je(){let e=O();e.loginError&&(e.loginError.innerText=`Password reset email sent. Please check your inbox.`,e.loginError.style.color=`#4CAF50`,e.loginError.style.fontSize=`0.95rem`,e.loginError.style.fontWeight=`600`,e.loginError.style.display=`block`,setTimeout(()=>{e.loginError&&(e.loginError.style.display=`none`,e.loginError.innerText=``,e.loginError.style.color=`var(--danger)`)},5e3))}function Me(){let e=O();e.newPasswordInput&&(e.newPasswordInput.value=``),e.confirmPasswordInput&&(e.confirmPasswordInput.value=``)}var Ne=null;function Pe(){ye(),H(),G(),di()}function Fe(){Se()}function Ie(){Ce(),Ne=e=>{e.key===`Escape`&&Le()},document.addEventListener(`keydown`,Ne)}function Le(){we(),Ne&&document.removeEventListener(`keydown`,Ne)}function Re(){be()}function ze(){xe()}async function Be(){let e=document.getElementById(`login-email`).value,t=document.getElementById(`login-password`).value,{error:n}=await c({email:e,password:t});n&&Te(n.message)}async function Ve(){let e=document.getElementById(`login-email`).value;if(!e){Ee(`Please enter your email address first.`);return}De();let{error:t}=await l(e);t?Te(t.message||`Failed to send reset email. Please try again.`):je()}function He(){Oe()}function Ue(){ke()}async function We(){let e=document.getElementById(`new-password`).value,t=document.getElementById(`confirm-password`).value;if(!e){Ae(`Please enter a new password.`);return}if(e!==t){Ae(`Passwords do not match.`);return}let{error:n}=await u({password:e});n?Ae(n.message):(alert(`Password updated successfully!`),Ue(),Me())}async function Ge(){await D(`Log Out`,`Log out now?`)&&await d()}var k={duel:`<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor"><path d="M769-88 645-212l-88 88-43-43q-17-17-17-42t17-42l199-199q17-17 42-17t42 17l43 43-88 88 123 124q9 9 9 21t-9 21l-64 65q-9 9-21 9t-21-9Zm111-636L427-271l19 20q17 17 17 42t-17 42l-43 43-88-88L191-88q-9 9-21 9t-21-9l-65-65q-9-9-9-21t9-21l124-124-88-88 43-43q17-17 42-17t42 17l20 19 453-453h160v160ZM278-526 80-724v-160h160l198 198-160 160Z"/></svg>`,teams:`<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor"><path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM250-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42Zm426 0q-42 42-108 42-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108q0 66-42 108Z"/></svg>`,ffa:`<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor"><path d="M420-340h120l-60-120-60 120Zm-79.91-120q28.91 0 49.41-20.59 20.5-20.59 20.5-49.5t-20.59-49.41q-20.59-20.5-49.5-20.5t-49.41 20.59q-20.5 20.59-20.5 49.5t20.59 49.41q20.59 20.5 49.5 20.5Zm280 0q28.91 0 49.41-20.59 20.5-20.59 20.5-49.5t-20.59-49.41q-20.59-20.5-49.5-20.5t-49.41 20.59q-20.5 20.59-20.5 49.5t20.59 49.41q20.59 20.5 49.5 20.5ZM240-80v-170q-36-16-65.5-43T124-355.5Q103-391 91.5-433T80-520q0-158 112-259t288-101q176 0 288 101t112 259q0 45-11.5 87T836-355.5Q815-320 785.5-293T720-250v170H600v-120h-60v120H420v-120h-60v120H240Z"/></svg>`,koth:`<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor"><path d="M510-80v-329q0-23 5.5-44.5T537-492q44-46 103-72.5T767-591q63 0 108 45t45 108v205q0 63-45 108T767-80H510Zm-317 0q-63 0-108-45T40-233v-205q0-63 45-108t108-45q69 0 129.5 27.5T427-488q14 16 18.5 36.5T450-409v329H193Zm287-444q-29-28-58.5-49.5T359-612q17-22 40-37t51-21v-66H327v-60h123v-124h60v124h123v60H510v66q28 5 51 20t40 37q-33 17-62.5 39T480-524Z"/></svg>`},Ke=`<svg class="setup-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,qe=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="13 6 19 12 13 18"></polyline></svg>`,Je={duel:`1v1`,"2v2":`2v2`,"3v3":`3v3`,ffa:`FFA`,koth:`KotH`},Ye={duel:`Standard health pools (50 HP), each player has their CP.`,"2v2":`Teams share a single health pool (50 HP for 2v2), each player has their CP.`,"3v3":`Teams share a single health pool (60 HP for 3v3), each player has their CP.`,ffa:`Standard health pools (50 HP), each player has their CP, targeting using dice (1/2 left, 3/4 across, 5/6 right). With 3 players, 3/4 is player's choice.`,koth:`Free For All variant when you may freely choose any opponent, but if you attack the highest health player, you immediately draw a bonus card.`},Xe=null,A=()=>(Xe||={gameTypeStep:document.getElementById(`setup-step-gametype`),gameTypeGrid:document.getElementById(`game-type-grid`),gameTypeHint:document.getElementById(`game-type-hint`),inviteeZone:document.getElementById(`invitee-zone`),teamsStep:document.getElementById(`setup-step-teams`),teamsGrid:document.getElementById(`teams-grid`),randomizeTeamsBtn:document.getElementById(`randomize-teams-btn`),teamSwapQuestion:document.getElementById(`team-swap-question`),teamSwapScrim:document.getElementById(`team-swap-scrim`),rollModeStep:document.getElementById(`setup-step-rollmode`),rollModeGrid:document.getElementById(`roll-mode-grid`),draftCountSection:document.getElementById(`draft-count-section`),draftCountGrid:document.getElementById(`draft-count-grid`),rollStep:document.getElementById(`setup-step-roll`),rollFinalBtn:document.getElementById(`roll-final-btn`)},Xe);function j(){let e=A();if(!e.inviteeZone)return;let t=w(`invitees`).map(e=>`
            <label class="player-card invitee-card" style="--player-color: var(--p5)">
                <input type="checkbox" checked data-invitee-id="${e.id}">
                <span class="player-card-name">${e.name}</span>
            </label>`).join(``),n=lt()?`
            <button type="button" class="player-card invitee-add-btn" data-action="add-invitee">
                <span class="invitee-add-icon" aria-hidden="true">+</span>
            </button>`:``;e.inviteeZone.innerHTML=t+n}function Ze(e=I()){let t=A();t.gameTypeStep&&t.gameTypeStep.classList.toggle(`step-locked`,e<2)}function Qe(){let e=A();if(!e.gameTypeGrid)return;let t=pt(I()),n=w(`selectedGameType`),r=[{type:`duel`,label:`1v1 Duel`,enabled:t.duel,icon:k.duel},{type:t.teamsValue,label:`Teams ${t.teamsValue}`,enabled:t.teams,icon:k.teams},{type:`ffa`,label:`Free For All`,enabled:t.ffa,icon:k.ffa},{type:`koth`,label:`King of the Hill`,enabled:t.koth,icon:k.koth}];e.gameTypeGrid.innerHTML=r.map(e=>`
            <button type="button"
                class="game-type-btn${e.type===n?` active`:``}"
                data-action="select-game-type"
                data-type="${e.type}"
                ${e.enabled?``:`disabled`}>
                <span class="game-type-icon">${e.icon}</span>
                <span class="game-type-label">${e.label}</span>
            </button>`).join(``),$e(n)}function $e(e=w(`selectedGameType`)){let t=A();if(!t.gameTypeHint)return;let n=e&&Ye[e];if(!n){t.gameTypeHint.style.display=`none`,t.gameTypeHint.innerHTML=``;return}t.gameTypeHint.style.display=`flex`,t.gameTypeHint.innerHTML=`${Ke}<span>${n}</span>`}function et(e,t,n,r){let i=!!r&&r.team!==e,a=t.map(t=>{let a=n.get(t);if(!a)return``;if(i)return`
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
        </div>`}function M(){let e=A();if(!e.teamsStep)return;if(!F(w(`selectedGameType`))){e.teamsStep.style.display=`none`,e.teamSwapScrim.style.display=`none`;return}e.teamsStep.style.display=`block`;let t=w(`teamAssignments`);if(!t){e.teamsGrid.innerHTML=``;return}let n=w(`teamSwapSource`),r=new Map(ut().map(e=>[e.id,e]));e.teamsGrid.innerHTML=et(`A`,t.teamA,r,n)+et(`B`,t.teamB,r,n),e.randomizeTeamsBtn.style.display=n?`none`:`block`,e.teamSwapQuestion.style.display=n?`block`:`none`,e.teamSwapQuestion.classList.toggle(`swap-active`,!!n),e.teamSwapScrim.style.display=n?`block`:`none`}var tt=[2,3,4,5];function nt(){let e=A();e.rollModeStep&&e.rollModeStep.classList.toggle(`step-locked`,!w(`selectedGameType`))}function N(){let e=A();if(!e.rollModeGrid)return;let t=w(`rollModeChosen`),n=w(`draftModeEnabled`),r=w(`draftCountChosen`),i=w(`draftCount`),a=!w(`selectedGameType`);e.rollModeGrid.innerHTML=`
        <button type="button" class="roll-mode-btn${t&&!n?` active`:``}" data-action="select-roll-mode" data-mode="quick" ${a?`disabled`:``}>
            <span class="roll-mode-title">Quick Roll</span>
            <span class="roll-mode-subtitle">1 hero per player</span>
        </button>
        <button type="button" class="roll-mode-btn${t&&n?` active`:``}" data-action="select-roll-mode" data-mode="draft" ${a?`disabled`:``}>
            <span class="roll-mode-title">Draft Roll</span>
            <span class="roll-mode-subtitle">Pick 1 of N options</span>
        </button>`,e.draftCountSection.style.display=t&&n?`block`:`none`,e.draftCountGrid.innerHTML=tt.map(e=>`
        <button type="button" class="draft-count-btn${r&&i===e?` active`:``}" data-action="select-draft-count" data-count="${e}">${e}</button>`).join(``)}function P(){let e=A();if(!e.rollStep||!e.rollFinalBtn)return;let t=w(`selectedGameType`),n=w(`rollModeChosen`),r=w(`draftModeEnabled`),i=w(`draftCountChosen`),a=!r||i;if(e.rollStep.classList.toggle(`step-locked`,!t||!n||!a),!t){e.rollFinalBtn.disabled=!0,e.rollFinalBtn.innerHTML=`<span>ROLL &middot; Complete the steps above</span>`;return}if(!n||!a){e.rollFinalBtn.disabled=!0,e.rollFinalBtn.innerHTML=`<span>ROLL &middot; Finish selecting your options above</span>`;return}e.rollFinalBtn.disabled=!1;let o=F(t)?k.teams:k[t],s=Je[t],c=I();e.rollFinalBtn.innerHTML=`${o}<span>ROLL &middot; ${s} &middot; ${c} PLAYER${c===1?``:`S`}</span>`}function rt(){let e=document.getElementById(`randomizer-setup`);e&&(e.style.display=`none`);let t=document.getElementById(`team-swap-scrim`);t&&(t.style.display=`none`)}function it(){let e=document.getElementById(`randomizer-setup`);e&&(e.style.display=`block`);let t=document.getElementById(`results-title`);t&&(t.style.display=`none`)}var at={draft:`ROLL &middot; DRAFT`,confirmation:`ROLL &middot; CONFIRMATION`};function ot(e){let t=document.getElementById(`results-title`);t&&(t.innerHTML=at[e]||``,t.style.display=`block`)}function st(){j(),Ze(),Qe(),M(),nt(),N(),P()}var ct=6;function F(e){return e===`2v2`||e===`3v3`}function I(){return document.querySelectorAll(`#player-toggle-zone-top input:checked, #invitee-zone input:checked`).length}function lt(){return document.querySelectorAll(`#player-toggle-zone-top input:checked`).length+w(`invitees`).length<ct}function ut(){let e=w(`players`).slice(0,4),t=w(`invitees`),n=[];return e.forEach((e,t)=>{document.getElementById(`use${t}`)?.checked&&n.push({id:e.id,name:e.name,colorVar:e.id})}),t.forEach(e=>{document.querySelector(`#invitee-zone input[data-invitee-id="${e.id}"]`)?.checked&&n.push({id:e.id,name:e.name,colorVar:`p5`})}),n}function dt(){let e=w(`players`).slice(0,4),t=w(`invitees`),n=[];e.forEach((e,t)=>{document.getElementById(`use${t}`)?.checked&&n.push({pIdx:t,name:e.name,colorVar:e.id,isInvitee:!1})});let r=0;return t.forEach(e=>{document.querySelector(`#invitee-zone input[data-invitee-id="${e.id}"]`)?.checked&&(n.push({pIdx:4+r,name:e.name,colorVar:`p5`,isInvitee:!0}),r++)}),n}function ft(){let e=ut(),t=dt(),n={};return e.forEach((e,r)=>{n[e.id]=`p${t[r].pIdx+1}`}),n}function pt(e){return{duel:e===2,teams:e===4||e===6,ffa:e>=3&&e<=6,koth:e>=3&&e<=6,teamsValue:e===6?`3v3`:`2v2`}}function mt(){if(!lt())return;let e=w(`invitees`);T(`invitees`,[...e,{id:`invitee-${Date.now()}`,name:`Invitee ${e.length+1}`}]),j(),yt()}function ht(e){T(`invitees`,w(`invitees`).filter(t=>t.id!==e).map((e,t)=>({...e,name:`Invitee ${t+1}`}))),j(),yt()}function gt(){T(`invitees`,[]),j(),yt()}function _t(){T(`invitees`,[]),T(`selectedGameType`,null),T(`teamAssignments`,null),T(`teamSwapSource`,null),T(`rollModeChosen`,!1),T(`draftCountChosen`,!1),j(),yt()}function vt(e){if(!e)return;let t=pt(I());(e===`duel`&&t.duel||e===t.teamsValue&&t.teams||e===`ffa`&&t.ffa||e===`koth`&&t.koth)&&(T(`selectedGameType`,e),T(`teamSwapSource`,null),F(e)?St():T(`teamAssignments`,null),Qe(),M(),nt(),N(),P())}function yt(){let e=I(),t=pt(e),n=w(`selectedGameType`),r=n===`duel`&&t.duel||n===t.teamsValue&&t.teams||n===`ffa`&&t.ffa||n===`koth`&&t.koth;n&&!r&&T(`selectedGameType`,null);let i=w(`selectedGameType`);T(`teamSwapSource`,null),F(i)?St():T(`teamAssignments`,null),Ze(e),Qe(),M(),nt(),N(),P()}function bt(e){let t=e===`draft`;T(`rollModeChosen`,!0),T(`draftModeEnabled`,t),localStorage.setItem(`draftModeEnabled`,t),N(),P()}function xt(e){T(`draftCount`,e),T(`draftCountChosen`,!0),localStorage.setItem(`draftCount`,e),N(),P()}function St(){let e=[...ut()].sort(()=>Math.random()-.5),t=e.length/2;T(`teamAssignments`,{teamA:e.slice(0,t).map(e=>e.id),teamB:e.slice(t).map(e=>e.id)}),T(`teamSwapSource`,null),M()}function Ct(e,t){T(`teamSwapSource`,{id:e,team:t}),M()}function wt(){T(`teamSwapSource`,null),M()}function Tt(e){let t=w(`teamSwapSource`),n=w(`teamAssignments`);if(!t||!n)return;let{teamA:r,teamB:i}=n,a=t.team===`A`?r:i,o=t.team===`A`?i:r,s=a.indexOf(t.id),c=o.indexOf(e);s===-1||c===-1||(a[s]=e,o[c]=t.id,T(`teamAssignments`,{teamA:r,teamB:i}),T(`teamSwapSource`,null),M())}var Et=null,L=()=>(Et||={sortSection:document.getElementById(`sort-section`),sortToggleBtn:document.getElementById(`sort-panel-toggle`),filterSection:document.getElementById(`filter-section`),filterToggleBtn:document.getElementById(`filter-panel-toggle`),sortFilterDrawer:document.getElementById(`sort-filter-drawer`),drawerTitle:document.getElementById(`drawer-title-text`),drawerFooter:document.getElementById(`drawer-footer-content`),drawerBody:document.getElementById(`drawer-body-content`),leftFilterDrawer:document.getElementById(`filter-drawer-left`),leftPlayersContainer:document.getElementById(`filter-options-players`),leftGroupsContainer:document.getElementById(`filter-options-groups`),leftHeroCountLabel:document.getElementById(`filter-drawer-hero-count`),leftTitleDataHistory:document.getElementById(`title-data-history`),leftTitlePlayers:document.getElementById(`title-players`),leftTitleComplexity:document.getElementById(`title-complexity`),leftTitleGroups:document.getElementById(`title-groups`),filterActiveBadge:document.getElementById(`filter-active-badge`),gamesFilterActiveBadge:document.getElementById(`games-filter-active-badge`),sortTriggerBtn:document.getElementById(`btn-trigger-sort`),sortDropdownMenu:document.getElementById(`sort-dropdown-menu`),activeFiltersContainer:document.getElementById(`active-filters-container`),heroContainer:document.getElementById(`heroContainer`),countStatsLabel:document.getElementById(`count-stats`),heroSearchInput:document.getElementById(`hero-search`),dbShowOwnedCheckbox:document.getElementById(`db-show-owned`),dbShowNotOwnedCheckbox:document.getElementById(`db-show-not-owned`)},Et);function Dt(){let e=L();e.sortFilterDrawer&&(e.drawerTitle&&(e.drawerTitle.innerText=`Filter History`),e.drawerFooter&&(e.drawerFooter.style.display=`flex`),Ut(),e.sortFilterDrawer.classList.add(`open`),document.body.style.overflow=`hidden`)}function Ot(){let e=w(`stagedOwnershipFilter`);Object.entries({owned:`pill-show-owned`,unowned:`pill-show-not-owned`,all:`pill-show-all`}).forEach(([t,n])=>{document.getElementById(n)?.classList.toggle(`active`,t===e)}),Ft()}function kt(){Mt(),Ot(),Bt(),Vt();let e=L();e.leftFilterDrawer&&(e.leftFilterDrawer.classList.add(`open`),document.body.style.overflow=`hidden`)}function At(e=null,t=!1){if(e&&e.target!==e.currentTarget&&!t)return;let n=L();n.leftFilterDrawer&&(n.leftFilterDrawer.classList.remove(`open`),document.body.style.overflow=`auto`)}function jt(e=null,t=!1){if(e&&e.target!==e.currentTarget&&!t)return;let n=L();n.sortFilterDrawer&&(n.sortFilterDrawer.classList.remove(`open`),document.body.style.overflow=`auto`)}function Mt(){let e=L(),t=w(`players`),n=w(`groups`),r=w(`stagedFilterPlayers`),i=w(`stagedFilterGroups`),a=w(`stagedFilterDataHistories`),o=w(`stagedFilterComplexities`);if(e.leftPlayersContainer&&t){let n=t.filter(e=>e.name&&!e.name.toLowerCase().includes(`invitee`)).slice().sort((e,t)=>e.name.localeCompare(t.name));e.leftPlayersContainer.innerHTML=n.map(e=>{let t=r.has(e.id)?`checked`:``;return`
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${e.id}" data-type="player" ${t} />
                    ${e.name}
                </label>
            `}).join(``)}if(e.leftGroupsContainer&&n){let t=n.slice().sort((e,t)=>(e.order_index??0)-(t.order_index??0));e.leftGroupsContainer.innerHTML=t.map(e=>{let t=i.has(e.id)?`checked`:``;return`
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${e.id}" data-type="group" ${t} />
                    ${e.name}
                </label>
            `}).join(``)}document.querySelectorAll(`#filter-drawer-left input[data-type="data-history"]`).forEach(e=>{e.checked=a.has(e.value)}),document.querySelectorAll(`#filter-drawer-left input[data-type="complexity"]`).forEach(e=>{e.checked=o.has(Number(e.value))})}function Nt(){let e=L();if(!e.filterActiveBadge)return;let t=w(`activeFilterDataHistories`),n=w(`activeFilterPlayers`),r=w(`activeFilterComplexities`),i=w(`activeFilterGroups`),a=w(`activeOwnershipFilter`),o=0;t&&(o+=t.size),n&&(o+=n.size),r&&(o+=r.size),i&&(o+=i.size),a&&a!==`all`&&o++,o>0?(e.filterActiveBadge.innerText=o,e.filterActiveBadge.style.display=`inline-block`):e.filterActiveBadge.style.display=`none`}function Pt(){let e=L();if(!e.gamesFilterActiveBadge)return;let t=w(`selectedGamePlayerIndex`),n=w(`gamesWinnerOnly`),r=w(`gamesUseHistorical`),i=0;t!==null&&i++,n&&i++,r||i++,i>0?(e.gamesFilterActiveBadge.innerText=i,e.gamesFilterActiveBadge.style.display=`inline-block`):e.gamesFilterActiveBadge.style.display=`none`}function Ft(){document.querySelectorAll(`.ownership-segmented-control, .segmented-control`).forEach(e=>{let t=e.querySelector(`.segmented-pill.active`),n=e.querySelector(`.segmented-highlight`);n||(n=document.createElement(`div`),n.className=`segmented-highlight`,e.insertBefore(n,e.firstChild)),t&&(n.style.width=`${t.offsetWidth}px`,n.style.transform=`translateX(${t.offsetLeft}px)`,n.style.height=`${t.offsetHeight}px`)})}function It(){let e=L();if(!e.sortTriggerBtn)return;let t=w(`currentSort`),n=w(`sortAsc`),r=w(`currentSortPlayerIndex`),i=w(`NAMES`),a=`Hero (A-Z)`;if(t===`name`)a=n?`Hero (A-Z)`:`Hero (Z-A)`;else if(t===`complexity`)a=n?`Complexity (1-6)`:`Complexity (6-1)`;else if(t.startsWith(`w`)){let e=i[r]||`Player ${r+1}`;a=n?`${e} % (Low to High)`:`${e} % (High to Low)`}else if(t.startsWith(`d`)){let e=i[r]||`Player ${r+1}`;a=n?`${e} Played (Oldest)`:`${e} Played (Newest)`}else t===`group`&&(a=n?`Group (A-Z)`:`Group (Z-A)`);e.sortTriggerBtn.innerHTML=`<span class="action-icon">⇅</span> <strong style="font-weight: 700;">SORT:</strong> <span style="font-weight: 400; text-transform: none; margin-left: 2px;">${a}</span>`}function Lt(){let e=L();if(!e.sortDropdownMenu)return;let t=w(`currentSort`),n=w(`sortAsc`),r=w(`activePlayerIndices`),i=w(`NAMES`),a=`
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
            `})),e.sortDropdownMenu.innerHTML=a}function Rt(e){let t=L();t.sortDropdownMenu&&(e.stopPropagation(),t.sortDropdownMenu.classList.toggle(`show`)?(t.sortTriggerBtn&&t.sortTriggerBtn.classList.add(`active`),Lt()):t.sortTriggerBtn&&t.sortTriggerBtn.classList.remove(`active`))}function zt(){let e=L();e.sortDropdownMenu&&e.sortDropdownMenu.classList.remove(`show`),e.sortTriggerBtn&&e.sortTriggerBtn.classList.remove(`active`)}function Bt(){let e=L();if(!e.leftHeroCountLabel)return;let t=Wn();e.leftHeroCountLabel.innerText=`${t} heroes match`}function Vt(){let e=L(),t=w(`stagedFilterDataHistories`),n=w(`stagedFilterPlayers`),r=w(`stagedFilterComplexities`),i=w(`stagedFilterGroups`);if(e.leftTitleDataHistory){let n=t.size;e.leftTitleDataHistory.innerHTML=`Data Type ${n>0?`<span class="filter-count-bubble">${n}</span>`:``}`}if(e.leftTitlePlayers){let t=n.size;e.leftTitlePlayers.innerHTML=`Players ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}if(e.leftTitleComplexity){let t=r.size;e.leftTitleComplexity.innerHTML=`Complexity ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}if(e.leftTitleGroups){let t=i.size;e.leftTitleGroups.innerHTML=`Group / Season ${t>0?`<span class="filter-count-bubble">${t}</span>`:``}`}}function Ht(e){let t=w(`players`),n=w(`games`);w(`NAMES`);let r=w(`stagedGamesUseHistorical`),i=w(`stagedSelectedGamePlayerIndex`),a=w(`stagedGamesWinnerOnly`),o=r,s=t.map(()=>({played:0,won:0})),c=0,l=0;n&&n.forEach(e=>{!o&&e.is_historical||e.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1;t>=0&&t<4?(s[t].played++,e.is_winner&&s[t].won++):t>=4&&(c++,e.is_winner&&l++)})});let u=``;for(let e=0;e<4;e++){let n=t[e];n&&(u+=`
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
    `}function Ut(){let e=L();if(!e.drawerBody)return;let t=w(`currentDrawerMode`),n=w(`stagedSort`);w(`stagedSortPlayerIndex`);let r=w(`stagedPlayerIndices`),i=w(`stagedUseHistorical`),a=w(`NAMES`);w(`activePlayerIndices`);let o=w(`stagedBanSearchQuery`);if(e.drawerBody.style.overflowY=`auto`,t===`sort-filter`){e.drawerBody.innerHTML=`
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
        `;let t=`name`;n===`group`?t=`group`:n.startsWith(`w`)?t=`probability`:n.startsWith(`d`)&&(t=`lastPlayed`);let r=document.getElementById(`drawer-sort-type-select`);r&&(r.value=t),Wt(),Gt(),Kt(),Yt()}else if(t===`columns`){let t=a.slice(0,4).map((e,t)=>`
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
        `}else t===`history-filter`?Ht(e.drawerBody):t===`roll-settings`&&(e.drawerBody.style.overflowY=`hidden`,e.drawerBody.innerHTML=`
            <div id="roll-settings-ban-tab" style="display: flex; flex-direction: column; flex: 1; min-height: 0; font-size: 1rem;">
                <div class="panel-row-new" style="display: flex; flex-direction: column; flex: 1; min-height: 0; margin-top: 8px;">
                    <input type="text" id="ban-search-input" class="ban-search-input" placeholder="Search heroes to ban..." data-action="ban-search-input" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #fff; margin-bottom: 15px; flex-shrink: 0;" value="${o||``}">
                    <div id="drawer-ban-list-container" class="ban-list-container" style="flex: 1; min-height: 0; overflow-y: auto; padding-right: 4px; max-height: 350px;">
                    </div>
                </div>
            </div>
        `,pn())}function Wt(){let e=document.getElementById(`drawer-sort-direction-text`),t=document.getElementById(`drawer-sort-direction-arrow`),n=w(`stagedSortAsc`);e&&t&&(e.innerText=n?`Ascending`:`Descending`,t.innerText=n?`▲`:`▼`)}function Gt(){let e=document.getElementById(`drawer-player-sort-sub-section`),t=document.getElementById(`drawer-player-sort-pills`);if(!e||!t)return;let n=w(`stagedSort`),r=w(`stagedSortPlayerIndex`),i=w(`activePlayerIndices`),a=w(`NAMES`),o=n.startsWith(`w`)||n.startsWith(`d`);e.style.display=o?`block`:`none`,o&&(t.innerHTML=a.slice(0,4).map((e,t)=>`
                <button type="button" class="pill-toggle ${r===t?`active p${t+1}-color`:``}" style="${i.includes(t)?``:`opacity: 0.5;`}" data-action="drawer-sort-player-change" data-player-idx="${t}">
                    ${e}
                </button>
            `).join(``))}function Kt(){let e=document.getElementById(`drawer-complexity-filter-bar`);if(!e)return;let t=document.getElementById(`hero-search`),n=t?t.value.toLowerCase():``,r=document.getElementById(`db-show-owned`)?.checked??!0,i=document.getElementById(`db-show-not-owned`)?.checked??!1,a=w(`stagedGroups`),o=w(`stagedLevels`),s=w(`characters`),c=(e,t)=>t?e.name.toLowerCase().includes(t)||e.group&&e.group.toLowerCase().includes(t):!0,l=``;for(let e=1;e<=6;e++){let t=s.filter(t=>{if(Number(t.complexity)!==e)return!1;let o=a.has(t.group_id),s=X(t)&&r||!X(t)&&i;return c(t,n)&&o&&s}).length,u=t===0,d=o.has(e)&&!u?`active-die`:``;l+=`
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
        </div>`,e.innerHTML=l}function qt(e){let t=(e||``).toLowerCase();return t.includes(`season 1`)||t.includes(`s1`)?`group-s1`:t.includes(`season 2`)||t.includes(`s2`)?`group-s2`:t.includes(`marvel`)?`group-marvel`:t.includes(`x-men`)||t.includes(`xmen`)?`group-xmen`:t.includes(`adventures`)?`group-adventures`:t.includes(`solo`)?`group-solo`:t.includes(`outcast`)?`group-outcast`:t.includes(`santa`)||t.includes(`krampus`)||t.includes(`svk`)?`group-svk`:t.includes(`vanguard`)?`group-vanguard`:`group-default`}function Jt(e){if(!e)return`?`;let t=e.trim().toLowerCase();if(t.includes(`season 1`))return`S1`;if(t.includes(`season 2`))return`S2`;if(t.includes(`marvel`))return`MRVL`;if(t.includes(`x-men`)||t.includes(`xmen`))return`XMEN`;if(t.includes(`adventure`))return`ADV`;if(t.includes(`santa`)&&t.includes(`krampus`))return`SvK`;if(t.includes(`solo`))return`SOLO`;if(t.includes(`outcast`))return`OUTC`;if(t.includes(`vanguard`))return`VNGD`;let n=e.split(/\s+/);return n.length>1?n.map(e=>e[0]).join(``).toUpperCase().substring(0,3):e.substring(0,3).toUpperCase()}function Yt(){let e=document.getElementById(`drawer-group-filter-bar`);if(!e)return;let t=document.getElementById(`hero-search`),n=t?t.value.toLowerCase():``,r=document.getElementById(`db-show-owned`)?.checked??!0,i=document.getElementById(`db-show-not-owned`)?.checked??!1,a=w(`stagedLevels`),o=w(`stagedGroups`),s=w(`groups`),c=w(`characters`),l=(e,t)=>t?e.name.toLowerCase().includes(t)||e.group&&e.group.toLowerCase().includes(t):!0,u=s.map(e=>{let t=Jt(e.name),s=o.has(e.id),u=qt(e.name),d=c.filter(t=>{if(t.group_id!==e.id)return!1;let o=a.has(Number(t.complexity)),s=X(t)&&r||!X(t)&&i;return l(t,n)&&o&&s}).length,f=d===0;return`
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
    `}function Xt(){let e=L();if(!e.activeFiltersContainer)return;let t=e.heroSearchInput,n=t?t.value.trim():``,r=w(`activeOwnershipFilter`),i=w(`activeFilterDataHistories`),a=w(`activeFilterPlayers`),o=w(`activeFilterComplexities`),s=w(`activeFilterGroups`),c=w(`players`),l=w(`groups`),u=``;n&&(u+=`
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
            `}),e.activeFiltersContainer.innerHTML=u,e.activeFiltersContainer.classList.toggle(`has-chips`,!!u.trim())}function Zt(){let e=L();if(!e.heroContainer)return;Li();let t=e.heroSearchInput?.value.toLowerCase()||``,n=e.dbShowOwnedCheckbox?.checked??!0,r=e.dbShowNotOwnedCheckbox?.checked??!1,i=w(`NAMES`),a=w(`characters`),o=w(`activeFilterComplexities`),s=w(`activeFilterGroups`),c=w(`activeFilterDataHistories`),l=w(`activeFilterPlayers`),u=w(`games`),d=w(`activePlayerIndices`),f=w(`currentSort`),p=w(`sortAsc`);w(`currentSortPlayerIndex`);let m=(e,t)=>{if(!t)return!0;let n=t.trim().toLowerCase();return(e.name||``).toLowerCase().includes(n)||(e.group||``).toLowerCase().includes(n)},h=[];t&&i.forEach((e,n)=>{e&&e.toLowerCase().includes(t)&&h.push(n)});let g=[,,,,].fill(0);a.filter(X).forEach(e=>{for(let t=0;t<4;t++)g[t]+=Q(e,t)});let _=a.map((e,t)=>({...e,originalIndex:t})).filter(e=>{let i=!0;o.size>0&&(i=o.has(Number(e.complexity)));let a=!0;s.size>0&&(a=s.has(e.group_id));let d=!0,f=c.has(`Normal only`),p=c.has(`Historical only`);f&&!p?d=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(e=>!e.is_historical):p&&!f&&(d=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(e=>e.is_historical));let h=!0;l.size>0&&(h=u.filter(t=>t.game_players.some(t=>t.hero_id===e.id)).some(t=>t.game_players.some(t=>t.hero_id===e.id&&l.has(t.player_id))));let g=X(e)&&n||!X(e)&&r;return m(e,t)&&i&&a&&d&&h&&g});e.countStatsLabel&&(e.countStatsLabel.innerText=`Showing ${_.length} of ${a.length} heroes`),_.sort((e,t)=>{let n,r;if(f.startsWith(`w`)){let i=parseInt(f[1]);n=Q(e,i),r=Q(t,i)}else if(f.startsWith(`d`)){let i=parseInt(f[1]);n=e.lastPlayed&&e.lastPlayed[i]||``,r=t.lastPlayed&&t.lastPlayed[i]||``,(n===`Never`||n===`Unknown`)&&(n=``),(r===`Never`||r===`Unknown`)&&(r=``)}else if(f===`group`){if(n=(e.group||``).toLowerCase(),r=(t.group||``).toLowerCase(),n===r){let n=(e.name||``).toLowerCase(),r=(t.name||``).toLowerCase();return p?n.localeCompare(r):r.localeCompare(n)}}else if(f===`complexity`){if(n=Number(e.complexity)||0,r=Number(t.complexity)||0,n===r){let n=(e.name||``).toLowerCase(),r=(t.name||``).toLowerCase();return n.localeCompare(r)}}else n=(e[f]||``).toLowerCase(),r=(t[f]||``).toLowerCase();if(n===r)return 0;let i=n<r?-1:1;return p?i:-i}),e.heroContainer.innerHTML=_.map(e=>{let t=d;l.size>0?t=Array.from(l).map(e=>parseInt(e.substring(1))-1).filter(e=>e>=0&&e<4):h.length>0&&(t=d.filter(e=>h.includes(e)));let n=t.map(t=>{let n=Q(e,t),r=X(e)&&g[t]>0?(n/g[t]*100).toFixed(2):`0.00`,i=e.playCount&&e.playCount[t]||0,a=e.lastPlayed&&e.lastPlayed[t]||`Never`,o=e.winCount&&e.winCount[t]||0,s=i>0?(o/i*100).toFixed(1):`0.0`;return{p:t,percentage:parseFloat(r),percentageStr:r,playCount:i,lastPlayed:a,winCount:o,winRate:s}});n.sort((e,t)=>{let n=(i[e.p]||``).toLowerCase(),r=(i[t.p]||``).toLowerCase();return n.localeCompare(r)});let r=n.map(e=>{let t=qi(e.lastPlayed);return`
                <div class="collapsed-player-row-simple">
                    <span class="collapsed-player-name" style="color: var(--p${e.p+1});">${i[e.p]}</span>
                    <span class="collapsed-player-prob">${e.percentageStr}%</span>
                    <span class="collapsed-player-plays">🎲 ${e.playCount}</span>
                    <span class="collapsed-player-wins">🏆 ${e.winCount} <span class="collapsed-player-rate">(${e.winRate}%)</span></span>
                    <span class="collapsed-player-recency" title="Last played: ${e.lastPlayed}">${t}</span>
                </div>`}).join(``),a=n.map(e=>{let t=Ki(e.lastPlayed),n=qi(e.lastPlayed),r=t?`<span class="expanded-player-relative">${t} ${n}</span>`:``;return`
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
            </div>`}).join(``)}var R=()=>({resultsDiv:document.getElementById(`results`),actionButtons:document.getElementById(`action-buttons`),heroSelectModal:document.getElementById(`hero-select-modal`),heroSelectModalTitle:document.getElementById(`hero-select-modal-title`),heroSelectSearch:document.getElementById(`hero-select-search`),modalSortName:document.getElementById(`modal-sort-name`),modalSortWeight:document.getElementById(`modal-sort-weight`),heroSelectOptionsContainer:document.getElementById(`hero-select-options-container`),confirmBtn:document.getElementById(`confirmBtn`),errorMsg:document.getElementById(`error-msg`),rollSettingsBadge:document.getElementById(`roll-settings-badge`),rollSettingsBtn:document.getElementById(`rollSettingsBtn`),drawerBanListContainer:document.getElementById(`drawer-ban-list-container`)});function Qt(e){let t=Number(e)||1;return`<img src="images/dice/d${t}.png" class="complexity-die-solo" alt="Complexity ${t}">`}function $t(e){let t=R();if(!t.resultsDiv)return;let n=q(e),r=n?.name||`Player ${e+1}`,i=n?.colorVar||`p${e+1}`,a=e<4?`
                    <div class="hero-stats-row scramble-hidden opacity-0" id="stats-row-${e}">
                        <span>Plays: --</span>
                        <span class="stats-divider">|</span>
                        <span>Last: --</span>
                        <span class="stats-divider">|</span>
                        <span id="hero-prob-${e}">Prob: --</span>
                    </div>`:`<div class="hero-stats-row" id="stats-row-${e}"></div>`;t.resultsDiv.innerHTML+=`
        <div class="hero-card player-row randomizing" id="player-row-${e}" style="--player-color: var(--${i}); border-color: var(--${i});">
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
                        <button class="edit-icon-btn scramble-hidden opacity-0" id="edit-btn-${e}" type="button" data-action="open-hero-select" data-player-idx="${e}" aria-label="Select hero">CHANGE</button>
                    </div>
                </div>

                <div class="hero-select-container" id="select-container-${e}">
                    <input type="hidden" class="char-select" data-player="${e}" id="select-${e}">
                </div>
            </div>
        </div>
    `}function en(e){let t=R();if(!t.heroSelectModal)return;t.heroSelectModal.style.display=`flex`,document.body.style.overflow=`hidden`;let n=q(e);t.heroSelectModalTitle&&n?.name&&(t.heroSelectModalTitle.innerText=`Select Hero for ${n.name}`),t.heroSelectSearch&&(t.heroSelectSearch.value=``),T(`modalSortMode`,`name`),nn(`name`),rn(),setTimeout(Ft,50)}function tn(){let e=R();e.heroSelectModal&&(e.heroSelectModal.style.display=`none`),document.body.style.overflow=``}function nn(e){let t=R();t.modalSortName&&t.modalSortName.classList.toggle(`active`,e===`name`),t.modalSortWeight&&t.modalSortWeight.classList.toggle(`active`,e===`weight`),Ft()}function rn(){let e=R();if(!e.heroSelectOptionsContainer)return;let t=w(`activeSelectPlayerIdx`),n=w(`modalSortMode`),r=e.heroSelectSearch,i=r?r.value.toLowerCase().trim():``,a=w(`characters`),o=w(`bannedHeroIds`);if(t===null)return;let s=a.filter(e=>X(e)&&!o.has(e.id));i&&(s=s.filter(e=>e.name.toLowerCase().includes(i)||e.group&&e.group.toLowerCase().includes(i))),n===`name`?s.sort((e,t)=>e.name.localeCompare(t.name)):n===`weight`&&s.sort((e,n)=>{let r=Q(e,t),i=Q(n,t);return r===i?e.name.localeCompare(n.name):i-r});let c=document.getElementById(`select-${t}`)?.value;if(s.length===0){e.heroSelectOptionsContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic; grid-column: 1 / -1; text-align: center; padding: 20px;">No available heroes found.</p>`;return}e.heroSelectOptionsContainer.innerHTML=s.map(e=>{let n=c===e.name,r=Ui(e,t);return`
            <div class="hero-select-card ${n?`selected`:``}" data-action="select-hero-option" data-hero-name="${e.name.replace(/"/g,`&quot;`)}" data-hero-slug="${e.slug}" data-hero-id="${e.id}">
                <img src="${J(e.slug)}" class="hero-select-card-img" alt="${e.name}">
                <div class="hero-select-card-info">
                    <div class="hero-select-card-name">${e.name}</div>
                    <div class="hero-select-card-prob">${r}</div>
                </div>
            </div>`}).join(``)}function an(e,t){let n=document.getElementById(`player-row-${e}`),r=document.getElementById(`select-${e}`),i=document.getElementById(`bg-img-${e}`),a=document.getElementById(`hero-name-title-${e}`),o=document.getElementById(`hero-group-${e}`),s=document.getElementById(`stats-row-${e}`),c=document.getElementById(`complexity-dice-${e}`);if(r&&(r.value=t.name),i&&(i.src=J(t.slug),i.style.opacity=`0.25`,i.classList.remove(`scramble-img`)),a&&(a.innerText=t.name,a.href=Y(t.slug),a.classList.remove(`scramble-text`),a.classList.add(`resolved`)),o&&(o.innerText=t.group||`Unknown`),c&&(c.innerHTML=Qt(t.complexity)),s)if(e<4){let n=`Prob: <b>${Ui(t,e)}</b>`;s.innerHTML=`
                <span>Plays: <b>${t.playCount[e]||0}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                <span class="stats-divider">|</span>
                <span>${n}</span>
            `}else s.innerHTML=``;if(n){n.classList.remove(`randomizing`),n.classList.add(`revealed`),o&&(o.classList.remove(`scramble-hidden`,`opacity-0`),o.classList.add(`fade-in-resolve`)),s&&(s.classList.remove(`scramble-hidden`,`opacity-0`),s.classList.add(`fade-in-resolve`)),c&&(c.classList.remove(`scramble-hidden`,`opacity-0`),c.classList.add(`fade-in-resolve`));let t=document.getElementById(`edit-btn-${e}`);t&&(t.classList.remove(`scramble-hidden`,`opacity-0`),t.classList.add(`fade-in-resolve`))}}function on(e,t){let n=R(),r=document.getElementById(`player-row-${e}`);if(!r){if(!n.resultsDiv)return;r=document.createElement(`div`),r.id=`player-row-${e}`,n.resultsDiv.appendChild(r)}let i=q(e),a=i?.name||`Player ${e+1}`,o=i?.colorVar||`p${e+1}`;r.className=`hero-card player-row revealed`,r.style.cssText=`--player-color: var(--${o}); border-color: var(--${o});`,r.innerHTML=`
        <img src="${J(t.slug)}" class="char-bg-img" id="bg-img-${e}" alt="${t.name}" style="opacity: 0.25;">
        <div class="player-row-content">
            <div class="hero-info-container" id="info-container-${e}">
                <div class="hero-header-row">
                    <div class="hero-header-left">
                        <span class="player-name-caps" style="color: var(--player-color);">${a.toUpperCase()}</span>
                        <span class="hero-name-divider">:</span>
                        <a href="${Y(t.slug)}" target="_blank" class="hero-name hero-name-link resolved" id="hero-name-title-${e}">${t.name}</a>
                    </div>
                    <div class="complexity-dice-bar player-row-dice-bar" id="complexity-dice-${e}">${Qt(t.complexity)}</div>
                </div>
                <span class="expanded-group" id="hero-group-${e}">${t.group||`Unknown`}</span>
                <div class="hero-footer-row">
                    <div class="hero-stats-row" id="stats-row-${e}"></div>
                    <button class="edit-icon-btn" id="edit-btn-${e}" type="button" data-action="open-hero-select" data-player-idx="${e}" aria-label="Select hero">CHANGE</button>
                </div>
            </div>
            <div class="hero-select-container" id="select-container-${e}">
                <input type="hidden" class="char-select" data-player="${e}" id="select-${e}" value="${t.name}">
            </div>
        </div>
    `;let s=document.getElementById(`stats-row-${e}`);if(s)if(e<4){let n=`Prob: <b>${Ui(t,e)}</b>`;s.innerHTML=`
                <span>Plays: <b>${t.playCount[e]||0}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                <span class="stats-divider">|</span>
                <span>${n}</span>
            `}else s.innerHTML=``}function sn(e,t){let n=R();if(!n.resultsDiv)return;let r=e[t],i=q(r)?.name||`Player ${r+1}`,a=e.map((e,n)=>{let r=q(e),i=r?.name||`Player ${e+1}`,a=r?.colorVar||`p${e+1}`,o=n===t;return`
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
    `}function cn(e,t){let n=document.getElementById(`draft-card-list`);if(!n)return;let r=``;for(let n=0;n<t;n++)r+=`
            <div class="hero-card draft-card" id="draft-card-${e}-${n}">
                <img src="" class="char-bg-img scramble-img" id="draft-card-img-${e}-${n}" style="opacity: 0.15;">
                <div class="draft-card-content">
                    <div class="draft-card-header">
                        <span class="draft-hero-name scramble-text" id="draft-card-name-${e}-${n}">ROLLING...</span>
                    </div>
                    <span class="draft-card-group" id="draft-card-group-${e}-${n}">Group</span>
                </div>
            </div>`;n.innerHTML=r}function ln(e,t){let n=document.getElementById(`draft-card-list`);n&&(n.innerHTML=t.map((t,n)=>{let r=e<4?`
                <div class="hero-stats-row">
                    <span>Plays: <b>${t.playCount[e]||0}</b></span>
                    <span class="stats-divider">|</span>
                    <span>Last: <b>${t.lastPlayed[e]||`Never`}</b></span>
                    <span class="stats-divider">|</span>
                    <span>Prob: <b>${Ui(t,e)}</b></span>
                </div>`:`<span></span>`;return`
            <div class="hero-card draft-card" id="draft-card-${e}-${n}" data-action="select-draft-candidate" data-player-idx="${e}" data-hero-id="${t.id}">
                <img src="${J(t.slug)}" alt="${t.name}" class="char-bg-img" style="opacity: 0.2;">
                <div class="draft-card-content">
                    <div class="draft-card-header">
                        <span class="hero-name draft-hero-name">${t.name}</span>
                        <div class="complexity-dice-bar player-row-dice-bar">${Qt(t.complexity)}</div>
                    </div>
                    <span class="draft-card-group">${t.group||`Unknown`}</span>
                    <div class="hero-footer-row">
                        ${r}
                        <span class="draft-selected-badge">SELECTED</span>
                    </div>
                </div>
            </div>`}).join(``))}function un(e,t){document.querySelectorAll(`.draft-card[data-player-idx="${e}"]`).forEach(e=>{e.classList.toggle(`selected`,e.dataset.heroId===String(t))})}function dn(e,t){let n=document.getElementById(`draft-confirm-btn`);if(n)if(!t)n.disabled=!0,n.innerText=`SELECT A HERO`;else{let r=q(e)?.name||`Player ${e+1}`;n.disabled=!1,n.innerHTML=`${Z(r.toUpperCase())} picks ${Z(t.name.toUpperCase())} &rarr;`}}function fn(){let e=R();if(!e.rollSettingsBadge||!e.rollSettingsBtn)return;let t=w(`draftModeEnabled`),n=w(`bannedHeroIds`),r=0;t&&r++,n&&n.size>0&&(r+=n.size),r>0?(e.rollSettingsBadge.innerText=r,e.rollSettingsBadge.style.display=`inline-block`,e.rollSettingsBtn.classList.add(`has-settings`)):(e.rollSettingsBadge.style.display=`none`,e.rollSettingsBtn.classList.remove(`has-settings`))}function pn(){let e=R();if(!e.drawerBanListContainer)return;let t=w(`characters`),n=w(`stagedBannedHeroIds`),r=w(`stagedBanSearchQuery`)||``,i=r.toLowerCase().trim(),a=t;i&&(a=t.filter(e=>e.name.toLowerCase().includes(i)||e.group&&e.group.toLowerCase().includes(i)));let o=[...a].sort((e,t)=>e.name.localeCompare(t.name));if(o.length===0){e.drawerBanListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic; text-align: center; padding: 20px;">No heroes found matching "${r}"</p>`;return}e.drawerBanListContainer.innerHTML=o.map(e=>{let t=n.has(e.id);return`
            <label class="ban-list-item ${t?`banned`:``}">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" ${t?`checked`:``} data-action="toggle-staged-ban" data-hero-id="${e.id}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--danger);">
                    <span>${e.name}</span>
                </div>
                <span class="ban-item-group">${e.group||`Unknown`}</span>
            </label>
        `}).join(``)}var mn=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;function hn(){let e=w(`characters`),t=w(`bannedHeroIds`),n=dt();if(console.log(`[randomizer] pickCharacters participants:`,n),console.log(`[randomizer] draftModeEnabled:`,w(`draftModeEnabled`)),n.length===0)return alert(`Select players!`);T(`activeRollParticipants`,n);let r=n.map(e=>e.pIdx),i=[...r].sort(()=>Math.random()-.5),a=document.getElementById(`results`);a&&(a.innerHTML=``);let o=e.filter(e=>X(e)&&!t.has(e.id)).map(e=>structuredClone(e));if(console.log(`[randomizer] Owned/non-banned heroes pool count:`,o.length),o.length<r.length)return alert(`Not enough available (owned & non-banned) heroes (${o.length}) in your collection for ${r.length} players!`);if(rt(),w(`draftModeEnabled`)){let e=document.getElementById(`action-buttons`);e&&(e.style.display=`none`),T(`activeDraftOrder`,i),T(`activeDraftStep`,0),T(`selectedDraftHeroes`,{}),T(`activeDraftCandidates`,{}),Zr(`roll`),ot(`draft`),a&&a.scrollIntoView({behavior:`smooth`,block:`start`}),An();return}let s={};i.forEach(e=>{let t=null;if(e>=4){let e=Math.floor(Math.random()*o.length);t=o[e],o.splice(e,1)}else{let n=o.filter(t=>t.weights[e]>0);if(n.length===0){if(o.length>0){let e=Math.floor(Math.random()*o.length);t=o[e],o.splice(e,1)}}else{let r=n.reduce((t,n)=>t+Q(n,e),0),i=Math.random()*r;for(let r of n){let n=Q(r,e);if(i<n){t=r,o.splice(o.findIndex(e=>e.name===r.name),1);break}i-=n}}}s[e]=t});let c=document.getElementById(`action-buttons`);c&&(c.style.display=`none`),T(`isRollActive`,!1);let l=[...r].sort((e,t)=>e-t);l.forEach(e=>{$t(e)}),Zr(`roll`),ot(`confirmation`),a&&a.scrollIntoView({behavior:`smooth`,block:`start`});let u=e.filter(e=>X(e)&&!t.has(e.id));l.forEach(e=>{xn(e,u)});let d=0;function f(){if(d>=i.length){Cn(),Ri()?c&&(c.style.display=`flex`):(it(),gt()),T(`isRollActive`,!0);return}let e=i[d],t=s[e],n=500+Math.random()*500;setTimeout(()=>{Sn(e,t),d++,setTimeout(f,400)},n)}f()}function z(){Cn()}function gn(e){T(`activeSelectPlayerIdx`,e),en(e)}function _n(){tn(),T(`activeSelectPlayerIdx`,null)}function vn(e){T(`modalSortMode`,e),nn(e),yn()}function yn(){rn()}function bn(e){let t=w(`activeSelectPlayerIdx`);if(t===null)return;let n=w(`characters`).find(t=>t.name===e);n&&(w(`draftModeEnabled`)&&(w(`selectedDraftHeroes`)[t]=n),an(t,n),Cn(),_n())}function xn(e,t){if(t.length===0)return;let n=document.getElementById(`bg-img-${e}`),r=document.getElementById(`hero-name-title-${e}`);ge(`scrambleIntervals`,e,setInterval(()=>{let e=t[Math.floor(Math.random()*t.length)];if(n&&(n.src=J(e.slug)),r){let e=``;for(let t=0;t<8;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*`[Math.floor(Math.random()*32)];r.innerText=e}},70))}function Sn(e,t){let n=w(`scrambleIntervals`);n[e]&&(clearInterval(n[e]),ge(`scrambleIntervals`,e,void 0)),t&&an(e,t)}function Cn(){let e=document.querySelectorAll(`.char-select`),t=Array.from(e).map(e=>e.value),n=t.reduce((e,t)=>(e[t]=(e[t]||0)+1,e),{}),r=Object.values(n).some(e=>e>1),i=w(`characters`),a=t.filter(e=>{let t=i.find(t=>t.name===e);return t&&!X(t)}),o=a.length>0,s=document.getElementById(`confirmBtn`),c=document.getElementById(`error-msg`);!s||!c||(s.classList.remove(`disabled`,`warning`),s.disabled=!1,s.innerHTML=`${mn} LOCK IN SESSION`,c.style.display=`none`,r?(s.classList.add(`disabled`),s.disabled=!0,c.style.display=`block`,c.innerText=`⚠ Duplicate hero selected! Each player must have a unique character.`):o&&(s.classList.add(`warning`),s.innerHTML=`⚠️ LOCK IN SESSION`,c.style.display=`block`,c.innerText=`⚠️ You have selected unowned heroes: ${a.join(`, `)}.`),e.forEach(e=>{let t=e.closest(`.player-row`);t&&t.classList.toggle(`error`,n[e.value]>1)}))}async function wn(){let e=document.getElementById(`confirmBtn`),t=e?e.innerHTML:`Lock In`;e&&(e.disabled=!0,e.innerText=`Saving...`);let n=Array.from(document.querySelectorAll(`.char-select`)).map(e=>e.value),r=w(`characters`),i=n.filter(e=>{let t=r.find(t=>t.name===e);return t&&!X(t)});if(i.length>0&&!await D(`Unowned Heroes Selected`,`You have selected unowned heroes: ${i.join(`, `)}. Do you want to proceed?`)){e&&(e.disabled=!1,e.innerHTML=t);return}let a=document.querySelectorAll(`.char-select`),o=new Map(Array.from(a).map(e=>[parseInt(e.dataset.player),e.value])),s=w(`selectedGameType`),{data:c,error:l}=await C(w(`currentUser`).id,s);if(l)return e&&(e.disabled=!1,e.innerHTML=t),alert(`Error creating game: `+l.message);let u={},d=w(`teamAssignments`);if(F(s)&&d){let n=w(`currentUser`).id,{data:r,error:i}=await ae([{game_id:c.id,team_label:`A`,last_updated_by:n},{game_id:c.id,team_label:`B`,last_updated_by:n}]);if(i)return e&&(e.disabled=!1,e.innerHTML=t),alert(`Error creating teams: `+i.message);let a=ft(),o=Object.fromEntries(r.map(e=>[e.team_label,e.id]));d.teamA.forEach(e=>{u[a[e]||e]=o.A}),d.teamB.forEach(e=>{u[a[e]||e]=o.B})}let{gameParticipants:f,statsUpdates:p}=Hi(r,o,u,c.id,w(`currentUser`).id),{error:m}=await oe(f);if(m)return e&&(e.disabled=!1,e.innerHTML=t),alert(`Error logging game participants: `+m.message);let{error:h}=await se(p);if(h)return e&&(e.disabled=!1,e.innerHTML=t),alert(`Error saving results: `+h.message);await $();let g=document.getElementById(`action-buttons`);g&&(g.style.display=`none`),it(),gt();let _=document.getElementById(`results`);_&&(_.innerHTML=`
            <p style="color:#28a745; text-align:center; font-weight:bold;">
                Session Logged! Game record created and stats updated.
            </p>`),T(`isRollActive`,!1)}function Tn(){let e=document.getElementById(`results`);e&&(e.innerHTML=``);let t=document.getElementById(`action-buttons`);t&&(t.style.display=`none`);let n=w(`scrambleIntervals`);n&&(Object.keys(n).forEach(e=>{n[e]&&clearInterval(n[e])}),T(`scrambleIntervals`,{})),T(`activeDraftOrder`,[]),T(`activeDraftStep`,0),T(`selectedDraftHeroes`,{}),T(`activeDraftCandidates`,{}),it(),Fe(),_t(),T(`isRollActive`,!1)}function En(e){E(`stagedBannedHeroIds`,`toggle`,e),pn()}function Dn(e){T(`stagedBanSearchQuery`,e),pn()}function On(){fn()}function kn(){let e=document.getElementById(`results`);e&&(e.innerHTML=``);let t=w(`selectedDraftHeroes`);[...w(`activeDraftOrder`)].sort((e,t)=>e-t).forEach(e=>{let n=t[e];n&&on(e,n)})}function An(){let e=w(`activeDraftStep`),t=w(`activeDraftOrder`),n=w(`characters`),r=w(`bannedHeroIds`),i=w(`selectedDraftHeroes`);if(e>=t.length){kn(),ot(`confirmation`),Cn();let e=document.getElementById(`action-buttons`);Ri()?e&&(e.style.display=`flex`):(it(),gt()),T(`isRollActive`,!0);return}let a=t[e];sn(t,e),dn(a,null);let o=Object.values(i).map(e=>e?.name),s=n.filter(e=>X(e)&&!r.has(e.id)&&!o.includes(e.name)),c=w(`draftCount`),l=Math.min(c,s.length);cn(a,l),Mn(a,s,l),setTimeout(()=>{let e=jn(a,s);w(`activeDraftCandidates`)[a]=e,Nn(a),ln(a,e)},1e3)}function jn(e,t){let n=[],r=[...t],i=w(`draftCount`),a=Math.min(i,r.length);for(let t=0;t<a;t++){let t=null;if(e>=4){let e=Math.floor(Math.random()*r.length);t=r[e],r.splice(e,1)}else{let n=r.filter(t=>t.weights[e]>0);if(n.length===0){if(r.length>0){let e=Math.floor(Math.random()*r.length);t=r[e],r.splice(e,1)}}else{let i=n.reduce((t,n)=>t+Q(n,e),0),a=Math.random()*i;for(let i of n){let n=Q(i,e);if(a<n){t=i,r.splice(r.findIndex(e=>e.name===i.name),1);break}a-=n}}}t&&n.push(t)}return n}function Mn(e,t,n){t.length===0||n===0||ge(`scrambleIntervals`,e,setInterval(()=>{for(let r=0;r<n;r++){let n=t[Math.floor(Math.random()*t.length)];if(!n)continue;let i=document.getElementById(`draft-card-img-${e}-${r}`),a=document.getElementById(`draft-card-name-${e}-${r}`),o=document.getElementById(`draft-card-group-${e}-${r}`);if(i&&(i.src=J(n.slug)),a){let e=``;for(let t=0;t<6;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZ`[Math.floor(Math.random()*26)];a.innerText=e}o&&(o.innerText=n.group||``)}},70))}function Nn(e){let t=w(`scrambleIntervals`);t[e]&&(clearInterval(t[e]),ge(`scrambleIntervals`,e,void 0))}function Pn(e,t){let n=(w(`activeDraftCandidates`)[e]||[]).find(e=>String(e.id)===String(t));if(!n)return;let r=w(`selectedDraftHeroes`);if(r[e]?.id===n.id){r[e]=null,un(e,null),dn(e,null);return}r[e]=n,un(e,n.id),dn(e,n)}function Fn(e){w(`selectedDraftHeroes`)[e]&&(T(`activeDraftStep`,w(`activeDraftStep`)+1),An())}function In(e){T(`stagedGamesWinnerOnly`,e),V()}function Ln(){T(`currentDrawerMode`,`history-filter`),T(`stagedSelectedGamePlayerIndex`,w(`selectedGamePlayerIndex`)),T(`stagedGamesWinnerOnly`,w(`gamesWinnerOnly`)),T(`stagedGamesUseHistorical`,w(`gamesUseHistorical`)),Dt()}function Rn(){T(`stagedFilterDataHistories`,new Set(w(`activeFilterDataHistories`))),T(`stagedFilterPlayers`,new Set(w(`activeFilterPlayers`))),T(`stagedFilterComplexities`,new Set(w(`activeFilterComplexities`))),T(`stagedFilterGroups`,new Set(w(`activeFilterGroups`))),T(`stagedOwnershipFilter`,w(`activeOwnershipFilter`)),kt()}function zn(e){T(`stagedOwnershipFilter`,e),Ot(),Bt()}function Bn(e=null,t=!1){At(e,t)}function Vn(e){let t=e.getAttribute(`data-type`),n=e.value,r=e.checked;if(t===`data-history`)E(`stagedFilterDataHistories`,r?`add`:`delete`,n);else if(t===`player`)E(`stagedFilterPlayers`,r?`add`:`delete`,n);else if(t===`complexity`){let e=Number(n);E(`stagedFilterComplexities`,r?`add`:`delete`,e)}else t===`group`&&E(`stagedFilterGroups`,r?`add`:`delete`,n);Bt(),Vt()}function Hn(){w(`stagedFilterDataHistories`).clear(),w(`stagedFilterPlayers`).clear(),w(`stagedFilterComplexities`).clear(),w(`stagedFilterGroups`).clear(),T(`stagedOwnershipFilter`,`all`),document.querySelectorAll(`#filter-drawer-left input[type="checkbox"]`).forEach(e=>{e.checked=!1}),Ot(),Bt(),Vt()}function Un(){T(`activeFilterDataHistories`,new Set(w(`stagedFilterDataHistories`))),T(`activeFilterPlayers`,new Set(w(`stagedFilterPlayers`))),T(`activeFilterComplexities`,new Set(w(`stagedFilterComplexities`))),T(`activeFilterGroups`,new Set(w(`stagedFilterGroups`))),T(`dbUseHistorical`,!w(`activeFilterDataHistories`).has(`Normal only`)||w(`activeFilterDataHistories`).has(`Historical only`));let e=w(`stagedOwnershipFilter`);T(`activeOwnershipFilter`,e),ti(e),Bn(null,!0),H(),er(),ur()}function Wn(){let e=document.getElementById(`hero-search`)?.value.toLowerCase()||``,t=w(`stagedOwnershipFilter`),n=t===`owned`||t===`all`,r=t===`unowned`||t===`all`,i=w(`characters`),a=w(`games`),o=w(`stagedFilterComplexities`),s=w(`stagedFilterGroups`),c=w(`stagedFilterDataHistories`),l=w(`stagedFilterPlayers`);return i.filter(t=>{let i=!0;o.size>0&&(i=o.has(Number(t.complexity)));let u=!0;s.size>0&&(u=s.has(t.group_id));let d=!0,f=c.has(`Normal only`),p=c.has(`Historical only`);f&&!p?d=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>!e.is_historical):p&&!f&&(d=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>e.is_historical));let m=!0;l.size>0&&(m=a.filter(e=>e.game_players.some(e=>e.hero_id===t.id)).some(e=>e.game_players.some(e=>e.hero_id===t.id&&l.has(e.player_id))));let h=X(t)&&n||!X(t)&&r;return pr(t,e)&&i&&u&&d&&m&&h}).length}function B(e=null,t=!1){jt(e,t)}function V(){Ut()}function Gn(e){w(`stagedSelectedGamePlayerIndex`)===e?T(`stagedSelectedGamePlayerIndex`,null):T(`stagedSelectedGamePlayerIndex`,e),w(`stagedSelectedGamePlayerIndex`)===null&&T(`stagedGamesWinnerOnly`,!1),V()}function Kn(e){T(`stagedGamesUseHistorical`,e),V()}function qn(e){e===`name`?T(`stagedSort`,`name`):e===`group`?T(`stagedSort`,`group`):e===`probability`?T(`stagedSort`,`w${w(`stagedSortPlayerIndex`)}`):e===`lastPlayed`&&T(`stagedSort`,`d${w(`stagedSortPlayerIndex`)}`),T(`stagedSortAsc`,e===`name`||e===`group`),Wt(),Gt()}function Jn(e){T(`stagedSortPlayerIndex`,e);let t=w(`stagedSort`);t.startsWith(`w`)?T(`stagedSort`,`w${e}`):t.startsWith(`d`)&&T(`stagedSort`,`d${e}`),Gt()}function Yn(e){let t=w(`stagedPlayerIndices`),n=t.indexOf(e);n>-1?t.splice(n,1):t.push(e),T(`stagedPlayerIndices`,t),V()}function Xn(e){e===`all`?T(`stagedLevels`,w(`stagedLevels`).size===6?new Set:new Set([1,2,3,4,5,6])):E(`stagedLevels`,`toggle`,e),Kt(),Yt()}function Zn(e){let t=w(`groups`);e===`all`?w(`stagedGroups`).size===t.length?E(`stagedGroups`,`clear`):t.forEach(e=>E(`stagedGroups`,`add`,e.id)):E(`stagedGroups`,`toggle`,e),Kt(),Yt()}function Qn(){let e=w(`groups`),t=w(`currentDrawerMode`);t===`sort-filter`?(T(`stagedSort`,`name`),T(`stagedSortAsc`,!0),T(`stagedSortPlayerIndex`,0),T(`stagedLevels`,new Set([1,2,3,4,5,6])),T(`stagedGroups`,new Set(e.map(e=>e.id))),V()):t===`columns`?(T(`stagedPlayerIndices`,[0,1,2,3]),T(`stagedUseHistorical`,!0),V()):t===`history-filter`?(T(`stagedSelectedGamePlayerIndex`,null),T(`stagedGamesWinnerOnly`,!1),T(`stagedGamesUseHistorical`,!0),V()):t===`roll-settings`&&(T(`stagedBannedHeroIds`,new Set),T(`stagedBanSearchQuery`,``),V())}function $n(){let e=w(`currentDrawerMode`);e===`sort-filter`?(T(`currentSort`,w(`stagedSort`)),T(`sortAsc`,w(`stagedSortAsc`)),T(`currentSortPlayerIndex`,w(`stagedSortPlayerIndex`)),T(`activeLevels`,new Set(w(`stagedLevels`))),T(`activeGroups`,new Set(w(`stagedGroups`))),er(),B(null,!0),H()):e===`columns`?(T(`activePlayerIndices`,[...w(`stagedPlayerIndices`)]),T(`dbUseHistorical`,w(`stagedUseHistorical`)),er(),B(null,!0),H()):e===`history-filter`?(T(`selectedGamePlayerIndex`,w(`stagedSelectedGamePlayerIndex`)),T(`gamesWinnerOnly`,w(`stagedGamesWinnerOnly`)),T(`gamesUseHistorical`,w(`stagedGamesUseHistorical`)),tr(),B(null,!0),G()):e===`roll-settings`&&(T(`bannedHeroIds`,new Set(w(`stagedBannedHeroIds`))),localStorage.setItem(`bannedHeroIds`,JSON.stringify(Array.from(w(`bannedHeroIds`)))),On(),B(null,!0))}function er(){Nt()}function tr(){Pt()}function nr(e){let t=w(`currentSort`),n=w(`sortAsc`);t===e?T(`sortAsc`,!n):(T(`currentSort`,e),T(`sortAsc`,!0)),rr(),H()}function rr(){It()}function ir(e){Rt(e)}function ar(){zt()}function or(e,t){T(`currentSort`,e),T(`sortAsc`,t),(e.startsWith(`w`)||e.startsWith(`d`))&&T(`currentSortPlayerIndex`,parseInt(e.substring(1))),ar(),rr(),H()}function sr(){let e=document.getElementById(`hero-search`),t=document.getElementById(`clear-search`);e&&t&&t.classList.toggle(`hidden`,e.value.trim().length===0)}function cr(){let e=document.getElementById(`hero-search`);e&&(e.value=``,e.focus()),sr(),lr()}function lr(){H(),ur()}function ur(){Xt()}function dr(e,t){if(e===`data-history`)E(`activeFilterDataHistories`,`delete`,t),T(`dbUseHistorical`,!w(`activeFilterDataHistories`).has(`Normal only`)||w(`activeFilterDataHistories`).has(`Historical only`));else if(e===`player`)E(`activeFilterPlayers`,`delete`,t);else if(e===`complexity`)E(`activeFilterComplexities`,`delete`,t);else if(e===`group`)E(`activeFilterGroups`,`delete`,t);else if(e===`ownership`){T(`activeOwnershipFilter`,`all`),T(`stagedOwnershipFilter`,`all`);let e=document.getElementById(`db-show-owned`),t=document.getElementById(`db-show-not-owned`);e&&(e.checked=!0),t&&(t.checked=!0)}if(e!==`ownership`){let n=document.querySelector(`#filter-drawer-left input[value="${t}"][data-type="${e}"]`);n&&(n.checked=!1)}H(),ur(),er()}function fr(){cr()}function H(){Zt()}function pr(e,t){if(!t)return!0;let n=t.trim().toLowerCase();return(e.name||``).toLowerCase().includes(n)||(e.group||``).toLowerCase().includes(n)}var mr={duel:`1v1 Duel`,"2v2":`Teams 2v2`,"3v3":`Teams 3v3`,ffa:`Free For All`,koth:`King of the Hill`};function hr(e){if(!e)return``;let t=k[e===`2v2`||e===`3v3`?`teams`:e];return t?`<span class="game-card-type-icon" title="${Je[e]||e}">${t}</span>`:``}function gr(e){return e-4+1}var _r=null,U=()=>(_r||={buildInfoDiv:document.getElementById(`admin-build-info`),changelogModal:document.getElementById(`changelog-modal`),changelogContainer:document.getElementById(`changelog-container`),whatsNewModal:document.getElementById(`whats-new-modal`),whatsNewContainer:document.getElementById(`whats-new-container`),collectionContainer:document.getElementById(`collectionContainer`),collectionCountLabel:document.getElementById(`collection-count-stats`),heroForm:document.getElementById(`heroForm`),addHeroBtn:document.getElementById(`addHeroBtn`),groupSelect:document.getElementById(`charGroup`),formTitle:document.getElementById(`formTitle`),charNameInput:document.getElementById(`charName`),charSlugInput:document.getElementById(`charSlug`),charComplexitySelect:document.getElementById(`charComplexity`),groupsListContainer:document.getElementById(`groupsListContainer`),heroesListContainer:document.getElementById(`heroesListContainer`),playersListContainer:document.getElementById(`playersListContainer`),usersListContainer:document.getElementById(`usersListContainer`),collectionsListContainer:document.getElementById(`collectionsListContainer`),gamesListContainer:document.getElementById(`gamesContainer`),winnerModal:document.getElementById(`winner-modal`),winnerContainer:document.getElementById(`winner-selection-container`),confirmWinnerBtn:document.getElementById(`confirm-winner-btn`),groupForm:document.getElementById(`groupForm`),addGroupBtn:document.getElementById(`addGroupBtn`)},_r);function vr(){let t=U();if(!t.buildInfoDiv)return;let n=window.location.hostname,r=`Localhost`;n.includes(`github.io`)?r=`GitHub Pages`:n.includes(`workers.dev`)&&(r=`Cloudflare Workers`);let i=e?`Production`:`Development`,a=e?`Supabase PROD`:`Supabase DEV`,o=e?`main`:`dev/local`;t.buildInfoDiv.innerHTML=`
        <div><b>Platform:</b> ${r} (${n})</div>
        <div><b>Environment:</b> ${i} (Targeting: ${o})</div>
        <div><b>Database:</b> ${a}</div>
        ${e?``:`<div style="margin-top:5px; color:var(--danger); font-style:italic;">Note: Dev heroes are prefixed with "DEV-" in this database.</div>`}
    `}function yr(){let e=U(),t=w(`cachedChangelog`);!t||!e.changelogContainer||!e.changelogModal||(e.changelogContainer.innerHTML=t.map(e=>`
        <div>
            <h3>v${e.version}</h3>
            <ul>
                ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
        </div>
    `).join(``),e.changelogModal.style.display=`flex`,document.body.style.overflow=`hidden`)}function br(){let e=U();e.changelogModal&&(e.changelogModal.style.display=`none`),document.body.style.overflow=`auto`}function xr(e){let t=U();!t.whatsNewContainer||!t.whatsNewModal||(t.whatsNewContainer.innerHTML=e.map(e=>`
        <div>
            <h3>v${e.version}</h3>
            <ul style="text-align: left;">
                ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
            </ul>
        </div>
    `).join(``),t.whatsNewModal.style.display=`flex`,document.body.style.overflow=`hidden`)}function Sr(){let e=U();e.whatsNewModal&&(e.whatsNewModal.style.display=`none`),document.body.style.overflow=`auto`}var Cr={roll:{title:`Randomizer`},database:{title:`Heroes`},history:{title:`History`},collection:{title:`Collection`},admin:{title:`Admin`}};function wr(e){let t=Cr[e];if(!t)return;let n=document.getElementById(`header-section-title`);n&&(n.innerText=t.title)}function Tr(e){if(e===`admin`&&!K())return;let t={roll:`rollSection`,database:`dbSection`,history:`gamesSection`,collection:`collectionSection`,admin:`adminSection`},n=t[e];n&&(Object.values(t).forEach(e=>{let t=document.getElementById(e);t&&(e===n?t.classList.remove(`hidden`):t.classList.add(`hidden`))}),wr(e),document.querySelectorAll(`.bottom-nav .nav-item`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-section`)===e)}),e===`database`?setTimeout(Ft,50):e===`history`?Gr():e===`collection`&&Or())}function Er(e,t){let n=document.getElementById(t),r=(e.currentTarget.closest(`.panel-header`)||e.currentTarget).querySelector(`.panel-toggle`);if(!n||!r)return;let i=n.classList.toggle(`hidden`);r.classList.toggle(`open`,!i),r.setAttribute(`aria-expanded`,String(!i))}function Dr(e){let t=e.closest(`.hero-item`),n=e.querySelector(`.panel-toggle`);if(!t||!n)return;let r=t.classList.toggle(`collapsed`);n.classList.toggle(`open`,!r),n.setAttribute(`aria-expanded`,String(!r))}function Or(){let e=U();if(!e.collectionContainer)return;let t=w(`characters`),n=w(`groups`),r=w(`currentUser`),i=w(`expandedCollectionGroups`),a=t.length,o=t.filter(w(`isHeroOwned`)||(e=>e.is_owned)).length;e.collectionCountLabel&&(e.collectionCountLabel.innerText=`Owned ${o} of ${a} heroes`);let s=[...n].sort((e,t)=>{let n=e.order_index??2**53-1,r=t.order_index??2**53-1;return n===r?e.name.localeCompare(t.name):n-r}),c=r?``:`disabled`,l=[];e.collectionContainer.innerHTML=s.map(e=>{let n=t.filter(t=>t.group_id===e.id).sort((e,t)=>e.name.localeCompare(t.name));if(n.length===0)return``;let r=n.every(w(`isHeroOwned`)||(e=>e.is_owned)),a=n.map(e=>{let t=e.is_owned;return`
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
        `}).join(``),l.forEach(e=>{let t=document.getElementById(`owned-group-${e}`);t&&(t.indeterminate=!0)})}function kr(){let e=U();e.charNameInput&&(e.charNameInput.value=``),e.charSlugInput&&(e.charSlugInput.value=``),e.groupSelect&&(e.groupSelect.value=``),e.charComplexitySelect&&(e.charComplexitySelect.value=``),e.formTitle&&(e.formTitle.innerText=`Add New Hero`),e.heroForm&&e.addHeroBtn&&(e.heroForm.classList.add(`hidden`),e.addHeroBtn.innerText=`Add Hero`)}function Ar(){let e=U();if(!e.heroForm||!e.addHeroBtn)return;let t=e.heroForm.classList.toggle(`hidden`);e.addHeroBtn.innerText=t?`Add Hero`:`Hide Hero Form`,!t&&e.charNameInput&&e.charNameInput.focus()}function jr(){let e=U();if(!e.groupSelect)return;let t=w(`groups`).map(e=>`<option value="${e.id}">${e.name}</option>`).join(``);e.groupSelect.innerHTML=`<option value="">-- Select Group --</option>`+t}function Mr(){let e=U();if(!e.groupsListContainer)return;let t=w(`groups`);if(t.length===0){e.groupsListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No groups yet. Create one above.</p>`;return}let n=t.map(e=>`
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
    `).join(``);e.groupsListContainer.innerHTML=n}function Nr(){let e=U();if(!e.heroesListContainer)return;let t=w(`characters`),n=w(`editIndex`),r=w(`groups`);if(t.length===0){e.heroesListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No heroes yet. Add one above.</p>`;return}let i=t.map((e,t)=>{let i=n===t,a=K()?`<button class="btn-save btn-inline" data-action="edit-hero" data-hero-idx="${t}">Edit</button>`:``,o=K()?`<button class="btn-cancel btn-inline" data-action="delete-hero" data-hero-id="${e.id}">Delete</button>`:``,s=r.map(t=>`<option value="${t.id}" ${t.id===e.group_id?`selected`:``}>${Z(t.name)}</option>`).join(``);return`
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
            </div>`}).join(``);e.heroesListContainer.innerHTML=i,n===-1?e.heroesListContainer.classList.remove(`group-edit-active`):e.heroesListContainer.classList.add(`group-edit-active`)}function Pr(e){let t=document.getElementById(`groupEditPanel-${e}`),n=document.getElementById(`groupRow-${e}`);t&&t.classList.add(`hidden`),n&&n.classList.remove(`editing`);let r=U().groupsListContainer;r&&(r.querySelectorAll(`.group-row.editing`).length>0||r.classList.remove(`group-edit-active`))}function Fr(){let e=document.getElementById(`groupName`),t=document.getElementById(`groupOrder`),n=document.getElementById(`groupYear`);e&&(e.value=``),t&&(t.value=``),n&&(n.value=``);let r=U().groupForm,i=U().addGroupBtn;r&&i&&(r.classList.add(`hidden`),i.innerText=`Add Group`)}function Ir(){let e=U().groupForm,t=U().addGroupBtn;if(!e||!t)return;let n=e.classList.toggle(`hidden`);if(t.innerText=n?`Add Group`:`Hide Group Form`,!n){let e=document.getElementById(`groupName`);e&&e.focus()}}function Lr(){let e=U();if(!e.playersListContainer)return;let t=w(`players`);if(t.length===0){e.playersListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No players loaded.</p>`;return}let n=t.map((e,t)=>{let n=Bi(e);return`
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
            </div>`}).join(``);e.playersListContainer.innerHTML=n}function Rr(e){let t=document.getElementById(`playerEditPanel-${e}`),n=document.getElementById(`playerRow-${e}`);t&&t.classList.add(`hidden`),n&&n.classList.remove(`editing`);let r=U().playersListContainer;r&&(r.querySelectorAll(`.player-admin-row.editing`).length>0||r.classList.remove(`player-edit-active`))}function zr(){let e=U();if(!e.usersListContainer)return;let t=w(`authUsers`);if(t.length===0){e.usersListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No system users loaded.</p>`;return}let n=t.map(e=>{let t=e.role||`user`,n=t===`admin`;return`
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
            </div>`}).join(``);e.usersListContainer.innerHTML=n}function Br(e,t){let n=U();if(!n.collectionsListContainer)return;if(e.length===0){n.collectionsListContainer.innerHTML=`<p style="opacity: 0.6; font-style: italic;">No collections loaded.</p>`;return}let r=w(`characters`),i={};t.forEach(e=>{i[`${e.user_id}_${e.hero_id}`]=e.is_owned});let a=document.createElement(`div`);a.style.overflowX=`auto`,a.style.marginTop=`10px`,a.innerHTML=`
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
    `,n.collectionsListContainer.innerHTML=``,n.collectionsListContainer.appendChild(a)}function Vr(e,t){return e.game_players.map(e=>{let n=parseInt(e.player_id.substring(1))-1,r=e.heroes?.name||`Unknown`,i=e.heroes?.slug||``,a=e.is_winner===!0,o=a?`checked`:``,s=a?`selected`:``,c=t[n]||`Invitee`;return n>=4&&(c=`Invitee (${gr(n)})`),`
            <div class="winner-card ${s}" data-action="winner-card-click" data-value="${e.player_id}">
                <input type="radio" name="winner-selection" value="${e.player_id}" ${o} style="display: none;">
                <img src="${J(i)}" class="winner-card-img" alt="${r}">
                <div class="winner-card-player-name">${c}</div>
                <div class="winner-card-hero-name">${r}</div>
            </div>
        `}).join(``)}function Hr(e,t){let n={A:[],B:[]};return e.game_players.forEach(e=>{let t=e.teams?.team_label;t&&n[t]&&n[t].push(e)}),[`A`,`B`].filter(e=>n[e].length>0).map(e=>{let r=n[e],i=r.some(e=>e.is_winner===!0);return`
            <div class="winner-card team-card ${i?`selected`:``}" data-action="winner-card-click" data-value="${e}">
                <input type="radio" name="winner-selection" value="${e}" ${i?`checked`:``} style="display: none;">
                <div class="winner-card-player-name">Team ${e}</div>
                <div class="winner-team-members">${r.map(e=>{let n=parseInt(e.player_id.substring(1))-1,r=e.heroes?.name||`Unknown`,i=e.heroes?.slug||``,a=t[n]||`Invitee`;return`
                    <div class="winner-team-member">
                        <img src="${J(i)}" class="winner-team-member-img" alt="${r}">
                        <div class="winner-team-member-text">
                            <span class="winner-card-player-name">${a}</span>
                            <span class="winner-card-hero-name">${r}</span>
                        </div>
                    </div>
                `}).join(``)}</div>
            </div>
        `}).join(``)}function Ur(e){let t=U(),n=w(`games`),r=w(`NAMES`);if(!t.winnerModal||!t.winnerContainer||!t.confirmWinnerBtn)return;let i=n.find(t=>t.id===e);if(!i)return;t.confirmWinnerBtn.setAttribute(`data-game-id`,e),t.confirmWinnerBtn.disabled=!0;let a=i.game_type===`2v2`||i.game_type===`3v3`,o=i.game_players.filter(e=>e.is_winner===!0),s=i.game_players.filter(e=>e.is_winner===!1),c=o.length===0&&s.length>0&&s.length===i.game_players.length,l,u;a?(l=`winner-select-grid team-mode`,u=Hr(i,r)):(l=i.game_players.length>3?`winner-select-grid two-rows`:`winner-select-grid`,u=Vr(i,r));let d=c?`checked`:``,f=c?`selected`:``;t.winnerContainer.innerHTML=`
        <div class="${l}">
            ${u}
            <div class="winner-draw-card ${f}" data-action="winner-card-click" data-value="draw">
                <input type="radio" name="winner-selection" value="draw" ${d} style="display: none;">
                <span style="font-size: 1.5rem; line-height: 1;">🤝</span>
                <div style="text-align: left;">
                    <div class="winner-card-player-name" style="font-size: 0.9rem;">Select a Draw</div>
                    <div class="winner-card-hero-name" style="font-size: 0.7rem; opacity: 0.7;">No winner for this match</div>
                </div>
            </div>
        </div>
    `,t.winnerModal.style.display=`flex`,document.body.style.overflow=`hidden`}function Wr(){let e=U();e.winnerModal&&(e.winnerModal.style.display=`none`),document.body.style.overflow=`auto`}function Gr(){let e=U();if(!e.gamesListContainer)return;let t=w(`games`);w(`players`);let n=w(`NAMES`),r=w(`expandedGameIds`),i=w(`selectedGamePlayerIndex`),a=w(`gamesWinnerOnly`),o=w(`gamesUseHistorical`),s=w(`gamesHistoryStyle`)||`gorgeous`,c=document.getElementById(`games-search`),l=c?c.value.toLowerCase().trim():``,u=s===`gorgeous`,d=e=>{let n=document.getElementById(`game-count-stats`);n&&(n.innerText=`Showing ${e} of ${t?t.filter(e=>u?!e.is_historical:o||!e.is_historical).length:0} games`)},f=``;if(K()&&(f=`
            <div class="admin-view-toggle-row" style="display: flex; justify-content: flex-end; margin-bottom: 15px; padding: 0 5px;">
                <button type="button" class="btn-save btn-inline" data-action="toggle-history-view-style" style="font-size: 0.85em; padding: 6px 12px; height: auto;">
                    ${u?`Switch to Admin List View`:`Switch to Gorgeous View`}
                </button>
            </div>
        `),!t||t.length===0){e.gamesListContainer.innerHTML=f+`<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No games played yet.</p>`,d(0);return}let p=t.filter(e=>{if(u&&e.is_historical||!u&&!o&&e.is_historical)return!1;let t=!0;return i!==null&&(t=e.game_players.some(e=>{let t=parseInt(e.player_id.substring(1))-1,n=!1;return i>=0&&i<4?n=t===i:i===4&&(n=t>=4),n&&a?e.is_winner===!0:n})),!(!t||l&&!(e.game_players||[]).map(e=>e.heroes?.name||``).join(` `).toLowerCase().includes(l))});if(p.length===0){e.gamesListContainer.innerHTML=f+`<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No matches found matching filter criteria.</p>`,d(0);return}d(p.length),u?e.gamesListContainer.innerHTML=f+p.map(e=>{let a=e.played_at||``;a&&!a.includes(`T`)&&(a=a.replace(` `,`T`)),a&&!a.includes(`Z`)&&!a.includes(`+`)&&(a+=`Z`);let o=new Date(a).toLocaleDateString(void 0,{dateStyle:`medium`}),s=new Date(a).toLocaleTimeString(void 0,{timeStyle:`short`}),c=e.game_type===`2v2`||e.game_type===`3v3`,u=hr(e.game_type),d=e.game_type?`<div class="game-card-type-badge">${mr[e.game_type]||e.game_type}</div>`:``,f=e.game_players.filter(e=>e.is_winner===!0),p=e.game_players.filter(e=>e.is_winner===!1),m=f.length===0&&p.length>0&&p.length===e.game_players.length,h=f.length===0&&!m,g=r.has(e.id)?`expanded`:``,_=h?`in-progress`:``,v=``;f.length>0&&f[0].heroes?.slug&&(v=`<img src="${J(f[0].heroes.slug)}" class="game-card-bg-img" alt="">`);let y={};e.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1,r;t>=4?r=`Invitee ${gr(t)}`:(r=n[t]||`Unknown`,r.toLowerCase().startsWith(`player `)&&r.length>7&&(r=`P`+r.substring(7))),y[e.player_id]=r});let b=Object.values(y).map(e=>e.charAt(0).toUpperCase()),x={};e.game_players.forEach(e=>{let t=y[e.player_id],n=t.charAt(0).toUpperCase(),r=b.filter(e=>e===n).length,i=n;r>1&&t.length>1&&(i=n+t.charAt(1).toLowerCase()),x[e.player_id]=i});let ee=[...e.game_players].sort((e,t)=>e.is_winner&&!t.is_winner?-1:!e.is_winner&&t.is_winner?1:0).map(e=>{let t=parseInt(e.player_id.substring(1))-1,n=e.heroes?.slug||``,r=e.heroes?.name||`Unknown`,i=e.is_winner===!0,a=i?`winner-highlight`:``,o=i?`<span class="mini-winner-trophy">🏆</span>`:``,s=x[e.player_id];return`
                            <a href="${Y(n)}" target="_blank" class="mini-portrait-wrapper ${a}" title="${r}">
                                ${o}
                                <img src="${J(n)}" class="mini-portrait-img" alt="${r}">
                                <div class="mini-portrait-pill" style="background-color: var(--p${t+1});">${s}</div>
                            </a>
                        `}).join(``),te=h?`<span class="game-card-status-badge">In Progress</span>`:``,ne=m?`<div class="player-plate-draw-badge">DRAW</div>`:``,re=`
                <div class="game-card-header" data-action="toggle-game-expansion" data-game-id="${e.id}">
                    <div class="game-card-title-group">
                        <div class="game-card-title-row">
                            ${u}
                            <div class="game-card-date-time">
                                <span class="game-card-date">${o}</span>
                                <span class="game-card-time">${s}</span>
                            </div>
                        </div>
                        ${te}
                    </div>
                    <div class="game-card-collapsed-summary">
                        <div class="mini-portrait-strip">
                            ${ee}
                            ${ne}
                        </div>
                        <span class="chevron-icon">▼</span>
                    </div>
                </div>`,ie=K()||e.last_updated_by===w(`currentUser`)?.id?`
                    <div class="game-card-actions">
                        <button class="btn-game-action" data-action="select-winner" data-game-id="${e.id}" title="Select Winner">🏆</button>
                        <button class="btn-game-action delete" data-action="delete-game" data-game-id="${e.id}" title="Delete Game">🗑️</button>
                    </div>
                `:``,S=e=>{let r=parseInt(e.player_id.substring(1))-1,a=r>=4?`Invitee ${gr(r)}`:n[r],o=e.heroes?.name||`Unknown`,s=e.heroes?.slug||``,c=!!(l&&o.toLowerCase().includes(l)),u=!1;i!==null&&(i>=0&&i<4?u=r===i:i===4&&(u=r>=4));let d=`draw`;d=f.length>0?e.is_winner?`winner`:`loser`:m?`draw`:h?`in-progress`:e.is_winner===!1?`loser`:`draw`;let p=``;(c||u)&&(p=`box-shadow: 0 0 8px var(--accent), 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);`);let g=e.is_winner?`<div class="player-plate-trophy">🏆</div>`:``,_=m?`<div class="player-plate-draw-badge">DRAW</div>`:``,v=0,y=0,b=w(`gamesUseHistorical`);t.forEach(t=>{!b&&t.is_historical||t.game_players.forEach(t=>{t.player_id===e.player_id&&t.hero_id===e.hero_id&&(v++,t.is_winner&&y++)})});let x=v>0?(y/v).toFixed(3):`.000`,ee=x.startsWith(`0`)?x.substring(1):x;return`
                        <div class="player-plate-wrapper">
                            <a href="${Y(s)}" target="_blank" class="player-plate ${d}" style="${p}">
                                <img src="${J(s)}" class="player-plate-bg-art" alt="${o}">
                                <div class="player-plate-overlay"></div>
                                ${g}
                                ${_}
                                <div class="player-plate-tag" style="background-color: var(--p${r+1});">${a}</div>
                                <div class="player-plate-info">
                                    <div class="player-plate-hero-name">${o}</div>
                                </div>
                            </a>
                            <div class="player-plate-stats-below">
                                <span class="player-plate-winner-stats">${y}🏆 / ${v}🎲</span>
                                <span class="player-plate-winner-pct">( ${ee})</span>
                            </div>
                        </div>`},C;if(c){let t=e.game_players.filter(e=>e.teams?.team_label===`A`),n=e.game_players.filter(e=>e.teams?.team_label===`B`);C=`
                        <div class="team-block">
                            <div class="team-block-label">Team A</div>
                            <div class="player-responsive-grid">${t.map(S).join(``)}</div>
                        </div>
                        <div class="team-block">
                            <div class="team-block-label">Team B</div>
                            <div class="player-responsive-grid">${n.map(S).join(``)}</div>
                        </div>
                    `}else C=`<div class="player-responsive-grid">${e.game_players.map(S).join(``)}</div>`;return`
                <div class="game-history-card ${g} ${_}">
                    ${v}
                    ${re}
                    <div class="game-card-body">
                        ${d}
                        ${C}
                        ${ie}
                    </div>
                </div>`}).join(``):e.gamesListContainer.innerHTML=f+p.map(e=>{let t=r.has(e.id),i=new Date(e.played_at).toLocaleDateString(void 0,{month:`short`,day:`numeric`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}),a=``,o=``,s=e.game_players.filter(e=>e.is_winner===!0),c=e.game_players.filter(e=>e.is_winner===!1),u=s.length===0&&c.length===e.game_players.length,d=s.length===0&&!u;a=u?`<span style="color: var(--accent); font-weight: bold;">TIE</span>`:d?`<span style="opacity: 0.5; font-style: italic; font-size: 0.85em;">Pending...</span>`:s.map(e=>{let t=parseInt(e.player_id.substring(1))-1,r=n[t]||`Invitee`;return t>=4&&(r=`Invitee (${gr(t)})`),`<span style="color: var(--p${t+1}); font-weight: bold;">${r}</span>`}).join(`, `),e.game_players.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1,r=`--p${t+1}`,i=n[t]||`Invitee`;t>=4&&(i=`Invitee (${gr(t)})`);let a=``;a=e.is_winner===!0?`<span class="status-badge-win">WIN</span>`:e.is_winner===!1?`<span class="status-badge-lose">LOSS</span>`:`<span class="status-badge-pending">...</span>`;let s=!!(l&&e.heroes?.name?.toLowerCase().includes(l));o+=`
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.03);${s?` border: 1px solid var(--accent); padding: 6px; border-radius: 4px;`:``}">
                            <span style="color: var(${r}); font-weight: bold;">${i}</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 0.9em; ${s?`color: var(--accent); font-weight: bold;`:`opacity: 0.8;`}">${e.heroes?.name||`Unknown`}</span>
                                ${a}
                            </div>
                        </div>
                    `});let f=Ri()&&d?`<button type="button" class="btn-save btn-inline" data-action="open-winner-modal" data-game-id="${e.id}">Select Winner</button>`:``,p=K()?`<button type="button" class="btn-cancel btn-inline" data-action="delete-game" data-game-id="${e.id}">Delete</button>`:``,m=e.is_historical?`<span style="font-size: 0.7em; letter-spacing: 0.5px; opacity: 0.5; padding: 2px 6px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; font-weight: 500; font-family: monospace;">HISTORICAL</span>`:``;return`
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
                </div>`}).join(``)}function Kr(){vr()}function qr(){yr()}function Jr(){br()}function Yr(e){xr(e),localStorage.setItem(`lastSeenVersion`,e[0].version)}function Xr(){Sr()}function Zr(e){Tr(e)}function Qr(e,t){Er(e,t)}function $r(e){Dr(e)}function ei(e,t){t.target.tagName===`INPUT`||t.target.tagName===`LABEL`||t.target.closest(`label`)||(E(`expandedCollectionGroups`,`toggle`,e),W())}function ti(e){let t=document.getElementById(`db-show-owned`),n=document.getElementById(`db-show-not-owned`);t&&n&&(e===`owned`?(t.checked=!0,n.checked=!1):e===`unowned`?(t.checked=!1,n.checked=!0):(t.checked=!0,n.checked=!0)),H()}function W(){Or()}async function ni(e,t){if(!w(`currentUser`)){alert(`Please log in to manage your collection.`);return}let n=w(`characters`).find(t=>t.id===e);n&&(n.is_owned=t),W(),H(),z();let r=document.getElementById(`admin-owned-${w(`currentUser`).id}-${e}`);r&&(r.checked=t);let{error:i}=await x(w(`currentUser`).id,e,t);i&&(alert(`Error updating ownership: `+i.message),n&&(n.is_owned=!t),W(),z(),H(),r&&(r.checked=!t))}async function ri(e,t){if(!w(`currentUser`)){alert(`Please log in to manage your collection.`);return}let n=w(`characters`);n.forEach(n=>{if(n.group_id===e){n.is_owned=t;let e=document.getElementById(`admin-owned-${w(`currentUser`).id}-${n.id}`);e&&(e.checked=t)}}),W(),H(),z();let{error:r}=await ee(n.filter(t=>t.group_id===e).map(e=>({user_id:w(`currentUser`).id,hero_id:e.id,is_owned:t})));r&&(alert(`Error updating group ownership: `+r.message),n.forEach(n=>{n.group_id===e&&(n.is_owned=!t)}),W(),z(),H())}async function ii(){let e=document.getElementById(`charName`).value.trim(),t=document.getElementById(`charGroup`).value,n=document.getElementById(`charSlug`).value.trim(),r=document.getElementById(`charComplexity`).value.trim();if(!e)return alert(`Name is required`);if(!t)return alert(`Group is required`);let{error:i}=await te({name:e,slug:n,complexity:r?parseInt(r):null,group_id:t,last_updated_by:w(`currentUser`).id});if(i)return alert(`Error saving: `+i.message);await $(),si()}function ai(e){T(`editIndex`,e),di(),document.getElementById(`adminSection`).classList.contains(`hidden`)&&Zr(`admin`);let t=w(`characters`),n=document.getElementById(`heroEditPanel-${t[e]?.id}`);n&&!oi(n)&&n.scrollIntoView({behavior:`smooth`,block:`nearest`})}function oi(e){let t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)}function si(){T(`editIndex`,-1),kr()}function ci(){Ar()}function li(){jr()}function ui(){Mr()}function di(){Nr()}function fi(){T(`editIndex`,-1),di()}async function pi(e,t){let n=document.getElementById(`heroName-${t}`).value.trim(),r=document.getElementById(`heroGroup-${t}`).value,i=document.getElementById(`heroSlug-${t}`).value.trim(),a=document.getElementById(`heroComplexity-${t}`).value.trim();if(!n)return alert(`Name is required`);if(!r)return alert(`Group is required`);let{error:o}=await ne({id:e,name:n,slug:i,complexity:a?parseInt(a):null,group_id:r,last_updated_by:w(`currentUser`).id});if(o)return alert(`Error saving: `+o.message);T(`editIndex`,-1),await $()}async function mi(e){if(!await D(`Delete Hero`,`Delete this hero? This action cannot be undone.`))return;let{error:t}=await re(e);if(t)return alert(`Error deleting hero: `+t.message);await $()}async function hi(){let e=document.getElementById(`groupName`).value.trim(),t=document.getElementById(`groupOrder`).value.trim(),n=document.getElementById(`groupYear`).value.trim();if(!e)return alert(`Group name is required`);let{error:r}=await ie({name:e,order_index:t?parseInt(t):null,year:n?parseInt(n):null,is_active:!0});if(r)return alert(`Error saving group: `+r.message);yi(),$()}function gi(e){let t=w(`groups`).find(t=>t.id===e);if(!t)return;let n=document.getElementById(`groupsListContainer`);n&&(n.classList.add(`group-edit-active`),n.querySelectorAll(`.group-row`).forEach(e=>e.classList.remove(`editing`)));let r=document.getElementById(`groupEditPanel-${e}`),i=document.getElementById(`groupRow-${e}`);!r||!i||(i.classList.add(`editing`),document.getElementById(`groupName-${e}`).value=t.name,document.getElementById(`groupOrder-${e}`).value=t.order_index||``,document.getElementById(`groupYear-${e}`).value=t.year||``,r.classList.remove(`hidden`))}function _i(e){Pr(e)}async function vi(e){let t=document.getElementById(`groupName-${e}`).value.trim(),n=document.getElementById(`groupOrder-${e}`).value.trim(),r=document.getElementById(`groupYear-${e}`).value.trim();if(!t)return alert(`Group name is required`);let{error:i}=await ie({id:e,name:t,order_index:n?parseInt(n):null,year:r?parseInt(r):null,is_active:!0});if(i)return alert(`Error saving group: `+i.message);$()}function yi(){Fr()}function bi(){Ir()}function xi(){Lr()}function Si(e){let t=w(`players`).find(t=>t.id===e);if(!t)return;let n=document.getElementById(`playersListContainer`);n&&(n.classList.add(`player-edit-active`),n.querySelectorAll(`.player-admin-row`).forEach(e=>e.classList.remove(`editing`)));let r=document.getElementById(`playerEditPanel-${e}`),i=document.getElementById(`playerRow-${e}`);!r||!i||(i.classList.add(`editing`),document.getElementById(`playerName-${e}`).value=t.name,r.classList.remove(`hidden`))}function Ci(e){Rr(e)}async function wi(e){let t=document.getElementById(`playerName-${e}`).value.trim();if(!t)return alert(`Player name is required`);let{error:n}=await b(e,t);if(n)return alert(`Error saving player: `+n.message);let r=w(`players`),i=w(`NAMES`),a=r.findIndex(t=>t.id===e);a!==-1&&(r[a].name=t,i[a]=t),Ci(e),xi()}function Ti(){zr()}async function Ei(){let e=document.getElementById(`collectionsListContainer`);if(!e)return;e.innerHTML=`<p style="opacity: 0.7; font-style: italic; padding: 10px;">Loading collections...</p>`;let t=[];try{let{data:n,error:r}=await v();if(r){e.innerHTML=`<p style="color: var(--danger); padding: 10px;">Error loading collections: ${Z(r.message)}</p>`;return}t=n||[]}catch(t){e.innerHTML=`<p style="color: var(--danger); padding: 10px;">Error connecting to database: ${Z(t.message)}</p>`;return}let n=[],r=w(`players`);r.forEach(e=>{e.user_id&&n.push({user_id:e.user_id,name:e.name,isLinked:!0})}),t.forEach(e=>{n.some(t=>t.user_id===e.user_id)||n.push({user_id:e.user_id,name:`User (${e.user_id.substring(0,8)})`,isLinked:!1})});let i=w(`currentUser`);if(i&&!n.some(e=>e.user_id===i.id)){let e=r.find(e=>e.user_id===i.id),t=e?e.name:i.email?i.email.split(`@`)[0]:`Admin`;n.push({user_id:i.id,name:t,isLinked:!!e})}Br(n,t)}async function Di(e,t,n){let r=w(`currentUser`);if(e===r?.id){let e=w(`characters`).find(e=>e.id===t);e&&(e.is_owned=n),W(),H(),z()}let{error:i}=await x(e,t,n);if(i){if(alert(`Error updating user collection: `+i.message),e===r?.id){let e=w(`characters`).find(e=>e.id===t);e&&(e.is_owned=!n),W(),H(),z()}Ei()}}async function Oi(e){if(!await D(`Delete Group`,`Delete this group?`))return;let{error:t}=await S(e);if(t)return alert(`Error deleting group: `+t.message);yi(),$()}function G(){Gr()}function ki(){let e=document.getElementById(`games-search`),t=document.getElementById(`clear-games-search`);e&&t&&t.classList.toggle(`hidden`,e.value.trim().length===0),G()}function Ai(){let e=document.getElementById(`games-search`);e&&(e.value=``,e.focus()),ki()}function ji(e){E(`expandedGameIds`,`toggle`,e),G()}function Mi(){T(`gamesHistoryStyle`,(w(`gamesHistoryStyle`)||`gorgeous`)===`gorgeous`?`admin`:`gorgeous`),G()}function Ni(e){Ur(e)}function Pi(){Wr()}async function Fi(e){let t=document.querySelector(`input[name="winner-selection"]:checked`);if(!t)return alert(`Please select a winner.`);let n=t.value,r=document.getElementById(`confirm-winner-btn`);r.disabled=!0,r.innerText=`Saving...`;let i=w(`games`).find(t=>t.id===e),a=i?.game_type===`2v2`||i?.game_type===`3v3`;try{let{error:t}=a?await le(e,n,w(`currentUser`).id):await ce(e,n,w(`currentUser`).id);if(t)throw t;Pi(),await $()}catch(e){alert(`Error updating winner: `+e.message)}finally{r.disabled=!1,r.innerText=`Save Result`}}async function Ii(e){if(!await D(`Delete Game Record`,`Are you sure you want to delete this game record? This cannot be undone.`))return;let{error:t}=await ue(e);if(t)return console.error(`Error deleting game:`,t),alert(`Failed to delete game: `+t.message);await $()}function Li(){let e=!0,t=!0,n=w(`activeFilterDataHistories`),r=n.has(`Normal only`),i=n.has(`Historical only`);r&&!i?(e=!0,t=!1):i&&!r&&(e=!1,t=!0);let a=w(`characters`);a.forEach(e=>{e.playCount=[0,0,0,0],e.lastPlayed=[`Never`,`Never`,`Never`,`Never`],e.winCount=[0,0,0,0]});let o=w(`games`);o&&o.forEach(n=>{let r=!!n.is_historical;r&&!t||!r&&!e||n.game_players.forEach(e=>{let t=parseInt(e.player_id?.substring(1)||`0`,10)-1;if(t>=0&&t<4){let r=a.find(t=>t.id===e.hero_id);if(!r)return;if(r.playCount[t]++,e.is_winner&&r.winCount[t]++,r.lastPlayed[t]===`Never`){let e=n.played_at||``;e&&!e.includes(`T`)&&(e=e.replace(` `,`T`)),e&&!e.includes(`Z`)&&!e.includes(`+`)&&(e+=`Z`);let i=new Date(e);r.lastPlayed[t]=i.getFullYear()<2026?`Unknown`:i.toLocaleDateString(`en-CA`)}}})})}window.alert=function(e){_e(e,e&&(e.toLowerCase().includes(`error`)||e.toLowerCase().includes(`failed`))?`error`:`warning`)};function K(){return w(`currentUser`)?.app_metadata?.role===`admin`}function Ri(){return!!w(`currentUser`)}function q(e){return w(`activeRollParticipants`).find(t=>t.pIdx===e)}var J=e=>e?`https://dice-throne.rulepop.com/heroes/${e}.webp`:``,Y=e=>`https://dice-throne.rulepop.com/#hero/${e}`,X=e=>!!e?.is_owned,Z=e=>String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),zi=e=>{if(!e)return`#ffffff`;if(e=e.trim(),e.startsWith(`#`))return e;let t=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(t){let e=parseInt(t[1],10),n=parseInt(t[2],10),r=parseInt(t[3],10);return`#${(1<<24|e<<16|n<<8|r).toString(16).slice(1)}`}return e},Bi=e=>e?.player_color?zi(e.player_color):zi(getComputedStyle(document.documentElement).getPropertyValue(`--${e?.id}`).trim()),Vi=(e,t)=>{document.documentElement.style.setProperty(`--${e}`,t)};function Q(e,t){return e.weights[t]/(e.playCount[t]*3+1)**2}function Hi(e,t,n,r,i){let a=[],o=[];return e.forEach(e=>{t.forEach((t,s)=>{if(t===e.name&&a.push({game_id:r,player_id:`p${s+1}`,hero_id:e.id,is_winner:null,team_id:n[`p${s+1}`]||null,last_updated_by:i}),s>=4)return;let c=t===e.name?20:(e.weights[s]||250)+10;o.push({hero_id:e.id,player_id:`p${s+1}`,weight:c,last_updated_by:i})})}),{gameParticipants:a,statsUpdates:o}}function Ui(e,t){if(!e)return`0.00%`;let n=w(`characters`).filter(X).length;if(n===0)return`0.00%`;if(t>=4)return`${(100/n).toFixed(2)}%`;let r=0;if(w(`characters`).filter(X).forEach(e=>r+=Q(e,t)),r===0)return`0.00%`;let i=X(e),a=Q(e,t);return`${i?(a/r*100).toFixed(2):`0.00`}%`}async function Wi(e,t){let n=w(`players`).find(t=>t.id===e);if(!n)return;let r=Bi(n),i=zi(t.value);if(i.toLowerCase()===r.toLowerCase())return;if(!await D(`Change Player Color`,`Change ${n.name}'s color from ${r} to ${i}?`)){t.value=r;return}let{error:a}=await y(e,i);if(a){alert(`Error saving player color: `+a.message),t.value=r;return}let o=w(`players`).findIndex(t=>t.id===e);o!==-1&&(w(`players`)[o].player_color=i),Vi(e,i),xi()}function Gi(e){if(!e)return null;try{let t=e.trim();t&&!t.includes(`T`)&&(t=t.replace(` `,`T`)),t&&t.includes(`:`)&&!t.includes(`Z`)&&!t.includes(`+`)&&(t+=`Z`);let n=new Date(t);return isNaN(n.getTime())?null:n}catch{return null}}function Ki(e){if(!e||e===`Never`)return``;if(e===`Unknown`)return`Date unknown (historical)`;let t=Gi(e);if(!t)return``;try{let e=new Date;t.setHours(0,0,0,0),e.setHours(0,0,0,0);let n=e-t,r=Math.floor(n/(1e3*60*60*24));return r<0?``:r===0?`today`:r===1?`yesterday`:`${r} days ago`}catch{return``}}function qi(e){let t=`⚫`;if(e&&e===`Unknown`)t=`🔴`;else if(e&&e!==`Never`&&e!==`Unknown`){let n=Gi(e);if(n)try{let e=new Date;n.setHours(0,0,0,0),e.setHours(0,0,0,0);let r=e-n,i=Math.floor(r/(1e3*60*60*24));t=i<=15?`🟢`:i<=60?`🟡`:`🔴`}catch{t=`⚪`}else t=`⚪`}return t}function Ji(){let e=(e,t)=>{let n=document.getElementById(e);n&&n.addEventListener(`click`,t)};e(`roll-final-btn`,hn),e(`cancelBtn`,Tn),e(`confirmBtn`,wn),e(`clear-search`,cr),e(`hero-search-btn`,lr),e(`btn-trigger-sort`,ir),e(`btn-trigger-filter`,Rn),e(`clear-games-search`,Ai),e(`btn-trigger-games-filter`,Ln);let t=document.getElementById(`randomizer-setup`);t&&(t.addEventListener(`change`,e=>{let t=e.target.closest(`#invitee-zone input[data-invitee-id]`);if(t&&!t.checked)return ht(t.dataset.inviteeId);e.target.closest(`#player-toggle-zone-top, #invitee-zone`)&&yt()}),t.addEventListener(`click`,e=>{if(e.target.closest(`[data-action="add-invitee"]`))return mt();let t=e.target.closest(`[data-action="select-game-type"]`);if(t&&!t.disabled)return vt(t.dataset.type);if(e.target.closest(`[data-action="randomize-teams"]`))return St();let n=e.target.closest(`[data-action="initiate-team-swap"]`);if(n)return Ct(n.dataset.participantId,n.dataset.team);let r=e.target.closest(`[data-action="complete-team-swap"]`);if(r)return Tt(r.dataset.participantId);let i=e.target.closest(`[data-action="select-roll-mode"]`);if(i&&!i.disabled)return bt(i.dataset.mode);let a=e.target.closest(`[data-action="select-draft-count"]`);if(a)return xt(parseInt(a.dataset.count,10))}));let n=document.getElementById(`team-swap-scrim`);n&&n.addEventListener(`click`,()=>wt()),document.querySelectorAll(`.bottom-nav .nav-item`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.getAttribute(`data-section`);n&&Zr(n)})});let r=document.getElementById(`version-number`);r&&r.addEventListener(`click`,()=>{ze(),qr()});let i=document.querySelector(`.close-button`);i&&i.addEventListener(`click`,Jr),e(`whats-new-close`,Xr),e(`whats-new-got-it`,Xr),e(`winner-close`,Pi),e(`winner-cancel`,Pi),e(`login-close`,Le),e(`forgot-password-btn`,Ve),e(`update-password-close`,Ue),e(`hero-select-close`,_n),e(`header-avatar-btn`,Re),e(`account-close`,ze);let a=document.getElementById(`hero-search`);a&&(a.addEventListener(`keydown`,e=>{e.key===`Enter`&&lr()}),a.addEventListener(`input`,sr));let o=document.getElementById(`games-search`);o&&o.addEventListener(`input`,ki);let s=document.getElementById(`hero-select-search`);s&&s.addEventListener(`input`,yn);let c=document.getElementById(`modal-sort-name`);c&&c.addEventListener(`click`,()=>vn(`name`));let l=document.getElementById(`modal-sort-weight`);l&&l.addEventListener(`click`,()=>vn(`weight`));let u=document.getElementById(`sort-filter-drawer`);u&&u.addEventListener(`click`,e=>{B(e)});let d=document.getElementById(`filter-drawer-left`);d&&d.addEventListener(`click`,e=>{let t=e.target.closest(`.segmented-pill[data-filter]`);if(t){let e=t.getAttribute(`data-filter`);e&&zn(e);return}Bn(e)}),e(`drawer-close`,()=>B(null,!0)),e(`drawer-reset`,Qn),e(`drawer-apply`,$n),e(`filter-drawer-close-btn`,Un),e(`filter-drawer-reset`,Hn),e(`filter-drawer-apply`,Un),e(`addGroupBtn`,bi),e(`saveGroupBtn`,hi);let f=document.getElementById(`cancelGroupBtn`);f&&f.addEventListener(`click`,async()=>{document.getElementById(`groupName`).value&&!await D(`Discard Changes`,`Discard unsaved changes?`)||yi()}),e(`addHeroBtn`,ci),e(`saveBtn`,ii);let p=document.getElementById(`cancelHeroBtn`);p&&p.addEventListener(`click`,async()=>{document.getElementById(`charName`).value&&!await D(`Discard Changes`,`Discard unsaved changes?`)||si()}),document.querySelectorAll(`#adminSection .panel-header`).forEach(e=>{e.addEventListener(`click`,t=>{let n=e.getAttribute(`data-panel`);n&&Qr(t,n)})});let m=document.getElementById(`login-form`);m&&m.addEventListener(`submit`,e=>{e.preventDefault(),Be()});let h=document.getElementById(`update-password-form`);h&&h.addEventListener(`submit`,e=>{e.preventDefault(),We()});let g=document.getElementById(`auth-btn`);g&&g.addEventListener(`click`,()=>{w(`currentUser`)?Ge():(ze(),Ie())});let _=document.getElementById(`confirm-winner-btn`);_&&_.addEventListener(`click`,()=>{let e=_.getAttribute(`data-game-id`);e&&Fi(e)});let v=document.getElementById(`sort-dropdown-menu`);v&&v.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="select-sort"]`);t&&or(t.getAttribute(`data-sort-key`),t.getAttribute(`data-sort-asc`)===`true`)});let y=document.getElementById(`filter-drawer-left`);y&&y.addEventListener(`change`,e=>{let t=e.target.closest(`input[type="checkbox"][data-type]`);t&&Vn(t)});let b=document.getElementById(`drawer-body-content`);b&&(b.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-drawer-player-filter"]`);if(n){Yn(parseInt(n.getAttribute(`data-player-idx`),10));return}let r=t.closest(`[data-action="toggle-staged-player-game-filter"]`);if(r){Gn(parseInt(r.getAttribute(`data-player-idx`),10));return}let i=t.closest(`[data-action="drawer-sort-player-change"]`);if(i){Jn(parseInt(i.getAttribute(`data-player-idx`),10));return}let a=t.closest(`[data-action="toggle-drawer-level"]`);if(a){if(a.getAttribute(`data-disabled`)===`true`)return;let e=a.getAttribute(`data-level`);Xn(e===`all`?`all`:parseInt(e,10));return}let o=t.closest(`[data-action="toggle-drawer-group"]`);if(o){if(o.getAttribute(`data-disabled`)===`true`)return;Zn(o.getAttribute(`data-group-id`));return}}),b.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-use-historical"]`);if(n){Kn(n.checked);return}let r=t.closest(`[data-action="toggle-staged-winner-only"]`);if(r){In(r.checked);return}let i=t.closest(`[data-action="drawer-sort-type-change"]`);if(i){qn(i.value);return}let a=t.closest(`[data-action="toggle-staged-ban"]`);if(a){En(a.getAttribute(`data-hero-id`));return}}),b.addEventListener(`input`,e=>{let t=e.target.closest(`[data-action="ban-search-input"]`);t&&Dn(t.value)}));let x=document.getElementById(`active-filters-container`);x&&x.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-action="clear-search-filter"]`)){fr();return}let n=t.closest(`[data-action="remove-filter-chip"]`);if(n){let e=n.getAttribute(`data-type`),t=n.getAttribute(`data-value`);e===`complexity`&&(t=parseInt(t,10)),dr(e,t);return}});let ee=document.getElementById(`results`);ee&&ee.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="open-hero-select"]`);if(n){gn(parseInt(n.getAttribute(`data-player-idx`),10));return}let r=t.closest(`[data-action="select-draft-candidate"]`);if(r){Pn(parseInt(r.getAttribute(`data-player-idx`),10),r.getAttribute(`data-hero-id`));return}if(t.closest(`[data-action="cancel-roll"]`)){Tn();return}let i=t.closest(`[data-action="confirm-draft"]`);if(i){Fn(parseInt(i.getAttribute(`data-player-idx`),10));return}});let te=document.getElementById(`hero-select-options-container`);te&&te.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="select-hero-option"]`);t&&bn(t.getAttribute(`data-hero-name`))});let ne=document.getElementById(`heroContainer`);ne&&ne.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="toggle-hero-panel"]`);if(t){if(e.target.closest(`a`)||e.target.closest(`.complexity-dice-bar`))return;$r(t)}});let re=document.getElementById(`groupsListContainer`);re&&re.addEventListener(`click`,e=>{let t=e.target,n=t.getAttribute(`data-group-id`);t.closest(`[data-action="edit-group"]`)?gi(n):t.closest(`[data-action="delete-group"]`)?Oi(n):t.closest(`[data-action="save-group-inline"]`)?vi(n):t.closest(`[data-action="cancel-group-edit"]`)&&_i(n)});let ie=document.getElementById(`heroesListContainer`);ie&&ie.addEventListener(`click`,e=>{let t=e.target;t.closest(`[data-action="edit-hero"]`)?ai(parseInt(t.getAttribute(`data-hero-idx`),10)):t.closest(`[data-action="delete-hero"]`)?mi(t.getAttribute(`data-hero-id`)):t.closest(`[data-action="save-hero-inline"]`)?pi(t.getAttribute(`data-hero-id`),parseInt(t.getAttribute(`data-hero-idx`),10)):t.closest(`[data-action="cancel-hero-edit"]`)&&fi()});let S=document.getElementById(`playersListContainer`);S&&(S.addEventListener(`click`,e=>{let t=e.target,n=t.getAttribute(`data-player-id`);t.closest(`[data-action="edit-player"]`)?Si(n):t.closest(`[data-action="save-player-inline"]`)?wi(n):t.closest(`[data-action="cancel-player-edit"]`)&&Ci(n)}),S.addEventListener(`change`,e=>{let t=e.target.closest(`[data-action="player-color-change"]`);t&&Wi(t.getAttribute(`data-player-id`),t)}));let C=document.getElementById(`usersListContainer`);C&&C.addEventListener(`change`,e=>{e.target.closest(`[data-action="user-role-change"]`)&&(alert(`User roles must be modified directly in the Supabase Dashboard for security reasons.`),Ti())});let ae=e=>{e&&(e.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-hero-owned"]`);if(n){ni(n.getAttribute(`data-hero-id`),n.getAttribute(`data-selected`)!==`true`);return}let r=t.closest(`[data-action="toggle-collection-group"]`);if(r){if(e.target.closest(`input[type="checkbox"]`)||e.target.closest(`label`))return;ei(r.getAttribute(`data-group-id`),e);return}}),e.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`[data-action="toggle-group-owned"]`);if(n){ri(n.getAttribute(`data-group-id`),n.checked);return}let r=t.closest(`[data-action="toggle-user-hero-owned"]`);if(r){Di(r.getAttribute(`data-user-id`),r.getAttribute(`data-hero-id`),r.checked);return}}))};ae(document.getElementById(`collectionsListContainer`)),ae(document.getElementById(`collectionContainer`));let oe=document.getElementById(`gamesSection`);oe&&oe.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-action="toggle-history-view-style"]`)){Mi();return}let n=t.closest(`[data-action="toggle-game-expansion"]`);if(n){ji(n.getAttribute(`data-game-id`));return}let r=t.closest(`[data-action="select-winner"]`);if(r){Ni(r.getAttribute(`data-game-id`));return}let i=t.closest(`[data-action="delete-game"]`);if(i){Ii(i.getAttribute(`data-game-id`));return}let a=t.closest(`[data-action="open-winner-modal"]`);if(a){Ni(a.getAttribute(`data-game-id`));return}});let se=document.getElementById(`winner-selection-container`);se&&se.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="winner-card-click"]`);if(t){let e=t.querySelector(`input[name="winner-selection"]`);if(e){e.checked=!0,se.querySelectorAll(`.winner-card, .winner-draw-card`).forEach(e=>{e.classList.toggle(`selected`,e===t)});let n=document.getElementById(`confirm-winner-btn`);n&&(n.disabled=!1)}}}),window.addEventListener(`click`,e=>{let t=document.getElementById(`changelog-modal`),n=document.getElementById(`login-modal`),r=document.getElementById(`whats-new-modal`),i=document.getElementById(`update-password-modal`),a=document.getElementById(`hero-select-modal`),o=document.getElementById(`account-modal`);e.target===t&&Jr(),e.target===n&&Le(),e.target===r&&Xr(),e.target===i&&Ue(),e.target===a&&_n(),e.target===o&&ze();let s=document.getElementById(`sort-dropdown-menu`),c=document.getElementById(`sort-dropdown-container`);s&&s.classList.contains(`show`)&&c&&!c.contains(e.target)&&ar()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&_n()})}async function $(){T(`draftModeEnabled`,localStorage.getItem(`draftModeEnabled`)===`true`);let e=parseInt(localStorage.getItem(`draftCount`)||`3`,10);[2,3,4,5].includes(e)||(e=3),T(`draftCount`,e);let t=localStorage.getItem(`bannedHeroIds`);T(`bannedHeroIds`,t?new Set(JSON.parse(t)):new Set),On();let{data:n,error:r}=await m();if(!r&&n){T(`groups`,n),li(),ui();let e=new Set(n.map(e=>e.id));if(w(`activeGroups`).size===0)n.forEach(e=>E(`activeGroups`,`add`,e.id));else for(let t of w(`activeGroups`))e.has(t)||E(`activeGroups`,`delete`,t);er(),ur()}let{data:i,error:a}=await h();if(!a&&i){T(`players`,i),i.forEach(e=>{e.player_color&&Vi(e.id,zi(e.player_color))});let e=i.map(e=>e.name),t=-1,n=w(`currentUser`);i.forEach((r,i)=>{i<6&&(e[i]=r.name,n&&r.user_id===n.id&&(t=i))}),T(`NAMES`,e),T(`loggedInPlayerIndex`,t),Pe(),Fe(),st()}let{data:o,error:s}=await g();if(s)return console.error(`Error fetching heroes:`,s);T(`characters`,o.map(e=>{let t=e.user_heroes?.find(e=>e.user_id===w(`currentUser`)?.id),n=t?t.is_owned:!0,r={id:e.id,name:e.name,slug:e.slug,complexity:e.complexity,group_id:e.group_id,is_owned:n,group:e.groups?.name||`Unknown`,weights:[,,,,].fill(250),playCount:[,,,,].fill(0),lastPlayed:[,,,,].fill(`Never`),winCount:[,,,,].fill(0)};return e.player_hero_stats?.forEach(e=>{let t=parseInt(e.player_id.substring(1))-1;t>=0&&t<4&&(r.weights[t]=e.weight)}),r}));let{data:c,error:l}=await _();l?console.error(`Error fetching games:`,l):T(`games`,c.map(e=>({...e,game_players:(e.game_players||[]).slice().sort((e,t)=>parseInt(e.player_id?.substring(1)||`0`,10)-parseInt(t.player_id?.substring(1)||`0`,10))}))),Kr(),ui(),G(),di(),xi(),Ti(),K()&&Ei(),W();let u=w(`currentSort`);T(`currentSort`,null),nr(u)}async function Yi(){try{let{data:{session:e}}=await f();T(`currentUser`,e?.user||null),Pe(),await $(),T(`cachedChangelog`,await(await fetch(`changelog.json`)).json());let t=w(`cachedChangelog`);if(t&&t.length>0){let e=t[0],n=document.getElementById(`version-number`);n&&(n.innerText=e.version);let r=localStorage.getItem(`lastSeenVersion`);if(r!==e.version){let n=t.findIndex(e=>e.version===r);Yr(n===-1?[e]:t.slice(0,n))}}de($),me((e,t)=>{console.log(`[stateStore] Update: ${e} =`,t)})}catch(e){console.error(`Could not load version number:`,e);let t=document.getElementById(`version-number`);t&&(t.innerText=`Error`)}finally{Xi()}}function Xi(){let e=document.getElementById(`preloader`);e&&(e.classList.add(`fade-out`),document.body.classList.add(`loaded`),e.addEventListener(`animationend`,()=>e.remove(),{once:!0}))}window.addEventListener(`DOMContentLoaded`,()=>{Ji(),Yi(),p((e,t)=>{T(`currentUser`,t?.user||null),(e===`SIGNED_IN`||e===`SIGNED_OUT`)&&$(),e===`PASSWORD_RECOVERY`&&He(),Pe(),e===`SIGNED_IN`&&Le()})});