// =============================================================================
// TPAC — Core Enums
// Keep in sync with packages/database/prisma/schema.prisma
// =============================================================================

export enum Role {
  SUPER_ADMIN     = "SUPER_ADMIN",
  ADMIN           = "ADMIN",
  MANAGER         = "MANAGER",
  CORPORATE_ADMIN = "CORPORATE_ADMIN",
  MENTOR          = "MENTOR",
  MEMBER          = "MEMBER",
}

export enum AccountStatus {
  PENDING   = "PENDING",
  ACTIVE    = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED   = "DELETED",
}

export enum CountryStatus {
  DRAFT       = "DRAFT",
  COMING_SOON = "COMING_SOON",
  ACTIVE      = "ACTIVE",
  INACTIVE    = "INACTIVE",
}

export enum TierSlot {
  EXPLORER  = "EXPLORER",
  BUILDER   = "BUILDER",
  FOUNDER   = "FOUNDER",
  CORPORATE = "CORPORATE",
  DIASPORA  = "DIASPORA",
}

export enum ProfileType {
  ENTREPRENEUR = "ENTREPRENEUR",
  ALUMNI       = "ALUMNI",
}

export enum ProgrammePhase {
  APPLICATION = "APPLICATION",
  SELECTION   = "SELECTION",
  ACTIVE      = "ACTIVE",
  DEMO_DAY    = "DEMO_DAY",
  GRADUATED   = "GRADUATED",
}

export enum ContentType {
  COURSE      = "COURSE",
  WORKSHOP    = "WORKSHOP",
  CERTIFICATE = "CERTIFICATE",
}

export enum EventType {
  PUBLIC    = "PUBLIC",
  MEMBER    = "MEMBER",
  COHORT    = "COHORT",
  CORPORATE = "CORPORATE",
}

export enum OpportunityType {
  JOB               = "JOB",
  GIG               = "GIG",
  FUNDING           = "FUNDING",
  PARTNER_CHALLENGE = "PARTNER_CHALLENGE",
}

export enum SessionStatus {
  PENDING   = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum SubscriptionStatus {
  TRIAL     = "TRIAL",
  ACTIVE    = "ACTIVE",
  CANCELLED = "CANCELLED",
  EXPIRED   = "EXPIRED",
}

export enum PaymentStatus {
  PENDING  = "PENDING",
  PAID     = "PAID",
  FAILED   = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PostStatus {
  PUBLISHED = "PUBLISHED",
  DRAFT     = "DRAFT",
  FLAGGED   = "FLAGGED",
  REMOVED   = "REMOVED",
}

export enum RegistrationMode {
  INVITE_ONLY        = "INVITE_ONLY",
  SELF_REGISTER      = "SELF_REGISTER",
  SELF_REGISTER_AUTO = "SELF_REGISTER_AUTO",
}
