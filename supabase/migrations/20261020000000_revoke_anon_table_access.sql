-- The app only reads and writes data as a signed-in user (RLS scopes every row to its owner), so the anonymous role
-- needs no table access. Revoking it also keeps the tables out of the public GraphQL schema.
revoke all on all tables in schema public from anon;

alter default privileges for role postgres in schema public revoke all on tables from anon;
