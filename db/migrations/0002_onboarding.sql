alter table users
  add column onboarding_completed_at timestamptz,
  add column recommended_module_id text references modules(id);
