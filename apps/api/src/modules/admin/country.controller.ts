import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError }   from "../../utils/appError.js";

// ── List countries ─────────────────────────────────────────────────────────────

export const listCountries = catchAsync(async (_req: Request, res: Response) => {
  const countries = await prisma.country.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          members:  true,
          managers: true,
          tiers:    true,
        },
      },
    },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { countries } });
});

// ── Get single country ─────────────────────────────────────────────────────────

export const getCountry = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const country = await prisma.country.findUnique({
    where:   { id },
    include: {
      tiers:   { orderBy: { sortOrder: "asc" } },
      _count:  { select: { members: true, managers: true } },
    },
  });

  if (!country) throw new AppError("Country not found", HttpStatus.NOT_FOUND);

  return res.status(HttpStatus.OK).json({ status: "success", data: { country } });
});

// ── Create country (Step 1 — Identity) ────────────────────────────────────────
// Creates a DRAFT country. Subsequent wizard steps call PATCH.

export const createCountry = catchAsync(async (req: Request, res: Response) => {
  const { name, code, currency, currencySymbol, timezone, flagEmoji } = req.body;

  if (!name || !code || !currency || !timezone)
    throw new AppError("name, code, currency, and timezone are required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.country.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) throw new AppError(`Country code ${code.toUpperCase()} already exists`, HttpStatus.CONFLICT);

  const country = await prisma.country.create({
    data: {
      name,
      code:           code.toUpperCase(),
      currency:       currency.toUpperCase(),
      currencySymbol: currencySymbol ?? null,
      timezone,
      flagEmoji:      flagEmoji ?? null,
      status:         "DRAFT",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId:     req.user!.userId,
      action:     "country.create",
      entityType: "country",
      entityId:   country.id,
      newValue:   { name, code: country.code, currency: country.currency },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({ status: "success", data: { country } });
});

// ── Update country (Steps 3-6, and general edits) ─────────────────────────────

export const updateCountry = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const country = await prisma.country.findUnique({ where: { id } });
  if (!country) throw new AppError("Country not found", HttpStatus.NOT_FOUND);

  // Whitelist updatable fields — never let status change through this endpoint
  const {
    name, currency, currencySymbol, timezone, flagEmoji,
    physicalAccessEnabled, physicalLocation, physicalAddress,
    chapterName, chapterLeadId, showGlobalContent,
    complianceFramework, taxConfigJson, invoiceTemplateId,
    waitlistMessage, onboardingMessage, registrationMode,
    paymentGateway, paymentConfigJson,
  } = req.body;

  const old = { ...country };

  const updated = await prisma.country.update({
    where: { id },
    data: {
      ...(name              !== undefined && { name }),
      ...(currency          !== undefined && { currency: currency.toUpperCase() }),
      ...(currencySymbol    !== undefined && { currencySymbol }),
      ...(timezone          !== undefined && { timezone }),
      ...(flagEmoji         !== undefined && { flagEmoji }),
      ...(physicalAccessEnabled !== undefined && { physicalAccessEnabled }),
      ...(physicalLocation  !== undefined && { physicalLocation }),
      ...(physicalAddress   !== undefined && { physicalAddress }),
      ...(chapterName       !== undefined && { chapterName }),
      ...(chapterLeadId     !== undefined && { chapterLeadId }),
      ...(showGlobalContent   !== undefined && { showGlobalContent }),
      ...(complianceFramework !== undefined && { complianceFramework }),
      ...(taxConfigJson     !== undefined && { taxConfigJson }),
      ...(invoiceTemplateId !== undefined && { invoiceTemplateId }),
      ...(waitlistMessage   !== undefined && { waitlistMessage }),
      ...(onboardingMessage !== undefined && { onboardingMessage }),
      ...(registrationMode  !== undefined && { registrationMode }),
      ...(paymentGateway    !== undefined && { paymentGateway }),
      ...(paymentConfigJson !== undefined && { paymentConfigJson }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId:     req.user!.userId,
      action:     "country.update",
      entityType: "country",
      entityId:   id,
      countryId:  id,
      oldValue:   old,
      newValue:   req.body,
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", data: { country: updated } });
});

// ── Update country status ──────────────────────────────────────────────────────

export const updateCountryStatus = catchAsync(async (req: Request, res: Response) => {
  const { id }     = req.params;
  const { status } = req.body;

  const valid = ["DRAFT", "COMING_SOON", "ACTIVE", "INACTIVE"];
  if (!valid.includes(status))
    throw new AppError("Invalid status. Must be DRAFT | COMING_SOON | ACTIVE | INACTIVE", HttpStatus.BAD_REQUEST);

  const country = await prisma.country.findUnique({ where: { id } });
  if (!country) throw new AppError("Country not found", HttpStatus.NOT_FOUND);

  // Guard: cannot activate a country that has no tiers configured
  if (status === "ACTIVE") {
    const tierCount = await prisma.countryTier.count({
      where: { countryId: id, isActive: true },
    });
    if (tierCount === 0)
      throw new AppError(
        "Cannot activate a country with no active tiers. Configure tiers first.",
        HttpStatus.BAD_REQUEST,
      );
  }

  const updated = await prisma.country.update({
    where: { id },
    data:  { status },
  });

  await prisma.auditLog.create({
    data: {
      userId:     req.user!.userId,
      action:     "country.status",
      entityType: "country",
      entityId:   id,
      countryId:  id,
      oldValue:   { status: country.status },
      newValue:   { status },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", data: { country: updated } });
});

// ── Upsert tiers for a country (Step 2) ───────────────────────────────────────
// Receives array of tier configs. Creates or updates each TierSlot for this country.

export const upsertCountryTiers = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tiers } = req.body; // TierConfig[]

  const country = await prisma.country.findUnique({ where: { id } });
  if (!country) throw new AppError("Country not found", HttpStatus.NOT_FOUND);

  if (!Array.isArray(tiers) || tiers.length === 0)
    throw new AppError("tiers array is required", HttpStatus.BAD_REQUEST);

  const VALID_SLOTS = ["EXPLORER", "BUILDER", "FOUNDER", "CORPORATE", "DIASPORA"];

  const results = await Promise.all(
    tiers.map((t: any) => {
      if (!VALID_SLOTS.includes(t.slot))
        throw new AppError(`Invalid tier slot: ${t.slot}`, HttpStatus.BAD_REQUEST);

      return prisma.countryTier.upsert({
        where:  { countryId_slot: { countryId: id, slot: t.slot } },
        create: {
          countryId:    id,
          slot:         t.slot,
          name:         t.name          ?? t.slot,
          description:  t.description   ?? null,
          price:        t.price         ?? 0,
          billingCycle: t.billingCycle  ?? "monthly",
          isActive:     t.isActive      ?? true,
          isRecommended: t.isRecommended ?? false,
          sortOrder:    t.sortOrder      ?? 0,
          featuresJson: t.features       ?? null,
          guestDaysPerMonth: t.guestDaysPerMonth ?? null,
        },
        update: {
          name:          t.name         ?? undefined,
          description:   t.description  ?? undefined,
          price:         t.price        !== undefined ? t.price : undefined,
          billingCycle:  t.billingCycle ?? undefined,
          isActive:      t.isActive     !== undefined ? t.isActive : undefined,
          isRecommended: t.isRecommended !== undefined ? t.isRecommended : undefined,
          sortOrder:     t.sortOrder    !== undefined ? t.sortOrder : undefined,
          featuresJson:  t.features     ?? undefined,
          guestDaysPerMonth: t.guestDaysPerMonth !== undefined ? t.guestDaysPerMonth : undefined,
        },
      });
    }),
  );

  await prisma.auditLog.create({
    data: {
      userId:     req.user!.userId,
      action:     "country.tiers.upsert",
      entityType: "country",
      entityId:   id,
      countryId:  id,
      newValue:   { slots: tiers.map((t: any) => t.slot) },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", data: { tiers: results } });
});

// ── Get country tiers ──────────────────────────────────────────────────────────

export const getCountryTiers = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const tiers = await prisma.countryTier.findMany({
    where:   { countryId: id },
    orderBy: { sortOrder: "asc" },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { tiers } });
});
