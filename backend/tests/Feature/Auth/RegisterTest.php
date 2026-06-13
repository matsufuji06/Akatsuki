<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    // 各テストの前にデータベースをリフレッシュする。
    use RefreshDatabase;

    // 正常系: 登録でユーザー作成とトークン発行が行われることを確認する。
    public function test_register_creates_user_and_returns_token_and_user(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Taro Yamada',
            'email' => '  NEW.USER@example.com ',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();

        $response->assertJsonPath('data.user.name', 'Taro Yamada');
        $this->assertNotEmpty($response->json('data.token'));

        $this->assertDatabaseHas('users', [
            'name' => 'Taro Yamada',
            'email' => 'new.user@example.com',
        ]);

        $userId = $response->json('data.user.id');

        $this->assertSame(1, DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', (int) $userId)
            ->count());
    }

    // 異常系: 既存メールアドレスでは登録できないことを確認する。
    public function test_register_fails_when_email_is_already_taken(): void
    {
        User::factory()->create([
            'email' => 'duplicate@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Hanako',
            'email' => 'duplicate@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);

        $this->assertSame(1, User::query()->where('email', 'duplicate@example.com')->count());
    }

    // 異常系: 必須項目や確認用パスワード不一致を検知できることを確認する。
    public function test_register_validates_required_fields_and_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'name',
            'email',
            'password',
        ]);
    }
}
