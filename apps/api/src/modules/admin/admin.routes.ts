import { Router } from "express";
import {
  adminDashboard, listUsers, inviteUser, updateUserStatus, updateUserRole,
  inviteManager, listManagers,
  inviteMentor, listMentors,
  hardDeleteUser, resendUserInvite,
  adminActivity,
} from "./admin.controller.js";
import {
  listCountries, getCountry, createCountry, updateCountry,
  updateCountryStatus, upsertCountryTiers, getCountryTiers,
} from "./country.controller.js";
import {
  listProgrammes, getProgramme, createProgramme, updateProgramme,
  listCohorts, getCohort, getCohortDetail, createCohort, updateCohort,
  addCohortCourse, removeCohortCourse,
  addCohortMentor, removeCohortMentor,
  createCohortMilestone, updateCohortMilestone, deleteCohortMilestone,
} from "./programme.controller.js";
import {
  listCourses, getCourse, createCourse, updateCourse, updateCourseStatus,
  createModule, updateModule, deleteModule,
  createLesson, updateLesson, deleteLesson,
} from "./course.controller.js";
import { protect }   from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role }      from "@repo/types";

const router = Router();
router.use(protect);
router.use(authorize([Role.ADMIN, Role.SUPER_ADMIN]));

// Dashboard & activity
router.get("/dashboard", adminDashboard);
router.get("/activity",  adminActivity);

// Countries
router.get("/countries",                    listCountries);
router.post("/countries",                   createCountry);
router.get("/countries/:id",                getCountry);
router.patch("/countries/:id",              updateCountry);
router.patch("/countries/:id/status",       updateCountryStatus);
router.get("/countries/:id/tiers",          getCountryTiers);
router.post("/countries/:id/tiers",         upsertCountryTiers);

// Users (members)
router.get("/users",              listUsers);
router.post("/users/invite",      inviteUser);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role",   updateUserRole);

// Managers
router.get("/managers",         listManagers);
router.post("/managers/invite", inviteManager);

// Mentors
router.get("/mentors",          listMentors);
router.post("/mentors/invite",  inviteMentor);

// User actions (works for any role)
router.post("/users/:id/resend-invite",  resendUserInvite);
router.delete("/users/:id/hard-delete",  hardDeleteUser);

// Courses
router.get("/courses",                                                         listCourses);
router.post("/courses",                                                        createCourse);
router.get("/courses/:id",                                                     getCourse);
router.patch("/courses/:id",                                                   updateCourse);
router.patch("/courses/:id/status",                                            updateCourseStatus);
router.post("/courses/:id/modules",                                            createModule);
router.patch("/courses/:id/modules/:moduleId",                                 updateModule);
router.delete("/courses/:id/modules/:moduleId",                                deleteModule);
router.post("/courses/:id/modules/:moduleId/lessons",                          createLesson);
router.patch("/courses/:id/modules/:moduleId/lessons/:lessonId",               updateLesson);
router.delete("/courses/:id/modules/:moduleId/lessons/:lessonId",              deleteLesson);

// Programmes
router.get("/programmes",                                                          listProgrammes);
router.post("/programmes",                                                         createProgramme);
router.get("/programmes/:id",                                                      getProgramme);
router.patch("/programmes/:id",                                                    updateProgramme);
router.get("/programmes/:programmeId/cohorts",                                     listCohorts);
router.post("/programmes/:programmeId/cohorts",                                    createCohort);
router.get("/programmes/:programmeId/cohorts/:cohortId",                           getCohort);
router.patch("/programmes/:programmeId/cohorts/:cohortId",                         updateCohort);
// Cohort detail (full)
router.get("/cohorts/:cohortId/detail",                                            getCohortDetail);
// Cohort courses
router.post("/cohorts/:cohortId/courses",                                          addCohortCourse);
router.delete("/cohorts/:cohortId/courses/:courseId",                              removeCohortCourse);
// Cohort mentors
router.post("/cohorts/:cohortId/mentors",                                          addCohortMentor);
router.delete("/cohorts/:cohortId/mentors/:mentorId",                              removeCohortMentor);
// Cohort milestones
router.post("/cohorts/:cohortId/milestones",                                       createCohortMilestone);
router.patch("/cohorts/:cohortId/milestones/:milestoneId",                         updateCohortMilestone);
router.delete("/cohorts/:cohortId/milestones/:milestoneId",                        deleteCohortMilestone);

export default router;
