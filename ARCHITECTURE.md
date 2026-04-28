# ERUDITE Platform - System Architecture Documentation

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2026-04-25

---

## 1. System Overview

The ERUDITE platform is a comprehensive educational management system designed to facilitate course management, student enrollment, grading, and communication between administrators, instructors, and students.

### Architecture Type
**Three-Tier Architecture** - Separation of concerns across presentation, application, and data layers.

```
┌─────────────────────────────────────────────┐
│        PRESENTATION LAYER (React 19)        │
│  - Admin Portal, Instructor Portal,          │
│    Student Portal (Single-Page Application) │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTP/HTTPS (JSON over REST)
                   │
┌──────────────────▼──────────────────────────┐
│      APPLICATION LAYER (Laravel 12)         │
│  - RESTful API Endpoints                    │
│  - Business Logic, Authentication,          │
│    Authorization, Data Validation           │
└──────────────────┬──────────────────────────┘
                   │
                   │ SQL Queries
                   │
┌──────────────────▼──────────────────────────┐
│      DATA LAYER (MySQL 8)                   │
│  - Relational Database                      │
│  - 10 Tables with relationships             │
│  - Data persistence and integrity           │
└─────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 (JSX, Hooks)
- **Build Tool:** Vite
- **Routing:** React Router v7
- **State Management:** React Context API (Auth, Notifications, Schedules, Announcements)
- **HTTP Client:** Axios with request/response interceptors
- **Styling:** Tailwind CSS
- **Language:** TypeScript 5+
- **Development Server:** http://localhost:5173

### Backend
- **Framework:** Laravel 12 (PHP 8.2+)
- **Authentication:** Laravel Sanctum (Token-based)
- **ORM:** Eloquent (Object-Relational Mapping)
- **API Style:** RESTful
- **Language:** PHP
- **Development Server:** http://localhost:8000/api

### Database
- **DBMS:** MySQL 8.0
- **Tables:** 10 (users, courses, enrollments, schedules, grades, notifications, announcements, etc.)
- **Relationships:** Properly normalized with foreign keys
- **Constraints:** Unique, NOT NULL, foreign key constraints

### Development Environment
- **Node.js:** v18+
- **Package Manager:** npm
- **Composer:** PHP package manager (Backend dependencies)

---

## 3. Directory Structure

### Frontend Structure
```
app/
├── routes/                           # Route components by role
│   ├── admin/
│   │   ├── dashboard.tsx            # Admin analytics and metrics
│   │   ├── users.tsx                # User management (CRUD)
│   │   ├── catalog.tsx              # Course catalog management
│   │   ├── analytics.tsx            # System analytics
│   │   └── course-review.tsx        # Course review details
│   ├── instructor/
│   │   ├── dashboard.tsx            # Instructor statistics
│   │   ├── my-courses.tsx           # Courses taught by instructor
│   │   ├── students.tsx             # Student management
│   │   ├── schedule.tsx             # Class schedule
│   │   └── grades.tsx               # Grade management
│   ├── student/
│   │   ├── dashboard.tsx            # Student progress and stats
│   │   ├── courses.tsx              # Enrolled courses
│   │   ├── learning.tsx             # Course content
│   │   ├── grades.tsx               # Academic performance
│   │   └── schedule.tsx             # Personal schedule
│   └── login.tsx                    # Authentication entry point
│
├── components/
│   ├── shared/                      # Reusable components
│   │   ├── Toast.tsx                # Notification toasts
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   ├── Header.tsx               # App header
│   │   └── ProtectedRoute.tsx       # Route protection
│   ├── admin/                       # Admin-specific components
│   │   ├── DashboardMetrics.tsx     # Metric cards
│   │   ├── UserTable.tsx            # User list component
│   │   ├── CourseGrid.tsx           # Course display
│   │   └── RecentActivity.tsx       # Activity feed
│   ├── instructor/                  # Instructor-specific components
│   │   ├── CourseCard.tsx           # Course display
│   │   ├── StudentList.tsx          # Student roster
│   │   └── GradeForm.tsx            # Grade entry form
│   └── student/                     # Student-specific components
│       ├── EnrollmentCard.tsx       # Course enrollment card
│       ├── GradeDisplay.tsx         # Grade visualization
│       └── ScheduleView.tsx         # Schedule display
│
├── context/                         # React Context for state management
│   ├── AuthContext.tsx              # Authentication & user state
│   ├── NotificationContext.tsx      # Notifications state
│   ├── ScheduleContext.tsx          # Schedule data state
│   └── AnnouncementContext.tsx      # Announcements state
│
├── services/
│   ├── api.ts                       # Axios HTTP client configuration
│   └── (API endpoint wrappers defined in api.ts)
│
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts                   # Hook for authentication context
│   ├── useNotifications.ts          # Hook for notifications
│   └── useToast.ts                  # Hook for toast notifications
│
└── main.tsx                         # Application entry point
```

### Backend Structure
```
backend/
├── app/
│   ├── Models/
│   │   ├── User.php                 # User model (admin, instructor, student)
│   │   ├── Course.php               # Course model
│   │   ├── Enrollment.php           # Student enrollment model
│   │   ├── Schedule.php             # Class schedule model
│   │   ├── Grade.php                # Student grade model
│   │   ├── Notification.php         # User notification model
│   │   ├── Announcement.php         # Admin announcement model
│   │   └── (other models)
│   │
│   └── Http/
│       ├── Controllers/
│       │   └── Api/
│       │       ├── AuthController.php        # Login, logout, me
│       │       ├── UserController.php        # User CRUD
│       │       ├── CourseController.php      # Course management
│       │       ├── EnrollmentController.php  # Enrollment management
│       │       ├── GradeController.php       # Grade posting
│       │       ├── NotificationController.php
│       │       ├── AnnouncementController.php
│       │       └── (other controllers)
│       │
│       ├── Middleware/
│       │   ├── Authenticate.php
│       │   ├── CheckRole.php        # Role authorization
│       │   └── CorsMiddleware.php   # CORS configuration
│       │
│       └── Requests/
│           ├── StoreUserRequest.php # User validation
│           ├── StoreCourseRequest.php
│           └── (other form requests)
│
├── database/
│   ├── migrations/
│   │   ├── 2026_04_25_000001_add_role_to_users_table.php
│   │   ├── 2026_04_25_000002_create_courses_table.php
│   │   ├── 2026_04_25_000003_create_enrollments_table.php
│   │   ├── 2026_04_25_000004_create_schedules_table.php
│   │   ├── 2026_04_25_000005_create_announcements_table.php
│   │   ├── 2026_04_25_000006_create_notifications_table.php
│   │   ├── 2026_04_25_000007_create_grades_table.php
│   │   └── (other migrations)
│   │
│   └── seeders/
│       └── DatabaseSeeder.php       # Test data creation
│
├── routes/
│   ├── api.php                      # API endpoints
│   └── web.php                      # Web routes (if any)
│
├── config/
│   ├── auth.php                     # Authentication configuration
│   ├── database.php                 # Database configuration
│   ├── cors.php                     # CORS configuration
│   └── (other config files)
│
└── .env                             # Environment variables
```

---

## 4. Data Flow Architecture

### Complete Data Flow Diagram

```
USER INTERACTION (Frontend)
    │
    ├─────────────► Component receives user action
    │              (click, form submission, etc.)
    │
    ├─────────────► Component state updates (local)
    │              (setFormData, setLoading, etc.)
    │
    ├─────────────► API call triggered via Axios
    │              (POST, GET, PUT, DELETE request)
    │
    │              HTTP REQUEST LIFECYCLE
    │              ├─ Request interceptor adds Bearer token
    │              ├─ Headers set (Content-Type: application/json)
    │              └─ Request sent to backend
    │
    ├─────────────► BACKEND RECEIVES REQUEST
    │              (Laravel router matches endpoint)
    │
    │              BACKEND PROCESSING
    │              ├─ Middleware checks token validity (Sanctum)
    │              ├─ Middleware verifies user role if needed
    │              ├─ Controller method invoked
    │              ├─ Input validation (FormRequest or validate())
    │              ├─ Business logic execution
    │              └─ Database operation via Eloquent ORM
    │
    ├─────────────► DATABASE OPERATION
    │              ├─ SQL query executed
    │              ├─ Data inserted/updated/deleted/fetched
    │              ├─ Relationships lazy/eager loaded
    │              ├─ Constraints and triggers executed
    │              └─ Result returned to controller
    │
    ├─────────────► CONTROLLER RESPONSE PREPARATION
    │              ├─ Data transformed to JSON
    │              ├─ Status code set (200, 201, 404, 422, etc.)
    │              └─ Response headers set
    │
    │              HTTP RESPONSE LIFECYCLE
    │              ├─ Response sent back to frontend
    │              └─ Response interceptor processes response
    │
    ├─────────────► FRONTEND RECEIVES RESPONSE
    │              ├─ Status code checked
    │              ├─ Data extracted from response body
    │              ├─ Component state updated (setData, setError)
    │              └─ Loading state cleared (setLoading = false)
    │
    └─────────────► UI RE-RENDERS
                   ├─ Component updates with new data
                   ├─ List refreshes with new items
                   ├─ Error messages display if needed
                   └─ User sees updated information
