<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckInTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    public function test_authenticated_user_can_check_in_once_per_day(): void
    {
        CarbonImmutable::setTestNow('2026-07-25 06:30:00');
        $user = User::factory()->create([
            'current_streak' => 0,
            'best_streak' => 0,
            'total_check_ins' => 0,
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/check-ins', [
            'activity' => '読書',
            'duration_minutes' => 30,
            'note' => '技術書を1章読んだ',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.checkIn.activity', '読書')
            ->assertJsonPath('data.checkIn.durationMinutes', 30)
            ->assertJsonPath('data.dashboard.checkedInToday', true)
            ->assertJsonPath('data.dashboard.canCheckInNow', false)
            ->assertJsonPath('data.dashboard.user.streak', 1)
            ->assertJsonPath('data.dashboard.user.totalCheckIns', 1);

        $this->assertDatabaseHas('check_ins', [
            'user_id' => $user->getKey(),
            'activity' => '読書',
            'duration_minutes' => 30,
            'checked_in_on' => '2026-07-25',
        ]);

        $user->refresh();
        $this->assertSame(1, $user->current_streak);
        $this->assertSame(1, $user->best_streak);
        $this->assertSame(1, $user->total_check_ins);

        $this->postJson('/api/v1/check-ins', [
            'activity' => '運動',
            'duration_minutes' => 20,
        ])->assertConflict()
            ->assertExactJson([
                'message' => '今日はすでにチェックイン済みです。',
            ]);

        $this->assertDatabaseCount('check_ins', 1);
    }

    public function test_check_in_continues_or_resets_streak_based_on_previous_day(): void
    {
        CarbonImmutable::setTestNow('2026-07-25 07:00:00');

        $continuingUser = User::factory()->create([
            'current_streak' => 4,
            'best_streak' => 6,
            'total_check_ins' => 10,
        ]);
        $continuingUser->checkIns()->create([
            'activity' => '勉強',
            'duration_minutes' => 45,
            'checked_in_on' => '2026-07-24',
            'checked_in_at' => '2026-07-24 06:00:00',
        ]);

        Sanctum::actingAs($continuingUser);
        $this->postJson('/api/v1/check-ins', [
            'activity' => '勉強',
            'duration_minutes' => 45,
        ])->assertCreated()
            ->assertJsonPath('data.dashboard.user.streak', 5);

        $staleUser = User::factory()->create([
            'current_streak' => 8,
            'best_streak' => 12,
            'total_check_ins' => 30,
        ]);
        $staleUser->checkIns()->create([
            'activity' => '運動',
            'duration_minutes' => 20,
            'checked_in_on' => '2026-07-22',
            'checked_in_at' => '2026-07-22 06:00:00',
        ]);

        Sanctum::actingAs($staleUser);
        $this->postJson('/api/v1/check-ins', [
            'activity' => '運動',
            'duration_minutes' => 20,
        ])->assertCreated()
            ->assertJsonPath('data.dashboard.user.streak', 1)
            ->assertJsonPath('data.dashboard.user.bestStreak', 12);
    }

    public function test_dashboard_returns_today_and_current_week_data_for_authenticated_user(): void
    {
        CarbonImmutable::setTestNow('2026-07-25 08:00:00');
        $user = User::factory()->create([
            'current_streak' => 3,
            'best_streak' => 3,
            'total_check_ins' => 3,
        ]);

        foreach (['2026-07-20', '2026-07-22'] as $date) {
            $user->checkIns()->create([
                'activity' => '読書',
                'duration_minutes' => 15,
                'checked_in_on' => $date,
                'checked_in_at' => "{$date} 06:00:00",
            ]);
        }
        $user->checkIns()->create([
            'activity' => '瞑想',
            'duration_minutes' => 10,
            'note' => '集中できた',
            'checked_in_on' => '2026-07-25',
            'checked_in_at' => '2026-07-25 07:30:00',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonPath('data.checkedInToday', true)
            ->assertJsonPath('data.canCheckInNow', false)
            ->assertJsonPath('data.todayCheckIn.activity', '瞑想')
            ->assertJsonPath('data.summary.todayDuration', 10)
            ->assertJsonPath('data.summary.weeklyProgress', 3)
            ->assertJsonPath('data.summary.weeklyTarget', 7);
    }

    public function test_check_in_validates_input_and_requires_authentication(): void
    {
        $this->getJson('/api/v1/dashboard')->assertUnauthorized();
        $this->postJson('/api/v1/check-ins', [
            'activity' => '読書',
            'duration_minutes' => 30,
        ])->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/check-ins', [
            'activity' => '',
            'duration_minutes' => 0,
            'note' => str_repeat('a', 1001),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['activity', 'duration_minutes', 'note']);
    }
}
