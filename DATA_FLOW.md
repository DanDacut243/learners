# ERUDITE Platform - Data Flow Documentation

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2026-04-25

---

## 1. Complete Data Flow Overview

This document explains how data flows through the ERUDITE platform from user interaction to database storage and back to the UI.

---

## 2. Core Data Flow Patterns

### Pattern A: Fetching Data (GET Request)

```
USER ACTION: Navigate to Admin Dashboard
    ↓
1. COMPONENT MOUNT
   └─ useEffect(() => { fetchData() }, [])

2. API CALL (Frontend)
   ├─ URL: GET http://localhost:8000/api/users
   ├─ Headers: {
   │    Authorization: "Bearer {token}",
   │    Content-Type: "application/json"
   │  }
   └─ Body: None (GET requests don't have body)

3. REQUEST INTERCEPTOR (Axios)
   ├─ Retrieve token from localStorage
   ├─ Add Authorization header if token exists
   ├─ Set Content-Type to application/json
   └─ Send request to backend

4. BACKEND RECEIVES (Laravel Router)
   ├─ Method: GET
   ├─ Path: /api/users
   ├─ Route maps to: UserController@index

5. MIDDLEWARE PROCESSING
   ├─ Sanctum Auth Middleware
   │  ├─ Extract Bearer token from Authorization header
   │  ├─ Find matching PersonalAccessToken in database
   │  ├─ Verify token hasn't expired
   │  ├─ Attach user to $request (via $request->user())
   │  └─ If invalid → Return 401 Unauthorized
   │
   └─ Other middleware (CORS, etc.)

6. CONTROLLER EXECUTION (UserController@index)
   ├─ Get authenticated user: $user = $request->user()
   ├─ Query database: $users = User::all()
   │  └─ SQL: SELECT * FROM users
   │
   ├─ Eager load relationships (optimize queries)
   │  └─ $users = User::with('enrollments', 'grades')->get()
   │  └─ Prevents N+1 query problem
   │
   ├─ Apply filtering/pagination if needed
   │  └─ $users = User::paginate(15)
   │
   └─ Return response: return response()->json($users)

7. DATABASE QUERY EXECUTION
   ├─ Laravel Eloquent ORM generates SQL
   ├─ SQL Query: SELECT * FROM users LEFT JOIN enrollments ...
   ├─ MySQL executes query
   ├─ Database returns result set
   └─ Eloquent maps result to User models

8. RESPONSE SERIALIZATION
   ├─ Convert User models to JSON
   ├─ Relationships converted to nested JSON
   └─ Response body:
      [
        {
          id: 1,
          name: "Admin User",
          email: "admin@admin.com",
          role: "admin",
          avatar: "https://...",
          enrollments: [...],
          grades: [...]
        },
        ...
      ]

9. HTTP RESPONSE SENT
   ├─ Status Code: 200 OK
   ├─ Headers: Content-Type: application/json
   └─ Body: JSON user array

10. RESPONSE INTERCEPTOR (Axios)
    ├─ Status code checked (200 is success)
    ├─ Response body extracted
    └─ Return data to component

11. COMPONENT STATE UPDATE (Frontend)
    ├─ setUsers(data)  // Update state with fetched data
    ├─ setLoading(false)  // Hide loading spinner
    └─ Component re-renders

12. UI DISPLAY
    ├─ Map through users array
    ├─ Render user cards/rows
    ├─ Display name, email, role, avatar
    └─ User sees data on screen
```

### Pattern B: Creating/Posting Data (POST Request)

