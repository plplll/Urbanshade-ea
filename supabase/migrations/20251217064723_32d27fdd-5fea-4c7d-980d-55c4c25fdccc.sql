-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  subject text NOT NULL,
  body text NOT NULL CHECK (char_length(body) <= 750),
  priority text DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  read_at timestamptz DEFAULT NULL
);

-- Create rate limiting table
CREATE TABLE public.message_rate_limits (
  user_id uuid PRIMARY KEY,
  message_count integer DEFAULT 0,
  window_start timestamptz DEFAULT now(),
  blocked_until timestamptz DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_rate_limits ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read received messages" ON public.messages
  FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "Recipients can update messages" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete messages" ON public.messages
  FOR DELETE USING (auth.uid() = recipient_id);

-- Rate limit policies
CREATE POLICY "Users can view own rate limit" ON public.message_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limit" ON public.message_rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limit" ON public.message_rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to check rate limit and send message
CREATE OR REPLACE FUNCTION public.check_and_send_message(
  p_recipient_id uuid,
  p_subject text,
  p_body text,
  p_priority text DEFAULT 'normal'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id uuid;
  v_rate_record RECORD;
  v_pending_count integer;
  v_result jsonb;
BEGIN
  v_sender_id := auth.uid();
  
  IF v_sender_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check body length
  IF char_length(p_body) > 750 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message too long (max 750 characters)');
  END IF;

  -- Get or create rate limit record
  SELECT * INTO v_rate_record FROM message_rate_limits WHERE user_id = v_sender_id;
  
  -- Check if user is blocked
  IF v_rate_record.blocked_until IS NOT NULL AND v_rate_record.blocked_until > now() THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'rate_limited',
      'blocked_until', v_rate_record.blocked_until
    );
  END IF;
  
  -- Check pending message count (max 3)
  SELECT COUNT(*) INTO v_pending_count FROM messages 
  WHERE sender_id = v_sender_id AND read_at IS NULL;
  
  IF v_pending_count >= 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Too many pending messages (max 3 unread)');
  END IF;
  
  -- Check rate (15 messages per 5 minutes)
  IF v_rate_record IS NULL OR v_rate_record.window_start < now() - interval '5 minutes' THEN
    -- Reset window
    INSERT INTO message_rate_limits (user_id, message_count, window_start, blocked_until)
    VALUES (v_sender_id, 1, now(), NULL)
    ON CONFLICT (user_id) DO UPDATE SET message_count = 1, window_start = now(), blocked_until = NULL;
  ELSIF v_rate_record.message_count >= 15 THEN
    -- Block for 1 hour
    UPDATE message_rate_limits 
    SET blocked_until = now() + interval '1 hour'
    WHERE user_id = v_sender_id;
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'rate_limited',
      'blocked_until', now() + interval '1 hour'
    );
  ELSE
    -- Increment count
    UPDATE message_rate_limits 
    SET message_count = message_count + 1
    WHERE user_id = v_sender_id;
  END IF;

  -- Send the message
  INSERT INTO messages (sender_id, recipient_id, subject, body, priority)
  VALUES (v_sender_id, p_recipient_id, p_subject, p_body, p_priority);
  
  RETURN jsonb_build_object('success', true);
END;
$$;