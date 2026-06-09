export const endpoints = {
  // Auth
  auth: {
    register:           "/auth/register",
    verifyCode:         "/auth/verify-code",
    login:              "/auth/login",
    setPassword:        "/auth/set-password",
    forgotPassword:     "/auth/forgot-password",
    resendVerification: "/auth/resend-verification",
    me:                 "/auth/me",
    logout:             "/auth/logout",
    provision:          "/auth/provision",
    resetPassword:      "/auth/reset-password",
  },

  // Users
  users: {
    profile:      "/users/me",
    password:     "/users/me/password",
    avatarPresign: "/users/profile/avatar/presign",
    list:         "/users",
    byId:         (id: string) => `/users/${id}`,
    provision:    "/users/provision",
    status:       (id: string) => `/users/${id}/status`,
    role:         (id: string) => `/users/${id}/role`,
    resendInvite: "/users/resend-invite",
    delete:       (id: string) => `/users/${id}`,
  },

  // Super Admin
  superAdmin: {
    stats:            "/super-admin/stats",
    audit:            "/super-admin/audit",
    admins:           "/super-admin/admins",
    adminInvite:      "/super-admin/admins/invite",
    adminRemove:      (id: string) => `/super-admin/admins/${id}`,
    adminSuspend:     (id: string) => `/super-admin/admins/${id}/suspend`,
    adminActivate:    (id: string) => `/super-admin/admins/${id}/activate`,
    adminResendInvite:(id: string) => `/super-admin/admins/${id}/resend-invite`,
    settings:         "/super-admin/settings",
  },

  // Admin
  admin: {
    dashboard:    "/admin/dashboard",
    activity:     "/admin/activity",
    // Countries
    countries:         "/admin/countries",
    countryById:       (id: string) => `/admin/countries/${id}`,
    countryStatus:     (id: string) => `/admin/countries/${id}/status`,
    countryTiers:      (id: string) => `/admin/countries/${id}/tiers`,
    // Users (members)
    users:             "/admin/users",
    userStatus:        (id: string) => `/admin/users/${id}/status`,
    userRole:          (id: string) => `/admin/users/${id}/role`,
    userInvite:        "/admin/users/invite",
    userResendInvite:  (id: string) => `/admin/users/${id}/resend-invite`,
    userHardDelete:    (id: string) => `/admin/users/${id}/hard-delete`,
    // Managers
    managers:          "/admin/managers",
    managerInvite:     "/admin/managers/invite",
    // Mentors
    mentors:           "/admin/mentors",
    mentorInvite:      "/admin/mentors/invite",
    // Courses
    courses:              "/admin/courses",
    courseById:           (id: string) => `/admin/courses/${id}`,
    courseStatus:         (id: string) => `/admin/courses/${id}/status`,
    courseModules:        (id: string) => `/admin/courses/${id}/modules`,
    courseModule:         (id: string, moduleId: string) => `/admin/courses/${id}/modules/${moduleId}`,
    courseLessons:        (id: string, moduleId: string) => `/admin/courses/${id}/modules/${moduleId}/lessons`,
    courseLesson:         (id: string, moduleId: string, lessonId: string) => `/admin/courses/${id}/modules/${moduleId}/lessons/${lessonId}`,
    // Programmes
    programmes:       "/admin/programmes",
    programmeById:    (id: string) => `/admin/programmes/${id}`,
    programmeCohorts: (id: string) => `/admin/programmes/${id}/cohorts`,
    cohortById:       (programmeId: string, cohortId: string) => `/admin/programmes/${programmeId}/cohorts/${cohortId}`,
    // Cohort detail & management (flat routes)
    cohortDetail:       (cohortId: string) => `/admin/cohorts/${cohortId}/detail`,
    cohortCourses:      (cohortId: string) => `/admin/cohorts/${cohortId}/courses`,
    cohortCourse:       (cohortId: string, courseId: string) => `/admin/cohorts/${cohortId}/courses/${courseId}`,
    cohortMentors:      (cohortId: string) => `/admin/cohorts/${cohortId}/mentors`,
    cohortMentor:       (cohortId: string, mentorId: string) => `/admin/cohorts/${cohortId}/mentors/${mentorId}`,
    cohortMilestones:   (cohortId: string) => `/admin/cohorts/${cohortId}/milestones`,
    cohortMilestone:    (cohortId: string, milestoneId: string) => `/admin/cohorts/${cohortId}/milestones/${milestoneId}`,
  },

  // Projects
  projects: {
    list:         "/projects",
    create:       "/projects",
    byId:         (id: string) => `/projects/${id}`,
    update:       (id: string) => `/projects/${id}`,
    status:       (id: string) => `/projects/${id}/status`,
    addMember:    (id: string) => `/projects/${id}/members`,
    removeMember: (id: string, userId: string) => `/projects/${id}/members/${userId}`,
    delete:       (id: string) => `/projects/${id}`,
  },

  // Intake
  intake: {
    submit:  "/intake",
    list:    "/intake",
    byId:    (id: string) => `/intake/${id}`,
    convert: (id: string) => `/intake/${id}/convert`,
  },

  //Milestones
  milestones: {
    list:    (projectId: string) => `/projects/${projectId}/milestones`,
    create:  (projectId: string) => `/projects/${projectId}/milestones`,
    byId:    (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}`,
    update:  (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}`,
    submit:  (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}/submit`,
    approve: (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}/approve`,
    reject:  (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}/reject`,
    delete:  (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}`,
  },

  //Tasks
  tasks: {
    list:   (projectId: string) => `/projects/${projectId}/tasks`,
    create: (projectId: string) => `/projects/${projectId}/tasks`,
    byId:   (projectId: string, id: string) => `/projects/${projectId}/tasks/${id}`,
    update: (projectId: string, id: string) => `/projects/${projectId}/tasks/${id}`,
    delete: (projectId: string, id: string) => `/projects/${projectId}/tasks/${id}`,
  },
  //Documents
  documents: {
    list:   (projectId: string) => `/projects/${projectId}/documents`,
    create: (projectId: string) => `/projects/${projectId}/documents`,
    byId:   (projectId: string, id: string) => `/projects/${projectId}/documents/${id}`,
    update: (projectId: string, id: string) => `/projects/${projectId}/documents/${id}`,
    delete: (projectId: string, id: string) => `/projects/${projectId}/documents/${id}`,
  },

  //Invoices
  invoices: {
    list:         (projectId: string) => `/projects/${projectId}/invoices`,
    create:       (projectId: string) => `/projects/${projectId}/invoices`,
    byId:         (projectId: string, id: string) => `/projects/${projectId}/invoices/${id}`,
    updateStatus: (projectId: string, id: string) => `/projects/${projectId}/invoices/${id}/status`,
  },

  //Comments
  comments: {
    list:   (projectId: string) => `/projects/${projectId}/comments`,
    create: (projectId: string) => `/projects/${projectId}/comments`,
    delete: (projectId: string, id: string) => `/projects/${projectId}/comments/${id}`,
  },

  //Change Requests
  changeRequests: {
    list:         (projectId: string) => `/projects/${projectId}/change-requests`,
    create:       (projectId: string) => `/projects/${projectId}/change-requests`,
    updateStatus: (projectId: string, id: string) => `/projects/${projectId}/change-requests/${id}/status`,
    delete:       (projectId: string, id: string) => `/projects/${projectId}/change-requests/${id}`,
  },

};
