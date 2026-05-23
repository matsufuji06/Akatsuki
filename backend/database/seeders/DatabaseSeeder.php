<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ログイン確認に使いやすい固定ユーザー
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff',
            'current_streak' => 3,
            'best_streak' => 7,
            'total_check_ins' => 18,
            'level' => 1,
            'joined_at' => now()->subMonths(6),
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Admin+User&background=1F2937&color=fff',
            'current_streak' => 12,
            'best_streak' => 30,
            'total_check_ins' => 120,
            'level' => 6,
            'joined_at' => now()->subYear(),
        ]);

        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Demo+User&background=F59E0B&color=111827',
            'current_streak' => 5,
            'best_streak' => 14,
            'total_check_ins' => 42,
            'level' => 3,
            'joined_at' => now()->subMonths(3),
        ]);

        // 追加のテスト用ダミーユーザー
        User::factory(15)->create();
    }
}
