-- Migration 025: Remote theme overlay application mode + multi-layer packages

ALTER TABLE bsplus_remote_theme_packages
  ADD COLUMN application_mode TEXT NOT NULL DEFAULT 'replace'
    CHECK (application_mode IN ('replace', 'overlay'));

ALTER TABLE bsplus_remote_theme_packages
  ADD COLUMN overlay_layers_json TEXT;

ALTER TABLE bsplus_remote_theme_packages
  ADD COLUMN overlay_hints_json TEXT;
