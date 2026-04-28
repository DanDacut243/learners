# ERUDITE Platform - API Reference Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000/api`  
**Authentication:** Laravel Sanctum (Bearer Token)  
**Content-Type:** `application/json`

---

## 1. Authentication Endpoints

### Login
**Endpoint:** `POST /api/auth/login`  
**Authentication:** None (public endpoint)  
**Description:** Authenticate user and receive API token

**Request:**
```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@admin.com",
    "role": "admin",
    "avatar": "https://example.com/avatar.jpg",
    "subtitle": "Platform Administrator",
    "created_at": "2026-04-25T10:00:00Z",
    "updated_at": "2026-04-25T10:00:00Z"
  },
  "token": "1|dJaI8KzB3FwX2mP9vL4qR6sT8uVwXyZ..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

**Usage (Frontend - Axios):**
```typescript
const response = await axios.post('/auth/login', {
  email: 'admin@admin.com',
  password: 'admin123'
});
localStorage.setItem('token', response.data.token);
```

---

### Get Current User
**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required (Bearer token)  
**Description:** Get authenticated user profile

**Request Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@admin.com",
  "role": "admin",
  "avatar": "https://example.com/avatar.jpg",
  "subtitle": "Platform Administrator",
  "created_at": "2026-04-25T10:00:00Z",
  "updated_at": "2026-04-25T10:00:00Z"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

---

### Logout
**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Required (Bearer token)  
**Description:** Invalidate current API token

**Request Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Usage (Frontend):**
```typescript
await axios.post('/auth/logout', {}, {
  headers: { Authorization: `Bearer ${token}` }
});
localStorage.removeItem('token');
```

---

## 2. User Management Endpoints

### List All Users
**Endpoint:** `GET /api/users`  
**Authentication:** Required (Admin)  
**Description:** Get all users with pagination

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `per_page` (optional, default: 15) - Items per page
- `role` (optional) - Filter by role: "admin", "instructor", "student"

**Request:**
```
GET /api/users?page=1&per_page=15&role=instructor
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@admin.com",
      "role": "admin",
      "avatar": "https://...",
      "subtitle": "Platform Administrator",
      "created_at": "2026-04-25T10:00:00Z"
    },
    {
      "id": 2,
      "name": "John Instructor",
      "email": "john@school.edu",
      "role": "instructor",
      "avatar": "https://...",
      "subtitle": "Chemistry Department",
      "created_at": "2026-04-25T10:05:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 7,
    "last_page": 1
  }
}
```

---

### Get User by ID
**Endpoint:** `GET /api/users/{id}`  
**Authentication:** Required  
**Description:** Get specific user details

**Request:**
```
GET /api/users/2
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "id": 2,
  "name": "John Instructor",
  "email": "john@school.edu",
  "role": "instructor",
  "avatar": "https://...",
  "subtitle": "Chemistry Department",
  "created_at": "2026-04-25T10:05:00Z",
  "updated_at": "2026-04-25T10:05:00Z",
  "enrollments": [
    {
      "id": 5,
      "course_id": 3,
      "status": "active",
      "enrolled_at": "2026-04-25T10:10:00Z"
    }
  ],
  "grades": [
    {
      "id": 1,
      "course_id": 3,
      "grade": 87,
      "created_at": "2026-04-25T11:00:00Z"
    }
  ]
}
```

---

### Create User
**Endpoint:** `POST /api/users`  
**Authentication:** Required (Admin only)  
**Description:** Create new user account

**Request Body:**
```json
{
  "name": "Jane Student",
  "email": "jane@school.edu",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123",
  "role": "student",
  "avatar": null,
  "subtitle": "First-year student"
}
```

**Success Response (201 Created):**
```json
{
  "id": 8,
  "name": "Jane Student",
  "email": "jane@school.edu",
  "role": "student",
  "avatar": null,
  "subtitle": "First-year student",
  "created_at": "2026-04-25T14:30:00Z",
  "updated_at": "2026-04-25T14:30:00Z"
}
```

**Validation Error Response (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

---

### Update User
**Endpoint:** `PUT /api/users/{id}`  
**Authentication:** Required (Admin or user self)  
**Description:** Update user details

**Request Body:**
```json
{
  "name": "Jane Doe",
  "subtitle": "Second-year student",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Success Response (200 OK):**
```json
{
  "id": 8,
  "name": "Jane Doe",
  "email": "jane@school.edu",
  "role": "student",
  "avatar": "https://example.com/new-avatar.jpg",
  "subtitle": "Second-year student",
  "updated_at": "2026-04-25T15:00:00Z"
}
```

---

### Delete User
**Endpoint:** `DELETE /api/users/{id}`  
**Authentication:** Required (Admin only)  
**Description:** Delete user (cascades related data)

**Request:**
```
DELETE /api/users/8
Authorization: Bearer {token}
```

**Success Response (204 No Content):**
```
(Empty body)
```

---

## 3. Course Management Endpoints

### List All Courses
**Endpoint:** `GET /api/courses`  
**Authentication:** Required  
**Description:** Get all courses with instructor info

**Query Parameters:**
- `status` (optional) - Filter: "active", "draft", "archived"
- `instructor_id` (optional) - Filter by instructor

**Request:**
```
GET /api/courses?status=active
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Introduction to Python",
    "description": "Learn Python basics",
    "instructor_id": 2,
    "instructor": {
      "id": 2,
      "name": "John Instructor",
      "email": "john@school.edu"
    },
    "capacity": 50,
    "status": "active",
    "start_date": "2026-05-01T00:00:00Z",
    "end_date": "2026-08-01T00:00:00Z",
    "created_at": "2026-04-25T10:00:00Z",
    "enrollments": [
      {
        "id": 1,
        "user_id": 3,
        "status": "active"
      }
    ]
  }
]
```

---

### Get Course by ID
**Endpoint:** `GET /api/courses/{id}`  
**Authentication:** Required  
**Description:** Get course details with all relationships

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Introduction to Python",
  "description": "Learn Python basics",
  "instructor_id": 2,
  "instructor": { ... },
  "capacity": 50,
  "status": "active",
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-08-01T00:00:00Z",
  "created_at": "2026-04-25T10:00:00Z",
  "enrollments": [ ... ],
  "schedules": [
    {
      "id": 1,
      "course_id": 1,
      "day_of_week": "Monday",
      "start_time": "09:00:00",
      "end_time": "10:30:00"
    }
  ],
  "grades": [ ... ]
}
```

---

### Create Course
**Endpoint:** `POST /api/courses`  
**Authentication:** Required (Instructor or Admin)  
**Description:** Create new course

**Request Body:**
```json
{
  "name": "Advanced Python",
  "description": "Intermediate Python course",
  "capacity": 40,
  "start_date": "2026-06-01T00:00:00Z",
  "end_date": "2026-09-01T00:00:00Z",
  "status": "draft"
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "name": "Advanced Python",
  "description": "Intermediate Python course",
  "instructor_id": 2,
  "capacity": 40,
  "status": "draft",
  "start_date": "2026-06-01T00:00:00Z",
  "end_date": "2026-09-01T00:00:00Z",
  "created_at": "2026-04-25T16:00:00Z"
}
```

---

### Update Course
**Endpoint:** `PUT /api/courses/{id}`  
**Authentication:** Required (Course instructor or Admin)  
**Description:** Update course details or status

**Request Body:**
```json
{
  "status": "active",
  "capacity": 45
}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "name": "Advanced Python",
  "status": "active",
  "capacity": 45,
  "updated_at": "2026-04-25T16:30:00Z"
}
```

---

### Delete Course
**Endpoint:** `DELETE /api/courses/{id}`  
**Authentication:** Required (Admin)  
**Description:** Delete course (cascades enrollments, grades)

**Response (204 No Content):**
```
(Empty body)
```

---

## 4. Enrollment Endpoints

### List Student's Courses
**Endpoint:** `GET /api/enrollments`  
**Authentication:** Required  
**Description:** Get courses student is enrolled in

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 3,
    "course_id": 1,
    "status": "active",
    "enrolled_at": "2026-04-25T10:00:00Z",
    "course": {
      "id": 1,
      "name": "Introduction to Python",
      "instructor": { ... },
      "status": "active"
    }
  }
]
```

