-- Enable RLS on designers table
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to approved designers only
CREATE POLICY "Public can view approved designers" ON public.designers
    FOR SELECT
    USING (is_approved = true);

-- Policy 2: Allow designers to view their own profile
CREATE POLICY "Designers can view own profile" ON public.designers
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 3: Allow designers to update their own profile
CREATE POLICY "Designers can update own profile" ON public.designers
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow new designer registrations (INSERT)
CREATE POLICY "Anyone can register as designer" ON public.designers
    FOR INSERT
    WITH CHECK (true);

-- Policy 5: Service role bypass (for admin operations)
CREATE POLICY "Service role has full access" ON public.designers
    USING (auth.role() = 'service_role');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_designers_approved ON public.designers(is_approved);
CREATE INDEX IF NOT EXISTS idx_designers_id ON public.designers(id);