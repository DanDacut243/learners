# ERUDITE Platform - Database Schema Documentation

**Version:** 1.0.0  
**Database:** MySQL 8.0  
**Last Updated:** 2026-04-25

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│      USERS          │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email (UNIQUE)      │◄──────┐
│ password (hashed)   │       │
│ role (enum)         │       │
│ avatar              │       │
│ subtitle            │       │
│ created_at          │       │
│ updated_at          │       │
└─────────────────────┘       │
         │                     │
         │ (instructor_id)     │
         │                     │
         ▼                     │
┌─────────────────────┐       │
│     COURSES         │       │
├─────────────────────┤       │
│ id (PK)             │       │
│ name                │       │
│ description         │───────┘
│ instructor_id (FK)  │
│ capacity            │
│ start_date          │
│ end_date            │
│ status (enum)       │
│ created_at          │
│ updated_at          │
└─────────────────────┘
    │    │    │
    │    │    └──────────────────┐
    │    │                       │
    ▼    ▼                       ▼
    ┌─────────────┐    ┌────────────────┐
    │ ENROLLMENTS │    │   SCHEDULES    │
    ├─────────────┤    ├────────────────┤
    │ id (PK)     │    │ id (PK)        │
    │ user_id (FK)│    │ course_id (FK) │
    │ course_id◄──┼────┤ day_of_week    │
    │ status      │    │ start_time     │
    │ enrolled_at │    │ end_time       │
    └─────────────┘    │ created_at     │
         │             └────────────────┘
         │
         │ (to users)
         ▼
    ┌─────────────┐    ┌──────────────────┐
    │   GRADES    │    │ ANNOUNCEMENTS    │
    ├─────────────┤    ├──────────────────┤
    │ id (PK)     │    │ id (PK)          │
    │ user_id (FK)│    │ title            │
    │ course_id(FK│    │ content          │
    │ grade       │    │ created_by (FK)  │
    │ comment     │    │ created_at       │
    │ created_at  │    └──────────────────┘
    └─────────────┘          │
                             │ (to users)
    ┌──────────────┐    ┌────────────────┐
    │NOTIFICATIONS│    │ PERSONAL ACCESS│
    ├──────────────┤    │    TOKENS      │
    │ id (PK)      │    ├────────────────┤
    │ user_id (FK) │    │ id (PK)        │
    │ title        │    │ tokenable_id   │
    │ message      │    │ tokenable_type │
    │ type         │    │ name           │
    │ read_at      │    │ token (hashed) │
    │ created_at   │    │ created_at     │
    └──────────────┘    └────────────────┘
```

---

## 1. Users Table

**Purpose:** Store user accounts (admin, instructors, students)

**Table Definition:**
```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'instructor', 'student') NOT NULL,
  avatar LONGTEXT NULL,
  subtitle VARCHAR(255) NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  INDEX idx_role (role),
  INDEX idx_email (email)
);
```

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | BIGINT UNSIGNED | Yes | Auto-incrementing primary key |
| name | VARCHAR(255) | Yes | User's full name |
| email | VARCHAR(255) | Yes | Unique, used for login |
| email_verified_at | TIMESTAMP | No | Email verification timestamp |
| password | VARCHAR(255) | Yes | Bcrypt hashed password |
| role | ENUM | Yes | admin, instructor, or student |
| avatar | LONGTEXT | No | URL to avatar image (longText for Google URLs) |
| subtitle | VARCHAR(255) | No | Job title or description |
| remember_token | VARCHAR(100) | No | Laravel remember token |
| created_at | TIMESTAMP | Yes | Record creation time |
| updated_at | TIMESTAMP | Yes | Record update time |

**Relationships:**
- One-to-Many: User → Courses (as instructor)
- One-to-Many: User → Enrollments
- One-to-Many: User → Grades
- One-to-Many: User → Notifications
- One-to-Many: User → PersonalAccessTokens

**Sample Data:**
```sql
INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Admin User', 'admin@admin.com', '$2y$10$...', 'admin', NOW(), NOW()),
('John Instructor', 'instructor@erudite.edu', '$2y$10$...', 'instructor', NOW(), NOW()),
('Jane Student', 'student@erudite.edu', '$2y$10$...', 'student', NOW(), NOW());
```

---

## 2. Courses Table

**Purpose:** Store course information

**Table Definition:**
```sql
CREATE TABLE courses (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  instructor_id BIGINT UNSIGNED NOT NULL,
  capacity INT NOT NULL DEFAULT 50,
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  status ENUM('draft', 'active', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_instructor_id (instructor_id),
  INDEX idx_start_date (start_date)
);
```

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | BIGINT UNSIGNED | Yes | Auto-incrementing primary key |
| name | VARCHAR(255) | Yes | Course title |
| description | TEXT | No | Course description |
| instructor_id | BIGINT UNSIGNED | Yes | FK to instructor (User) |
| capacity | INT | Yes | Max student enrollment (default 50) |
| start_date | TIMESTAMP | No | Course start date |
| end_date | TIMESTAMP | No | Course end date |
| status | ENUM | Yes | draft, active, or archived |
| created_at | TIMESTAMP | Yes | Record creation time |
| updated_at | TIMESTAMP | Yes | Record update time |

**Relationships:**
- Many-to-One: Course → User (instructor)
- One-to-Many: Course → Enrollments
- One-to-Many: Course → Schedules
- One-to-Many: Course → Grades

**Sample Data:**
```sql
INSERT INTO courses (name, instructor_id, capacity, start_date, status) VALUES
('Introduction to Python', 2, 50, '2026-05-01', 'active'),
('Web Development 101', 2, 40, '2026-05-15', 'draft');
```

---

## 3. Enrollments Table

**Purpose:** Link students to courses (many-to-many with metadata)

**Table Definition:**
```sql
CREATE TABLE enrollments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'completed', 'dropped') NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (user_id, course_id),
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_status (status)
);
```

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | BIGINT UNSIGNED | Yes | Auto-incrementing primary key |
| user_id | BIGINT UNSIGNED | Yes | FK to student (User) |
| course_id | BIGINT UNSIGNED | Yes | FK to Course |
| status | ENUM | Yes | active, completed, or dropped |
| enrolled_at | TIMESTAMP | Yes | Enrollment date/time |
| created_at | TIMESTAMP | Yes | Record creation time |
| updated_at | TIMESTAMP | Yes | Record update time |

**Constraints:**
- Unique: Each user can only enroll once per course
- On Delete: Cascade (delete enrollment if user/course deleted)

**Sample Data:**
```sql
INSERT INTO enrollments (user_id, course_id, status) VALUES
(3, 1, 'active'),
(4, 1, 'active'),
(5, 2, 'active');
```

---

## 4. Schedules Table

**Purpose:** Store class schedule for courses

**Table Definition:**
```sql
CREATE TABLE schedules (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT UNSIGNED NOT NULL,
  day_of_week VARCHAR(10) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id),
  INDEX idx_day (day_of_week)
);
```

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | BIGINT UNSIGNED | Yes | Auto-incrementing primary key |
| course_id | BIGINT UNSIGNED | Yes | FK to Course |
| day_of_week | VARCHAR(10) | Yes | Monday, Tuesday, etc. |
| start_time | TIME | Yes | Class start time (HH:MM:SS) |
| end_time | TIME | Yes | Class end time (HH:MM:SS) |
| created_at | TIMESTAMP | Yes | Record creation time |
| updated_at | TIMESTAMP | Yes | Record update time |

**Sample Data:**
```sql
INSERT INTO schedules (course_id, day_of_week, start_time, end_time) VALUES
(1, 'Monday', '09:00:00', '10:30:00'),
(1, 'Wednesday', '09:00:00', '10:30:00'),
(1, 'Friday', '09:00:00', '10:30:00');
```

---

## 5. Grades Table

**Purpose:** Store student grades for courses

**Table Definition:**
```sql
CREATE TABLE grades (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  grade INT NOT NULL CHECK (grade >= 0 AND grade <= 100),
  comment TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_grade (grade)
);
```

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | BIGINT UNSIGNED | Yes | Auto-incrementing primary key |
| user_id | BIGINT UNSIGNED | Yes | FK to student (User) |
| course_id | BIGINT UNSIGNED | Yes | FK to Course |
| grade | INT | Yes | 0-100, CHECK constraint enforced |
| comment | TEXT | No | Feedback from instructor |
| created_at | TIMESTAMP | Yes | Record creation time |
| updated_at | TIMESTAMP | Yes | Record update time |

**Sample Data:**
```sql
INSERT INTO grades (user_id, course_id, grade, comment) VALUES
(3, 1, 87, 'Great work!'),
(4, 1, 92, 'Excellent performance'),
(5, 2, 75, 'Needs improvement');
```

---

## 6. Notifications Table

**Purpose:** Store user notifications

**Table Definition:**
```sql
CREATE TABLE notifications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_read_at (read_at),
  INDEX idx_created_at (created_at)
);
```

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | BIGINT UNSIGNED | Yes | Auto-incrementing primary key |
| user_id | BIGINT UNSIGNED | Yes | FK to User |
| title | VARCHAR(255) | Yes | Notification title |
| message | TEXT | Yes | Notification message/body |
| type | ENUM | Yes | info, success, warning, error |
| read_at | TIMESTAMP | No | NULL if unread, timestamp if read |
| created_at | TIMESTAMP | Yes | Record creation time |
| updated_at | TIMESTAMP | Yes | Record update time |

**Sample Data:**
```sql
INSERT INTO notifications (user_id, title, message, type) VALUES
(3, 'Course enrolled', 'You successfully enrolled in Python 101', 'success'),
(3, 'Grade posted', 'You received a grade of 87 in Python 101', 'info');
```

---

## 7. Announcements Table

**Purpose:** Store global announcements from admin

**Table Definition:**
```sql
CREATE TABLE announcements (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);
```

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | BIGINT UNSIGNED | Yes | Auto-incrementing primary key |
| title | VARCHAR(255) | Yes | Announcement title |
| content | TEXT | Yes | Announcement body |
| created_by | BIGINT UNSIGNED | Yes | FK to admin User |
| created_at | TIMESTAMP | Yes | Record creation time |
| updated_at | TIMESTAMP | Yes | Record update time |

**Sample Data:**
```sql
INSERT INTO announcements (title, content, created_by) VALUES
('New course available', 'Python basics starting May 1', 1);
```

---

## 8. Personal Access Tokens Table

**Purpose:** Store API tokens for authentication (Laravel Sanctum)

**Table Definition:**
```sql
CREATE TABLE personal_access_tokens (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tokenable_id BIGINT UNSIGNED NOT NULL,
  tokenable_type VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  abilities TEXT NULL,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  INDEX tokenable (tokenable_type, tokenable_id)
);
```

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | BIGINT UNSIGNED | Yes | Auto-incrementing primary key |
| tokenable_id | BIGINT UNSIGNED | Yes | User ID |
| tokenable_type | VARCHAR(255) | Yes | 'App\Models\User' |
| name | VARCHAR(255) | Yes | Token name (e.g., 'api-token') |
| token | VARCHAR(64) | Yes | Hashed token (unique) |
| abilities | TEXT | No | JSON array of abilities |
| last_used_at | TIMESTAMP | No | Last request timestamp |
| expires_at | TIMESTAMP | No | Token expiration (if set) |
| created_at | TIMESTAMP | Yes | Record creation time |
| updated_at | TIMESTAMP | Yes | Record update time |

**Notes:**
- Token stored as SHA256 hash for security
- Plaintext token sent only at creation
- Prevents compromise if database leaked

---

## Database Relationships Summary

### One-to-Many Relationships
```
User (Admin/Instructor) ────1◄──* Courses
                              instructor_id

