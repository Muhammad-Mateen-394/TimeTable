<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MasterDataController;
use App\Http\Controllers\Api\V1\TimetableController;
use App\Http\Controllers\Api\V1\ConflictController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\AccountController;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware(['web', 'throttle:10,1']);
    Route::post('/auth/signup', [AuthController::class, 'signup'])->middleware(['web', 'throttle:5,1']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('web');
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::get('/accounts', [AccountController::class, 'index']);
        Route::post('/accounts', [AccountController::class, 'store']);
        Route::put('/auth/password', [AccountController::class, 'updatePassword']);
        Route::put('/auth/school', [AuthController::class, 'updateSchool'])->middleware('role:principal,manager');
        Route::get('/dashboard', DashboardController::class);
        Route::get('/{resource}', [MasterDataController::class, 'index'])->where('resource', 'teachers|classes|subjects|rooms|periods|academic-years|assignments');
        Route::post('/{resource}', [MasterDataController::class, 'store'])->where('resource', 'teachers|classes|subjects|rooms|periods|academic-years|assignments')->middleware('role:principal,manager');
        Route::match(['put', 'patch'], '/{resource}/{id}', [MasterDataController::class, 'update'])->where('resource', 'teachers|classes|subjects|rooms|periods|academic-years|assignments')->middleware('role:principal,manager');
        Route::delete('/{resource}/{id}', [MasterDataController::class, 'destroy'])->where('resource', 'teachers|classes|subjects|rooms|periods|academic-years|assignments')->middleware('role:principal,manager');
        Route::get('/conflicts', [ConflictController::class, 'index']);
        Route::post('/conflicts/{conflict}/resolve', [ConflictController::class, 'resolve'])->middleware('role:principal,manager');
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'read']);
        Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
        Route::get('/reports/teacher-workload', [ReportController::class, 'workload']);
        Route::get('/reports/subject-distribution', [ReportController::class, 'subjects']);
        Route::get('/reports/room-utilization', [ReportController::class, 'rooms']);
        Route::get('/timetables', [TimetableController::class, 'index']);
        Route::post('/timetables', [TimetableController::class, 'store'])->middleware('role:principal,manager');
        Route::post('/timetables/generate', [TimetableController::class, 'generate'])->middleware('role:principal,manager');
        Route::get('/timetables/{timetable}', [TimetableController::class, 'show']);
        Route::post('/timetables/validate-entry', [TimetableController::class, 'validateEntry']);
        Route::post('/timetables/{timetable}/entries', [TimetableController::class, 'storeEntry'])->middleware('role:principal,manager');
        Route::match(['put', 'patch'], '/timetable-entries/{entry}', [TimetableController::class, 'updateEntry'])->middleware('role:principal,manager');
        Route::delete('/timetable-entries/{entry}', [TimetableController::class, 'destroyEntry'])->middleware('role:principal,manager');
        Route::post('/timetables/{timetable}/submit', [TimetableController::class, 'submit'])->middleware('role:manager');
        Route::post('/timetables/{timetable}/request-changes', [TimetableController::class, 'requestChanges'])->middleware('role:principal');
        Route::post('/timetables/{timetable}/approve', [TimetableController::class, 'approve'])->middleware('role:principal');
        Route::post('/timetables/{timetable}/publish', [TimetableController::class, 'publish'])->middleware('role:principal');
    });
});
