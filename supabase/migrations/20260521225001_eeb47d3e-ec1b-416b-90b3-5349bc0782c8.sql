
create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'shiftsync-daily-reminder') then
    perform cron.unschedule('shiftsync-daily-reminder');
  end if;
  if exists (select 1 from cron.job where jobname = 'shiftsync-weekly-reminder') then
    perform cron.unschedule('shiftsync-weekly-reminder');
  end if;
end $$;

select cron.schedule(
  'shiftsync-daily-reminder',
  '*/5 * * * *',
  $$
  select net.http_post(
    url:='https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app/api/public/hooks/send-daily-reminder',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzc3Blcnd5ZnRhbXRzZXVvanFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzAzNjEsImV4cCI6MjA5NDkwNjM2MX0.gdTNmHXJ5PQXDvwtUSvYnyE_h2unuol6tXMJnf1TQ6M"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

select cron.schedule(
  'shiftsync-weekly-reminder',
  '*/5 * * * *',
  $$
  select net.http_post(
    url:='https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app/api/public/hooks/send-weekly-reminder',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzc3Blcnd5ZnRhbXRzZXVvanFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzAzNjEsImV4cCI6MjA5NDkwNjM2MX0.gdTNmHXJ5PQXDvwtUSvYnyE_h2unuol6tXMJnf1TQ6M"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