User (Student) ────1◄──* Enrollments
                    user_id

Course ────1◄──* Enrollments
           course_id

Course ────1◄──* Schedules
          course_id

Course ────1◄──* Grades
          course_id

User ────1◄──* Grades
      user_id

User ────1◄──* Notifications
      user_id

User ────1◄──* PersonalAccessTokens
      tokenable_id

User ────1◄──* Announcements (as creator)
      created_by
```

### Many-to-Many Relationships (Through Join Tables)
```
Users ────* Enrollments *──── Courses
       (student)          (course)
```

---

## Indexes for Performance

```sql
-- Users indexes
INDEX idx_role (role)
INDEX idx_email (email)

-- Courses indexes
INDEX idx_status (status)
INDEX idx_instructor_id (instructor_id)
INDEX idx_start_date (start_date)

-- Enrollments indexes
INDEX idx_user_id (user_id)
INDEX idx_course_id (course_id)
INDEX idx_status (status)
UNIQUE KEY unique_enrollment (user_id, course_id)

-- Schedules indexes
INDEX idx_course_id (course_id)
INDEX idx_day (day_of_week)

-- Grades indexes
INDEX idx_user_id (user_id)
INDEX idx_course_id (course_id)
INDEX idx_grade (grade)

-- Notifications indexes
INDEX idx_user_id (user_id)
INDEX idx_read_at (read_at)
INDEX idx_created_at (created_at)