---

### Enroll Student in Course
**Endpoint:** `POST /api/enrollments`  
**Authentication:** Required (Student or Admin)  
**Description:** Create course enrollment

**Request Body:**
```json
{
  "course_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 8,
  "user_id": 3,
  "course_id": 1,
  "status": "active",
  "enrolled_at": "2026-04-25T14:30:00Z"
}
```

**Error (422 - Already Enrolled):**
```json
{
  "message": "Student already enrolled in this course"
}
```

---

### Unenroll Student
**Endpoint:** `DELETE /api/enrollments/{id}`  
**Authentication:** Required (Student or Admin)  
**Description:** Remove enrollment

**Response (204 No Content):**
```
(Empty body)
```

---

## 5. Grade Endpoints

### List Student's Grades
**Endpoint:** `GET /api/grades`  
**Authentication:** Required  
**Description:** Get student's grades

**Query Parameters:**
- `course_id` (optional) - Filter by course

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 3,
    "course_id": 1,
    "grade": 87,
    "comment": "Great work!",
    "created_at": "2026-04-25T15:00:00Z",
    "course": {
      "id": 1,
      "name": "Introduction to Python"
    }
  }
]
```

---

### Post Grade for Student
**Endpoint:** `POST /api/grades`  
**Authentication:** Required (Instructor)  
**Description:** Instructor posts grade for student

**Request Body:**
```json
{
  "user_id": 3,
  "course_id": 1,
  "grade": 92,
  "comment": "Excellent performance"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "user_id": 3,
  "course_id": 1,
  "grade": 92,
  "comment": "Excellent performance",
  "created_at": "2026-04-25T15:30:00Z"
}
```

**Error (403 - Not Instructor):**
```json
{
  "message": "Only course instructors can post grades"
}
```

---

### Update Grade
**Endpoint:** `PUT /api/grades/{id}`  
**Authentication:** Required (Instructor)  
**Description:** Update existing grade

**Request Body:**
```json
{
  "grade": 95,
  "comment": "Updated comment"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "grade": 95,
  "comment": "Updated comment",
  "updated_at": "2026-04-25T16:00:00Z"
}
```

---

### Delete Grade
**Endpoint:** `DELETE /api/grades/{id}`  
**Authentication:** Required (Instructor or Admin)  
**Description:** Remove grade

**Response (204 No Content):**
```
(Empty body)
```

---

## 6. Notification Endpoints

### List User's Notifications
**Endpoint:** `GET /api/notifications`  
**Authentication:** Required  
**Description:** Get user notifications

**Query Parameters:**
- `read` (optional) - Filter: "true" (read) or "false" (unread)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 3,
    "title": "Course enrolled",
    "message": "You successfully enrolled in Python 101",
    "type": "info",
    "read_at": null,
    "created_at": "2026-04-25T10:00:00Z"
  },
  {
    "id": 2,
    "user_id": 3,
    "title": "Grade posted",
    "message": "You received a grade of 92 in Python 101",
    "type": "success",
    "read_at": "2026-04-25T10:05:00Z",
    "created_at": "2026-04-25T10:02:00Z"
  }
]
```