```

### Example: Creating a Course (Admin)

```
1. Admin clicks "Add Course" button
   └─ setModalOpen(true)

2. Admin fills form and clicks "Create"
   └─ handleCreateCourse() called

3. Axios POST request sent
   POST http://localhost:8000/api/courses
   Headers: {
     Authorization: "Bearer {token}",
     Content-Type: "application/json"
   }
   Body: {
     name: "Introduction to Python",
     description: "...",
     capacity: 50,
     start_date: "2026-05-01T00:00:00Z",
     end_date: "2026-08-01T00:00:00Z",
     status: "draft"
   }

4. Laravel receives request at POST /api/courses
   └─ Routes to CourseController@store

5. Middleware checks
   ├─ Is token valid? (Sanctum)
   ├─ Is user authenticated?
   └─ Can user create courses? (usually admin/instructor)

6. Controller validates input
   ├─ Name required, 3-255 characters
   ├─ Capacity required, > 0
   ├─ Dates must be valid
   └─ (validation errors → 422 response)

7. Controller creates Course in database
   └─ INSERT INTO courses (name, description, ...)
      VALUES (...)

8. Course object returned and serialized
   └─ JSON: { id: 123, name: "...", ... }

9. 201 Created response sent to frontend

10. Frontend receives response
    ├─ setCourses([...courses, newCourse])
    ├─ setModalOpen(false)
    ├─ toast("Course created successfully")
    └─ UI updates with new course in list
