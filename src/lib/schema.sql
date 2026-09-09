-- ============================================================
-- Orbit Analytics Dashboard — PostgreSQL Schema
-- Run this once against your Neon / Supabase database
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users & Auth ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Admin','Editor','Viewer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Profile (one per user) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  job_title     TEXT NOT NULL DEFAULT '',
  company       TEXT NOT NULL DEFAULT '',
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  bio           TEXT NOT NULL DEFAULT '',
  currency      TEXT NOT NULL DEFAULT 'USD',
  language      TEXT NOT NULL DEFAULT 'en-US',
  date_format   TEXT NOT NULL DEFAULT 'MMM DD, YYYY',
  fiscal_year   TEXT NOT NULL DEFAULT 'January',
  default_view  TEXT NOT NULL DEFAULT 'Overview',
  refresh_rate  TEXT NOT NULL DEFAULT '60',
  theme         TEXT NOT NULL DEFAULT 'Dark',
  notifications JSONB NOT NULL DEFAULT '{"email":true,"slack":false,"browser":false,"weekly":true,"monthly":true,"alerts":true}'
);

-- ── Dashboard KPI metrics ────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id       TEXT PRIMARY KEY,
  label    TEXT NOT NULL,
  value    TEXT NOT NULL,
  change   TEXT NOT NULL,
  trend    TEXT NOT NULL DEFAULT 'up' CHECK (trend IN ('up','down','neutral')),
  icon     TEXT NOT NULL DEFAULT 'TrendingUp',
  color    TEXT NOT NULL DEFAULT 'brand'
);

-- ── Time series data ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_series (
  id          SERIAL PRIMARY KEY,
  date        TEXT NOT NULL,
  revenue     INTEGER NOT NULL DEFAULT 0,
  users       INTEGER NOT NULL DEFAULT 0,
  sessions    INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0
);

-- ── Traffic sources ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS traffic_sources (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#15b382'
);

-- ── Top pages ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS top_pages (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page             TEXT NOT NULL,
  views            INTEGER NOT NULL DEFAULT 0,
  unique_visitors  INTEGER NOT NULL DEFAULT 0,
  bounce_rate      INTEGER NOT NULL DEFAULT 0,
  avg_time         TEXT NOT NULL DEFAULT '0m 00s',
  status           TEXT NOT NULL DEFAULT 'stable' CHECK (status IN ('growing','stable','declining'))
);

-- ── Funnel stages ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS funnel_stages (
  id         SERIAL PRIMARY KEY,
  stage      TEXT NOT NULL,
  value      INTEGER NOT NULL DEFAULT 0,
  pct        NUMERIC(5,1) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ── Activity events ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type       TEXT NOT NULL CHECK (type IN ('signup','upgrade','churn','alert')),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Alerts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  severity    TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('critical','warning','info','resolved')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','snoozed')),
  metric      TEXT NOT NULL DEFAULT '',
  value       TEXT NOT NULL DEFAULT '',
  threshold   TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Alert rules ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_rules (
  id      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name    TEXT NOT NULL,
  trigger TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'Email',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── Team members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name   TEXT NOT NULL,
  email  TEXT NOT NULL,
  role   TEXT NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Admin','Editor','Viewer')),
  avatar TEXT NOT NULL DEFAULT '',
  online BOOLEAN NOT NULL DEFAULT FALSE
);

-- ── Scheduled reports ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name      TEXT NOT NULL,
  freq      TEXT NOT NULL,
  last_sent TEXT NOT NULL DEFAULT 'Never',
  status    TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused')),
  type      TEXT NOT NULL DEFAULT 'kpi'
);

-- ── Integrations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name      TEXT NOT NULL,
  desc      TEXT NOT NULL DEFAULT '',
  logo      TEXT NOT NULL DEFAULT '',
  connected BOOLEAN NOT NULL DEFAULT FALSE,
  category  TEXT NOT NULL DEFAULT ''
);

-- ── Support tickets ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id  TEXT NOT NULL UNIQUE,
  message    TEXT NOT NULL,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Demo admin user (password: demo1234)
