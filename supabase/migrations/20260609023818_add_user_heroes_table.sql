
  create table "public"."user_heroes" (
    "user_id" uuid not null default auth.uid(),
    "hero_id" uuid not null,
    "is_owned" boolean not null default true
      );


alter table "public"."user_heroes" enable row level security;

CREATE UNIQUE INDEX user_heroes_pkey ON public.user_heroes USING btree (user_id, hero_id);

alter table "public"."user_heroes" add constraint "user_heroes_pkey" PRIMARY KEY using index "user_heroes_pkey";

alter table "public"."user_heroes" add constraint "user_heroes_hero_id_fkey" FOREIGN KEY (hero_id) REFERENCES public.heroes(id) ON DELETE CASCADE not valid;

alter table "public"."user_heroes" validate constraint "user_heroes_hero_id_fkey";

alter table "public"."user_heroes" add constraint "user_heroes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_heroes" validate constraint "user_heroes_user_id_fkey";

grant delete on table "public"."user_heroes" to "anon";

grant insert on table "public"."user_heroes" to "anon";

grant references on table "public"."user_heroes" to "anon";

grant select on table "public"."user_heroes" to "anon";

grant trigger on table "public"."user_heroes" to "anon";

grant truncate on table "public"."user_heroes" to "anon";

grant update on table "public"."user_heroes" to "anon";

grant delete on table "public"."user_heroes" to "authenticated";

grant insert on table "public"."user_heroes" to "authenticated";

grant references on table "public"."user_heroes" to "authenticated";

grant select on table "public"."user_heroes" to "authenticated";

grant trigger on table "public"."user_heroes" to "authenticated";

grant truncate on table "public"."user_heroes" to "authenticated";

grant update on table "public"."user_heroes" to "authenticated";

grant delete on table "public"."user_heroes" to "service_role";

grant insert on table "public"."user_heroes" to "service_role";

grant references on table "public"."user_heroes" to "service_role";

grant select on table "public"."user_heroes" to "service_role";

grant trigger on table "public"."user_heroes" to "service_role";

grant truncate on table "public"."user_heroes" to "service_role";

grant update on table "public"."user_heroes" to "service_role";


  create policy "Users can manage their own collection"
  on "public"."user_heroes"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



