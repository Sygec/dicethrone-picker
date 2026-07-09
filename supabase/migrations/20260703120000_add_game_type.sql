alter table "public"."games" add column "game_type" text;

alter table "public"."games" add constraint "games_game_type_check"
  check (game_type in ('duel', 'ffa', 'koth', '2v2', '3v3'));

update "public"."games" g
set game_type = case
  when (select count(*) from "public"."game_players" gp where gp.game_id = g.id) = 2 then 'duel'
  when (select count(*) from "public"."game_players" gp where gp.game_id = g.id) > 2 then 'koth'
end;
