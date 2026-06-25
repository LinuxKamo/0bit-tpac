import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/appError.js";

// ── List programmes by country ────────────────────────────────────────────────

export const listProgrammes = catchAsync(
  async (req: Request, res: Response) => {
    const { countryId } = req.query;
    if (!countryId)
      throw new AppError(
        "countryId query param is required",
        HttpStatus.BAD_REQUEST,
      );

    const programmes = await prisma.programme.findMany({
      where: { countryId: countryId as string },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { cohorts: true } },
        cohorts: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { participants: true } },
          },
        },
      },
    });

    return res
      .status(HttpStatus.OK)
      .json({ status: "success", data: { programmes } });
  },
);

// ── Get single programme ───────────────────────────────────────────────────────

export const getProgramme = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const programme = await prisma.programme.findUnique({
    where: { id },
    include: {
      cohorts: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { participants: true } },
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });

  if (!programme)
    throw new AppError("Programme not found", HttpStatus.NOT_FOUND);

  return res
    .status(HttpStatus.OK)
    .json({ status: "success", data: { programme } });
});

// ── Create programme ───────────────────────────────────────────────────────────

export const createProgramme = catchAsync(
  async (req: Request, res: Response) => {
    const { countryId, name, description, type } = req.body;

    if (!countryId || !name)
      throw new AppError(
        "countryId and name are required",
        HttpStatus.BAD_REQUEST,
      );

    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });
    if (!country) throw new AppError("Country not found", HttpStatus.NOT_FOUND);

    const {
      minimumTierSlot,
      enrollmentType,
      scheduleType,
      recurringFrequency,
    } = req.body;

    const VALID_SLOTS = [
      "EXPLORER",
      "BUILDER",
      "FOUNDER",
      "CORPORATE",
      "DIASPORA",
    ];
    if (minimumTierSlot && !VALID_SLOTS.includes(minimumTierSlot))
      throw new AppError("Invalid minimumTierSlot", HttpStatus.BAD_REQUEST);

    const programme = await prisma.programme.create({
      data: {
        countryId,
        name: name.trim(),
        description: description?.trim() ?? null,
        type: type ?? "BUILDERS_RESIDENCY",
        isActive: true,
        minimumTierSlot: minimumTierSlot ?? null,
        enrollmentType: enrollmentType ?? "OPEN",
        scheduleType: scheduleType ?? "ONE_TIME",
        recurringFrequency:
          scheduleType === "RECURRING" ? (recurringFrequency ?? null) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: "programme.create",
        entityType: "programme",
        entityId: programme.id,
        countryId,
        newValue: { name, type },
      },
    });
    req.auditLogged = true;

    return res
      .status(HttpStatus.CREATED)
      .json({ status: "success", data: { programme } });
  },
);

// ── Update programme ───────────────────────────────────────────────────────────

export const updateProgramme = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      type,
      isActive,
      minimumTierSlot,
      enrollmentType,
      scheduleType,
      recurringFrequency,
    } = req.body;

    const programme = await prisma.programme.findUnique({ where: { id } });
    if (!programme)
      throw new AppError("Programme not found", HttpStatus.NOT_FOUND);

    const updated = await prisma.programme.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && {
          description: description?.trim() ?? null,
        }),
        ...(type !== undefined && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(minimumTierSlot !== undefined && {
          minimumTierSlot: minimumTierSlot || null,
        }),
        ...(enrollmentType !== undefined && { enrollmentType }),
        ...(scheduleType !== undefined && { scheduleType }),
        ...(recurringFrequency !== undefined && {
          recurringFrequency: recurringFrequency || null,
        }),
      },
    });

    return res
      .status(HttpStatus.OK)
      .json({ status: "success", data: { programme: updated } });
  },
);

// ── List cohorts for a programme ───────────────────────────────────────────────