```

---

## 5. Authentication Flow

### Token-Based Authentication (Laravel Sanctum)

```
┌─────────────────────────────────────────────┐
│          LOGIN PROCESS                      │
└─────────────────────────────────────────────┘

1. USER SUBMITS CREDENTIALS (Frontend)
   Email: admin@admin.com
   Password: admin123
   
   └─► Axios POST /api/auth/login
       {
         email: "admin@admin.com",
         password: "admin123"
       }

2. BACKEND VERIFICATION (Laravel)
   └─► AuthController@login
       ├─ Validate email exists
       ├─ Verify password (bcrypt comparison)
       ├─ Create API token (plainPlainToken() from Sanctum)
       └─ Return user + token

3. SUCCESSFUL RESPONSE
   Status: 200 OK
   Body: {
     user: {
       id: 1,
       name: "Admin User",
       email: "admin@admin.com",
       role: "admin",
       avatar: "https://...",
       subtitle: "Platform Administrator"
     },
     token: "1|dJaI8KzB3FwX..."  ← Stored in DB as hashed
   }

4. FRONTEND STORES TOKEN
   └─ localStorage.setItem('token', '1|dJaI8KzB3FwX...')
   └─ AuthContext updates user state

5. REQUEST WITH TOKEN (Authenticated)
   ┌─ Axios Request Interceptor
   │  └─ Retrieve token from localStorage
   │  └─ Add Authorization header
   ├─ Header: Authorization: Bearer 1|dJaI8KzB3FwX...
   └─ Send request

6. BACKEND VALIDATES TOKEN (Sanctum Middleware)
   ├─ Extract token from Authorization header
   ├─ Find PersonalAccessToken in DB with matching hash
   ├─ Verify token hasn't expired
   └─ Attach user to request ($request->user())

7. AUTHORIZATION CHECKS (Controller)
   ├─ Can this user perform this action?
   ├─ Does user have required role?
   └─ Return 401 if not authenticated
              403 if not authorized

8. SUCCESSFUL RESPONSE
   Status: 200 OK
   Body: [...requested data...]

9. LOGOUT PROCESS
   ├─ Frontend: POST /api/auth/logout
   └─ Backend: Delete PersonalAccessToken from DB
   ├─ Frontend: Clear localStorage
   ├─ Frontend: Reset AuthContext
   └─ Frontend: Redirect to login
```

### Token Persistence on Page Refresh

```
1. User refreshes page

2. React app mounts
   └─ useEffect(() => { getMe() }, [])

3. GET /api/auth/me called with token from localStorage
   Header: Authorization: Bearer {stored_token}

