-- Local development seed data.
--
-- Runs automatically after migrations on `supabase db reset`. Migrations create the empty
-- tables; this file puts rows in them so the app is usable on a fresh local stack.
--
-- Contents:
--   * A confirmed admin account (admin@local.test / password123) — the admin role lives in
--     auth app_metadata and cannot be granted from the client, so it has to be seeded here.
--   * Reference data (groups, heroes) mirroring the production catalogue. Hero names carry a
--     "LOC-" prefix so it is obvious at a glance that the app is on the local database.
--   * Placeholder players p1-p10, matching the shape the randomizer expects.
--   * Nine games with results, teams and weighted pick stats, covering every state the
--     History tab renders (each game_type, completed, awaiting result, draw, historical).
--
-- No production game history or real player names are copied here.

-- ---------------------------------------------------------------------------
-- Local admin account
-- ---------------------------------------------------------------------------

insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    -- These four are nullable with no default, but GoTrue scans them into non-nullable Go
    -- strings. Leaving them NULL makes every sign-in fail with "Database error querying
    -- schema", so they must be seeded as empty strings.
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@local.test',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "admin"}',
    '{}',
    '',
    '',
    '',
    ''
);

-- GoTrue requires a matching identity row before email/password sign-in will work.
insert into auth.identities (
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
) values (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'email',
    '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@local.test", "email_verified": true, "phone_verified": false}',
    now(),
    now(),
    now()
);

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

-- `last_updated_by` defaults to auth.uid(), which is NULL when seeding over psql, so every
-- insert below sets it to the seeded admin explicitly.

insert into public.groups (id, name, type, order_index, is_active, year, last_updated_by)
select v.id, v.name, v.type, v.order_index, v.is_active, v.year, '00000000-0000-0000-0000-000000000001'::uuid
from (values
    ('b6b9e7d4-4acd-4b7e-b804-8bab26342daa'::uuid, 'Season 1', 'season', 1, true, 2018),
    ('2fbc8576-a138-48c2-910e-5a49890d58a1'::uuid, 'Season 2', 'season', 2, true, 2018),
    ('6efe0fce-7dad-4108-b68c-a3298eb1c8f9'::uuid, 'Marvel', 'franchise', 3, true, 2022),
    ('441f74ea-531c-485b-add3-e72b6ec4c6f7'::uuid, 'Santa vs Krampus', null, 4, true, 2022),
    ('f5f5cf87-3a04-4d8c-8646-42b340065e80'::uuid, 'X-Men', 'franchise', 5, true, 2025),
    ('eb3901f7-72d5-4638-804a-15ea5533dd3a'::uuid, 'Outcasts', 'other', 6, true, 2025),
    ('3d9be94b-9d3b-45e2-8c88-d60d35501f0a'::uuid, 'Vanguard', null, 7, true, 2026),
    ('4ba52128-d007-472a-abaf-55d950cb100c'::uuid, 'Solo', null, 8, true, null)
) as v(id, name, type, order_index, is_active, year);

