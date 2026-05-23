<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_accepts_email_variations_and_returns_token_and_user(): void
    {
        $user = User::factory()->create([
            'email' => 'Mixed.Case@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => '  mixed.case@example.com ',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.user.id', (string) $user->getKey());
        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_login_replaces_existing_login_tokens(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
        ]);

        $user->createToken('apiToken')->plainTextToken;

        $this->assertSame(1, DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->getKey())
            ->count());

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk();

        $this->assertSame(1, DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->getKey())
            ->count());

        $this->assertSame('apiToken', DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->getKey())
            ->value('name'));
    }
}