```
USER ACTION: Admin creates new user
    ↓
1. FORM SUBMISSION (Frontend)
   ├─ User fills form:
   │  ├─ Name: "John Instructor"
   │  ├─ Email: "john@school.edu"
   │  ├─ Password: "SecurePass123"
   │  └─ Role: "instructor"
   │
   ├─ Form validation (client-side for UX)
   │  ├─ Email format check
   │  ├─ Password strength check
   │  └─ Required fields check
   │
   └─ handleSubmit() called

2. API CALL (Frontend)
   ├─ URL: POST http://localhost:8000/api/users
   ├─ Headers: {
   │    Authorization: "Bearer {token}",
   │    Content-Type: "application/json"
   │  }
   └─ Body (JSON):
      {
        "name": "John Instructor",
        "email": "john@school.edu",
        "password": "SecurePass123",
        "role": "instructor"
      }

3. REQUEST PROCESSING (Axios)
   ├─ Serialize form data to JSON
   ├─ Add Authorization header with token
   ├─ Send POST request to backend

4. BACKEND RECEIVES (Laravel)
   ├─ Method: POST
   ├─ Path: /api/users
   ├─ Route maps to: UserController@store
   └─ Request body deserialized from JSON

5. MIDDLEWARE PROCESSING
   ├─ Sanctum authentication (verify token)
   ├─ Role authorization (check if admin)
   └─ If not admin → Return 403 Forbidden

6. INPUT VALIDATION (FormRequest / validate())
   ├─ Name validation
   │  ├─ Required: true
   │  ├─ String: true
   │  ├─ Max length: 255
   │  └─ Result: ✓ Pass
   │
   ├─ Email validation
   │  ├─ Required: true
   │  ├─ Email format: true
   │  ├─ Unique in users table: true
   │  └─ Result: ✓ Pass
   │
   ├─ Password validation
   │  ├─ Required: true
   │  ├─ Min length: 8
   │  ├─ Confirmed: true (password_confirmation)
   │  └─ Result: ✓ Pass
   │
   └─ Role validation
      ├─ Required: true
      ├─ In: [admin, instructor, student]
      └─ Result: ✓ Pass

   IF VALIDATION FAILS (e.g., email already exists):
   ├─ Return 422 Unprocessable Entity
   ├─ Response body:
      {
        "message": "The given data was invalid.",
        "errors": {
          "email": ["The email has already been taken."]
        }
      }
   └─ Frontend displays errors and doesn't create user

7. CONTROLLER LOGIC (UserController@store)
   ├─ Create new User model: $user = new User()
   ├─ Set attributes from request
   ├─ Hash password securely
   │  └─ Password: SecurePass123
   │  └─ Hashed: $2y$10$...hash...
   │  └─ Cannot be reversed
   │
   ├─ Add additional fields
   │  ├─ Created at: current timestamp
   │  ├─ Avatar: default or provided URL
   │  └─ Subtitle: job title or description
   │
   └─ Save to database: $user->save()

8. DATABASE INSERT OPERATION
   ├─ SQL Query Generated:
      INSERT INTO users (
        name, email, password, role, 
        avatar, subtitle, created_at, updated_at
      ) VALUES (
        'John Instructor', 'john@school.edu', 
        '$2y$10$...hash...', 'instructor',
        NULL, NULL, 2026-04-25 10:30:00, 2026-04-25 10:30:00
      )
   │
   ├─ Constraints checked:
   │  ├─ Email uniqueness: ✓ Pass (email not in DB)
   │  ├─ NOT NULL fields: ✓ Pass (all provided)
   │  ├─ Enum values: ✓ Pass (role = "instructor" valid)
   │  └─ Data types: ✓ Pass (all correct types)
   │
   ├─ Row inserted into users table
   ├─ New user_id auto-generated: 8
   └─ Database returns inserted user object

9. RESPONSE PREPARATION
   ├─ User object retrieved from database
   ├─ Converted to JSON (without sensitive data)
   └─ Response body:
      {
        "id": 8,
        "name": "John Instructor",
        "email": "john@school.edu",
        "role": "instructor",
        "avatar": null,
        "subtitle": null,
        "created_at": "2026-04-25T10:30:00Z",
        "updated_at": "2026-04-25T10:30:00Z"
      }

10. HTTP RESPONSE SENT
    ├─ Status Code: 201 Created
    ├─ Location Header: /api/users/8
    └─ Body: Created user object (JSON)

11. FRONTEND RESPONSE HANDLING
    ├─ Response interceptor (Axios)
    ├─ Status 201 means success
    ├─ Extract user data from response
    └─ Return to component promise

12. COMPONENT STATE UPDATE
    ├─ try {
    │    const response = await usersApi.create(formData)
    │    setUsers([...users, response.data])  // Add new user to list
    │    toast("User created successfully")
    │    setModalOpen(false)  // Close form
    │    resetForm()  // Clear form fields
    │  } catch (err) {
    │    toast(err.message, "error")  // Show error message
    │  }
    │
    └─ Component re-renders

13. UI UPDATES
    ├─ Modal closes
    ├─ New user appears in user list
    ├─ Toast notification shows: "User created successfully"
    └─ Admin sees new user in dashboard
```