insert into public.heroes (id, name, slug, complexity, group_id, is_owned, last_updated_by)
select v.id, v.name, v.slug, v.complexity, v.group_id, v.is_owned, '00000000-0000-0000-0000-000000000001'::uuid
from (values
    ('02946c33-2c67-40ae-88c6-398a8b165e2b'::uuid, 'LOC-Alchemist', 'alchemist', 5, '4ba52128-d007-472a-abaf-55d950cb100c'::uuid, false),
    ('cd8fab6b-bcf4-4564-8167-6bcbece7c9a0', 'LOC-Artificer', 'artificer', 6, '2fbc8576-a138-48c2-910e-5a49890d58a1', true),
    ('23bba556-9dec-4e5e-9b85-cd319549edeb', 'LOC-Barbarian', 'barbarian', 1, 'b6b9e7d4-4acd-4b7e-b804-8bab26342daa', true),
    ('fbbe8779-9408-40d0-92e4-eb08d3737f73', 'LOC-Black Panther', 'black-panther', 2, '6efe0fce-7dad-4108-b68c-a3298eb1c8f9', true),
    ('a07fcb0b-80e4-4753-b31b-a01e817fd364', 'LOC-Black Widow', 'black-widow', 4, '6efe0fce-7dad-4108-b68c-a3298eb1c8f9', true),
    ('4fe8ec8d-ebdf-4943-a4c6-3567d76ac389', 'LOC-Captain Marvel', 'captain-marvel', 2, '6efe0fce-7dad-4108-b68c-a3298eb1c8f9', true),
    ('22fdd719-d891-40f3-8221-74f341bcf397', 'LOC-Cursed Pirate', 'cursed-pirate', 4, '2fbc8576-a138-48c2-910e-5a49890d58a1', true),
    ('4112579a-47d9-40fe-9d6e-78b873d0816c', 'LOC-Cyclops', 'cyclops', 4, 'f5f5cf87-3a04-4d8c-8646-42b340065e80', true),
    ('1b41dc8d-c325-43fa-8a68-815a200ad24d', 'LOC-Deadpool', 'deadpool', 3, '4ba52128-d007-472a-abaf-55d950cb100c', true),
    ('47e12a5c-9bf1-4d02-af8b-18473f7ddfbf', 'LOC-Doctor Strange', 'doctor-strange', 5, '6efe0fce-7dad-4108-b68c-a3298eb1c8f9', true),
    ('d0bbf09c-0b6d-47de-b91b-04ba9db2d0d1', 'LOC-Druid', 'druid', 4, '3d9be94b-9d3b-45e2-8c88-d60d35501f0a', true),
    ('e15e0978-cbca-4f8e-80a4-caeb9e56ba6e', 'LOC-Duelist', 'duelist', 3, '3d9be94b-9d3b-45e2-8c88-d60d35501f0a', true),
    ('796db339-3113-4ab7-9e46-fc35cb999078', 'LOC-Forgemaster', 'forgemaster', 4, '3d9be94b-9d3b-45e2-8c88-d60d35501f0a', true),
    ('fa02aac9-84bc-44c2-bae5-6970b9213b28', 'LOC-Gambit', 'gambit', 6, 'f5f5cf87-3a04-4d8c-8646-42b340065e80', true),
    ('4a3d7e5a-1576-4f7c-bf8f-b7beb22b7788', 'LOC-Gunslinger', 'gunslinger', 2, '2fbc8576-a138-48c2-910e-5a49890d58a1', true),
    ('132f0fb6-7bff-4d45-803a-f6243fc4a0c9', 'LOC-Headless Horseman', 'headless-horseman', 4, 'eb3901f7-72d5-4638-804a-15ea5533dd3a', true),
    ('1980afad-d2ca-49c0-8f3d-43956fe210b3', 'LOC-Huntress', 'huntress', 5, '2fbc8576-a138-48c2-910e-5a49890d58a1', true),
    ('cf118864-5d5f-4fbd-9861-a8070a285041', 'LOC-Iceman', 'iceman', 4, 'f5f5cf87-3a04-4d8c-8646-42b340065e80', true),
    ('9d84fe2d-58bc-4a8d-bee0-e912c87a206f', 'LOC-Jean Grey', 'jean-grey', 6, 'f5f5cf87-3a04-4d8c-8646-42b340065e80', true),
    ('7ee25be3-16fc-4838-91f7-e1b6cab7ec87', 'LOC-Krampus', 'krampus', 4, '441f74ea-531c-485b-add3-e72b6ec4c6f7', true),
    ('6fa128da-01dd-4d26-8752-5383e3175cb7', 'LOC-Loki', 'loki', 4, '6efe0fce-7dad-4108-b68c-a3298eb1c8f9', true),
    ('3941482b-fff7-49fb-97e5-a98a079f514f', 'LOC-Monk', 'monk', 4, 'b6b9e7d4-4acd-4b7e-b804-8bab26342daa', true),
    ('a907dceb-9a2c-45dc-89cc-e04fc3a5597c', 'LOC-Moon Elf', 'moon-elf', 2, 'b6b9e7d4-4acd-4b7e-b804-8bab26342daa', true),
    ('361a1650-08ce-4d07-bd4b-4c8672422151', 'LOC-Mystic Brawler', 'mystic-brawler', 3, '4ba52128-d007-472a-abaf-55d950cb100c', true),
    ('93b64562-7073-42f7-8030-9cef5862096d', 'LOC-Necromancer', 'necromancer', 6, 'eb3901f7-72d5-4638-804a-15ea5533dd3a', true),
    ('020e96b0-f308-49cf-9cff-f88e409d9b44', 'LOC-Ninja', 'ninja', 2, 'b6b9e7d4-4acd-4b7e-b804-8bab26342daa', true),
    ('f18b8a6f-1b4c-421e-9f04-ea7ca198780f', 'LOC-Paladin', 'paladin', 5, 'b6b9e7d4-4acd-4b7e-b804-8bab26342daa', true),
    ('755aaffc-8a91-4bb5-a906-9fd9e0b0566b', 'LOC-Pale Lady', 'pale-lady', 3, 'eb3901f7-72d5-4638-804a-15ea5533dd3a', true),
    ('f892d95e-e5a2-4efd-95ec-b91abac955d6', 'LOC-Psylocke', 'psylocke', 3, 'f5f5cf87-3a04-4d8c-8646-42b340065e80', true),
    ('fc542f85-ad4d-4aec-b43f-8e69f08d4f5e', 'LOC-Pyromancer', 'pyromancer', 3, 'b6b9e7d4-4acd-4b7e-b804-8bab26342daa', true),
    ('99b7b3f8-b2d2-4644-8fb6-7034e42fbb47', 'LOC-Raveness', 'raveness', 3, 'eb3901f7-72d5-4638-804a-15ea5533dd3a', true),
    ('cf9cd662-6154-415d-8f41-409bf56c2286', 'LOC-Rogue', 'rogue', 3, 'f5f5cf87-3a04-4d8c-8646-42b340065e80', true),
    ('2533fa1c-5d13-499b-adfa-793274f481b4', 'LOC-Samurai', 'samurai', 3, '2fbc8576-a138-48c2-910e-5a49890d58a1', true),
    ('4f331c3c-1438-41b9-8e8c-19e997ae9c88', 'LOC-Santa', 'santa', 2, '441f74ea-531c-485b-add3-e72b6ec4c6f7', true),
    ('a485fb92-2513-4b1d-afd7-b802dd4e673f', 'LOC-Scarlet Witch', 'scarlet-witch', 4, '6efe0fce-7dad-4108-b68c-a3298eb1c8f9', true),
    ('514099f2-6c2f-4b54-8f36-4d001716e297', 'LOC-Seraph', 'seraph', 3, '2fbc8576-a138-48c2-910e-5a49890d58a1', true),
    ('93825b90-582a-4fed-bdf0-384b118d05f2', 'LOC-Shadow Thief', 'shadow-thief', 5, 'b6b9e7d4-4acd-4b7e-b804-8bab26342daa', true),
    ('0b0feee7-e65b-4cae-8f52-4b26cdbe8e28', 'LOC-Spider-Man', 'spider-man', 2, '6efe0fce-7dad-4108-b68c-a3298eb1c8f9', true),
    ('a04abefd-0743-462a-b0f2-0167c0022481', 'LOC-Storm', 'storm', 4, 'f5f5cf87-3a04-4d8c-8646-42b340065e80', true),
    ('503fa689-8bb7-49e9-80db-dd17b8038e4d', 'LOC-Sun Elf', 'sun-elf', 3, '3d9be94b-9d3b-45e2-8c88-d60d35501f0a', true),
    ('75f17c71-d4d2-43e6-b1e0-1286e5be8712', 'LOC-Tactician', 'tactician', 5, '2fbc8576-a138-48c2-910e-5a49890d58a1', true),
    ('cb67b960-7ba2-4073-8512-f581e57ec235', 'LOC-Thor', 'thor', 3, '6efe0fce-7dad-4108-b68c-a3298eb1c8f9', true),
    ('1ad3d343-d955-4c9b-a513-556d34383faf', 'LOC-Treant', 'treant', 6, 'b6b9e7d4-4acd-4b7e-b804-8bab26342daa', true),
    ('2bc7b558-5a34-40e0-ac86-159ac335298f', 'LOC-Vampire Lord', 'vampire-lord', 4, '2fbc8576-a138-48c2-910e-5a49890d58a1', true),
    ('585ed156-5155-4df7-9760-172fe1a4306f', 'LOC-Wolverine', 'wolverine', 2, 'f5f5cf87-3a04-4d8c-8646-42b340065e80', true)
) as v(id, name, slug, complexity, group_id, is_owned);

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------

