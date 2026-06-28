import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { Role } from "@repo/database";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/appError.js";
import { sendInviteEmail } from "../../services/mail.service.js";

// ── Admin dashboard ────────────────────────────────────────────────────────────

export const adminDashboard = catchAsync(
  async (_req: Request, res: Response) => {
    const [
      totalUsers,
      totalManagers,
      pendingUsers,
      activeUsers,
      recentSignups,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "MEMBER", accountStatus: { not: "DELETED" } },
      }),
      prisma.user.count({
        where: { role: "MANAGER", accountStatus: { not: "DELETED" } },
      }),
      prisma.user.count({
        where: { role: "MEMBER", accountStatus: "PENDING" },
      }),
      prisma.user.count({ where: { role: "MEMBER", accountStatus: "ACTIVE" } }),
      prisma.user.findMany({
        where: { role: "MEMBER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
          accountStatus: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.findMany({
        where: { user: { role: { in: ["MEMBER", "MANAGER"] } } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: {
            select: {
              email: true,
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        totalUsers,
        totalManagers,
        pendingUsers,
        activeUsers,
        recentSignups,
        recentActivity,
      },
    });
  },
);

// ── List users (supports ?role=USER|MANAGER, ?status=, ?page=) ────────────────

export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 50;
  const skip = (page - 1) * limit;
  const roleQ = (req.query.role as string)?.toUpperCase();
  const status = req.query.status as string | undefined;

  const validRoles = ["MEMBER", "MANAGER"];
  if (roleQ && !validRoles.includes(roleQ))
    throw new AppError("Invalid role filter", HttpStatus.BAD_REQUEST);

  const search = req.query.search as string | undefined;

  const where: any = {
    role: roleQ ? { equals: roleQ } : { in: ["MEMBER", "MANAGER"] },
    accountStatus: status ? { equals: status } : { not: "DELETED" },
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        displayName: true,
        accountStatus: true,
        createdAt: true,
        lastActiveAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data: {
      users,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    },
  });
});

// ── Activity log (paginated audit for admin) ───────────────────────────────────

export const adminActivity = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 30;
  const action = req.query.action as string | undefined;

  const where: any = {
    user: { role: { in: ["MEMBER", "MANAGER", "ADMIN"] } },
  };
  if (action) where.action = { contains: action.toUpperCase() };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            email: true,
            displayName: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data: {
      logs,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    },
  });
});

// ── Invite user (role: USER) ───────────────────────────────────────────────────

