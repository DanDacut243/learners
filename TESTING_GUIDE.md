# 🧪 ERUDITE LMS - TESTING GUIDE

## Pre-Submission Testing Checklist

Use this guide to verify all new features work correctly before submitting.

---

## 🚀 Setup & Start

### Start Backend
```bash
cd backend
php artisan serve
# Backend runs on: http://localhost:8000
# API runs on: http://localhost:8000/api
```

### Start Frontend (in new terminal)
```bash
npm run dev
# Frontend runs on: http://localhost:5173
```

### Verify Services Running
```bash
# Check backend
curl http://localhost:8000/api/health

# Check frontend
curl http://localhost:5173
```

---

## 👥 Test Users Setup

Create test users (or use existing ones from seeder):

**Instructor Account:**
- Email: `instructor@test.com`
- Password: `password`
- Role: `instructor`
- Course: `1` (should be enrolled as instructor)

**Student Account:**
- Email: `student@test.com`
- Password: `password`
- Role: `student`
- Course: `1` (should be enrolled as student)

**Admin Account (optional):**
- Email: `admin@test.com`
- Password: `password`
- Role: `admin`

---

## ✅ Test 1: Learning Outcomes Feature

### Step 1: Create Learning Outcome (as Instructor)

1. **Login as Instructor**
   - Go to http://localhost:5173/login
   - Email: `instructor@test.com`
   - Password: `password`
   - Click Login

2. **Navigate to Learning Outcomes**
   - Go to: http://localhost:5173/instructor/learning-outcomes/1
   - Should see page titled "Learning Outcomes"
   - Click "Add Learning Outcome" button

3. **Create Outcome**
   - Title: "Understand Neural Networks"
   - Description: "Students will understand the fundamentals of neural networks"
   - Bloom Level: "understand"
   - Click "Save"
   - Should see success message
   - New outcome appears in list

4. **Verify Database**
   ```bash
   # In backend directory, open PHP artisan tinker:
   php artisan tinker
   > App\Models\LearningOutcome::all();
   # Should show your created outcome
   > exit()
   ```

### Step 2: Verify Student Can See Competencies

1. **Logout and Login as Student**
   - Click profile → Logout
   - Login as student@test.com

2. **Navigate to Competencies**
   - Go to: http://localhost:5173/student/competencies/1
   - Should see "Learning Outcomes - Student View"
   - Should see the outcome you created
   - Mastery level should be 0% (not assessed yet)
   - Attempts should be 0

3. **Verify Database**
   ```bash
   php artisan tinker
   > App\Models\StudentCompetency::where('user_id', 2)->get();
   # Should show competency for your student (adjust user_id as needed)
   > exit()
   ```

### ✅ Test 1 Complete
Learning Outcomes feature works if:
- [x] Instructor can create outcomes
- [x] Outcomes appear in database
- [x] Student can view competencies
- [x] Mastery levels display correctly

---

## ✅ Test 2: Assignment & Submission System

### Step 1: Create Assignment (as Instructor)

1. **Login as Instructor** (if not already logged in)

2. **Create Assignment via API** (UI form not fully tested, use API)
   ```bash
   # Get auth token first
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"instructor@test.com","password":"password"}'
   
   # Copy the token from response
   # Example: "token": "abc123xyz..."
   
   # Create assignment
   curl -X POST http://localhost:8000/api/courses/1/assignments \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Assignment 1",
       "description": "Complete the neural network exercise",
       "instructions": "Build a simple neural network using PyTorch",
       "points": 100,
       "due_date": "2026-05-15",
       "allow_submissions": true
     }'
   
   # Should return created assignment with id
   ```

3. **Verify Assignment Created**
   ```bash
   php artisan tinker
   > App\Models\Assignment::all();
   # Should show your assignment
   > exit()
   ```

### Step 2: Submit Assignment (as Student)

1. **Logout and Login as Student**

2. **Navigate to Assignments**
   - Go to: http://localhost:5173/student/assignments/1
   - Should see "Assignment 1" in the list
   - Click "Submit Assignment" button

3. **Submit Work**
   - Content: "Here is my solution to the neural network exercise: [code here]"
   - Click "Submit"
   - Should see success message
   - Submission status changes to "submitted"

4. **Verify Submission Created**
   ```bash
   php artisan tinker
   > App\Models\Submission::all();
   # Should show your submission
   > exit()
   ```