-- p1-p4 are the tracked players the randomizer weights (MAX_WEIGHTED_PLAYERS = 4);
-- p5-p10 are the invitee placeholders that carry no weighted stats.
insert into public.players (id, name, user_id, last_updated_by, player_color)
select v.id, v.name, null, '00000000-0000-0000-0000-000000000001'::uuid, v.player_color
from (values
    ('p1', 'Player 1', '#e05c5c'),
    ('p2', 'Player 2', '#5c9ae0'),
    ('p3', 'Player 3', '#5ce08a'),
    ('p4', 'Player 4', '#e0c15c'),
    ('p5', 'Invitee 1', '#a2a2a2'),
    ('p6', 'Invitee 2', '#a2a2a2'),
    ('p7', 'Invitee 3', '#a2a2a2'),
    ('p8', 'Invitee 4', '#a2a2a2'),
    ('p9', 'Invitee 5', '#a2a2a2'),
    ('p10', 'Invitee 6', '#a2a2a2')
) as v(id, name, player_color);

-- ---------------------------------------------------------------------------
-- Game history
-- ---------------------------------------------------------------------------

-- Nine games covering every state the History tab can render: each game_type in the
-- games_game_type_check constraint ('duel', 'ffa', 'koth', '2v2', '3v3'), a completed game, a
-- game still awaiting a result, a draw, and a historical entry. played_at is spread over the
-- last four months so date ordering and the history/non-history filters have something to sort.
--
-- Result states are encoded in game_players.is_winner, per isGameAwaitingResult() in utils.js:
--   * one row true, rest false  -> completed
--   * every row NULL            -> awaiting result (the state a fresh roll lands in)
--   * every row false           -> draw

