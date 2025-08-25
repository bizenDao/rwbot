# Railway Migration Guide

## 移行概要

このガイドは、AWS LambdaからRailwayへDiscord BOTを移行するための手順を説明します。

## 主な変更点

1. **サーバーアーキテクチャ**
   - Lambda Handler → 永続的なExpressサーバー
   - サーバーレス → 常時稼働サーバー

2. **新規作成ファイル**
   - `src/index-railway.ts`: Railway用のエントリーポイント
   - `railway.json`: Railway設定ファイル
   - `.env.railway`: 環境変数テンプレート
   - `tsconfig.railway.json`: TypeScript設定

## デプロイ手順

### 1. Railwayプロジェクトの作成

1. [Railway](https://railway.app)にアカウントを作成
2. 新規プロジェクトを作成
3. GitHubリポジトリと連携

### 2. 環境変数の設定

Railwayダッシュボードで以下の環境変数を設定：

```
API_ENV=PRD
API_NAME=Bizen API
DISCORD_PUB_KEY=your_discord_public_key_here
DISCORD_CHANNEL_ID=your_discord_channel_id_here
DISCORD_ADMIN_USER_ID=your_discord_admin_user_id_here
DISCORD_HOLDER_ROLE=your_discord_holder_role_here
DISCORD_SYNC_ROLE=your_discord_sync_role_here
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
DYNAMO_TABLE_PREFIX=your_table_prefix_here
DYNAMO_TABLE_PREFIX_MASTER=your_master_table_prefix_here
DYNAMO_SOFT_DELETE=true
PROVIDER_URL=https://your-frontend-domain.com
```

### 3. デプロイ

1. コードをGitHubにプッシュ
2. Railwayが自動的にビルド・デプロイを実行
3. デプロイ完了後、提供されたURLでアクセス可能

## ローカルテスト

```bash
# 依存関係のインストール
npm install

# TypeScriptのインストール（必要な場合）
npm install -D typescript @types/node @types/express ts-node

# ビルド
npm run build

# 開発サーバー起動
npm run dev
```

## 注意事項

1. **ポート設定**: RailwayはPORT環境変数を自動設定
2. **AWSサービス**: DynamoDB、S3、SQSは引き続き使用
3. **Discord Webhook**: Railway URLに変更が必要

## トラブルシューティング

- ビルドエラー: `tsconfig.railway.json`の設定確認
- 環境変数エラー: Railwayダッシュボードで設定確認
- ポートエラー: `process.env.PORT`を使用しているか確認