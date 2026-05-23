<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $joinedAt = fake()->dateTimeBetween('-2 years', 'now');
        $currentStreak = fake()->numberBetween(0, 30);
        $bestStreak = fake()->numberBetween($currentStreak, 90);
        $totalCheckIns = fake()->numberBetween($bestStreak, 365);

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'avatar_url' => fake()->imageUrl(256, 256, 'people', true),
            'current_streak' => $currentStreak,
            'best_streak' => $bestStreak,
            'total_check_ins' => $totalCheckIns,
            'level' => min(50, max(1, (int) ceil($totalCheckIns / 20))),
            'joined_at' => $joinedAt,
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
