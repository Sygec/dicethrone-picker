-- Drop the restrictive policy
drop policy if exists "Users can manage their own collection" on "public"."user_heroes";

-- Create a new policy that allows users to manage their own collection AND admins to manage all collections
create policy "Users and admins can manage collections"
on "public"."user_heroes"
for all
to authenticated
using (
    auth.uid() = user_id or 
    (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
)
with check (
    auth.uid() = user_id or 
    (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
);

alter publication supabase_realtime add table "public"."user_heroes";