export const listCohorts = catchAsync(async (req: Request, res: Response) => {
  const { programmeId } = req.params;

  const cohorts = await prisma.programmeCohort.findMany({
    where: { programmeId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { participants: true } },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return res
    .status(HttpStatus.OK)
    .json({ status: "success", data: { cohorts } });
});

// ── Get single cohort ──────────────────────────────────────────────────────────

export const getCohort = catchAsync(async (req: Request, res: Response) => {
  const { cohortId } = req.params;

  const cohort = await prisma.programmeCohort.findUnique({
    where: { id: cohortId },
    include: {
      programme: { select: { id: true, name: true, countryId: true } },
      _count: { select: { participants: true } },
      participants: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              displayName: true,
            },
          },
          organisation: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!cohort) throw new AppError("Cohort not found", HttpStatus.NOT_FOUND);

  return res
    .status(HttpStatus.OK)
    .json({ status: "success", data: { cohort } });
});

// ── Create cohort ──────────────────────────────────────────────────────────────

export const createCohort = catchAsync(async (req: Request, res: Response) => {
  const { programmeId } = req.params;
  const {
    name,
    applicationOpenAt,
    applicationCloseAt,
    startDate,
    endDate,
    demoDayDate,
    maxParticipants,
  } = req.body;

  if (!name) throw new AppError("name is required", HttpStatus.BAD_REQUEST);

  const programme = await prisma.programme.findUnique({
    where: { id: programmeId },
  });
  if (!programme)
    throw new AppError("Programme not found", HttpStatus.NOT_FOUND);

  const cohort = await prisma.programmeCohort.create({
    data: {
      programmeId,
      name: name.trim(),
      phase: "APPLICATION",
      applicationOpenAt: applicationOpenAt ? new Date(applicationOpenAt) : null,
      applicationCloseAt: applicationCloseAt
        ? new Date(applicationCloseAt)
        : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      demoDayDate: demoDayDate ? new Date(demoDayDate) : null,
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      createdById: req.user!.userId,
    },
    include: {
      _count: { select: { participants: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.userId,
      action: "cohort.create",
      entityType: "cohort",
      entityId: cohort.id,
      countryId: programme.countryId,
      newValue: { name, programmeId },
    },
  });
  req.auditLogged = true;

  return res
    .status(HttpStatus.CREATED)
    .json({ status: "success", data: { cohort } });
});

// ── Get cohort detail (full) ───────────────────────────────────────────────────

export const getCohortDetail = catchAsync(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;

    const cohort = await prisma.programmeCohort.findUnique({
      where: { id: cohortId },
      include: {
        programme: {
          select: { id: true, name: true, type: true, countryId: true },
        },
        _count: { select: { participants: true } },
        cohortCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
                sprintLabel: true,
                _count: { select: { modules: true } },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        cohortMentors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
                displayName: true,
              },
            },
          },
        },
        milestones: { orderBy: { dueDate: "asc" } },
        participants: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!cohort) throw new AppError("Cohort not found", HttpStatus.NOT_FOUND);

    return res
      .status(HttpStatus.OK)
      .json({ status: "success", data: { cohort } });
  },
);

// ── Update cohort ──────────────────────────────────────────────────────────────

export const updateCohort = catchAsync(async (req: Request, res: Response) => {
  const { cohortId } = req.params;
  const {
    name,
    phase,
    applicationOpenAt,
    applicationCloseAt,
    startDate,
    endDate,
    demoDayDate,
    maxParticipants,
  } = req.body;

  const cohort = await prisma.programmeCohort.findUnique({
    where: { id: cohortId },
  });
  if (!cohort) throw new AppError("Cohort not found", HttpStatus.NOT_FOUND);

  const VALID_PHASES = [
    "APPLICATION",
    "SELECTION",
    "ACTIVE",
    "DEMO_DAY",
    "GRADUATED",
  ];
  if (phase && !VALID_PHASES.includes(phase))
    throw new AppError("Invalid phase", HttpStatus.BAD_REQUEST);

  const updated = await prisma.programmeCohort.update({
    where: { id: cohortId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(phase !== undefined && { phase }),
      ...(applicationOpenAt !== undefined && {
        applicationOpenAt: applicationOpenAt
          ? new Date(applicationOpenAt)
          : null,
      }),
      ...(applicationCloseAt !== undefined && {
        applicationCloseAt: applicationCloseAt
          ? new Date(applicationCloseAt)
          : null,
      }),
      ...(startDate !== undefined && {
        startDate: startDate ? new Date(startDate) : null,
      }),
      ...(endDate !== undefined && {
        endDate: endDate ? new Date(endDate) : null,
      }),
      ...(demoDayDate !== undefined && {
        demoDayDate: demoDayDate ? new Date(demoDayDate) : null,
      }),
      ...(maxParticipants !== undefined && {
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      }),
    },
    include: {
      _count: { select: { participants: true } },
    },
  });

  return res
    .status(HttpStatus.OK)
    .json({ status: "success", data: { cohort: updated } });
});

// ── Cohort Courses ─────────────────────────────────────────────────────────────

export const addCohortCourse = catchAsync(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;
    const { courseId } = req.body;
    if (!courseId)
      throw new AppError("courseId is required", HttpStatus.BAD_REQUEST);

    const cohort = await prisma.programmeCohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort) throw new AppError("Cohort not found", HttpStatus.NOT_FOUND);

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError("Course not found", HttpStatus.NOT_FOUND);

    const exists = await prisma.cohortCourse.findUnique({
      where: { cohortId_courseId: { cohortId, courseId } },
    });
    if (exists)
      throw new AppError(
        "Course already assigned to this cohort",
        HttpStatus.CONFLICT,
      );

    const count = await prisma.cohortCourse.count({ where: { cohortId } });
    const cc = await prisma.cohortCourse.create({
      data: { cohortId, courseId, order: count },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            status: true,
            sprintLabel: true,
            _count: { select: { modules: true } },
          },
        },
      },
    });

    return res
      .status(HttpStatus.CREATED)
      .json({ status: "success", data: { cohortCourse: cc } });
  },
);

