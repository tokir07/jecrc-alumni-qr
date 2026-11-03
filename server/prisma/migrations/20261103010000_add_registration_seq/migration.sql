CREATE SEQUENCE IF NOT EXISTS alumni_registration_seq;

-- Safely synchronize sequence to current maximum numeric suffix in alumni_registrations
DO $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT MAX(CAST(SUBSTRING("registrationId" FROM '[0-9]+$') AS INTEGER))
  INTO max_num
  FROM "alumni_registrations";

  IF max_num IS NOT NULL AND max_num > 0 THEN
    PERFORM setval('alumni_registration_seq', max_num + 1, false);
  ELSE
    PERFORM setval('alumni_registration_seq', 1, false);
  END IF;
END $$;

