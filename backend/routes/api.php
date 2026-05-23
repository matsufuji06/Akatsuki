<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// 認証系 API は v1 配下にまとめて、将来の差し替えをしやすくする
Route::prefix('v1')->group(function () {
    // ログインは公開APIとして提供し、ここでアクセストークンを発行する
    Route::post('/auth/login', [AuthController::class, 'login']);
});