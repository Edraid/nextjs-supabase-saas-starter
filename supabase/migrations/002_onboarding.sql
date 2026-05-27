-- ============================================================
-- Migration 002: Redirect new users to onboarding
-- ============================================================
-- After login, check if user has completed onboarding.
-- If not, middleware redirects to /onboarding.
-- This migration adds nothing to the schema — onboarding_completed
-- is already in the profiles table (migration 001).
-- This file documents the middleware logic for reference.
-- ============================================================

-- Check in middleware.ts:
-- If user is authenticated AND onboarding_completed = false
-- AND pathname doesn't start with /onboarding → redirect to /onboarding

-- To query in server component:
-- const { data: profile } = await supabase
--   .from('profiles')
--   .select('onboarding_completed')
--   .eq('id', user.id)
--   .single()
-- if (!profile?.onboarding_completed) redirect('/onboarding')

-- RLS: profiles table already has policy "profiles: own"
-- which allows users to update their own onboarding_completed flag.