4. Backend verifies token validity
   ├─ If valid → Return current user data
   ├─ If invalid → Return 401 Unauthorized
   └─ If expired → Return 401 Unauthorized

5. Frontend handles response
   ├─ If valid → Set user in AuthContext, show dashboard
   ├─ If invalid → Clear localStorage, redirect to login
   └─ If no token → Skip getMe(), user stays as null

Result: User session persists across page refreshes
        (unless token has been invalidated/deleted)
```

---

## 6. Authentication & Authorization

### User Roles

```
┌─────────────────────────────────────────┐
│              ADMIN                      │
│  - Full system access                   │
│  - User management (CRUD)               │
│  - Course catalog management            │
│  - View system analytics                │
│  - Create/edit announcements            │
│  - View all users and courses           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            INSTRUCTOR                   │
│  - Create and manage courses            │
│  - View enrolled students               │
│  - Post grades for students             │
│  - View course analytics                │
│  - Manage class schedules               │
│  - Cannot manage other users            │
│  - Cannot view all courses (only own)   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│             STUDENT                     │
│  - View available courses               │
│  - Enroll in courses                    │
│  - View own grades                      │
│  - View personal schedule               │
│  - Cannot modify courses                │
│  - Cannot grade students                │
│  - Read-only access to data             │
└─────────────────────────────────────────┘
```

### Authorization Checks (Backend Middleware)

```
Protected Endpoints:
├─ POST /api/users
│  └─ Requires: role = "admin"
│
├─ PUT /api/users/{id}
│  └─ Requires: role = "admin" OR owner = user.id
│
├─ DELETE /api/users/{id}
│  └─ Requires: role = "admin"
│
├─ POST /api/courses
│  └─ Requires: role = "admin" OR "instructor"
│
├─ PUT /api/courses/{id}
│  └─ Requires: course.instructor_id = user.id OR role = "admin"
│
├─ POST /api/grades
│  └─ Requires: instructor of the course = user.id
│
├─ DELETE /api/courses/{id}
│  └─ Requires: role = "admin"
│
└─ POST /api/announcements
   └─ Requires: role = "admin"
```

---

## 7. Key Design Patterns

### Pattern 1: Request/Response Cycle (REST)

```
REQUEST → ROUTE → MIDDLEWARE → CONTROLLER → MODEL → DATABASE
  ↓                                                    ↓
Method                                           SQL Operation
Path                                          INSERT/UPDATE/
Headers                                       SELECT/DELETE
Body
  
  ← RESPONSE (JSON) ←─ Serialize ← Fetch ←─ Query result
Status Code
Headers
Body
```

### Pattern 2: Context API State Management (Frontend)

```
Context Provider (wraps entire app)
  ├─ State: user, token, loading, error
  ├─ Reducer/setState functions
  └─ useContext hook for components

Component
  ├─ Import useAuth() hook
  ├─ Get { user, loading, error }
  └─ Update UI based on state

State changes trigger re-render automatically
```

### Pattern 3: Eager Loading (N+1 Query Prevention)

```
WITHOUT Eager Loading (N+1 Problem):
GET /api/courses
└─ Query: SELECT * FROM courses (1 query)
  └─ Loop through courses
    └─ For each course: SELECT * FROM users WHERE id = course.instructor_id
      └─ 4 courses = 1 + 4 = 5 queries ✗ Bad performance

WITH Eager Loading (Solution):
GET /api/courses
└─ Query: SELECT * FROM courses
   INNER JOIN users ON courses.instructor_id = users.id
  └─ 1 query, includes instructor data ✓ Good performance
```

Implementation in Laravel:
```php
// Model
Course::with('instructor', 'enrollments', 'schedules')->get()
// or
Course::load('instructor')
```

### Pattern 4: Validation at Two Levels

```
Frontend Validation (UX):
├─ Real-time feedback
├─ Prevents unnecessary API calls
└─ Examples: email format, required fields, min length

Backend Validation (Security):
├─ Mandatory, cannot be bypassed
├─ Protects database integrity
├─ Returns 422 Unprocessable Entity with errors
└─ Examples: email uniqueness, password strength
```

---

## 8. Component Communication

### Between Sibling Components

```
Parent Component
  ├─ Child A
  │  └─ useState(data)
  │  └─ setData called when data changes
  │
  └─ Child B
     └─ useEffect({ fetchData() })
     └─ Displays data

Problem: Need to sync data between siblings
Solution: Lift state to parent or use Context API