### Pattern C: Updating Data (PUT Request)

```
USER ACTION: Admin updates user details
    ↓
1. EDIT FORM OPENED
   ├─ User object loaded: { id: 5, name: "Jane", email: "jane@..." }
   ├─ Form pre-filled with current data
   └─ Admin modifies field: name = "Jane Smith"

2. API CALL (PATCH/PUT)
   ├─ URL: PUT http://localhost:8000/api/users/5
   ├─ Headers: Authorization: Bearer {token}
   └─ Body: { name: "Jane Smith" }

3. BACKEND VALIDATION
   ├─ User with ID 5 exists? ✓ Yes
   ├─ Authenticated? ✓ Yes
   ├─ Authorized (admin or owner)? ✓ Yes
   └─ Continue

4. INPUT VALIDATION
   ├─ Name: "Jane Smith"
   │  ├─ Required: ✓ Pass
   │  ├─ String: ✓ Pass
   │  ├─ Max 255 chars: ✓ Pass
   │  └─ Result: Valid

5. CONTROLLER UPDATE (UserController@update)
   ├─ Find user: $user = User::findOrFail(5)
   ├─ Update attributes: $user->name = "Jane Smith"
   ├─ Save to database: $user->save()
   └─ SQL: UPDATE users SET name = 'Jane Smith', updated_at = NOW()

6. DATABASE UPDATE
   ├─ WHERE clause: id = 5
   ├─ SET clause: name = 'Jane Smith'
   ├─ Row updated in users table
   └─ Updated timestamp recorded

7. RESPONSE RETURN
   ├─ Return updated user object as JSON
   ├─ Status: 200 OK
   └─ Body: { id: 5, name: "Jane Smith", ... }

8. FRONTEND UPDATE
   ├─ Update state: 
   │  setUsers(users.map(u => 
   │    u.id === 5 ? response.data : u
   │  ))
   └─ Re-render list with updated user

9. UI SHOWS UPDATE
   ├─ List re-renders
   ├─ User row shows: "Jane Smith"
   └─ User sees their change immediately
```

### Pattern D: Deleting Data (DELETE Request)

```
USER ACTION: Admin deletes user
    ↓
1. CONFIRMATION DIALOG
   ├─ Admin clicks delete button
   ├─ Dialog: "Delete John Instructor?"
   └─ Admin confirms deletion

2. API CALL
   ├─ URL: DELETE http://localhost:8000/api/users/8
   ├─ Headers: Authorization: Bearer {token}
   └─ Body: None

3. BACKEND AUTHORIZATION
   ├─ Admin only? ✓ Yes
   └─ Continue

4. CONTROLLER DELETE (UserController@destroy)
   ├─ Find user: $user = User::findOrFail(8)
   ├─ Delete all related records (cascading):
   │  ├─ Enrollments: DELETE FROM enrollments WHERE user_id = 8
   │  ├─ Grades: DELETE FROM grades WHERE user_id = 8
   │  ├─ Notifications: DELETE FROM notifications WHERE user_id = 8
   │  └─ (other cascade relationships)
   │
   └─ Delete user: $user->delete()

5. DATABASE DELETION (with Cascading)
   ├─ Foreign keys with onDelete('cascade')
   ├─ When user deleted:
   │  ├─ All enrollments for this user deleted
   │  ├─ All grades for this user deleted
   │  ├─ All notifications for this user deleted
   │  └─ No orphaned records remain
   │
   └─ User row removed from users table

6. RESPONSE RETURN
   ├─ Status: 204 No Content
   └─ Body: Empty (no data to return)

7. FRONTEND CLEANUP
   ├─ Remove from state:
   │  setUsers(users.filter(u => u.id !== 8))
   ├─ Show success message
   │  toast("User deleted successfully")
   └─ Close any open dialogs

8. UI REFLECTS DELETION
   ├─ User disappears from list
   ├─ List count decrements
   └─ Admin sees updated user list
```

