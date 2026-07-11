-- ============================================================
-- 011 — Rename a personal-name login to a role name
--
-- The login usernames were personal names, which leaked who works here
-- (the login screen even listed them as a hint). Rename the one remaining
-- personal-name account to a role. Passwords and the audit trail are keyed
-- on user id, so nothing else has to change and history stays attributed.
-- ============================================================

UPDATE users
   SET username = 'workshop', display_name = 'Workshop'
 WHERE username = 'lalon';
