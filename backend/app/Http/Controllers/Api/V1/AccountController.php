<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['principal', 'manager'], true), 403);

        return response()->json(['success' => true, 'data' => User::where('school_id', $request->user()->school_id)
            ->with('teacher')->select('id', 'school_id', 'name', 'email', 'role', 'status', 'created_at')->latest()->get()]);
    }

    public function store(Request $request)
    {
        $creator = $request->user();
        abort_unless(in_array($creator->role, ['principal', 'manager'], true), 403);
        $allowedRoles = $creator->role === 'principal' ? ['manager', 'teacher'] : ['teacher'];
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in($allowedRoles)],
            'employee_code' => ['nullable', 'string', 'max:40'],
            'specialization' => ['nullable', 'string', 'max:120'],
        ]);

        $user = User::create([
            'school_id' => $creator->school_id,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        if ($user->role === 'teacher') {
            Teacher::create([
                'school_id' => $creator->school_id,
                'user_id' => $user->id,
                'employee_code' => $data['employee_code'] ?: 'T-'.$user->id,
                'name' => $user->name,
                'specialization' => $data['specialization'] ?? null,
            ]);
        }

        $this->notifyStaff($creator, 'account.created', 'New account created', "{$user->name} was added as a {$user->role} by {$creator->name}.");
        return response()->json(['success' => true, 'message' => 'Account created.', 'data' => $user->load('teacher')], 201);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'current_password' => ['required', 'current_password:web'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        $user->update(['password' => Hash::make($data['password'])]);
        $this->notifyStaff($user, 'account.password_changed', 'Password changed', "{$user->name} changed their account password.");
        return response()->json(['success' => true, 'message' => 'Password changed successfully.']);
    }

    private function notifyStaff(User $actor, string $type, string $title, string $message): void
    {
        User::where('school_id', $actor->school_id)->whereIn('role', ['principal', 'manager'])->get()->each(
            fn (User $recipient) => AppNotification::create(['school_id' => $actor->school_id, 'user_id' => $recipient->id, 'type' => $type, 'title' => $title, 'message' => $message, 'data' => ['actor' => $actor->name]])
        );
    }
}
