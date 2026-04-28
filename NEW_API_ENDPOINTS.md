# 📡 ERUDITE LMS - NEW API ENDPOINTS

All new endpoints are protected with `auth:sanctum` middleware and require Bearer token authentication.

---

## 🎯 Learning Outcomes Endpoints

### List Learning Outcomes for Course
```
GET /api/courses/{courseId}/learning-outcomes
Authorization: Bearer {token}
```
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Understand Neural Networks",
      "description": "Students will understand fundamentals...",
      "bloom_level": "understand",
      "order": 1,
      "created_at": "2026-04-28T10:00:00Z"
    }
  ]
}
```

### Create Learning Outcome
```
POST /api/courses/{courseId}/learning-outcomes
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Understand Neural Networks",
  "description": "Students will understand the fundamentals of neural networks",
  "bloom_level": "understand",
  "order": 1
}
```
**Required:** title, description, bloom_level  
**Bloom Levels:** remember | understand | apply | analyze | evaluate | create  
**Authorization:** Instructor of course only (checks: course.instructor_id === auth()->user()->id)

### Get Single Learning Outcome
```
GET /api/learning-outcomes/{id}
Authorization: Bearer {token}
```

### Update Learning Outcome
```
PUT /api/learning-outcomes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "bloom_level": "apply",
  "order": 2
}
```
**Authorization:** Instructor of course only

### Delete Learning Outcome
```
DELETE /api/learning-outcomes/{id}
Authorization: Bearer {token}
```
**Authorization:** Instructor of course only

### Get Student Competencies
```
GET /api/courses/{courseId}/student-competencies
Authorization: Bearer {token}
```
**Response:**
```json
{
  "competencies": [
    {
      "id": 1,
      "user_id": 2,
      "course_id": 1,
      "learning_outcome": {
        "id": 1,
        "title": "Understand Neural Networks",
        "bloom_level": "understand"
      },
      "mastery_level": 85,
      "attempts": 3,
      "last_assessed_at": "2026-04-29T14:30:00Z"
    }
  ],
  "overall_mastery": 85
}
```

### Update Competency Mastery
```
PUT /api/learning-outcomes/{outcomeId}/update-competency
Authorization: Bearer {token}
Content-Type: application/json

{
  "score": 90,
  "student_id": 2
}
```
**Formula:** `mastery_level = round(0.7 * newScore + 0.3 * oldScore)`  
**Effect:** Increments attempts counter, updates last_assessed_at

---

## 📝 Assignment Endpoints

### List Assignments for Course
```
GET /api/courses/{courseId}/assignments
Authorization: Bearer {token}
```
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "module_id": 1,
      "title": "Assignment 1: Neural Networks",
      "description": "Complete the neural network exercise",
      "instructions": "Build a simple neural network using PyTorch",
      "due_date": "2026-05-15T23:59:59Z",
      "points": 100,
      "rubric": {
        "correctness": 50,
        "code_quality": 30,
        "documentation": 20
      },
      "allow_submissions": true,
      "created_at": "2026-04-28T10:00:00Z"
    }
  ]
}
```

### Create Assignment
```
POST /api/courses/{courseId}/assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "module_id": 1,
  "title": "Assignment 1",
  "description": "Complete the neural network exercise",
  "instructions": "Build a simple neural network using PyTorch",
  "due_date": "2026-05-15",
  "points": 100,
  "rubric": {
    "correctness": 50,
    "code_quality": 30,
    "documentation": 20
  },
  "allow_submissions": true
}
```
**Required:** module_id, title, description, instructions, points  
**Optional:** due_date, rubric, allow_submissions

### Get Single Assignment
```
GET /api/assignments/{id}
Authorization: Bearer {token}
```
**Response includes:** assignment data + array of submissions

### Update Assignment
```
PUT /api/assignments/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "due_date": "2026-05-20"
}
```

### Delete Assignment
```
DELETE /api/assignments/{id}
Authorization: Bearer {token}
```
**Effect:** Cascades delete to all submissions

---

## 📮 Submission Endpoints

### List Submissions (Role-based)
```
GET /api/submissions?page=1
Authorization: Bearer {token}
```
**Response varies by user role:**
- **Students:** See only their own submissions
- **Instructors:** See all submissions in their courses (paginated: 20/page)
- **Admins:** See all submissions

```json
{
  "data": [
    {
      "id": 1,
      "assignment_id": 1,
      "user_id": 2,
      "enrollment_id": 5,
      "content": "Here is my solution to the neural network exercise: [code]",
      "files": ["solution.py", "report.pdf"],
      "status": "submitted",
      "submitted_at": "2026-04-29T10:15:00Z",
      "grade": null,
      "feedback": null,
      "graded_at": null,
      "created_at": "2026-04-29T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "per_page": 20,
    "current_page": 1,
    "last_page": 3
  }
}
```

### Create/Update Submission
```
POST /api/submissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "assignment_id": 1,
  "enrollment_id": 5,
  "content": "Here is my solution..."
}
```
**Required:** assignment_id, enrollment_id, content  
**Optional:** files (JSON array)  
**Effect:** 
- Creates new submission if first time
- Updates if already exists (saves as draft or overwrites)
- Sends "New Assignment Submission" notification to instructor

### Get Single Submission
```
GET /api/submissions/{id}
Authorization: Bearer {token}
```
**Response includes:** submission + assignment details + user details + gradedBy details