5. **Check Notifications**
   - Instructor should receive notification: "New Assignment Submission"
   - Check database:
   ```bash
   php artisan tinker
   > App\Models\Notification::latest()->first();
   # Should show notification about submission
   > exit()
   ```

### Step 3: Grade Assignment (as Instructor)

1. **Logout and Login as Instructor**

2. **Navigate to Grading**
   - Go to: http://localhost:5173/instructor/grading/1
   - Should see "Grading Interface"
   - Should see submission from student

3. **Grade Submission**
   - Click "Grade" button for the submission
   - Grade: 85
   - Feedback: "Excellent work! Your neural network implementation is correct."
   - Click "Submit Grade"
   - Should see success message
   - Submission status changes to "graded"

4. **Verify Grade Recorded**
   ```bash
   php artisan tinker
   > App\Models\Submission::latest()->first();
   # Should show grade: 85, status: "graded"
   > exit()
   ```

5. **Check Student Notification**
   - Student should receive notification: "Assignment Graded: 85/100 points"
   - Check database:
   ```bash
   php artisan tinker
   > App\Models\Notification::where('title', 'like', '%graded%')->latest()->first();
   # Should show grading notification
   > exit()
   ```

### ✅ Test 2 Complete
Assignment system works if:
- [x] Instructor can create assignments
- [x] Student can view assignments
- [x] Student can submit assignment
- [x] Instructor receives notification
- [x] Instructor can grade submission
- [x] Grades are recorded
- [x] Student receives notification

---

## ✅ Test 3: Competency Mastery Tracking

### Step 1: Update Competency (simulate assessment)

1. **Record Student Score** (Instructor assesses learning outcome)
   ```bash
   # Get instructor token (from previous test)
   
   curl -X PUT http://localhost:8000/api/learning-outcomes/1/update-competency \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "score": 80,
       "student_id": 2
     }'
   ```

2. **Verify Mastery Updated**
   ```bash
   php artisan tinker
   > $comp = App\Models\StudentCompetency::where('user_id', 2)->first();
   > $comp->mastery_level;
   # Should show 80 (first time is just the score)
   > $comp->attempts;
   # Should show 1
   > exit()
   ```

### Step 2: Test Exponential Moving Average

1. **Update Competency Again**
   ```bash
   curl -X PUT http://localhost:8000/api/learning-outcomes/1/update-competency \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "score": 60,
       "student_id": 2
     }'
   ```

2. **Verify EMA Calculation**
   ```bash
   php artisan tinker
   > $comp = App\Models\StudentCompetency::where('user_id', 2)->first();
   > $comp->mastery_level;
   # Should show: round(0.7 * 60 + 0.3 * 80) = round(42 + 24) = 66
   > $comp->attempts;
   # Should show 2
   > exit()
   ```

3. **Update Again**
   ```bash
   curl -X PUT http://localhost:8000/api/learning-outcomes/1/update-competency \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "score": 90,
       "student_id": 2
     }'
   ```

4. **Verify EMA Again**
   ```bash
   php artisan tinker
   > $comp = App\Models\StudentCompetency::where('user_id', 2)->first();
   > $comp->mastery_level;
   # Should show: round(0.7 * 90 + 0.3 * 66) = round(63 + 19.8) = 83
   > exit()
   ```

5. **Login as Student and Check**
   - Login as student
   - Go to: http://localhost:5173/student/competencies/1
   - Should see mastery level at 83%
   - Should see attempts count at 3

### ✅ Test 3 Complete
Competency tracking works if:
- [x] Mastery levels update correctly
- [x] EMA formula applied (0.7 new + 0.3 old)
- [x] Attempts increment
- [x] Student sees updated competencies

---

## ✅ Test 4: Authorization & Security

### Test 4a: Student Cannot Grade Other Student's Work

1. **Login as Different Student**
   - Use another student account
   - Try to PUT `/submissions/1/grade`
   ```bash
   curl -X PUT http://localhost:8000/api/submissions/1/grade \
     -H "Authorization: Bearer STUDENT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"grade": 50, "feedback": "hacked"}'
   ```
   - Should return 403 Forbidden

### Test 4b: Student Cannot View Another Student's Submissions

1. **Login as Student**
   - Try to GET `/submissions/OTHER_STUDENT_ID`
   - Should see only their own submissions

### Test 4c: Instructor from Different Course Cannot Grade

