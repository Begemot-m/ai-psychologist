alter table conversations
  add column summary text,
  add column summarized_through_message_count integer not null default 0;
