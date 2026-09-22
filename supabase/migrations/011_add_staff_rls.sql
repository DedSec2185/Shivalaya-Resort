-- Allow anyone (including anonymous login screen) to select active staff profiles
CREATE POLICY anon_read_staff ON staff
  FOR SELECT TO anon USING(is_active = true);
