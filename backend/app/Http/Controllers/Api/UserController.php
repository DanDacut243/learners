<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController
{
    public function index()
    {
        // Only admins can see all users. Others see only themselves
        if (auth()->user()->role !== 'admin') {
            return response()->json(['data' => [auth()->user()]], 200);
        }

        return response()->json(User::paginate(15));
    }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Only admin or the user themselves can view the user
        if (auth()->user()->id !== $id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|regex:/[A-Z]/|regex:/[a-z]/|regex:/[0-9]/|regex:/[@$!%*?&]/',
            'role' => 'required|in:admin,instructor,student',
            'avatar' => 'nullable|string',
            'subtitle' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        // Auto-set subtitle based on role if not provided
        if (!isset($validated['subtitle']) || !$validated['subtitle']) {
            $roleSubtitles = [
                'admin' => 'Administrator',
                'instructor' => 'Instructor',
                'student' => 'Student',
            ];
            $validated['subtitle'] = $roleSubtitles[$validated['role']] ?? ucfirst($validated['role']);
        }

        $user = User::create($validated);

        // Send notification to the new user
        Notification::create([
            'user_id' => $user->id,
            'title' => 'Welcome to ERUDITE!',
            'message' => 'Your account has been created successfully. Log in to get started.',
            'type' => 'success',
        ]);

        // Send notification to admin about new account creation
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'New ' . ucfirst($user->role) . ' Account Created',
                'message' => "{$user->name} ({$user->email}) has been added as a {$user->role}.",
                'type' => 'info',
            ]);
        }

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Only admin or the user themselves can update
        if (auth()->user()->id !== $id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:admin,instructor,student',
            'avatar' => 'nullable|string',
            'subtitle' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Only admins can delete users
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized - only admins can delete users'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}