-- bcrypt hash of "demo1234" with 10 rounds
INSERT INTO users (id, name, email, password_hash, role)
VALUES
  ('u1', 'Alex Kim',     'alex@orbit.io',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Admin'),
  ('u2', 'Sara Tadesse', 'sara@orbit.io',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Editor'),
  ('u3', 'Demo User',    'demo@orbit.io',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Viewer')
ON CONFLICT (id) DO NOTHING;

-- Profiles for demo users
INSERT INTO profiles (user_id, first_name, last_name, job_title, company, timezone, bio, currency)
VALUES
  ('u1', 'Alex', 'Kim',     'Head of Growth', 'Orbit Inc.', 'Africa/Addis_Ababa', 'SaaS growth lead tracking KPIs and conversion metrics.', 'ETB'),
  ('u2', 'Sara', 'Tadesse', 'Product Manager','Orbit Inc.', 'Africa/Addis_Ababa', 'Product manager focused on user growth and retention.', 'ETB'),
  ('u3', 'Demo', 'User',    'Viewer',         'Orbit Inc.', 'UTC',                'Demo account for exploring the dashboard.', 'USD')
ON CONFLICT (user_id) DO NOTHING;

-- KPI metrics
INSERT INTO kpi_metrics (id, label, value, change, trend, icon, color) VALUES
  ('mrr',      'Monthly Revenue',   'ETB 84,320', '+12.5%',  'up', 'DollarSign',  'brand'),
  ('users',    'Active Users',      '24,091',     '+8.2%',   'up', 'Users',       'blue'),
  ('sessions', 'Total Sessions',    '183,421',    '+3.7%',   'up', 'Activity',    'purple'),
  ('churn',    'Churn Rate',        '2.4%',       '-0.6%',   'up', 'TrendingDown','red'),
  ('arpu',     'Avg Revenue / User','ETB 3.50',   '+4.1%',   'up', 'BarChart2',   'amber'),
  ('nps',      'NPS Score',         '72',         '+5 pts',  'up', 'Star',        'teal')
ON CONFLICT (id) DO NOTHING;

-- Traffic sources
INSERT INTO traffic_sources (name, value, color) VALUES
  ('Organic Search', 38, '#15b382'),
  ('Direct',         24, '#3b82f6'),
  ('Social Media',   18, '#a855f7'),
  ('Referral',       12, '#f59e0b'),
  ('Email',           8, '#ef4444')
ON CONFLICT DO NOTHING;

-- Top pages
INSERT INTO top_pages (id, page, views, unique_visitors, bounce_rate, avg_time, status) VALUES
  ('p1', '/dashboard',            42310, 18920, 18, '4m 22s', 'growing'),
  ('p2', '/pricing',              31204, 14480, 34, '2m 45s', 'growing'),
  ('p3', '/features',             24891, 11230, 27, '3m 10s', 'stable'),
  ('p4', '/blog/getting-started', 18340, 16010, 42, '5m 03s', 'growing'),
  ('p5', '/docs',                 14200,  9840, 22, '6m 18s', 'stable'),
  ('p6', '/integrations',          9830,  7210, 31, '2m 55s', 'declining'),
  ('p7', '/changelog',             6120,  5440, 58, '1m 34s', 'stable')
ON CONFLICT (id) DO NOTHING;

-- Funnel stages
INSERT INTO funnel_stages (stage, value, pct, sort_order) VALUES
  ('Visitors',  183421, 100.0, 1),
  ('Sign-ups',   24091,  13.1, 2),
  ('Activated',  14455,   7.9, 3),
  ('Paying',      7632,   4.2, 4),
  ('Retained',    5881,   3.2, 5)
ON CONFLICT DO NOTHING;

-- Activity events
INSERT INTO events (id, type, message, created_at) VALUES
  ('e1', 'upgrade', 'Acme Corp upgraded to Enterprise plan',    NOW() - INTERVAL '2 minutes'),
  ('e2', 'signup',  '47 new signups from ProductHunt campaign', NOW() - INTERVAL '14 minutes'),
  ('e3', 'alert',   'API latency spike detected (p99 > 800ms)', NOW() - INTERVAL '31 minutes'),
  ('e4', 'signup',  'StartupXYZ completed onboarding',          NOW() - INTERVAL '1 hour'),
  ('e5', 'churn',   'BuildFast downgraded to free tier',        NOW() - INTERVAL '2 hours'),
  ('e6', 'upgrade', 'DataFlow Inc added 12 team seats',         NOW() - INTERVAL '3 hours'),
  ('e7', 'alert',   'Daily email digest sent to 8,240 users',   NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- Alerts
INSERT INTO alerts (id, title, description, severity, status, metric, value, threshold, created_at) VALUES
  ('a1','API Latency Spike',        'p99 latency exceeded 800ms for 3 consecutive minutes.', 'critical','active',   'p99 Latency',   '843ms',      '> 800ms',  NOW() - INTERVAL '31 minutes'),
  ('a2','Churn Rate Elevated',      '7-day churn rate is trending above baseline by 0.8%.',  'warning', 'active',   'Churn Rate',    '3.2%',       '> 2.5%',   NOW() - INTERVAL '2 hours'),
  ('a3','Conversion Drop',          'Daily conversions fell 12% below the 7-day moving avg.','warning', 'active',   'Conversions',   '287',        '< 300',    NOW() - INTERVAL '4 hours'),
  ('a4','New High — Daily Revenue', 'Today''s revenue hit an all-time high of ETB 56,956.',  'info',    'active',   'Daily Revenue', 'ETB 56,956', 'Record',   NOW() - INTERVAL '6 hours'),
  ('a5','Disk Usage Warning',       'Database disk usage reached 78%. Consider scaling.',    'warning', 'snoozed',  'Disk Usage',    '78%',        '> 75%',    NOW() - INTERVAL '1 day'),
  ('a6','Error Rate Spike Resolved','Error rate returned to normal after deploy rollback.',  'resolved','resolved', 'Error Rate',    '0.2%',       'Resolved', NOW() - INTERVAL '2 days'),
  ('a7','New User Milestone',       'Active user count crossed 24,000 — up 8.2% this month.','info',   'resolved', 'Active Users',  '24,091',     'Milestone',NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Alert rules
INSERT INTO alert_rules (id, name, trigger, channel, enabled) VALUES
  ('r1','Latency Alert',    'p99 > 800ms',    'Slack + Email', TRUE),
  ('r2','Churn Threshold',  'Churn > 2.5%',   'Email',         TRUE),
  ('r3','Revenue Milestone','Daily > record',  'Slack',         TRUE),
  ('r4','Error Rate Spike', 'Errors > 1%',    'PagerDuty',     FALSE),
  ('r5','Low Conversion',   'Conv < 300/day', 'Email',         TRUE)
ON CONFLICT (id) DO NOTHING;

-- Team members
INSERT INTO team_members (id, name, email, role, avatar, online) VALUES
  ('t1','Alex Kim',    'alex@orbit.io',  'Admin',  'AK', TRUE),
  ('t2','Sara Tadesse','sara@orbit.io',  'Editor', 'ST', TRUE),
  ('t3','Yonas Bekele','yonas@orbit.io', 'Viewer', 'YB', FALSE),
  ('t4','Liya Haile',  'liya@orbit.io',  'Editor', 'LH', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Scheduled reports
INSERT INTO scheduled_reports (id, name, freq, last_sent, status, type) VALUES
  ('sr1','Weekly KPI Digest',      'Every Monday',    'Sep 2, 2026',  'active', 'kpi'),
  ('sr2','Monthly Revenue Report', '1st of month',    'Sep 1, 2026',  'active', 'revenue'),
  ('sr3','User Churn Analysis',    'Every Sunday',    'Sep 7, 2026',  'active', 'users'),
  ('sr4','Traffic Summary',        'Every Wednesday', 'Sep 4, 2026',  'paused', 'sessions')
ON CONFLICT (id) DO NOTHING;

-- Integrations
INSERT INTO integrations (id, name, desc, logo, connected, category) VALUES
  ('i1','Slack',            'Receive alerts in your Slack channel',   '💬', TRUE,  'Communication'),
  ('i2','Google Analytics', 'Import GA4 event and traffic data',      '📊', TRUE,  'Analytics'),
  ('i3','Stripe',           'Sync revenue and subscription metrics',  '💳', FALSE, 'Payments'),
  ('i4','Mixpanel',         'Import product analytics events',        '🔬', FALSE, 'Analytics'),
  ('i5','PagerDuty',        'Route critical alerts to on-call team',  '🚨', FALSE, 'Alerts'),
  ('i6','Segment',          'Centralise your customer data pipeline', '⚡', TRUE,  'Data')
ON CONFLICT (id) DO NOTHING;
