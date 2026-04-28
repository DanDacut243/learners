<?php

namespace App\Http\Controllers\Api;

use App\Models\Discussion;
use App\Models\Module;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class DiscussionController
{
    public function getByModule($moduleId)
    {
        $module = Module::find($moduleId);

        if (!$module) {
            return response()->json(['message' => 'Module not found'], 404);
        }

        $discussions = Discussion::where('module_id', $moduleId)
            ->with(['enrollment.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($discussion) {
                return [
                    'id' => $discussion->id,
                    'content' => $discussion->content,
                    'author' => $discussion->enrollment->user->name,
                    'author_avatar' => $discussion->enrollment->user->avatar,
                    'created_at' => $discussion->created_at,
                ];
            });

        return response()->json($discussions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'module_id' => 'required|exists:modules,id',
            'content' => 'required|string|min:1',
        ]);

        // Verify user owns the enrollment
        $enrollment = Enrollment::find($validated['enrollment_id']);
        if ($enrollment->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $discussion = Discussion::create($validated);

        return response()->json($discussion, 201);
    }

    public function destroy(Request $request, $id)
    {
        $discussion = Discussion::find($id);

        if (!$discussion) {
            return response()->json(['message' => 'Discussion not found'], 404);
        }

        // Only the author or admin can delete
        if ($discussion->enrollment->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $discussion->delete();

        return response()->json(['message' => 'Discussion deleted']);
    }
}
