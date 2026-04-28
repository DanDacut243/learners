<?php

namespace App\Http\Controllers\Api;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController
{
    public function index()
    {
        return response()->json(
            Announcement::with('creator')
                ->where('visibility', 'public')
                ->orWhere('created_by', auth()->id())
                ->latest()
                ->paginate(15)
        );
    }

    public function show($id)
    {
        $announcement = Announcement::with('creator')->find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        return response()->json($announcement);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admins can create announcements'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'visibility' => 'required|in:public,admin_only,instructors_only',
            'expires_at' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        $validated['created_by'] = $request->user()->id;

        $announcement = Announcement::create($validated);

        return response()->json($announcement, 201);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        if ($announcement->created_by !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'visibility' => 'sometimes|in:public,admin_only,instructors_only',
            'expires_at' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        $announcement->update($validated);

        return response()->json($announcement);
    }

    public function destroy(Request $request, $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        if ($announcement->created_by !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted']);
    }
}