---

### Mark Notification as Read
**Endpoint:** `POST /api/notifications/{id}/mark-read`  
**Authentication:** Required  
**Description:** Mark notification as read

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "read_at": "2026-04-25T14:30:00Z"
}
```

---

### Mark All as Read
**Endpoint:** `POST /api/notifications/mark-all-read`  
**Authentication:** Required  
**Description:** Mark all user notifications as read

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read"
}
```

---

## 7. Announcement Endpoints

### List Announcements
**Endpoint:** `GET /api/announcements`  
**Authentication:** Required  
**Description:** Get all announcements

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "New course available",
    "content": "Python basics starting May 1",
    "created_by": 1,
    "creator": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@admin.com"
    },
    "created_at": "2026-04-25T12:00:00Z"
  }
]
```

---

### Create Announcement
**Endpoint:** `POST /api/announcements`  
**Authentication:** Required (Admin only)  
**Description:** Post announcement (creates notifications for all users)

**Request Body:**
```json
{
  "title": "Maintenance scheduled",
  "content": "System maintenance on Saturday, May 4 from 2-4 AM"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "title": "Maintenance scheduled",
  "content": "System maintenance on Saturday, May 4 from 2-4 AM",
  "created_by": 1,
  "created_at": "2026-04-25T13:00:00Z"
}
```

---

## 8. Schedule Endpoints

### List Course Schedules
**Endpoint:** `GET /api/schedules?course_id={id}`  
**Authentication:** Required  
**Description:** Get class schedule for course

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "course_id": 1,
    "day_of_week": "Monday",
    "start_time": "09:00:00",
    "end_time": "10:30:00",
    "created_at": "2026-04-25T10:00:00Z"
  },
  {
    "id": 2,
    "course_id": 1,
    "day_of_week": "Wednesday",
    "start_time": "09:00:00",
    "end_time": "10:30:00",
    "created_at": "2026-04-25T10:00:00Z"
  }
]
```

