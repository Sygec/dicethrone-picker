drop policy "Enable DELETE for authenticated" on "public"."player_hero_stats";

drop policy "Enable INSERT for creators" on "public"."player_hero_stats";

alter table "public"."players" drop constraint "players_user_id_key";

alter table "public"."players" drop constraint "players_user_id_fkey";

drop index if exists "public"."players_user_id_key";

alter table "public"."players" add constraint "players_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE not valid;

alter table "public"."players" validate constraint "players_user_id_fkey";


  create policy "Enable INSERT for authenticated"
  on "public"."player_hero_stats"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() IS NOT NULL));



