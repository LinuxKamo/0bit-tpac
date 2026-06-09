import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError }   from "../../utils/appError.js";

// ── List courses ───────────────────────────────────────────────────────────────

export const listCourses = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.query;

  const courses = await prisma.course.findMany({
    where:   status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy:  { select: { id: true, firstName: true, lastName: true, email: true } },
      reviewedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: {
        select: {
          modules:      true,
          cohortCourses: true,
          tierCourses:  true,
        },
      },
    },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { courses } });
});

// ── Get single course (with modules + lessons) ────────────────────────────────

export const getCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
    where:   { id },
    include: {
      createdBy:  { select: { id: true, firstName: true, lastName: true, email: true } },
      reviewedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      _count: {
        select: { cohortCourses: true, tierCourses: true },
      },
    },
  });

  if (!course) throw new AppError("Course not found", HttpStatus.NOT_FOUND);

  return res.status(HttpStatus.OK).json({ status: "success", data: { course } });
});

// ── Create course ──────────────────────────────────────────────────────────────

export const createCourse = catchAsync(async (req: Request, res: Response) => {
  const { title, description, thumbnailUrl, sprintLabel } = req.body;
  if (!title?.trim()) throw new AppError("title is required", HttpStatus.BAD_REQUEST);

  const course = await prisma.course.create({
    data: {
      title:       title.trim(),
      description: description?.trim() ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
      sprintLabel: sprintLabel?.trim() ?? "Module",
      status:      "DRAFT",
      createdById: req.user!.userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId:     req.user!.userId,
      action:     "course.create",
      entityType: "course",
      entityId:   course.id,
      newValue:   { title },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({ status: "success", data: { course } });
});

// ── Update course metadata ─────────────────────────────────────────────────────

export const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, thumbnailUrl, sprintLabel } = req.body;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw new AppError("Course not found", HttpStatus.NOT_FOUND);

  // Can only edit metadata on DRAFT or APPROVED (not while IN_REVIEW or PUBLISHED)
  if (course.status === "IN_REVIEW")
    throw new AppError("Cannot edit a course that is under review", HttpStatus.BAD_REQUEST);

  const updated = await prisma.course.update({
    where: { id },
    data: {
      ...(title        !== undefined && { title: title.trim() }),
      ...(description  !== undefined && { description: description?.trim() ?? null }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      ...(sprintLabel  !== undefined && { sprintLabel: sprintLabel.trim() }),
    },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { course: updated } });
});

// ── Update course status ───────────────────────────────────────────────────────

export const updateCourseStatus = catchAsync(async (req: Request, res: Response) => {
  const { id }     = req.params;
  const { action, reviewNote } = req.body;
  // action: "submit" | "approve" | "reject" | "publish" | "archive" | "unpublish"

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw new AppError("Course not found", HttpStatus.NOT_FOUND);

  const transitions: Record<string, { from: string[]; to: string }> = {
    submit:    { from: ["DRAFT", "APPROVED"],    to: "IN_REVIEW"  },
    approve:   { from: ["IN_REVIEW"],            to: "APPROVED"   },
    reject:    { from: ["IN_REVIEW"],            to: "DRAFT"      },
    publish:   { from: ["APPROVED"],             to: "PUBLISHED"  },
    unpublish: { from: ["PUBLISHED"],            to: "APPROVED"   },
    archive:   { from: ["PUBLISHED","APPROVED"], to: "ARCHIVED"   },
  };

  const transition = transitions[action];
  if (!transition) throw new AppError("Invalid action", HttpStatus.BAD_REQUEST);
  if (!transition.from.includes(course.status))
    throw new AppError(
      `Cannot ${action} a course with status ${course.status}`,
      HttpStatus.BAD_REQUEST,
    );

  const updated = await prisma.course.update({
    where: { id },
    data: {
      status: transition.to as any,
      ...(action === "approve" && {
        reviewedById: req.user!.userId,
        reviewNote:   reviewNote ?? null,
      }),
      ...(action === "reject"  && {
        reviewedById: req.user!.userId,
        reviewNote:   reviewNote ?? null,
      }),
      ...(action === "publish" && { publishedAt: new Date() }),
    },
    include: {
      createdBy:  { select: { id: true, firstName: true, lastName: true, email: true } },
      reviewedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { modules: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId:     req.user!.userId,
      action:     `course.${action}`,
      entityType: "course",
      entityId:   id,
      oldValue:   { status: course.status },
      newValue:   { status: transition.to, reviewNote },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", data: { course: updated } });
});

// ── Module CRUD ───────────────────────────────────────────────────────────────

export const createModule = catchAsync(async (req: Request, res: Response) => {
  const { id: courseId } = req.params;
  const { title, description } = req.body;
  if (!title?.trim()) throw new AppError("title is required", HttpStatus.BAD_REQUEST);

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError("Course not found", HttpStatus.NOT_FOUND);

  const count = await prisma.courseModule.count({ where: { courseId } });

  const module = await prisma.courseModule.create({
    data: {
      courseId,
      title:       title.trim(),
      description: description?.trim() ?? null,
      order:       count,
    },
    include: { lessons: true },
  });

  return res.status(HttpStatus.CREATED).json({ status: "success", data: { module } });
});

export const updateModule = catchAsync(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const { title, description, order } = req.body;

  const module = await prisma.courseModule.findUnique({ where: { id: moduleId } });
  if (!module) throw new AppError("Module not found", HttpStatus.NOT_FOUND);

  const updated = await prisma.courseModule.update({
    where: { id: moduleId },
    data: {
      ...(title       !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() ?? null }),
      ...(order       !== undefined && { order }),
    },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { module: updated } });
});

export const deleteModule = catchAsync(async (req: Request, res: Response) => {
  const { moduleId } = req.params;

  const module = await prisma.courseModule.findUnique({ where: { id: moduleId } });
  if (!module) throw new AppError("Module not found", HttpStatus.NOT_FOUND);

  await prisma.courseModule.delete({ where: { id: moduleId } });

  return res.status(HttpStatus.OK).json({ status: "success", data: null });
});

// ── Lesson CRUD ───────────────────────────────────────────────────────────────

export const createLesson = catchAsync(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const { title, code, type, isResource, submissionRequired } = req.body;

  if (!title?.trim()) throw new AppError("title is required", HttpStatus.BAD_REQUEST);
  if (!type)          throw new AppError("type is required",  HttpStatus.BAD_REQUEST);

  const module = await prisma.courseModule.findUnique({ where: { id: moduleId } });
  if (!module) throw new AppError("Module not found", HttpStatus.NOT_FOUND);

  const count = await prisma.courseLesson.count({ where: { moduleId } });

  const lesson = await prisma.courseLesson.create({
    data: {
      moduleId,
      title:              title.trim(),
      code:               code?.trim() ?? `L${count + 1}`,
      type,
      order:              count,
      isResource:         isResource         ?? false,
      submissionRequired: submissionRequired ?? false,
    },
  });

  return res.status(HttpStatus.CREATED).json({ status: "success", data: { lesson } });
});

export const updateLesson = catchAsync(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const { title, code, type, order, isResource, submissionRequired, content } = req.body;

  const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new AppError("Lesson not found", HttpStatus.NOT_FOUND);

  const updated = await prisma.courseLesson.update({
    where: { id: lessonId },
    data: {
      ...(title              !== undefined && { title: title.trim() }),
      ...(code               !== undefined && { code:  code.trim()  }),
      ...(type               !== undefined && { type  }),
      ...(order              !== undefined && { order }),
      ...(isResource         !== undefined && { isResource }),
      ...(submissionRequired !== undefined && { submissionRequired }),
      ...(content            !== undefined && { content }),
    },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { lesson: updated } });
});

export const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const { lessonId } = req.params;

  const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new AppError("Lesson not found", HttpStatus.NOT_FOUND);

  await prisma.courseLesson.delete({ where: { id: lessonId } });

  return res.status(HttpStatus.OK).json({ status: "success", data: null });
});
