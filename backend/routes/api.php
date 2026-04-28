<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\GradeExportController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\ModuleCompletionController;
use App\Http\Controllers\Api\DiscussionController;
use App\Http\Controllers\Api\QuizResultController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\LearningOutcomeController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\SubmissionController;

// Handle ALL preflight OPTIONS requests FIRST (before middleware groups)
Route::options('{any}', function () {
    return response('', 204)
        ->header('Access-Control-Allow-Origin', request()->header('origin') ?: '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('Access-Control-Max-Age', '86400');
})->where('any', '.*');

Route::middleware(['api', \App\Http\Middleware\CorsMiddleware::class])->group(function () {
    // Test endpoint
    Route::get('/health', function () {
        return response()->json(['status' => 'ok']);
    });

    // Public routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth routes
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Users routes
        Route::apiResource('users', UserController::class);

        // Courses routes
        Route::apiResource('courses', CourseController::class);
        Route::get('/courses/my-courses', [CourseController::class, 'getMyCourses']);
        Route::get('/my-enrolled-courses', [CourseController::class, 'getMyEnrolledCourses']);

        // Enrollments routes
        Route::apiResource('enrollments', EnrollmentController::class);
        Route::get('/courses/{courseId}/enrollments', [EnrollmentController::class, 'getByCourse']);

        // Schedules routes
        Route::apiResource('schedules', ScheduleController::class);
        Route::get('/courses/{courseId}/schedules', [ScheduleController::class, 'getByCourse']);

        // Announcements routes
        Route::apiResource('announcements', AnnouncementController::class);

        // Notifications routes
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/clear-all', [NotificationController::class, 'clearAll']);

        // Grades routes
        Route::apiResource('grades', GradeController::class, ['only' => ['index', 'store', 'update']]);
        Route::get('/courses/{courseId}/grades', [GradeController::class, 'getByCourse']);

        // Modules routes
        Route::get('/courses/{courseId}/modules', [ModuleController::class, 'index']);
        Route::post('/courses/{courseId}/modules', [ModuleController::class, 'store']);
        Route::get('/modules/{id}', [ModuleController::class, 'show']);
        Route::put('/modules/{id}', [ModuleController::class, 'update']);
        Route::delete('/modules/{id}', [ModuleController::class, 'destroy']);

        // Module Completions routes
        Route::post('/module-completions', [ModuleCompletionController::class, 'store']);
        Route::get('/enrollments/{enrollmentId}/module-completions', [ModuleCompletionController::class, 'getByEnrollment']);

        // Discussions routes
        Route::get('/modules/{moduleId}/discussions', [DiscussionController::class, 'getByModule']);
        Route::post('/discussions', [DiscussionController::class, 'store']);
        Route::delete('/discussions/{id}', [DiscussionController::class, 'destroy']);

        // Quiz Results routes
        Route::post('/quiz-results', [QuizResultController::class, 'store']);
        Route::get('/enrollments/{enrollmentId}/quiz-results', [QuizResultController::class, 'getByEnrollment']);
        Route::get('/quiz-results/{id}', [QuizResultController::class, 'show']);

        // Analytics routes
        Route::get('/analytics', [AnalyticsController::class, 'index']);

        // Grade Export/Statistics routes
        Route::get('/courses/{courseId}/grade-statistics', [GradeExportController::class, 'getGradeStatistics']);
        Route::get('/courses/{courseId}/export-grades', [GradeExportController::class, 'exportCourseGrades']);
        Route::post('/courses/{courseId}/bulk-update-grades', [GradeExportController::class, 'bulkUpdateGrades']);

        // Settings routes
        Route::put('/settings', function (Request $request) {
            // Store settings — for now return success (settings can be stored in a settings table or .env)
            return response()->json(['message' => 'Settings saved successfully']);
        });

        // Audit Logs routes (admin only)
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/{modelType}/{modelId}', [AuditLogController::class, 'getByModel']);

        // Progress routes
        Route::get('/enrollments/{enrollmentId}/progress', [ProgressController::class, 'getStudentProgress']);
        Route::get('/courses/{courseId}/student-progress', [ProgressController::class, 'getCourseStudentProgress']);

        // Search routes
        Route::get('/search/courses', [SearchController::class, 'searchCourses']);
        Route::get('/search/students', [SearchController::class, 'searchStudents']);
        Route::get('/search', [SearchController::class, 'globalSearch']);

        // AI routes
        Route::post('/ai/chat', [AiController::class, 'chat']);
        Route::get('/ai/insights', [AiController::class, 'insights']);
        Route::get('/ai/predict-risk/{courseId}', [AiController::class, 'predictRisk']);

        // Messages routes
        Route::get('/messages', [MessageController::class, 'index']);
        Route::get('/messages/student/{studentId}', [MessageController::class, 'getStudentMessages']);
        Route::get('/messages/course/{courseId}', [MessageController::class, 'getCourseMessages']);
        Route::post('/messages/send-to-student', [MessageController::class, 'sendToStudent']);
        Route::post('/messages/broadcast', [MessageController::class, 'broadcastToCourse']);
        Route::put('/messages/{messageId}/read', [MessageController::class, 'markAsRead']);
        Route::delete('/messages/{messageId}', [MessageController::class, 'destroy']);

        // Learning Outcomes routes
        Route::get('/courses/{courseId}/learning-outcomes', [LearningOutcomeController::class, 'index']);
        Route::post('/courses/{courseId}/learning-outcomes', [LearningOutcomeController::class, 'store']);
        Route::get('/learning-outcomes/{id}', [LearningOutcomeController::class, 'show']);
        Route::put('/learning-outcomes/{id}', [LearningOutcomeController::class, 'update']);
        Route::delete('/learning-outcomes/{id}', [LearningOutcomeController::class, 'destroy']);
        Route::get('/courses/{courseId}/student-competencies', [LearningOutcomeController::class, 'getStudentCompetencies']);
        Route::put('/learning-outcomes/{outcomeId}/update-competency', [LearningOutcomeController::class, 'updateCompetency']);

        // Assignments routes
        Route::get('/courses/{courseId}/assignments', [AssignmentController::class, 'index']);
        Route::post('/courses/{courseId}/assignments', [AssignmentController::class, 'store']);
        Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
        Route::put('/assignments/{id}', [AssignmentController::class, 'update']);
        Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);

        // Submissions routes
        Route::get('/submissions', [SubmissionController::class, 'index']);
        Route::post('/submissions', [SubmissionController::class, 'store']);
        Route::get('/submissions/{id}', [SubmissionController::class, 'show']);
        Route::put('/submissions/{id}/grade', [SubmissionController::class, 'grade']);
        Route::get('/assignments/{assignmentId}/submissions', [SubmissionController::class, 'getByAssignment']);
        Route::get('/enrollments/{enrollmentId}/submissions', [SubmissionController::class, 'getByEnrollment']);

        // AI Tutor routes
        Route::post('/ai/tutor/ask', [\App\Http\Controllers\Api\AITutorController::class, 'ask']);
        Route::post('/ai/tutor/explain', [\App\Http\Controllers\Api\AITutorController::class, 'explain']);

        // AI Analytics routes
        Route::post('/ai/analytics/risk-analysis', [\App\Http\Controllers\Api\AIAnalyticsController::class, 'analyzeRisk']);
        Route::get('/ai/analytics/student-insights/{studentId}', [\App\Http\Controllers\Api\AIAnalyticsController::class, 'studentInsights']);
        Route::get('/ai/analytics/course-health/{courseId}', [\App\Http\Controllers\Api\AIAnalyticsController::class, 'courseHealth']);

        // AI Content routes
        Route::post('/ai/content/generate-course-outline', [\App\Http\Controllers\Api\AIContentController::class, 'generateCourseOutline']);
        Route::post('/ai/content/generate-learning-outcomes', [\App\Http\Controllers\Api\AIContentController::class, 'generateLearningOutcomes']);
        Route::post('/ai/content/rubric-generation', [\App\Http\Controllers\Api\AIContentController::class, 'generateRubric']);
        Route::get('/ai/content/study-plan/{studentId}', [\App\Http\Controllers\Api\AIContentController::class, 'generateStudyPlan']);
    });
});
