<?php

namespace App\Services;

use App\Models\User;

class UserService
{
    /**
     * ユーザーの要約情報を取得
     *
     * 認証後に返す前提のため、API利用に必要な最小限の情報だけに絞る。
     *
     * @param User $user
     * @return array
     */
    public function summarize(User $user): array
    {
        // joined_at がある場合は入会日として優先し、なければ作成日を使う
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