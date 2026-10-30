-- Migration 023: hostname policy + campaign version bounds (extension parity)

ALTER TABLE bsplus_remote_config_global ADD COLUMN hostname_policy_json TEXT;

ALTER TABLE bsplus_remote_config_campaigns ADD COLUMN min_version TEXT;
ALTER TABLE bsplus_remote_config_campaigns ADD COLUMN max_version TEXT;
