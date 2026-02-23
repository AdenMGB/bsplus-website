-- Migration 006: Extension themes (BetterSEQTA) now use same approval flow as DesQTA
-- No schema changes. Application logic updated so BetterSEQTA themes are created with
-- status='pending' and theme_submissions.status='pending', requiring admin approval
-- via POST /api/admin/themes/[id]/approve (same as DesQTA themes).
-- Previously BetterSEQTA themes were auto-approved on creation.
SELECT 1;
