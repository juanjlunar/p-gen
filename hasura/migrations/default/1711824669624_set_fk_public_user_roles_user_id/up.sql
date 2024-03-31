alter table "public"."user_roles"
  add constraint "user_roles_user_id_fkey"
  foreign key ("user_id")
  references "public"."users"
  ("id") on update restrict on delete restrict;
