-- Create KYC Journey Logs table for tracking complete onboarding flow
CREATE TABLE IF NOT EXISTS public.kyc_journey_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyc_journey_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own journey logs
CREATE POLICY "Users can read own journey logs"
  ON public.kyc_journey_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own journey logs
CREATE POLICY "Users can insert own journey logs"
  ON public.kyc_journey_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all journey logs
CREATE POLICY "Admins can read all journey logs"
  ON public.kyc_journey_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_kyc_journey_logs_user_id ON public.kyc_journey_logs(user_id);
CREATE INDEX idx_kyc_journey_logs_client_id ON public.kyc_journey_logs(client_id);
CREATE INDEX idx_kyc_journey_logs_event_type ON public.kyc_journey_logs(event_type);
CREATE INDEX idx_kyc_journey_logs_created_at ON public.kyc_journey_logs(created_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.kyc_journey_logs;