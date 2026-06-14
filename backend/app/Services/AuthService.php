<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * 新規ユーザー登録
     *
     * メールアドレスは正規化したうえで保存し、joined_at を設定する。
     */
    public function registerUser(string $name, string $email, string $password): User
    {
        return User::query()->create([
            'name' => trim($name),
            'email' => strtolower(trim($email)),
            'password' => $password,
            'joined_at' => now(),
        ]);
    }

    /**
     * ログイン試行
     *
     * メールアドレスを正規化したうえでユーザーを探し、
     * パスワード確認まで通った場合のみユーザーを返す。
     */
    public function attemptLogin(string $email, string $password): ?User
    {
        // 入力の揺れを吸収して、同じアドレスなら同じユーザーにたどり着くようにする
        $normalizedEmail = strtolower(trim($email));

        // まずメールアドレスでユーザーを1件取得する
        $user = User::query()
            ->where('email', $normalizedEmail)
            ->first();

        // ユーザーがいない、またはパスワードが違うなら認証失敗として扱う
        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }

    /**
     * ログイントークン発行
     *
     * 同名トークンを先に消しておくことで、再ログイン時にトークンが増え続けるのを防ぐ。
     */
    public function issueLoginToken(User $user, string $tokenName = 'apiToken', int $expiresDays = 7): string
    {
        // 同名の古いトークンを削除してから、新しいトークンを発行する
        $user->tokens()->where('name', $tokenName)->delete();

        // 返却時に必要なのは平文トークンなので、createToken の戻り値から取り出す
        return $user->createToken($tokenName, ['*'], now()->addDays($expiresDays))->plainTextToken;
    }
}