1. **Try with Instructor from Different Course**
   ```bash
   # Using instructor not assigned to course 1
   curl -X PUT http://localhost:8000/api/submissions/1/grade \
     -H "Authorization: Bearer DIFFERENT_INSTRUCTOR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"grade": 50, "feedback": "hacked"}'
   ```
   - Should return 403 Forbidden

### ✅ Test 4 Complete
Authorization works if:
- [x] Non-instructors cannot grade
- [x] Instructors can only grade their own courses
- [x] Students can only see their own submissions

---

## ✅ Test 5: Messaging System

### Test 5a: Send Private Message

```bash
# Get token as instructor
INSTRUCTOR_TOKEN="..."

# Send message to student (user_id: 2)
curl -X POST http://localhost:8000/api/messages/send-to-student \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 2,
    "course_id": 1,
    "message": "Please review the assignment rubric before submitting"
  }'

# Should return created message
```

### Test 5b: Send Broadcast Message

```bash
# Send message to all students in course
curl -X POST http://localhost:8000/api/messages/broadcast \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 1,
    "message": "Reminder: Assignment 1 due tomorrow!"
  }'

# Should return created messages for all enrolled students
```

### Test 5c: Retrieve Messages

```bash
# Get all messages for logged-in user
curl -X GET http://localhost:8000/api/messages \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Should return array of messages
```

### Test 5d: Mark as Read

```bash
# Mark specific message as read
curl -X PUT http://localhost:8000/api/messages/1/read \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Message should have read_at timestamp
```

### ✅ Test 5 Complete
Messaging works if:
- [x] Messages can be sent to individual students
- [x] Broadcast messages go to all course students
- [x] Messages can be retrieved
- [x] Messages can be marked as read

---

## 🐛 Troubleshooting

### Issue: "404 Not Found" on frontend routes

**Solution:**
- Verify routes are registered in `app/routes.ts`
- Restart frontend: `npm run dev`
- Clear browser cache: Ctrl+Shift+Delete

### Issue: "Unauthenticated" on API calls

**Solution:**
- Verify token is in localStorage
- Get new token: POST `/auth/login`
- Add to request: `Authorization: Bearer TOKEN`

### Issue: Database migrations not working

**Solution:**
```bash
cd backend
php artisan migrate:status  # Check status
php artisan migrate --force  # Force if needed
php artisan migrate:rollback  # Rollback if needed
php artisan migrate --seed    # Reseed with test data
```

### Issue: "CORS error" on API calls

**Solution:**
- Verify backend CORS config: `backend/config/cors.php`
- Check frontend is calling correct API URL
- Verify `VITE_API_URL` environment variable set

### Issue: Build fails with TypeScript errors

**Solution:**
```bash
npm run build  # Full output
npm run build 2>&1 | grep "error"  # Just errors
# Fix errors in component files
npm run build  # Retry
```

---

## 📊 API Response Examples

### Learning Outcomes GET Response
```json
{
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Understand Neural Networks",
      "description": "...",
      "bloom_level": "understand",
      "order": 1,
      "created_at": "2026-04-28...",
      "updated_at": "2026-04-28..."
    }
  ]
}
```

### Student Competencies GET Response
```json
{
  "competencies": [
    {
      "id": 1,
      "user_id": 2,
      "learning_outcome": {
        "id": 1,
        "title": "Understand Neural Networks",
        "bloom_level": "understand"
      },
      "mastery_level": 83,
      "attempts": 3
    }
  ],
  "overall_mastery": 83
}
```

### Submission GET Response
```json
{
  "data": {
    "id": 1,
    "assignment_id": 1,
    "user_id": 2,
    "content": "Here is my solution...",
    "status": "graded",
    "grade": 85,
    "feedback": "Excellent work!",
    "submitted_at": "2026-04-28...",
    "graded_at": "2026-04-29..."
  }
}
```

---

## ✨ Final Verification

After all tests pass, verify:

- [x] Frontend builds: `npm run build` (success)
- [x] Backend migrations: `php artisan migrate:status` (all up)
- [x] No console errors in browser DevTools (F12)
- [x] All new routes accessible
- [x] No 404 or 500 errors in network tab
- [x] Database populated with test data
- [x] Notifications created automatically
- [x] Authorization working correctly

---

## 🚀 Ready for Submission

If all tests pass ✅, you're ready to:
1. Push to GitHub
2. Deploy to Vercel (frontend) and Render (backend)
3. Submit to instructor

**Good luck!** 🎉
