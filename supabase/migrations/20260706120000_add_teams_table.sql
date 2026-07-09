
  create table "public"."teams" (
    "id" uuid not null default gen_random_uuid(),
    "game_id" uuid not null,
    "team_label" text not null,
    "is_winner" boolean default false,
    "last_updated_by" uuid not null default auth.uid()
      );


alter table "public"."teams" enable row level security;

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX teams_game_id_team_label_key ON public.teams USING btree (game_id, team_label);

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."teams" add constraint "teams_game_id_team_label_key" UNIQUE using index "teams_game_id_team_label_key";

alter table "public"."teams" add constraint "teams_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE not valid;

alter table "public"."teams" validate constraint "teams_game_id_fkey";

alter table "public"."teams" add constraint "teams_last_updated_by_fkey" FOREIGN KEY (last_updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."teams" validate constraint "teams_last_updated_by_fkey";

alter table "public"."teams" add constraint "teams_team_label_check" check (team_label in ('A', 'B'));

alter table "public"."game_players" add column "team_id" uuid;

alter table "public"."game_players" add constraint "game_players_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE not valid;

alter table "public"."game_players" validate constraint "game_players_team_id_fkey";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";


  create policy "Admins have full access"
  on "public"."teams"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Enable DELETE for authenticated"
  on "public"."teams"
  as permissive
  for delete
  to authenticated
using ((last_updated_by = auth.uid()));



  create policy "Enable INSERT for creators"
  on "public"."teams"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = last_updated_by));



  create policy "Enable UPDATE for creators"
  on "public"."teams"
  as permissive
  for update
  to authenticated
using ((last_updated_by = auth.uid()))
with check ((last_updated_by = auth.uid()));



  create policy "Enable read access for all users"
  on "public"."teams"
  as permissive
  for select
  to public
using (true);
