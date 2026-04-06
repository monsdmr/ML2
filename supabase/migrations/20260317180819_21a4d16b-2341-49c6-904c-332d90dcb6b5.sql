-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Transactions are readable by hash" ON public.transactions;

-- SELECT: deny from client-side roles (service_role bypasses RLS)
CREATE POLICY "Select denied for clients"
  ON public.transactions FOR SELECT
  TO anon, authenticated
  USING (false);

-- INSERT: deny from client-side roles
CREATE POLICY "Insert denied for clients"
  ON public.transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- UPDATE: deny from client-side roles
CREATE POLICY "Update denied for clients"
  ON public.transactions FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);