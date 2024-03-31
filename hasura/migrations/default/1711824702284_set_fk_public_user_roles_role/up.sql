alter table "public"."user_roles"
  add constraint "user_roles_role_fkey"
  foreign key ("role")
  references "public"."roles"
  ("value") on update restrict on delete restrict;