insert into public.games (id, played_at, game_type, is_historical, last_updated_by)
select v.id, v.played_at::timestamp, v.game_type, v.is_historical, '00000000-0000-0000-0000-000000000001'::uuid
from (values
    ('11111111-1111-4111-8111-000000000001'::uuid, now() - interval '1 day',    'duel', false),  -- awaiting result
    ('11111111-1111-4111-8111-000000000002'::uuid, now() - interval '2 days',   'duel', false),
    ('11111111-1111-4111-8111-000000000003'::uuid, now() - interval '5 days',   'duel', false),  -- draw
    ('11111111-1111-4111-8111-000000000004'::uuid, now() - interval '9 days',   'duel', false),
    ('11111111-1111-4111-8111-000000000005'::uuid, now() - interval '16 days',  'ffa',  false),
    ('11111111-1111-4111-8111-000000000006'::uuid, now() - interval '23 days',  'koth', false),
    ('11111111-1111-4111-8111-000000000007'::uuid, now() - interval '30 days',  '2v2',  false),
    ('11111111-1111-4111-8111-000000000008'::uuid, now() - interval '37 days',  '3v3',  false),
    ('11111111-1111-4111-8111-000000000009'::uuid, now() - interval '120 days', 'duel', true)    -- historical
) as v(id, played_at, game_type, is_historical);

-- Teams exist only for the 2v2 and 3v3 games; team_label is constrained to 'A' or 'B'.
insert into public.teams (id, game_id, team_label, is_winner, last_updated_by)
select v.id, v.game_id, v.team_label, v.is_winner, '00000000-0000-0000-0000-000000000001'::uuid
from (values
    ('22222222-2222-4222-8222-000000000001'::uuid, '11111111-1111-4111-8111-000000000007'::uuid, 'A', true),
    ('22222222-2222-4222-8222-000000000002'::uuid, '11111111-1111-4111-8111-000000000007'::uuid, 'B', false),
    ('22222222-2222-4222-8222-000000000003'::uuid, '11111111-1111-4111-8111-000000000008'::uuid, 'A', false),
    ('22222222-2222-4222-8222-000000000004'::uuid, '11111111-1111-4111-8111-000000000008'::uuid, 'B', true)
) as v(id, game_id, team_label, is_winner);

