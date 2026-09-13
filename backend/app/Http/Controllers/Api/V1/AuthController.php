<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        if (!Auth::attempt($credentials)) {
            return response()->json(['success' => false, 'message' => 'Invalid email or password.'], 422);
        }
        $request->session()->regenerate();
        return $this->userResponse($request, 'Signed in successfully.');
    }

    public function signup(Request $request)
    {
        $data = $request->validate([
            'school_name' => ['required', 'string', 'max:160'],
            'campus' => ['nullable', 'string', 'max:160'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $school = \App\Models\School::create([
                'name' => $data['school_name'],
                'campus' => $data['campus'] ?? null,
                'code' => 'SCH-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 8)),
            ]);
            return \App\Models\User::create([
                'school_id' => $school->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'principal',
            ]);
        });

        Auth::login($user);
        $request->session()->regenerate();
        return $this->userResponse($request, 'Account created successfully.');
    }

    public function user(Request $request)
    {
        return $this->userResponse($request);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['success' => true, 'message' => 'Signed out successfully.']);
    }

    public function updateSchool(Request $request)
    {
        $user = $request->user();
        abort_unless(in_array($user->role, ['principal', 'manager'], true), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'campus' => ['nullable', 'string', 'max:160'],
            'settings' => ['nullable', 'array'],
        ]);

        $school = $user->school;
        abort_unless($school, 422, 'Your account is not linked to a school.');
        $school->update($data);

        return response()->json(['success' => true, 'message' => 'Settings saved.', 'data' => $school->fresh()]);
    }

    private function userResponse(Request $request, string $message = 'Authenticated user.')
    {
        $user = $request->user()->load('school', 'teacher');
        return response()->json(['success' => true, 'message' => $message, 'data' => [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'role' => $user->role, 'phone' => $user->phone, 'avatar' => $user->avatar,
            'school' => $user->school, 'teacher' => $user->teacher,
        ]]);
    }
}
