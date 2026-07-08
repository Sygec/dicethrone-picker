insert into public.players (id, name, user_id, last_updated_by, player_color)
select v.id, v.name, null, (select last_updated_by from public.players where id = 'p5'), '#a2a2a2'
from (values
    ('p7', 'Invitee 3'),
    ('p8', 'Invitee 4'),
    ('p9', 'Invitee 5'),
    ('p10', 'Invitee 6')
) as v(id, name);