---

## 3. Feature-Specific Data Flows

### Feature: Course Enrollment

```
FLOW: Student enrolls in course

FRONTEND:
1. Student views available courses
   └─ GET /api/courses → Load all courses

2. Student clicks "Enroll" on a course
   └─ handleEnroll(courseId) called

3. API call made
   └─ POST /api/enrollments
      { course_id: 5, user_id: 3 }

BACKEND:
4. EnrollmentController@store
   ├─ Validate course exists: ✓
   ├─ Validate student not already enrolled: ✓
   ├─ Create enrollment:
   │  └─ INSERT INTO enrollments 
   │     (user_id, course_id, enrolled_at, status)
   │     VALUES (3, 5, NOW(), 'active')
   │
   ├─ Update course enrollment count
   └─ Return enrollment + course data

DATABASE:
5. New enrollment record created
   ├─ ID: 47
   ├─ User: 3
   ├─ Course: 5
   ├─ Status: active
   └─ Enrolled at: current timestamp

FRONTEND:
6. State updates
   ├─ Add enrollment to my enrollments
   ├─ Remove course from available list
   ├─ Show toast: "Enrolled successfully"
   └─ Re-render UI

RESULT:
7. Course appears in student's "My Courses"
8. Course no longer shows as available
9. Instructor sees +1 enrolled student
10. System maintains referential integrity
```

### Feature: Grading

```
FLOW: Instructor posts grade for student

FRONTEND:
1. Instructor views course students
   └─ GET /api/courses/5/enrollments

2. Instructor clicks "Post Grade" for student
   └─ Open form with fields:
      ├─ Student name (read-only)
      ├─ Course name (read-only)
      ├─ Grade (input, 0-100)
      └─ Comments (optional)

3. Instructor fills grade: 87

4. Submit form
   └─ POST /api/grades
      {
        user_id: 8,
        course_id: 5,
        grade: 87,
        comment: "Great work!"
      }

BACKEND:
5. GradeController@store
   ├─ Verify instructor owns course
   │  └─ Course.instructor_id === user.id ✓
   │
   ├─ Verify student enrolled in course
   │  └─ Enrollment exists ✓
   │
   ├─ Validate grade: 0-100 ✓
   │
   └─ Create grade record:
      INSERT INTO grades
      (user_id, course_id, grade, comment, created_at)
      VALUES (8, 5, 87, 'Great work!', NOW())

DATABASE:
6. Grade record created
   ├─ ID: 156
   ├─ Student: 8
   ├─ Course: 5
   ├─ Grade: 87
   └─ Created: timestamp

FRONTEND (Instructor):
7. Grade appears in course gradebook
   ├─ Student row shows: Grade: 87
   ├─ Average calculation updates
   └─ Toast: "Grade posted successfully"

FRONTEND (Student):
8. When student views grades
   └─ GET /api/my-grades → Includes new grade
   └─ Grade appears in their transcript

RESULT:
9. Instructor sees all student grades in one view
10. Student sees their grade when they check
11. Grade persists permanently in database
12. GPA calculations can include this grade
```

### Feature: Notifications

