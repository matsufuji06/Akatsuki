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
     * 新規登録処理
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(
        Request $request,
    ): JsonResponse
    {
        // 登録に必要な項目のみを受け付け、重複メールや弱いパスワードを弾く
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // 作成処理はサービス層にまとめ、コントローラは入出力に集中させる
        $user = $this->authService->registerUser(
            $payload['name'],
            $payload['email'],
            $payload['password'],
        );

        // 登録直後にログイン済みとして扱えるようにトークンを払い出す
        $plainToken = $this->authService->issueLoginToken($user);

        return response()->json([
            'data' => [
                'token' => $plainToken,
                'user' => $this->userService->summarize($user),
            ],
        ], 201);
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
        // 入力値の形式を先に揃えて、認証処理に不正な値を渡さない
        $payload = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // 認証判定はサービス層に寄せて、コントローラは入出力に集中させる
        $user = $this->authService->attemptLogin($payload['email'], $payload['password']);

        if (!$user) {
            // 認証失敗時は理由をぼかして返し、情報を出しすぎない
            return response()->json([
                'message' => 'メールアドレスまたはパスワードが正しくありません。',
            ], 401);
        }

        // 既存トークンを整理してから、新しいログイントークンを払い出す
        $plainToken = $this->authService->issueLoginToken($user);

        // フロントエンドがそのまま使える形で、トークンと表示用ユーザー情報を返す
        return response()->json([
            'data' => [
                'token' => $plainToken,
                'user' => $this->userService->summarize($user),
            ],
        ]);
    }
}
