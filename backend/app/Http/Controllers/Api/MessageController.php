<?php

namespace App\Http\Controllers\Api;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController
{
    /**
     * Get all messages for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            
            // Get messages received by this user or broadcast to their course
            $userCourseIds = \DB::table('enrollments')
                ->where('user_id', $user->id)
                ->pluck('course_id');
            
            $messages = Message::where('recipient_id', $user->id)
                ->orWhereIn('course_id', $userCourseIds)
                ->with(['sender', 'course'])
                ->latest()
                ->paginate(50);

            return response()->json($messages);
        } catch (\Exception $e) {
            \Log::error('MessageController@index error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch messages', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get messages for a specific student (instructor view)
     */
    public function getStudentMessages(Request $request, $studentId)
    {
        try {
            $student = User::find($studentId);
            if (!$student) {
                return response()->json(['message' => 'Student not found'], 404);
            }

            // Only instructor or admin can view student messages
            if ($request->user()->role !== 'admin' && $request->user()->id !== $student->id) {
                // Verify if requester is instructor of student's course
                $studentCourseIds = \DB::table('enrollments')
                    ->where('user_id', $studentId)
                    ->pluck('course_id');
                
                $isInstructor = \DB::table('courses')
                    ->where('instructor_id', $request->user()->id)
                    ->whereIn('id', $studentCourseIds)
                    ->exists();

                if (!$isInstructor) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            }

            // Get all messages exchanged with this student
            $messages = Message::where(function ($query) use ($studentId, $request) {
                $query->where(function ($q) use ($studentId, $request) {
                    $q->where('sender_id', $request->user()->id)
                        ->where('recipient_id', $studentId);
                })->orWhere(function ($q) use ($studentId, $request) {
                    $q->where('sender_id', $studentId)
                        ->where('recipient_id', $request->user()->id);
                });
            })
            ->with(['sender', 'recipient', 'course'])
            ->latest()
            ->get();

            return response()->json($messages);
        } catch (\Exception $e) {
            \Log::error('MessageController@getStudentMessages error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch student messages', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get messages for a course (instructor/admin only)
     */
    public function getCourseMessages(Request $request, $courseId)
    {
        try {
            $course = \App\Models\Course::find($courseId);
            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }

            // Check if user is instructor or admin
            if ($request->user()->role !== 'admin' && $course->instructor_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $messages = Message::where('course_id', $courseId)
                ->with(['sender', 'recipient'])
                ->latest()
                ->paginate(50);

            return response()->json($messages);
        } catch (\Exception $e) {
            \Log::error('MessageController@getCourseMessages error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch course messages', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Send a message to a student
     */
    public function sendToStudent(Request $request)
    {
        try {
            $validated = $request->validate([
                'recipient_id' => 'required|exists:users,id',
                'content' => 'required|string|min:1',
                'course_id' => 'nullable|exists:courses,id',
            ]);

            $message = Message::create([
                'sender_id' => $request->user()->id,
                'recipient_id' => $validated['recipient_id'],
                'course_id' => $validated['course_id'] ?? null,
                'content' => $validated['content'],
                'is_read' => false,
            ]);

            return response()->json($message->load(['sender', 'recipient']), 201);
        } catch (\Exception $e) {
            \Log::error('MessageController@sendToStudent error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send message', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Broadcast a message to all students in a course
     */
    public function broadcastToCourse(Request $request)
    {
        try {
            $validated = $request->validate([
                'course_id' => 'required|exists:courses,id',
                'content' => 'required|string|min:1',
            ]);

            $course = \App\Models\Course::find($validated['course_id']);

            // Verify sender is the course instructor or admin
            if ($request->user()->role !== 'admin' && $course->instructor_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $message = Message::create([
                'sender_id' => $request->user()->id,
                'course_id' => $validated['course_id'],
                'content' => $validated['content'],
                'is_read' => false,
            ]);

            return response()->json($message->load(['sender', 'course']), 201);
        } catch (\Exception $e) {
            \Log::error('MessageController@broadcastToCourse error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to broadcast message', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mark a message as read
     */
    public function markAsRead(Request $request, $messageId)
    {
        try {
            $message = Message::find($messageId);

            if (!$message) {
                return response()->json(['message' => 'Message not found'], 404);
            }

            $user = $request->user();

            // Check if user is the recipient OR sender (instructor marking their sent messages)
            if ($message->recipient_id && $message->recipient_id !== $user->id && $message->sender_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // If no recipient_id (broadcast), only recipient of the course can mark as read
            if (!$message->recipient_id && $message->course_id) {
                $isEnrolled = \DB::table('enrollments')
                    ->where('user_id', $user->id)
                    ->where('course_id', $message->course_id)
                    ->exists();
                
                if (!$isEnrolled && $message->sender_id !== $user->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            }

            $message->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

            return response()->json($message);
        } catch (\Exception $e) {
            \Log::error('MessageController@markAsRead error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to mark message as read', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a message
     */
    public function destroy(Request $request, $messageId)
    {
        try {
            $message = Message::find($messageId);

            if (!$message) {
                return response()->json(['message' => 'Message not found'], 404);
            }

            // Only sender or admin can delete
            if ($message->sender_id !== $request->user()->id && $request->user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $message->delete();

            return response()->json(['message' => 'Message deleted']);
        } catch (\Exception $e) {
            \Log::error('MessageController@destroy error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete message', 'error' => $e->getMessage()], 500);
        }
    }
}