```
FLOW: Admin creates announcement → Students see notification

FRONTEND (Admin):
1. Admin navigates to announcements
2. Fills announcement form:
   ├─ Title: "New course available"
   ├─ Content: "Python basics starting May 1"
   └─ Submit

3. POST /api/announcements
   {
     title: "New course available",
     content: "Python basics starting May 1"
   }

BACKEND:
4. AnnouncementController@store
   ├─ Verify admin role ✓
   ├─ Validate content ✓
   └─ Create announcement:
      INSERT INTO announcements
      (title, content, created_by, created_at)
      VALUES (..., 1, NOW())

5. Create notifications for all users
   ├─ Loop through all users:
   │  └─ For each user_id in users table:
   │     INSERT INTO notifications
   │     (user_id, announcement_id, read_at, ...)
   │
   └─ 7 users → 7 notification records created

DATABASE:
6. Announcement created: ID 23
7. Notifications created: IDs 156-162

FRONTEND (Admin):
8. Announcement appears in list
   └─ Toast: "Announcement published"

FRONTEND (All Students):
9. Notification context fetches updates
   └─ GET /api/notifications
   └─ Returns new notification
   ├─ Notification badge updates
   ├─ Unread count: 1
   └─ Bell icon shows notification pending

10. Student clicks notification bell
    ├─ List expands
    ├─ Shows: "New course available"
    └─ Student clicks to read

11. Frontend marks as read
    └─ POST /api/notifications/156/mark-read
    └─ Sets read_at timestamp

DATABASE:
12. Notification marked as read
    └─ UPDATE notifications SET read_at = NOW()

RESULT:
13. Admin publishes one announcement
14. All students get notified automatically
15. Notifications persist in database
16. Students can see read/unread status
```

---

## 4. Real-Time Update Pattern

### WebSocket-Free Real-Time (Polling)

The current system uses polling for near-real-time updates:

```
Student Tab 1: "My Courses"
├─ Fetches: GET /api/my-courses
├─ Shows: [Course A, Course B]
├─ Sets polling interval: every 30 seconds
└─ useEffect cleanup removes interval on unmount

Instructor Tab (Different Browser): Grades "Course A" for Student
├─ POST /api/grades
└─ Database updated

Student Tab 1: Auto-poll happens
├─ GET /api/my-courses (called automatically after 30s)
├─ Server returns: [Course A, Course B, Course C]
│  └─ Course C is new (instructor added)
│
├─ State updates: setMyEnrollments(newCourses)
├─ Component re-renders
└─ Student sees new course

TIMING:
Max wait: 30 seconds
Min wait: 0 seconds (if user refreshes)
```

### Manual Refresh Pattern

```
User clicks "Refresh" button
├─ Manually trigger fetchData()
├─ GET /api/courses
├─ Update state immediately
└─ User sees latest data within 200ms
```

### Form Submission Pattern (Immediate Update)

```
User submits form to create course

Frontend optimistic update:
├─ Before API response:
│  ├─ setLoading(true)
│  ├─ Disable form
│  └─ Show loading spinner

Backend processes:
├─ Validate input
├─ Create database record
├─ Return created object

Frontend updates immediately:
├─ setCourses([...courses, newCourse])
├─ UI updates instantly
├─ User sees new course immediately

Result: No waiting, feels real-time
```

---

## 5. Error Recovery Data Flow

### Network Error

```
1. API call fails
   └─ No response from server

2. Catch block handles error
   └─ catch(error) { ... }

3. User sees error message
   └─ Toast: "Failed to connect to server"

4. Retry mechanism
   ├─ User clicks "Retry"
   └─ API call made again

5. If server back online
   ├─ Request succeeds
   └─ Data updated
```

### 401 Unauthorized (Expired Token)

```
1. API call returns 401
   └─ Token invalid or expired

2. Response interceptor catches
   └─ axios.interceptors.response.use(
      error => { if (status === 401) { ... } }
    )

3. Clear token
   └─ localStorage.removeItem('token')

4. Reset auth state
   └─ setUser(null)

5. Redirect to login
   └─ window.location.href = '/login'

6. User must login again
   └─ New token generated
```