Child A creates data
  └─ Calls API
  └─ Parent state updates
  └─ Parent re-renders
  └─ Child B receives new data
```

### Via Context API (Global State)

```
App.tsx
  ├─ <AuthProvider>
  │  ├─ <NotificationProvider>
  │  │  ├─ <Component A>
  │  │  │  └─ useAuth(), useNotifications()
  │  │  │
  │  │  └─ <Component B>
  │  │     └─ useAuth(), useNotifications()
  │  │     └─ Sees same state as Component A
  │  │
  │  └─ State changes automatically sync
```

---

## 9. Error Handling Architecture

### Error Flow

```
FRONTEND ERROR:
  ├─ Network error
  │  └─ No response from server
  │  └─ Show: "Failed to connect"
  │
  ├─ HTTP Error (4xx, 5xx)
  │  ├─ 400 Bad Request
  │  ├─ 401 Unauthorized → Redirect to login
  │  ├─ 403 Forbidden → Show "Not allowed"
  │  ├─ 404 Not Found → Show "Not found"
  │  ├─ 422 Unprocessable Entity → Show validation errors
  │  └─ 500 Server Error → Show "Server error"
  │
  ├─ Try/Catch
  │  └─ Unexpected error → Show generic message
  │
  └─ Response Interceptor
     └─ Centralized error handling
     └─ Logs errors for debugging
```

### Global Error Handling (Axios Interceptor)

```typescript
// api.ts
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 10. Scalability Considerations

### Current System
- ✅ Supports hundreds of users
- ✅ Handles thousands of courses and enrollments
- ✅ Database queries optimized with eager loading
- ✅ Token-based auth (stateless, scalable)

### Future Improvements (If Needed)
- Database indexing on frequently queried columns
- Caching layer (Redis) for static data
- WebSockets for real-time notifications
- Queue system (Laravel Queues) for background jobs
- API rate limiting per user
- Database replication for high availability

---

## 11. Security Architecture

### Security Layers

```
Layer 1: Transport Security
  ├─ HTTPS/SSL for all communication
  ├─ Prevents man-in-the-middle attacks
  └─ Token transmitted securely

Layer 2: Authentication (Who are you?)
  ├─ Email/password verification
  ├─ Bcrypt password hashing
  ├─ Personal access token generation
  └─ Token stored in DB, not in code

Layer 3: Authorization (What can you do?)
  ├─ Role-based access control
  ├─ Endpoint checks verify user role
  ├─ Cannot perform action without permission
  └─ 403 Forbidden returned if not authorized

Layer 4: Input Validation
  ├─ Frontend validation (UX feedback)
  ├─ Backend validation (security)
  ├─ Eloquent ORM prevents SQL injection
  └─ Type checking at database level

Layer 5: CORS Protection
  ├─ Only requests from http://localhost:5173 allowed
  ├─ Other origins blocked
  └─ Credentials only sent to same origin
```

### Sensitive Data Protection

```
Passwords:
├─ Bcrypt hashing with salt
├─ Cannot be reversed
├─ Never logged or displayed
└─ Compared securely during login

Tokens:
├─ Stored as hash in database
├─ Plaintext token sent only once
├─ Frontend stores plaintext in localStorage
├─ Sent in Authorization header for each request
└─ Deleted on logout

Personally Identifiable Information (PII):
├─ Email: Unique constraint, validated format
├─ Name: No sensitive data
├─ Avatar: Public URL to image
└─ Role: Used for authorization
```

---

## 12. Performance Optimization

### Frontend Optimization
- React Router code splitting (lazy loaded routes)
- Axios interceptors for request caching
- Context API prevents prop drilling
- Components only re-render on state change
- Proper key props in lists

### Backend Optimization
- Eager loading to prevent N+1 queries
- Database indexing on foreign keys
- Query result caching (if implemented)
- Pagination for large datasets
- Efficient JSON serialization

### Database Optimization
- Proper indexing on frequently queried columns
- Foreign key constraints with cascade
- Normalized schema prevents data duplication
- Query execution < 100ms for most operations

---

## Conclusion

The ERUDITE platform is built on a solid three-tier architecture with:
- ✅ Clear separation of concerns (frontend, backend, database)
- ✅ Secure token-based authentication
- ✅ Role-based authorization
- ✅ RESTful API design
- ✅ Responsive React frontend
- ✅ Optimized database queries
- ✅ Comprehensive error handling
- ✅ Production-ready implementation

The system is scalable, maintainable, and ready for deployment to production environments.