-- Announcements indexes
INDEX idx_created_by (created_by)
INDEX idx_created_at (created_at)

-- PersonalAccessTokens indexes
INDEX tokenable (tokenable_type, tokenable_id)
UNIQUE KEY token
```

---

## Cascade Delete Behavior

When a record is deleted, related records cascade:

```
DELETE User
  └─ DELETE all Enrollments for user
  └─ DELETE all Grades for user
  └─ DELETE all Notifications for user
  └─ DELETE all PersonalAccessTokens for user
  └─ DELETE all Announcements created by user
  └─ DELETE all Courses instructed by user (which cascade to enrollments/grades)

DELETE Course
  └─ DELETE all Enrollments for course
  └─ DELETE all Schedules for course
  └─ DELETE all Grades for course

DELETE Enrollment
  └─ (no cascades)

DELETE Notification
  └─ (no cascades)

DELETE Announcement
  └─ (no cascades)
```

---

## Data Integrity Constraints

```
PRIMARY KEY (id)
- Every table has auto-incrementing integer primary key

FOREIGN KEYS (with ON DELETE CASCADE)
- instructor_id in courses
- user_id in enrollments, grades, notifications
- course_id in enrollments, schedules, grades
- created_by in announcements
- tokenable_id in personal_access_tokens

UNIQUE CONSTRAINTS
- email in users
- token in personal_access_tokens
- (user_id, course_id) in enrollments

