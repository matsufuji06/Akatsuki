<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LoginTest extends TestCase
{
    // 各テストの前にデータベースをリフレッシュする。
    use RefreshDatabase;

    // メールアドレスの前後空白・大文字小文字差を吸収してログインできることを確認する。
    // 併せて、レスポンスにユーザー情報と発行トークンが含まれることを担保する。
    public function test_login_accepts_email_variations_and_returns_token_and_user(): void
    {
        // 大文字小文字混在・前後空白ありのメールアドレスでユーザーを作成する。
        $user = User::factory()->create([
            'email' => 'Mixed.Case@example.com',
            'password' => 'password',
        ]);

        // ログインを試みる。
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => '  mixed.case@example.com ',
            'password' => 'password',
        ]);

        // ログイン成功を確認する。
        $response->assertOk();

        // レスポンスにユーザー情報とトークンが含まれることを確認する。
        $response->assertJsonPath('data.user.id', (string) $user->getKey());

        // トークンが発行されていることを確認する。
        $this->assertNotEmpty($response->json('data.token'));
    }

    // 再ログイン時に既存トークンが残存せず、常に1件に置き換わることを確認する。
    // トークン名が変わらないことも合わせて検証し、同名で再発行されていることを担保する。
    public function test_login_replaces_existing_login_tokens(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
        ]);

        $user->createToken('apiToken')->plainTextToken;

        // 既に1件トークンが存在していることを確認する。
        $this->assertSame(1, DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->getKey())
            ->count());

        // 再ログインを試みる。
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        // ログイン成功を確認する。
        $response->assertOk();

        // 再ログイン後もトークンが1件であることを確認する。
        $this->assertSame(1, DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->getKey())
            ->count());

        // トークン名が変わらないことを確認する。
        $this->assertSame('apiToken', DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->getKey())
            ->value('name'));
    }

    // 認証情報が誤っている場合は401を返し、トークンを発行しないことを確認する。
    public function test_login_returns_unauthorized_when_credentials_are_invalid(): void
    {
        // ユーザーを作成する。
        $user = User::factory()->create([
            'password' => 'password',
        ]);

        // 誤ったパスワードでログインを試みる。
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        // 認証失敗を確認する。
        $response->assertUnauthorized();

        // レスポンスにエラーメッセージが含まれることを確認する。
        $response->assertExactJson([
            'message' => 'メールアドレスまたはパスワードが正しくありません。',
        ]);

        // トークンが発行されていないことを確認する。
        $this->assertSame(0, DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->getKey())
            ->count());
    }
}
