<?php

namespace App\Services;

use App\Models\CheckIn;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class CheckInService
{
    public function __construct(private readonly UserService $userService) {}

    /**
     * @param  array{activity: string, duration_minutes: int, note?: string|null}  $payload
     */
    public function create(User $user, array $payload): ?CheckIn
    {
        $now = CarbonImmutable::now();
        $today = $now->toDateString();

        try {
            return DB::transaction(function () use ($user, $payload, $now, $today): ?CheckIn {
                /** @var User $lockedUser */
                $lockedUser = User::query()->lockForUpdate()->findOrFail($user->getKey());

                if ($lockedUser->checkIns()->whereDate('checked_in_on', $today)->exists()) {
                    return null;
                }

                $lastCheckIn = $lockedUser->checkIns()
                    ->orderByDesc('checked_in_on')
                    ->first();

                $continuesStreak = $lastCheckIn?->checked_in_on->isSameDay($now->subDay())
                    ?? ((int) $lockedUser->total_check_ins > 0);
                $currentStreak = $continuesStreak
                    ? ((int) $lockedUser->current_streak + 1)
                    : 1;
                $totalCheckIns = (int) $lockedUser->total_check_ins + 1;

                $checkIn = $lockedUser->checkIns()->create([
                    'activity' => trim($payload['activity']),
                    'duration_minutes' => $payload['duration_minutes'],
                    'note' => $payload['note'] ?? null,
                    'checked_in_on' => $today,
                    'checked_in_at' => $now,
                ]);

                $lockedUser->forceFill([
                    'current_streak' => $currentStreak,
                    'best_streak' => max((int) $lockedUser->best_streak, $currentStreak),
                    'total_check_ins' => $totalCheckIns,
                    'level' => max(1, (int) ceil($totalCheckIns / 20)),
                ])->save();

                return $checkIn;
            }, 3);
        } catch (QueryException $exception) {
            // DB の一意制約を最後の防波堤にして、同時送信でも二重登録を防ぐ。
            if ($user->checkIns()->whereDate('checked_in_on', $today)->exists()) {
                return null;
            }

            throw $exception;
        }
    }

    /**
     * @return array{
     *   user: array,
     *   checkedInToday: bool,
     *   canCheckInNow: bool,
     *   todayCheckIn: array|null,
     *   summary: array
     * }
     */
    public function dashboard(User $user): array
    {
        $now = CarbonImmutable::now();
        $today = $now->toDateString();
        $todayCheckIn = $user->checkIns()
            ->whereDate('checked_in_on', $today)
            ->first();
        $latestCheckIn = $todayCheckIn ?? $user->checkIns()
            ->orderByDesc('checked_in_on')
            ->first();

        $weeklyProgress = $user->checkIns()
            ->whereBetween('checked_in_on', [
                $now->startOfWeek()->toDateString(),
                $now->endOfWeek()->toDateString(),
            ])
            ->count();

        $effectiveStreak = (int) $user->current_streak;
        if ($latestCheckIn !== null && $latestCheckIn->checked_in_on->lt($now->subDay()->startOfDay())) {
            $effectiveStreak = 0;
        }

        $userSummary = $this->userService->summarize($user);
        $userSummary['streak'] = $effectiveStreak;

        return [
            'user' => $userSummary,
            'checkedInToday' => $todayCheckIn !== null,
            'canCheckInNow' => $todayCheckIn === null,
            'todayCheckIn' => $todayCheckIn === null ? null : $this->summarize($todayCheckIn),
            'summary' => [
                'todayActivity' => $todayCheckIn?->activity ?? '未チェックイン',
                'todayDuration' => $todayCheckIn?->duration_minutes ?? 0,
                'weeklyTarget' => 7,
                'weeklyProgress' => $weeklyProgress,
            ],
        ];
    }

    public function summarize(CheckIn $checkIn): array
    {
        return [
            'id' => (string) $checkIn->getKey(),
            'activity' => $checkIn->activity,
            'durationMinutes' => (int) $checkIn->duration_minutes,
            'note' => $checkIn->note,
            'checkedInOn' => $checkIn->checked_in_on->toDateString(),
            'checkedInAt' => $checkIn->checked_in_at->toIso8601String(),
        ];
    }
}
