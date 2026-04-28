<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Module;
use App\Models\Enrollment;
use App\Models\Schedule;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\Grade;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@admin.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'avatar' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVMXvFxtDcA768WRQW5p4bnPresmx_HRtrBHyL9-jfIYw8OZnu-KMMlgSAUXS5ZRFbY07EDKSTOxLZ_BHYeLrLhZAVNRuvXioiBvHTfSd58fnARMmZ9puksQ_-IEu7rk4EPhB1-sr4U_v0mF-IUnsRHc9fXKzAMtjO4SZ3eZ8i2dF7iGbDfBtuMqVFT8YoZJth4WVqGIqomiUko7S71Lt1jTXZJfMGZ4ysQhKjHOOsFI0JXSDglYKJqm4AKnkZk7u2iChMoNlBxH4',
            'subtitle' => 'System Administrator',
        ]);

        // Create admin user with erudite email
        User::create([
            'name' => 'Admin Panel',
            'email' => 'admin@erudite.edu',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'avatar' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVMXvFxtDcA768WRQW5p4bnPresmx_HRtrBHyL9-jfIYw8OZnu-KMMlgSAUXS5ZRFbY07EDKSTOxLZ_BHYeLrLhZAVNRuvXioiBvHTfSd58fnARMmZ9puksQ_-IEu7rk4EPhB1-sr4U_v0mF-IUnsRHc9fXKzAMtjO4SZ3eZ8i2dF7iGbDfBtuMqVFT8YoZJth4WVqGIqomiUko7S71Lt1jTXZJfMGZ4ysQhKjHOOsFI0JXSDglYKJqm4AKnkZk7u2iChMoNlBxH4',
            'subtitle' => 'System Overlord',
        ]);

        // Create instructor
        $instructor = User::create([
            'name' => 'Dr. Aris Thorne',
            'email' => 'instructor@erudite.edu',
            'password' => bcrypt('instructor123'),
            'role' => 'instructor',
            'avatar' => '',
            'subtitle' => 'Instructor Portal',
        ]);

        // Create additional instructors
        $instructor2 = User::create([
            'name' => 'Dr. Maria Santos',
            'email' => 'maria@erudite.edu',
            'password' => bcrypt('instructor123'),
            'role' => 'instructor',
            'avatar' => '',
            'subtitle' => 'Faculty Member',
        ]);

        // Create students
        $student = User::create([
            'name' => 'Eleanor Vance',
            'email' => 'student@erudite.edu',
            'password' => bcrypt('student123'),
            'role' => 'student',
            'avatar' => '',
            'subtitle' => 'Student Portal',
        ]);

        $student2 = User::create([
            'name' => 'Marcus Aurelius',
            'email' => 'marcus@erudite.edu',
            'password' => bcrypt('student123'),
            'role' => 'student',
            'avatar' => '',
            'subtitle' => 'Engaged Learner',
        ]);

        $student3 = User::create([
            'name' => 'Sofia Rossi',
            'email' => 'sofia@erudite.edu',
            'password' => bcrypt('student123'),
            'role' => 'student',
            'avatar' => '',
            'subtitle' => 'Academic Excellence',
        ]);

        // Create courses
        $course1 = Course::create([
            'name' => 'Introduction to Web Development',
            'description' => 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
            'instructor_id' => $instructor->id,
            'capacity' => 50,
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(60),
            'status' => 'active',
        ]);

        $course2 = Course::create([
            'name' => 'Advanced Database Design',
            'description' => 'Master database architecture, normalization, and optimization techniques.',
            'instructor_id' => $instructor->id,
            'capacity' => 35,
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(90),
            'status' => 'active',
        ]);

        $course3 = Course::create([
            'name' => 'Data Science Fundamentals',
            'description' => 'Explore data analysis, visualization, and machine learning basics.',
            'instructor_id' => $instructor2->id,
            'capacity' => 40,
            'start_date' => now()->addDays(15),
            'end_date' => now()->addDays(75),
            'status' => 'active',
        ]);

        $course4 = Course::create([
            'name' => 'Cloud Computing with AWS',
            'description' => 'Deploy and manage applications on Amazon Web Services.',
            'instructor_id' => $instructor2->id,
            'capacity' => 45,
            'start_date' => now()->addDays(20),
            'end_date' => now()->addDays(120),
            'status' => 'active',
        ]);

        // Create schedules
        Schedule::create([
            'course_id' => $course1->id,
            'day_of_week' => 'Monday',
            'start_time' => '09:00',
            'end_time' => '10:30',
            'location' => 'Room 101',
        ]);

        Schedule::create([
            'course_id' => $course1->id,
            'day_of_week' => 'Wednesday',
            'start_time' => '09:00',
            'end_time' => '10:30',
            'location' => 'Room 101',
        ]);

        Schedule::create([
            'course_id' => $course2->id,
            'day_of_week' => 'Tuesday',
            'start_time' => '14:00',
            'end_time' => '15:30',
            'location' => 'Room 202',
        ]);

        Schedule::create([
            'course_id' => $course2->id,
            'day_of_week' => 'Thursday',
            'start_time' => '14:00',
            'end_time' => '15:30',
            'location' => 'Room 202',
        ]);

        Schedule::create([
            'course_id' => $course3->id,
            'day_of_week' => 'Monday',
            'start_time' => '11:00',
            'end_time' => '12:30',
            'location' => 'Lab 301',
        ]);

        Schedule::create([
            'course_id' => $course3->id,
            'day_of_week' => 'Friday',
            'start_time' => '11:00',
            'end_time' => '12:30',
            'location' => 'Lab 301',
        ]);

        // Create enrollments
        Enrollment::create(['user_id' => $student->id, 'course_id' => $course1->id, 'status' => 'active']);
        Enrollment::create(['user_id' => $student->id, 'course_id' => $course2->id, 'status' => 'active']);
        Enrollment::create(['user_id' => $student2->id, 'course_id' => $course1->id, 'status' => 'active']);
        Enrollment::create(['user_id' => $student2->id, 'course_id' => $course3->id, 'status' => 'active']);
        Enrollment::create(['user_id' => $student3->id, 'course_id' => $course2->id, 'status' => 'active']);
        Enrollment::create(['user_id' => $student3->id, 'course_id' => $course3->id, 'status' => 'active']);
        Enrollment::create(['user_id' => $student->id, 'course_id' => $course4->id, 'status' => 'active']);

        // Create announcements
        Announcement::create([
            'title' => 'Platform Maintenance',
            'content' => 'The platform will undergo scheduled maintenance on Saturday from 2-4 PM. All services will be temporarily unavailable.',
            'created_by' => $admin->id,
            'visibility' => 'public',
            'expires_at' => now()->addDays(7),
        ]);

        Announcement::create([
            'title' => 'Important: Mid-Semester Examinations',
            'content' => 'Mid-semester exams will be held from May 15-25. Students are advised to prepare accordingly. More details will be shared soon.',
            'created_by' => $admin->id,
            'visibility' => 'public',
            'expires_at' => now()->addDays(15),
        ]);

        Announcement::create([
            'title' => 'New Course: Artificial Intelligence Fundamentals',
            'content' => 'A new course on AI fundamentals has been added to the catalog. Registration opens next week.',
            'created_by' => $admin->id,
            'visibility' => 'public',
        ]);

        // Create notifications
        Notification::create([
            'user_id' => $student->id,
            'title' => 'Assignment Due',
            'message' => 'Your Web Development assignment is due tomorrow.',
            'type' => 'warning',
        ]);

        Notification::create([
            'user_id' => $student->id,
            'title' => 'Grade Posted',
            'message' => 'Your grade for Database Design midterm has been posted.',
            'type' => 'info',
        ]);

        Notification::create([
            'user_id' => $student2->id,
            'title' => 'Course Reminder',
            'message' => 'Your Data Science class starts in 1 hour.',
            'type' => 'info',
        ]);

        Notification::create([
            'user_id' => $instructor->id,
            'title' => 'New Student Enrollment',
            'message' => 'A new student has enrolled in your Web Development course.',
            'type' => 'success',
        ]);

        // Create grades
        Grade::create([
            'user_id' => $student->id,
            'course_id' => $course1->id,
            'grade' => 92.5,
            'comments' => 'Excellent work on the final project!',
        ]);

        Grade::create([
            'user_id' => $student->id,
            'course_id' => $course2->id,
            'grade' => 88.0,
            'comments' => 'Good understanding of normalization concepts.',
        ]);

        Grade::create([
            'user_id' => $student2->id,
            'course_id' => $course1->id,
            'grade' => 85.5,
            'comments' => 'Solid grasp of HTML and CSS fundamentals.',
        ]);

        Grade::create([
            'user_id' => $student2->id,
            'course_id' => $course3->id,
            'grade' => 91.0,
            'comments' => 'Outstanding analysis on the data visualization project.',
        ]);

        Grade::create([
            'user_id' => $student3->id,
            'course_id' => $course2->id,
            'grade' => 94.5,
            'comments' => 'Perfect understanding of complex database queries.',
        ]);

        Grade::create([
            'user_id' => $student3->id,
            'course_id' => $course3->id,
            'grade' => 89.0,
            'comments' => 'Good work on statistical analysis.',
        ]);

        // Create modules for Course 1 (Web Development)
        Module::create([
            'course_id' => $course1->id,
            'title' => 'Introduction to HTML',
            'type' => 'video',
            'description' => 'Learn the basics of HTML markup language',
            'duration' => 45,
            'order' => 1,
            'content' => [
                'video_url' => 'https://example.com/html-intro.mp4',
                'transcript' => 'HTML is the foundation of web development...'
            ],
        ]);

        Module::create([
            'course_id' => $course1->id,
            'title' => 'HTML Knowledge Check',
            'type' => 'quiz',
            'description' => 'Test your understanding of HTML basics',
            'duration' => 15,
            'order' => 2,
            'content' => [
                'questions' => [
                    [
                        'q' => 'What does HTML stand for?',
                        'options' => ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language'],
                        'answer' => 0
                    ],
                    [
                        'q' => 'Which tag is used for the largest heading?',
                        'options' => ['<h6>', '<h1>', '<heading>'],
                        'answer' => 1
                    ]
                ]
            ],
        ]);

        Module::create([
            'course_id' => $course1->id,
            'title' => 'CSS Styling Fundamentals',
            'type' => 'video',
            'description' => 'Master CSS for web design',
            'duration' => 60,
            'order' => 3,
            'content' => [
                'video_url' => 'https://example.com/css-intro.mp4',
                'transcript' => 'CSS allows you to style your HTML...'
            ],
        ]);

        Module::create([
            'course_id' => $course1->id,
            'title' => 'CSS Knowledge Check',
            'type' => 'quiz',
            'description' => 'Test your CSS knowledge',
            'duration' => 15,
            'order' => 4,
            'content' => [
                'questions' => [
                    [
                        'q' => 'What is the correct CSS syntax for red text?',
                        'options' => ['text-color: red;', 'color: red;', 'font-color: red;'],
                        'answer' => 1
                    ]
                ]
            ],
        ]);

        // Create modules for Course 2 (Database Design)
        Module::create([
            'course_id' => $course2->id,
            'title' => 'Database Normalization',
            'type' => 'video',
            'description' => 'Understanding database normalization principles',
            'duration' => 50,
            'order' => 1,
            'content' => [
                'video_url' => 'https://example.com/normalization.mp4',
                'transcript' => 'Database normalization ensures data integrity...'
            ],
        ]);

        Module::create([
            'course_id' => $course2->id,
            'title' => 'Normalization Quiz',
            'type' => 'quiz',
            'description' => 'Test your understanding of normalization',
            'duration' => 20,
            'order' => 2,
            'content' => [
                'questions' => [
                    [
                        'q' => 'What is the goal of normalization?',
                        'options' => ['To reduce data redundancy', 'To increase storage space', 'To make queries slower'],
                        'answer' => 0
                    ]
                ]
            ],
        ]);

        // Create modules for Course 3 (Data Science)
        Module::create([
            'course_id' => $course3->id,
            'title' => 'Data Analysis Basics',
            'type' => 'video',
            'description' => 'Introduction to data analysis and visualization',
            'duration' => 55,
            'order' => 1,
            'content' => [
                'video_url' => 'https://example.com/data-analysis.mp4',
                'transcript' => 'Data analysis helps us extract insights...'
            ],
        ]);

        Module::create([
            'course_id' => $course3->id,
            'title' => 'Data Analysis Assessment',
            'type' => 'quiz',
            'description' => 'Assess your data analysis knowledge',
            'duration' => 25,
            'order' => 2,
            'content' => [
                'questions' => [
                    [
                        'q' => 'What is the most important step in data analysis?',
                        'options' => ['Data collection and preparation', 'Creating charts', 'Writing reports'],
                        'answer' => 0
                    ]
                ]
            ],
        ]);
    }
}