export const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("User already exists", HttpStatus.CONFLICT);

  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email,
      password: "",
      role: "MEMBER",
      accountStatus: "PENDING",
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      invitedById: req.user!.userId,
      verificationCode: code,
      verificationExpires: expires,
    },
  });

  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${code}&email=${encodeURIComponent(email)}`;
  await sendInviteEmail(email, inviteLink, firstName ?? "MEMBER");

  await prisma.auditLog.create({
    data: { userId: req.user!.userId, action: "USER_INVITED", meta: { email } },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({
    status: "success",
    message: "User invited successfully",
    data: { id: user.id, email: user.email },
  });
});

// ── Invite manager (role: MANAGER) ────────────────────────────────────────────

export const inviteManager = catchAsync(async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("User already exists", HttpStatus.CONFLICT);

  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const manager = await prisma.user.create({
    data: {
      email,
      password: "",
      role: "MANAGER",
      accountStatus: "PENDING",
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      invitedById: req.user!.userId,
      verificationCode: code,
      verificationExpires: expires,
    },
  });

  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${code}&email=${encodeURIComponent(email)}`;
  await sendInviteEmail(email, inviteLink, firstName ?? "Manager");

  await prisma.auditLog.create({
    data: {
      userId: req.user!.userId,
      action: "MANAGER_INVITED",
      meta: { email },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({
    status: "success",
    message: "Manager invited successfully",
    data: { id: manager.id, email: manager.email },
  });
});

// ── List managers ──────────────────────────────────────────────────────────────

export const listManagers = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;

  const managers = await prisma.user.findMany({
    where: {
      role: "MANAGER",
      accountStatus: { not: "DELETED" },
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { displayName: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      displayName: true,
      accountStatus: true,
      createdAt: true,
      lastActiveAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(HttpStatus.OK)
    .json({ status: "success", data: { managers } });
});

// ── Invite mentor (role: MENTOR) ──────────────────────────────────────────────

export const inviteMentor = catchAsync(async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    throw new AppError(
      "A user with this email already exists",
      HttpStatus.CONFLICT,
    );

  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const mentor = await prisma.user.create({
    data: {
      email,
      password: "",
      role: "MENTOR",
      accountStatus: "PENDING",
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      invitedById: req.user!.userId,
      verificationCode: code,
      verificationExpires: expires,
    },
  });

  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${code}&email=${encodeURIComponent(email)}`;
  await sendInviteEmail(email, inviteLink, firstName ?? "Mentor");

  await prisma.auditLog.create({
    data: {
      userId: req.user!.userId,
      action: "MENTOR_INVITED",
      meta: { email },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({
    status: "success",
    message: "Mentor invited successfully",
    data: { id: mentor.id, email: mentor.email },
  });
});

// ── List mentors ───────────────────────────────────────────────────────────────

export const listMentors = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;

  const mentors = await prisma.user.findMany({
    where: {
      role: "MENTOR",
      accountStatus: { not: "DELETED" },
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { displayName: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      displayName: true,
      avatarUrl: true,
      accountStatus: true,
      createdAt: true,
      lastActiveAt: true,
      _count: { select: { cohortMentorships: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(HttpStatus.OK)
    .json({ status: "success", data: { mentors } });
});

// ── Hard delete user (permanent, for dev/testing) ─────────────────────────────

export const hardDeleteUser = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);

    // Prevent self-delete
    if (user.id === req.user!.userId)
      throw new AppError(
        "You cannot delete your own account",
        HttpStatus.FORBIDDEN,
      );

    await prisma.user.delete({ where: { id } });

    return res
      .status(HttpStatus.OK)
      .json({ status: "success", message: "User permanently deleted" });
  },
);

// ── Resend invite ──────────────────────────────────────────────────────────────

export const resendUserInvite = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);
    if (user.accountStatus !== "PENDING")
      throw new AppError(
        "User has already accepted their invitation",
        HttpStatus.BAD_REQUEST,
      );

    const code = Math.random().toString(36).slice(2, 10).toUpperCase();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id },
      data: { verificationCode: code, verificationExpires: expires },
    });

    const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${code}&email=${encodeURIComponent(user.email)}`;
    await sendInviteEmail(user.email, inviteLink, user.firstName ?? user.role);

    return res
      .status(HttpStatus.OK)
      .json({ status: "success", message: "Invite resent" });
  },
);

// ── Update user status ─────────────────────────────────────────────────────────

export const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const valid = ["ACTIVE", "SUSPENDED", "DELETED"];
    if (!valid.includes(status))
      throw new AppError("Invalid status value", HttpStatus.BAD_REQUEST);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);

    await prisma.user.update({
      where: { id },
      data: { accountStatus: status },
    });

    return res
      .status(HttpStatus.OK)
      .json({ status: "success", message: "User status updated" });
  },
);

// ── Update user role ───────────────────────────────────────────────────────────

export const updateUserRole = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = [Role.MEMBER, Role.MANAGER];
    if (!allowedRoles.includes(role))
      throw new AppError(
        "Admins can only assign USER or MANAGER roles",
        HttpStatus.BAD_REQUEST,
      );

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);

    await prisma.user.update({ where: { id }, data: { role } });

    return res
      .status(HttpStatus.OK)
      .json({ status: "success", message: "User role updated" });
  },
);