---

## 9. Error Responses

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request (resource created) |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Malformed JSON |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 500 | Server Error | Internal server error |

### Error Response Format

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Error message for field"]
  }
}
```

---

## 10. Request/Response Examples

### Complete Example: Create Course then Enroll

**Step 1: Instructor creates course**
```bash
curl -X POST http://localhost:8000/api/courses \
  -H "Authorization: Bearer 1|dJaI8KzB3FwX..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development 101",
    "description": "Learn web development",
    "capacity": 30,
    "start_date": "2026-05-15T00:00:00Z",
    "end_date": "2026-08-15T00:00:00Z",
    "status": "draft"
  }'
```

**Response:**
```json
{
  "id": 6,
  "name": "Web Development 101",
  "description": "Learn web development",
  "instructor_id": 2,
  "capacity": 30,
  "status": "draft",
  "start_date": "2026-05-15T00:00:00Z",
  "end_date": "2026-08-15T00:00:00Z",
  "created_at": "2026-04-25T17:00:00Z"
}
```

**Step 2: Instructor publishes course**
```bash
curl -X PUT http://localhost:8000/api/courses/6 \
  -H "Authorization: Bearer 1|dJaI8KzB3FwX..." \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

**Step 3: Student lists available courses**
```bash
curl -X GET http://localhost:8000/api/courses?status=active \
  -H "Authorization: Bearer 2|aAbBcCdDeEfFgGhHiIjJkKlMmNnO..."
```

**Step 4: Student enrolls in course**
```bash
curl -X POST http://localhost:8000/api/courses/6/enroll \
  -H "Authorization: Bearer 2|aAbBcCdDeEfFgGhHiIjJkKlMmNnO..."
```

---

## 11. Authentication Header Format

All protected endpoints require:

```
Authorization: Bearer {token}
```

Where `{token}` is the token returned from the login endpoint.

**Example:**
```
Authorization: Bearer 1|dJaI8KzB3FwX2mP9vL4qR6sT8uVwXyZ1aAbBcCdDeEfFgGhHiIjJkKlMmNnOpPqQ
```

---

## 12. Rate Limiting

Currently implemented: No rate limiting  
Recommended for production: 100 requests per minute per user

---

## 13. API Documentation Summary

| Resource | Method | Endpoint | Auth | Role |
|----------|--------|----------|------|------|
| **Auth** |
| Login | POST | /auth/login | No | - |
| Get Me | GET | /auth/me | Yes | - |
| Logout | POST | /auth/logout | Yes | - |
| **Users** |
| List | GET | /users | Yes | Admin |
| Show | GET | /users/{id} | Yes | - |
| Create | POST | /users | Yes | Admin |
| Update | PUT | /users/{id} | Yes | Admin/Self |
| Delete | DELETE | /users/{id} | Yes | Admin |
| **Courses** |
| List | GET | /courses | Yes | - |
| Show | GET | /courses/{id} | Yes | - |
| Create | POST | /courses | Yes | Instructor/Admin |
| Update | PUT | /courses/{id} | Yes | Instructor/Admin |
| Delete | DELETE | /courses/{id} | Yes | Admin |
| **Enrollments** |
| List | GET | /enrollments | Yes | - |
| Create | POST | /enrollments | Yes | - |
| Delete | DELETE | /enrollments/{id} | Yes | - |
| **Grades** |
| List | GET | /grades | Yes | - |
| Create | POST | /grades | Yes | Instructor |
| Update | PUT | /grades/{id} | Yes | Instructor |
| Delete | DELETE | /grades/{id} | Yes | Instructor/Admin |
| **Notifications** |
| List | GET | /notifications | Yes | - |
| Mark Read | POST | /notifications/{id}/mark-read | Yes | - |
| Mark All Read | POST | /notifications/mark-all-read | Yes | - |
| **Announcements** |
| List | GET | /announcements | Yes | - |
| Create | POST | /announcements | Yes | Admin |
| **Schedules** |
| List | GET | /schedules | Yes | - |

---

**API Version:** 1.0.0  
**Last Updated:** 2026-04-25  
**Status:** Production Ready
