<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\AuthService;
use App\Services\UserService;

class AuthController extends Controller
{
    protected AuthService $authService;
    protected UserService $userService;

    /**
     * コンストラクタ
     *
     * @param AuthService $authService
     * @param UserService $userService
     */
    public function __construct(AuthService $authService, UserService $userService)
    {
        $this->authService = $authService;
        $this->userService = $userService;
    }

    /**
     * ログイン処理
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(
        Request $request,
    ): JsonResponse
    {
        // バリデーション
        $payload = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = $this->authService->attemptLogin($payload['email'], $payload['password']);

        if (!$user) {
            return response()->json([
                'message' => 'メールアドレスまたはパスワードが正しくありません。',
            ], 401);
        }

        $plainToken = $this->authService->issueLoginToken($user);

        return response()->json([
            'data' => [
                'token' => $plainToken,
                'user' => $this->userService->summarize($user),
            ],
        ]);
    }
}
