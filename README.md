# Akatsuki Dockerコマンドガイド

このプロジェクトは Docker Compose を使って開発・運用します。

## 1. コマンドを実行する場所

Docker Compose のコマンドは、必ずプロジェクトのルートディレクトリで実行してください。

```bash
cd <project-root>
```

理由:
- docker-compose.yml がこのディレクトリにあるため
- backend / frontend / db のサービス定義がここにあるため

## 2. 環境の起動・停止

全サービスをバックグラウンドで起動:

```bash
docker compose up -d
```

イメージを再ビルドして起動:

```bash
docker compose up -d --build
```

全サービスを停止:

```bash
docker compose down
```

停止してボリュームも削除（完全リセット）:

```bash
docker compose down -v
```

コンテナ状態を確認:

```bash
docker compose ps
```

ログを確認:

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## 3. Backend（Laravel）コマンド

Laravel コマンドは、プロジェクトルートから backend コンテナ内で実行します。

```bash
docker compose exec backend php artisan migrate
docker compose exec backend php artisan migrate:fresh --seed
docker compose exec backend php artisan test
docker compose exec backend php artisan route:list
```

Composer も backend コンテナ内で実行します。

```bash
docker compose exec backend composer install
docker compose exec backend composer dump-autoload
```

backend コンテナにシェルで入る:

```bash
docker compose exec backend sh
```

## 4. Frontend コマンド

Node/NPM コマンドは、プロジェクトルートから frontend コンテナ内で実行します。

```bash
docker compose exec frontend npm install
docker compose exec frontend npm run dev
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

frontend コンテナにシェルで入る:

```bash
docker compose exec frontend sh
```

## 5. Database コマンド

コンテナ内の MySQL に接続:

```bash
docker compose exec db mysql -uakatsuki -pakatsuki akatsuki
```

バックアップ例:

```bash
docker compose exec db sh -lc 'mysqldump -uakatsuki -pakatsuki akatsuki' > backup.sql
```

リストア例:

```bash
cat backup.sql | docker compose exec -T db sh -lc 'mysql -uakatsuki -pakatsuki akatsuki'
```

## 6. 重要メモ（よくあるエラー）

ホストマシンで php artisan を実行すると、次のエラーが出る場合があります。

- could not find driver

これはホスト側の PHP に pdo_mysql が入っていない可能性があるためです。

次の形式で実行してください。

```bash
docker compose exec backend php artisan <command>
```

## 7. 初回セットアップ（最短）

```bash
cd /home/n-matsufuji/Akatsuki
docker compose up -d --build
docker compose exec backend php artisan migrate:fresh --seed
```

アプリケーションURL:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
