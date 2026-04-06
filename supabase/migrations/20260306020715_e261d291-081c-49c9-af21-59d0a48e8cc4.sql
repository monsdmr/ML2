-- Create transactions table to track PIX payments
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT,
  sigmapay_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'pix',
  customer_name TEXT,
  customer_email TEXT,
  customer_document TEXT,
  pix_code TEXT,
  pix_qr_code_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Public read policy (transactions are looked up by hash, no auth)
CREATE POLICY "Transactions are readable by hash"
  ON public.transactions FOR SELECT
  USING (true);

-- Allow inserts and updates (edge functions use service role)
CREATE POLICY "Allow insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update transactions"
  ON public.transactions FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();