CHECK CONSTRAINTS
- grade >= 0 AND grade <= 100 in grades
- role IN ('admin', 'instructor', 'student') in users
- status in courses, enrollments
- type in notifications

NOT NULL CONSTRAINTS
- See "Required" column in each table definition
```

---

## Seed Data Summary

**Test users created:**
- 2 Admin users (admin@admin.com, admin@erudite.edu)
- 2 Instructor users
- 3 Student users

**Test courses created:**
- 4 active courses with instructors

**Test enrollments:**
- 7 student enrollments

**Test schedules:**
- 6 class schedules (2-3 per course)

**Test announcements:**
- 3 system announcements

**Test notifications:**
- 4 user notifications

**Test grades:**
- 6 student grades

---

## Database Connection Settings

```
Host: localhost
Port: 3306
Username: root (or configured user)
Password: (configured in .env)
Database: erudite_db
Charset: utf8mb4
Collation: utf8mb4_unicode_ci
```

---

## Backup & Maintenance

```bash
# Backup database
mysqldump -u root -p erudite_db > backup.sql

# Restore database
mysql -u root -p erudite_db < backup.sql

# Check table sizes
SELECT table_name, 
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'erudite_db'
ORDER BY (data_length + index_length) DESC;
```

---

## Conclusion

The ERUDITE database is a well-structured, normalized relational database with:
- ✅ 8 tables with clear relationships
- ✅ Proper foreign keys with cascade deletes
- ✅ Optimized indexes for common queries
- ✅ Data integrity constraints
- ✅ Support for role-based access control
- ✅ Complete audit trail (created_at, updated_at)

The schema supports all features of the ERUDITE platform and is production-ready.
