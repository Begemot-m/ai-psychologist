insert into modules (id, title, approach, kb_namespace) values
  ('burnout_match', 'Спичка', 'cbt', 'burnout'),
  ('self_esteem_gestalt', 'Опора', 'gestalt', 'self_esteem')
on conflict (id) do nothing;
