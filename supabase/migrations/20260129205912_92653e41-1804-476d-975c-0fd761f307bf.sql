-- Create survey_responses table for storing all survey data
CREATE TABLE public.survey_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_type TEXT NOT NULL CHECK (survey_type IN ('landlord', 'tenant')),
    responses JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed BOOLEAN NOT NULL DEFAULT false,
    
    -- Contact info for pilot interest
    name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Metadata
    source TEXT,
    location TEXT
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policy for public insertions (anyone can submit surveys)
CREATE POLICY "Anyone can submit survey responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

-- Create admin users table for dashboard access
CREATE TABLE public.admin_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can read their own record
CREATE POLICY "Admins can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- Admins can read all survey responses
CREATE POLICY "Admins can view all survey responses" 
ON public.survey_responses 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_survey_responses_type ON public.survey_responses(survey_type);
CREATE INDEX idx_survey_responses_created ON public.survey_responses(created_at DESC);