### 422 Validation Error

```
1. API call returns 422
   ├─ Response body:
   │  {
   │    "message": "Validation failed",
   │    "errors": {
   │      "email": ["Email already taken"],
   │      "name": ["Name is required"]
   │    }
   │  }

2. Frontend handles error
   └─ errors.map(e => toast(e, "error"))

3. User sees specific error
   ├─ "Email already taken"
   ├─ "Name is required"
   └─ Can correct and retry

4. Form stays open
   └─ Data preserved
   └─ User retries with corrections
```

---

## 6. Data Consistency Guarantees

### Database Level

```
ACID Properties:
├─ Atomicity: Transaction all-or-nothing
├─ Consistency: Data integrity rules enforced
├─ Isolation: Concurrent requests don't interfere
└─ Durability: Written data persists
```

### Application Level

```
Foreign Key Constraints:
├─ Cannot create enrollment without course_id
├─ Cannot post grade without student enrollment
└─ Cascade deletes maintain referential integrity

Unique Constraints:
├─ Each user has unique email
├─ Prevents duplicate records

Type Validation:
├─ Grade must be 0-100 integer
├─ Dates must be valid datetime format
└─ Enums must be valid (admin, instructor, student)
```

### Frontend Level

```
Optimistic Updates:
├─ Update UI before server response
├─ If server fails, rollback UI
└─ Feels instant to user

Validation:
├─ Email format checked before submit
├─ Required fields checked before submit
└─ Reduces unnecessary API calls
```

---

## 7. Performance Considerations

### Query Optimization

```
WITHOUT Optimization (N+1 Problem):
GET /api/courses/5
├─ Query courses: 1 query
├─ For each enrollment (4 rows):
│  └─ Query student: 4 queries
│
└─ Total: 1 + 4 = 5 queries ✗

WITH Optimization (Eager Loading):
GET /api/courses/5
├─ Query: SELECT * FROM enrollments
          JOIN users ON ...
│
└─ Total: 1 query ✓

Result: 5x faster response time
```

### Caching Strategy

```
Frontend Caching (could be implemented):
├─ Cache GET /api/courses for 5 minutes
├─ Cache GET /api/users for 10 minutes
├─ Invalidate cache on create/update/delete
└─ Reduces API calls

Backend Caching (if needed):
├─ Cache expensive queries
├─ Invalidate on data changes
└─ Redis or in-memory
```

---

## 8. Data Lifecycle

### User Data Lifecycle

```
1. CREATION
   └─ Admin creates user via form
   └─ Data inserted into users table

2. USAGE
   ├─ User logs in
   ├─ System creates enrollments
   ├─ Instructor posts grades
   └─ Data accumulates

3. MODIFICATION
   ├─ Admin edits user details
   ├─ Update records in database
   └─ Timestamps updated

4. DELETION
   ├─ Admin deletes user
   ├─ Cascade deletes related records
   ├─ Enrollments, grades, notifications deleted
   └─ User and all related data removed
```

### Course Data Lifecycle

```
1. CREATION
   └─ Instructor creates course (draft)

2. PUBLICATION
   ├─ Course status changed to "active"
   ├─ Students can now enroll

3. ACTIVE PHASE
   ├─ Students enrolling
   ├─ Grades being posted
   ├─ Announcements sent

4. ARCHIVAL
   ├─ Course moved to "archived"
   ├─ New students cannot enroll
   ├─ Existing enrollments preserved

5. DATA RETENTION
   └─ Historical data remains in database
   └─ For auditing and reporting
```

---

## Conclusion

The ERUDITE platform implements a robust data flow architecture where:

✅ **Frontend** → User interactions trigger API calls  
✅ **API Layer** → Validates and processes requests  
✅ **Database** → Persists data with integrity constraints  
✅ **Response** → Sends data back to frontend  
✅ **UI** → Updates automatically with new data  

Every piece of data follows a clear path through the system with validation at multiple levels, error handling at each step, and consistency checks to maintain data integrity throughout.
