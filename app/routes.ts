import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public pages (no layout wrapper)
  index("routes/landing.tsx"),
  route("login", "routes/login.tsx"),

  // Admin portal
  layout("routes/admin/layout.tsx", [
    route("admin/dashboard", "routes/admin/dashboard.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/catalog", "routes/admin/catalog.tsx"),
    route("admin/catalog/:courseId", "routes/admin/course-review.tsx"),
    route("admin/analytics", "routes/admin/analytics.tsx"),
    route("admin/settings", "routes/admin/settings.tsx"),
  ]),

  // Instructor portal
  layout("routes/instructor/layout.tsx", [
    route("instructor/dashboard", "routes/instructor/dashboard.tsx"),
    route("instructor/my-courses", "routes/instructor/my-courses.tsx"),
    route("instructor/my-courses/:courseId", "routes/instructor/course-editor.tsx"),
    route("instructor/my-courses/:courseId/settings", "routes/instructor/course-settings.tsx"),
    route("instructor/learning-outcomes/:courseId", "routes/instructor/learning-outcomes.tsx"),
    route("instructor/grading/:courseId", "routes/instructor/grading.tsx"),
    route("instructor/students", "routes/instructor/students.tsx"),
    route("instructor/students/:studentId/analytics/:courseId", "routes/instructor/student-analytics.tsx"),
    route("instructor/submissions", "routes/instructor/submissions.tsx"),
    route("instructor/messages/:courseId", "routes/instructor/messages.tsx"),
    route("instructor/inbox", "routes/instructor/inbox.tsx"),
    route("instructor/ai-assistant", "routes/instructor/ai-assistant.tsx"),
    route("instructor/schedule", "routes/instructor/schedule.tsx"),
    route("instructor/settings", "routes/instructor/settings.tsx"),
  ]),

  // Student portal
  layout("routes/student/layout.tsx", [
    route("student/dashboard", "routes/student/dashboard.tsx"),
    route("student/courses", "routes/student/courses.tsx"),
    route("student/courses/:courseId", "routes/student/learning.tsx"),
    route("student/assignments/:courseId", "routes/student/assignments.tsx"),
    route("student/competencies/:courseId", "routes/student/competencies.tsx"),
    route("student/inbox", "routes/student/inbox.tsx"),
    route("student/badges", "routes/student/badges.tsx"),
    route("student/leaderboard/:courseId", "routes/student/leaderboard.tsx"),
    route("student/ai-tutor", "routes/student/ai-tutor.tsx"),
    route("student/grades", "routes/student/grades.tsx"),
    route("student/schedule", "routes/student/schedule.tsx"),
    route("student/settings", "routes/student/settings.tsx"),
  ]),
  // Catch-all 404
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