insert into public.game_players (game_id, player_id, hero_id, is_winner, team_id, last_updated_by)
select v.game_id, v.player_id, v.hero_id, v.is_winner, v.team_id, '00000000-0000-0000-0000-000000000001'::uuid
from (values
    -- Game 1 — duel, awaiting result (Krampus vs Santa)
    ('11111111-1111-4111-8111-000000000001'::uuid, 'p1', '7ee25be3-16fc-4838-91f7-e1b6cab7ec87'::uuid, null::boolean, null::uuid),
    ('11111111-1111-4111-8111-000000000001', 'p2', '4f331c3c-1438-41b9-8e8c-19e997ae9c88', null, null),

    -- Game 2 — duel, p1 wins
    ('11111111-1111-4111-8111-000000000002', 'p1', '23bba556-9dec-4e5e-9b85-cd319549edeb', true,  null),
    ('11111111-1111-4111-8111-000000000002', 'p2', 'a907dceb-9a2c-45dc-89cc-e04fc3a5597c', false, null),

    -- Game 3 — duel, draw (no winner, everyone explicitly not a winner)
    ('11111111-1111-4111-8111-000000000003', 'p3', '3941482b-fff7-49fb-97e5-a98a079f514f', false, null),
    ('11111111-1111-4111-8111-000000000003', 'p4', '93825b90-582a-4fed-bdf0-384b118d05f2', false, null),

    -- Game 4 — duel, p2 wins
    ('11111111-1111-4111-8111-000000000004', 'p2', '020e96b0-f308-49cf-9cff-f88e409d9b44', true,  null),
    ('11111111-1111-4111-8111-000000000004', 'p3', 'f18b8a6f-1b4c-421e-9f04-ea7ca198780f', false, null),

    -- Game 5 — free-for-all, four tracked players, p3 wins
    ('11111111-1111-4111-8111-000000000005', 'p1', 'fc542f85-ad4d-4aec-b43f-8e69f08d4f5e', false, null),
    ('11111111-1111-4111-8111-000000000005', 'p2', '1ad3d343-d955-4c9b-a513-556d34383faf', false, null),
    ('11111111-1111-4111-8111-000000000005', 'p3', '2533fa1c-5d13-499b-adfa-793274f481b4', true,  null),
    ('11111111-1111-4111-8111-000000000005', 'p4', '4a3d7e5a-1576-4f7c-bf8f-b7beb22b7788', false, null),

    -- Game 6 — king of the hill, includes an invitee (p5), p2 wins
    ('11111111-1111-4111-8111-000000000006', 'p1', '514099f2-6c2f-4b54-8f36-4d001716e297', false, null),
    ('11111111-1111-4111-8111-000000000006', 'p2', '22fdd719-d891-40f3-8221-74f341bcf397', true,  null),
    ('11111111-1111-4111-8111-000000000006', 'p3', 'cb67b960-7ba2-4073-8512-f581e57ec235', false, null),
    ('11111111-1111-4111-8111-000000000006', 'p4', '6fa128da-01dd-4d26-8752-5383e3175cb7', false, null),
    ('11111111-1111-4111-8111-000000000006', 'p5', '0b0feee7-e65b-4cae-8f52-4b26cdbe8e28', false, null),

    -- Game 7 — 2v2, team A wins. Per-player is_winner mirrors the team result, matching how
    -- apiService records team games so per-hero stats keep working.
    ('11111111-1111-4111-8111-000000000007', 'p1', 'fbbe8779-9408-40d0-92e4-eb08d3737f73', true,  '22222222-2222-4222-8222-000000000001'),
    ('11111111-1111-4111-8111-000000000007', 'p2', 'a04abefd-0743-462a-b0f2-0167c0022481', true,  '22222222-2222-4222-8222-000000000001'),
    ('11111111-1111-4111-8111-000000000007', 'p3', '585ed156-5155-4df7-9760-172fe1a4306f', false, '22222222-2222-4222-8222-000000000002'),
    ('11111111-1111-4111-8111-000000000007', 'p4', '4112579a-47d9-40fe-9d6e-78b873d0816c', false, '22222222-2222-4222-8222-000000000002'),

    -- Game 8 — 3v3, team B wins, uses two invitees to fill six seats
    ('11111111-1111-4111-8111-000000000008', 'p1', '9d84fe2d-58bc-4a8d-bee0-e912c87a206f', false, '22222222-2222-4222-8222-000000000003'),
    ('11111111-1111-4111-8111-000000000008', 'p2', 'cf9cd662-6154-415d-8f41-409bf56c2286', false, '22222222-2222-4222-8222-000000000003'),
    ('11111111-1111-4111-8111-000000000008', 'p3', 'fa02aac9-84bc-44c2-bae5-6970b9213b28', false, '22222222-2222-4222-8222-000000000003'),
    ('11111111-1111-4111-8111-000000000008', 'p4', 'cf118864-5d5f-4fbd-9861-a8070a285041', true,  '22222222-2222-4222-8222-000000000004'),
    ('11111111-1111-4111-8111-000000000008', 'p5', 'f892d95e-e5a2-4efd-95ec-b91abac955d6', true,  '22222222-2222-4222-8222-000000000004'),
    ('11111111-1111-4111-8111-000000000008', 'p6', '1b41dc8d-c325-43fa-8a68-815a200ad24d', true,  '22222222-2222-4222-8222-000000000004'),

    -- Game 9 — historical entry, p1 wins
    ('11111111-1111-4111-8111-000000000009', 'p1', '2bc7b558-5a34-40e0-ac86-159ac335298f', true,  null),
    ('11111111-1111-4111-8111-000000000009', 'p2', '1980afad-d2ca-49c0-8f3d-43956fe210b3', false, null)
) as v(game_id, player_id, hero_id, is_winner, team_id);