export const removeCohortCourse = catchAsync(
  async (req: Request, res: Response) => {
    const { cohortId, courseId } = req.params;

    const cc = await prisma.cohortCourse.findUnique({
      where: { cohortId_courseId: { cohortId, courseId } },
    });
    if (!cc)
      throw new AppError(
        "Course not assigned to this cohort",
        HttpStatus.NOT_FOUND,
      );

    await prisma.cohortCourse.delete({
      where: { cohortId_courseId: { cohortId, courseId } },
    });
    return res.status(HttpStatus.OK).json({ status: "success", data: null });
  },
);

// ── Cohort Mentors ─────────────────────────────────────────────────────────────

export const addCohortMentor = catchAsync(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;
    const { userId, role } = req.body;
    if (!userId)
      throw new AppError("userId is required", HttpStatus.BAD_REQUEST);

    const cohort = await prisma.programmeCohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort) throw new AppError("Cohort not found", HttpStatus.NOT_FOUND);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);

    const exists = await prisma.cohortMentor.findUnique({
      where: { cohortId_userId: { cohortId, userId } },
    });
    if (exists)
      throw new AppError(
        "Mentor already assigned to this cohort",
        HttpStatus.CONFLICT,
      );

    const cm = await prisma.cohortMentor.create({
      data: { cohortId, userId, role: role ?? "mentor" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            displayName: true,
          },
        },
      },
    });

    return res
      .status(HttpStatus.CREATED)
      .json({ status: "success", data: { cohortMentor: cm } });
  },
);

export const removeCohortMentor = catchAsync(
  async (req: Request, res: Response) => {
    const { cohortId, mentorId } = req.params;

    const cm = await prisma.cohortMentor.findUnique({
      where: { cohortId_userId: { cohortId, userId: mentorId } },
    });
    if (!cm)
      throw new AppError(
        "Mentor not assigned to this cohort",
        HttpStatus.NOT_FOUND,
      );

    await prisma.cohortMentor.delete({
      where: { cohortId_userId: { cohortId, userId: mentorId } },
    });
    return res.status(HttpStatus.OK).json({ status: "success", data: null });
  },
);

// ── Cohort Milestones ──────────────────────────────────────────────────────────

export const createCohortMilestone = catchAsync(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;
    const { title, description, dueDate, submissionType } = req.body;
    if (!title) throw new AppError("title is required", HttpStatus.BAD_REQUEST);

    const cohort = await prisma.programmeCohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort) throw new AppError("Cohort not found", HttpStatus.NOT_FOUND);

    const milestone = await prisma.cohortMilestone.create({
      data: {
        cohortId,
        title: title.trim(),
        description: description?.trim() ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        submissionType: submissionType ?? "FILE_UPLOAD",
      },
    });

    return res
      .status(HttpStatus.CREATED)
      .json({ status: "success", data: { milestone } });
  },
);

export const updateCohortMilestone = catchAsync(
  async (req: Request, res: Response) => {
    const { milestoneId } = req.params;
    const { title, description, dueDate, submissionType } = req.body;

    const milestone = await prisma.cohortMilestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone)
      throw new AppError("Milestone not found", HttpStatus.NOT_FOUND);

    const updated = await prisma.cohortMilestone.update({
      where: { id: milestoneId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() ?? null,
        }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(submissionType !== undefined && { submissionType }),
      },
    });

    return res
      .status(HttpStatus.OK)
      .json({ status: "success", data: { milestone: updated } });
  },
);

export const deleteCohortMilestone = catchAsync(
  async (req: Request, res: Response) => {
    const { milestoneId } = req.params;

    const milestone = await prisma.cohortMilestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone)
      throw new AppError("Milestone not found", HttpStatus.NOT_FOUND);

    await prisma.cohortMilestone.delete({ where: { id: milestoneId } });
    return res.status(HttpStatus.OK).json({ status: "success", data: null });
  },
);
