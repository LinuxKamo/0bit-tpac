// =============================================================================
// TPAC — Permissions
// Granular actions that map to real operations in the platform.
// =============================================================================

export const PERMISSIONS = {

  // ── Super Admin ────────────────────────────────────────────────────────────
  ADD_ADMIN:            "add_admin",
  MANAGE_PLATFORM:      "manage_platform",
  VIEW_AUDIT_LOGS:      "view_audit_logs",
  MANAGE_FEATURE_FLAGS: "manage_feature_flags",
  MANAGE_INTEGRATIONS:  "manage_integrations",

  // ── Admin ──────────────────────────────────────────────────────────────────
  MANAGE_COUNTRIES:     "manage_countries",
  MANAGE_TIERS:         "manage_tiers",
  MANAGE_PRICING:       "manage_pricing",
  ADD_MANAGER:          "add_manager",
  VIEW_ALL_MEMBERS:     "view_all_members",
  MANAGE_CORPORATE:     "manage_corporate",
  VIEW_REVENUE:         "view_revenue",
  VIEW_ANALYTICS:       "view_analytics",
  BROADCAST_COMMS:      "broadcast_comms",

  // ── Manager ────────────────────────────────────────────────────────────────
  MANAGE_MEMBERS:       "manage_members",
  MANAGE_COMMUNITY:     "manage_community",
  MANAGE_PROGRAMMES:    "manage_programmes",
  MANAGE_COHORTS:       "manage_cohorts",
  MANAGE_MENTORSHIP:    "manage_mentorship",
  MANAGE_CONTENT:       "manage_content",
  MANAGE_EVENTS:        "manage_events",
  MANAGE_OPPORTUNITIES: "manage_opportunities",
  SEND_COMMS:           "send_comms",
  HANDLE_SUPPORT:       "handle_support",
  ASSIGN_MENTOR:        "assign_mentor",
  UPLOAD_CERTIFICATES:  "upload_certificates",

  // ── Corporate Admin ────────────────────────────────────────────────────────
  MANAGE_ORG_TEAM:      "manage_org_team",
  VIEW_ORG_REPORTS:     "view_org_reports",
  MANAGE_ORG_BILLING:   "manage_org_billing",

  // ── Mentor ─────────────────────────────────────────────────────────────────
  VIEW_MENTEES:         "view_mentees",
  MANAGE_SESSIONS:      "manage_sessions",
  VIEW_COHORT_BRIEFS:   "view_cohort_briefs",

  // ── Member (all tiers) ─────────────────────────────────────────────────────
  VIEW_DASHBOARD:       "view_dashboard",
  ACCESS_COMMUNITY:     "access_community",
  ACCESS_LEARN:         "access_learn",
  ACCESS_MENTORSHIP:    "access_mentorship",
  ACCESS_OPPORTUNITIES: "access_opportunities",
  ACCESS_EVENTS:        "access_events",
  ACCESS_PROGRAMMES:    "access_programmes",
  BOOK_PHYSICAL_ACCESS: "book_physical_access",
  REQUEST_MENTOR:       "request_mentor",

} as const;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
