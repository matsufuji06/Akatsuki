<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * ログイン試行
     *
     * @return User|null
     */
    public function attemptLogin(string $email, string $password): ?User
    {
        // メールアドレスは正規化してから検索
        $normalizedEmail = strtolower(trim($email));

        // メールアドレスでユーザーを検索
        $user = User::query()
            ->where('email', $normalizedEmail)
            ->first();

        // ユーザーが存在しないか、パスワードが一致しない場合はnullを返す
        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }

    /**
     * ログイントークン発行
     *
     * @param User $user
     * @param string $tokenName
     * @param int $expiresDays
     * @return string
     */
    public function issueLoginToken(User $user, string $tokenName = 'apiToken', int $expiresDays = 7): string
    {
        // 同名のトークンがあれば削除してから新規発行
        $user->tokens()->where('name', $tokenName)->delete();

        // トークンを発行して平文のトークンを返す
        return $user->createToken($tokenName, ['*'], now()->addDays($expiresDays))->plainTextToken;
    }
}