-- Weighted pick stats for the four tracked players (invitees never accumulate stats). A hero
-- that was just played drops to PICKED_HERO_WEIGHT (20); unplayed heroes drift up from
-- DEFAULT_HERO_WEIGHT (250) in WEIGHT_INCREMENT (10) steps, so the mix below gives the
-- randomizer a realistic spread rather than a uniform one.
insert into public.player_hero_stats (player_id, hero_id, play_count, weight, last_played, last_updated_by)
select v.player_id, v.hero_id, v.play_count, v.weight, v.last_played::date, '00000000-0000-0000-0000-000000000001'::uuid
from (values
    ('p1', '23bba556-9dec-4e5e-9b85-cd319549edeb'::uuid, 3, 20,  now() - interval '2 days'),
    ('p1', 'fc542f85-ad4d-4aec-b43f-8e69f08d4f5e', 1, 260, now() - interval '16 days'),
    ('p1', 'fbbe8779-9408-40d0-92e4-eb08d3737f73', 2, 20,  now() - interval '30 days'),
    ('p1', '9d84fe2d-58bc-4a8d-bee0-e912c87a206f', 1, 280, now() - interval '37 days'),
    ('p1', '2bc7b558-5a34-40e0-ac86-159ac335298f', 4, 290, now() - interval '120 days'),
    ('p1', '514099f2-6c2f-4b54-8f36-4d001716e297', 1, 270, now() - interval '23 days'),

    ('p2', 'a907dceb-9a2c-45dc-89cc-e04fc3a5597c', 2, 20,  now() - interval '2 days'),
    ('p2', '020e96b0-f308-49cf-9cff-f88e409d9b44', 5, 20,  now() - interval '9 days'),
    ('p2', '1ad3d343-d955-4c9b-a513-556d34383faf', 1, 260, now() - interval '16 days'),
    ('p2', '22fdd719-d891-40f3-8221-74f341bcf397', 3, 250, now() - interval '23 days'),
    ('p2', 'a04abefd-0743-462a-b0f2-0167c0022481', 1, 300, now() - interval '30 days'),
    ('p2', 'cf9cd662-6154-415d-8f41-409bf56c2286', 2, 280, now() - interval '37 days'),

    ('p3', 'f18b8a6f-1b4c-421e-9f04-ea7ca198780f', 2, 20,  now() - interval '9 days'),
    ('p3', '2533fa1c-5d13-499b-adfa-793274f481b4', 4, 20,  now() - interval '16 days'),
    ('p3', '3941482b-fff7-49fb-97e5-a98a079f514f', 1, 250, now() - interval '5 days'),
    ('p3', 'cb67b960-7ba2-4073-8512-f581e57ec235', 2, 270, now() - interval '23 days'),
    ('p3', '585ed156-5155-4df7-9760-172fe1a4306f', 1, 290, now() - interval '30 days'),

    ('p4', '4a3d7e5a-1576-4f7c-bf8f-b7beb22b7788', 3, 20,  now() - interval '16 days'),
    ('p4', '93825b90-582a-4fed-bdf0-384b118d05f2', 1, 250, now() - interval '5 days'),
    ('p4', '6fa128da-01dd-4d26-8752-5383e3175cb7', 2, 260, now() - interval '23 days'),
    ('p4', '4112579a-47d9-40fe-9d6e-78b873d0816c', 1, 280, now() - interval '30 days'),
    ('p4', 'cf118864-5d5f-4fbd-9861-a8070a285041', 2, 20,  now() - interval '37 days')
) as v(player_id, hero_id, play_count, weight, last_played);
