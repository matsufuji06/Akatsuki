<?php

namespace App\Services;

use App\Models\User;

class UserService
{
    /**
     * ユーザーの要約情報を取得
     *
     * @param User $user
     * @return array
     */
    public function summarize(User $user): array
    {
        // joined_atがあればそれを、なければcreated_atを使用
        $joinedAt = $user->joined_at ?? $user->created_at;

        return [
            'id' => (string) $user->getKey(),
            'name' => $user->name,
            'avatar' => $user->avatar_url,
            'streak' => (int) ($user->current_streak ?? 0),
            'bestStreak' => (int) ($user->best_streak ?? 0),
            'totalCheckIns' => (int) ($user->total_check_ins ?? 0),
            'level' => (int) ($user->level ?? 1),
            'joinedAt' => optional($joinedAt)->toIso8601String(),
        ];
    }
}