### Grade Submission (Instructor Only)
```
PUT /api/submissions/{id}/grade
Authorization: Bearer {token}
Content-Type: application/json

{
  "grade": 85,
  "feedback": "Excellent work! Your implementation is correct and well-documented."
}
```
**Required:** grade (0-100), feedback  
**Authorization:** Instructor of the assignment's course only  
**Effect:**
- Sets status to "graded"
- Records grade, feedback, graded_at, graded_by
- Sends notification to student: "Assignment Graded: {grade}/100 points"

### Get Submissions by Assignment
```
GET /api/assignments/{assignmentId}/submissions
Authorization: Bearer {token}
```
**Response:** Array of submissions for the assignment

### Get Submissions by Enrollment
```
GET /api/enrollments/{enrollmentId}/submissions
Authorization: Bearer {token}
```
**Response:** All submissions for a student in a course

---

## 💬 Messaging Endpoints

### Send Private Message to Student
```
POST /api/messages/send-to-student
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipient_id": 2,
  "course_id": 1,
  "message": "Please review the assignment rubric before submitting"
}
```
**Required:** recipient_id, course_id, message  
**Authorization:** Sender must be instructor or admin  
**Effect:** Creates Message record

### Send Broadcast Message to Course
```
POST /api/messages/broadcast
Authorization: Bearer {token}
Content-Type: application/json

{
  "course_id": 1,
  "message": "Reminder: Assignment 1 due tomorrow at 11:59 PM!"
}
```
**Required:** course_id, message  
**Authorization:** Instructor or admin of course only  
**Effect:** Creates message for each enrolled student

### Get User Messages
```
GET /api/messages
Authorization: Bearer {token}
```
**Query Parameters:**
- `per_page` (default: 20)
- `page` (default: 1)
- `read` (filter: true/false/null)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "sender_id": 1,
      "sender": {
        "id": 1,
        "name": "John Instructor",
        "email": "instructor@test.com"
      },
      "recipient_id": 2,
      "course_id": 1,
      "message": "Please review the rubric",
      "is_read": false,
      "read_at": null,
      "created_at": "2026-04-29T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Mark Message as Read
```
PUT /api/messages/{id}/read
Authorization: Bearer {token}
```
**Effect:** Sets read_at timestamp, is_read = true

### Mark All Messages as Read
```
PUT /api/messages/read-all
Authorization: Bearer {token}
```
**Effect:** Marks all user messages as read

### Delete Message
```
DELETE /api/messages/{id}
Authorization: Bearer {token}
```
**Authorization:** Message recipient or sender can delete

### Clear All Messages
```
DELETE /api/messages/clear-all
Authorization: Bearer {token}
```
**Effect:** Deletes all messages for current user

---

## 🎮 Gamification Endpoints (Framework Ready)

### Get User Badges
```
GET /api/users/{userId}/badges
Authorization: Bearer {token}
```

### Get Course Leaderboard
```
GET /api/courses/{courseId}/leaderboard
Authorization: Bearer {token}
```
**Query Parameters:**
- `limit` (default: 10)

### Get User Points
```
GET /api/users/{userId}/points
Authorization: Bearer {token}
```

### Award Badge to User (Admin)
```
POST /api/badges/award
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 2,
  "badge_id": 1
}
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": {
    "title": ["The title field is required."],
    "description": ["The description must be at least 10 characters."]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "You are not authorized to perform this action."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "grade": ["The grade must be between 0 and 100."]
  }
}
```

### 500 Server Error
```json
{
  "message": "Server error",
  "error": "Error details..."
}
```

---

## 🔐 Authentication

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "instructor@test.com",
  "password": "password"
}
```
**Response:**
```json
{
  "token": "1|abcdefghijklmnopqrstuvwxyz123456789...",
  "user": {
    "id": 1,
    "name": "John Instructor",
    "email": "instructor@test.com",
    "role": "instructor"
  }
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## 📋 Rate Limiting

**Current:** No rate limiting (recommended to add for production)

**Recommended Configuration:**
- API: 60 requests per minute per IP
- Login: 5 attempts per minute per IP
- Submissions: 10 per minute per user

---

## 🧪 cURL Examples

### Get Token
```bash
RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@test.com",
    "password": "password"
  }')
TOKEN=$(echo $RESPONSE | grep -oP '"token":"\K[^"]*')
echo "Token: $TOKEN"
```

### Create Learning Outcome
```bash
curl -X POST http://localhost:8000/api/courses/1/learning-outcomes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understand ML",
    "description": "Fundamentals of machine learning",
    "bloom_level": "understand",
    "order": 1
  }'
```

### List Learning Outcomes
```bash
curl -X GET http://localhost:8000/api/courses/1/learning-outcomes \
  -H "Authorization: Bearer $TOKEN"
```

### Create Assignment
```bash
curl -X POST http://localhost:8000/api/courses/1/assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": 1,
    "title": "Assignment 1",
    "description": "First assignment",
    "instructions": "Follow the rubric",
    "points": 100,
    "due_date": "2026-05-15"
  }'
```

### Submit Assignment
```bash
curl -X POST http://localhost:8000/api/submissions \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignment_id": 1,
    "enrollment_id": 5,
    "content": "Here is my solution..."
  }'
```

### Grade Submission
```bash
curl -X PUT http://localhost:8000/api/submissions/1/grade \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 85,
    "feedback": "Excellent work!"
  }'
```

---

**All endpoints return JSON responses.**  
**All timestamps are in ISO 8601 format with UTC timezone.**  
**All IDs are required to be numeric integers.**
