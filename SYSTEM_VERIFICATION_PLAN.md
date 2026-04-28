# 🧪 ERUDITE LMS - Complete System Verification Plan

**Objective**: Verify ALL features work end-to-end across ALL user roles with REAL data (no hallucinations)
**Date**: April 28, 2026
**Status**: IN PROGRESS

---

## 1. SYSTEM COMPONENTS TO VERIFY

### 1.1 Authentication System
- [ ] Admin login (admin@admin.com / admin123)
- [ ] Instructor login (instructor@erudite.edu / instructor123)
- [ ] Student login (student@erudite.edu / student123)
- [ ] Token persistence in localStorage
- [ ] Logout functionality

### 1.2 Learning Outcomes Framework
- [ ] Instructor: Create learning outcome for course
- [ ] Instructor: Set Bloom's level (Remember, Understand, Apply, Analyze, Evaluate, Create)
- [ ] Student: View learning outcomes for enrolled course
- [ ] Student: View competency mastery level (0-100%)
- [ ] Verify: Mastery level displays with color coding (green 90%+, yellow 70-89%, etc.)
- [ ] Verify: Attempts counter shows correctly

### 1.3 Assignment Submission System
- [ ] Instructor: Create assignment with title, description, due date, points
- [ ] Instructor: Set rubric criteria
- [ ] Student: View assignments for enrolled course
- [ ] Student: Submit assignment with content
- [ ] Student: View submission status (draft/submitted/graded/returned)
- [ ] Instructor: View all student submissions
- [ ] Instructor: Grade submission (0-100 points)
- [ ] Instructor: Add feedback comments
- [ ] Student: View grade and feedback
- [ ] Notification: Student receives notification when graded

### 1.4 Messaging System
- [ ] Instructor: Send message to individual student
- [ ] Instructor: Broadcast message to all students in course
- [ ] Student: Receive and view messages in inbox
- [ ] Student: Mark messages as read
- [ ] Notification: Message received notification

### 1.5 Gamification System
- [ ] Student: View earned badges (First Assignment, Perfect Score, Quick Learner, etc.)
- [ ] Student: View locked badges with earning criteria
- [ ] Student: View leaderboard rankings
- [ ] Leaderboard: Shows rank, name, email, total points, badges earned, mastery %
- [ ] Leaderboard: User highlighted with blue border
- [ ] Leaderboard: Time filters work (all-time, month, week)

### 1.6 Dashboard & Navigation
- [ ] Admin: Dashboard shows system overview
- [ ] Instructor: Dashboard shows courses, recent submissions, messages
- [ ] Student: Dashboard shows enrolled courses, assignments, messages
- [ ] Navigation: Role-based menu items display correctly
- [ ] Navigation: Authorization - student cannot access instructor routes

### 1.7 Database & API
- [ ] All tables created (users, courses, enrollments, learning_outcomes, assignments, submissions, etc.)
- [ ] API endpoints respond with correct HTTP status (200, 201, 400, 401, 403, 404)
- [ ] Bearer token authentication works
- [ ] Pagination works on large datasets (submissions, leaderboard)
- [ ] Eager loading prevents N+1 queries

---

## 2. WORKFLOW SCENARIOS

### Scenario A: Instructor Workflow
1. Login as instructor@erudite.edu / instructor123
2. Navigate to teaching courses
3. Create new learning outcome for a course
4. Create assignment with rubric
5. View student submissions
6. Grade student submission with feedback
7. Send message to student
8. View dashboard

### Scenario B: Student Workflow
1. Login as student@erudite.edu / student123
2. View enrolled courses
3. View learning outcomes and competency levels
4. View and submit assignment
5. View submission status and grade
6. View badges and leaderboard
7. View inbox for messages
8. View dashboard

### Scenario C: Admin Workflow
1. Login as admin@admin.com / admin123
2. View system dashboard
3. Manage users (optional)
4. View system logs (if available)

---

## 3. TEST DATA REQUIREMENTS

**Users Seeded**:
- ✅ Admin: admin@admin.com / admin123
- ✅ Instructor: instructor@erudite.edu / instructor123
- ✅ Students: student@erudite.edu / student123

**Courses Seeded**: (verify in database)
- Course 1 assigned to instructor
- Students enrolled in courses

**Expected Data**:
- At least 2-3 courses
- 3-5 students enrolled per course
- 2-3 assignments created
- 2-3 submissions by students

---

## 4. VERIFICATION CHECKLIST

### API Endpoints Verified
- [ ] GET /api/user (auth check)
- [ ] GET /api/courses (list courses)
- [ ] GET /api/courses/{courseId}/learning-outcomes
- [ ] POST /api/courses/{courseId}/learning-outcomes
- [ ] GET /api/courses/{courseId}/student-competencies
- [ ] GET /api/courses/{courseId}/assignments
- [ ] POST /api/courses/{courseId}/assignments
- [ ] POST /api/submissions (student submits)
- [ ] GET /api/submissions (view submissions)
- [ ] PUT /api/submissions/{id}/grade (instructor grades)
- [ ] POST /api/messages/send-to-student
- [ ] POST /api/messages/broadcast
- [ ] GET /api/messages (inbox)

### Frontend Routes Verified
- [ ] / (landing or redirect to dashboard)
- [ ] /login (login page)
- [ ] /student/dashboard
- [ ] /student/courses
- [ ] /student/assignments
- [ ] /student/competencies
- [ ] /student/badges
- [ ] /student/leaderboard
- [ ] /instructor/dashboard
- [ ] /instructor/courses
- [ ] /instructor/learning-outcomes
- [ ] /instructor/assignments
- [ ] /instructor/submissions
- [ ] /instructor/grading
- [ ] /instructor/messages
- [ ] /admin/dashboard (if exists)

### Error Handling Verified
- [ ] 401 Unauthorized redirects to login
- [ ] 403 Forbidden prevents access to other user's data
- [ ] 404 Not Found shows error message
- [ ] 422 Validation errors show field errors
- [ ] Network errors show toast notification

---

## 5. REAL DATA VERIFICATION TARGETS

**NO SIMULATED/HALLUCINATED DATA**:
- ❌ Do NOT use pre-hardcoded badge data (must come from database)
- ❌ Do NOT use fake student list (must fetch from API)
- ❌ Do NOT use mock leaderboard (must calculate from real submissions)
- ❌ Do NOT use simulated submissions (must be real submissions)

**ALL DATA MUST**:
- ✅ Come from Laravel API endpoints
- ✅ Store in MySQL database
- ✅ Be retrievable via Sanctum Bearer token
- ✅ Respect user authorization (student sees own data only)
- ✅ Include proper timestamps and metadata

---

## 6. ISSUES FOUND & FIXES

| Issue | Component | Status | Fix |
|-------|-----------|--------|-----|
| (To be filled during testing) | | | |

---

## 7. SIGN-OFF CRITERIA

✅ ALL of the following must pass:
- All authentication workflows work for all 3 roles
- All 5 features (Learning Outcomes, Assignments, Messaging, Gamification, Dashboard) are functional
- No console errors (check browser DevTools)
- No API 500 errors (check backend logs)
- No hardcoded/simulated data anywhere (all from API)
- All user roles see role-appropriate UI
- Cross-user authorization works (student can't see other student's submissions)
- Database has real data (verify with query)
- System ready for 24-hour deadline submission

---

**Next Action**: Begin manual testing workflow A (Instructor) → B (Student) → C (Admin)

