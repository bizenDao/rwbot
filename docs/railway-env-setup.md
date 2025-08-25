# Railway環境変数設定ガイド

## 環境変数とは
アプリケーションの設定値（APIキー、データベース接続情報など）を、コードから分離して管理する仕組みです。

## Railway環境変数の設定方法

### 1. Railwayダッシュボードから設定

1. [Railway](https://railway.app)にログイン
2. プロジェクトを選択
3. サービスをクリック
4. 「Variables」タブを選択
5. 「+ New Variable」をクリック

### 2. 必要な環境変数

```bash
# ===== Discord関連 =====
DISCORD_PUB_KEY=               # Discord Application Public Key
DISCORD_CHANNEL_ID=             # 通知送信先のチャンネルID
DISCORD_ADMIN_USER_ID=          # 管理者のDiscordユーザーID
DISCORD_HOLDER_ROLE=            # Holderロール ID
DISCORD_SYNC_ROLE=              # 同期権限ロール ID

# ===== AWS関連 =====
AWS_REGION=ap-northeast-1       # AWSリージョン
AWS_ACCESS_KEY_ID=              # AWS IAMアクセスキー
AWS_SECRET_ACCESS_KEY=          # AWS IAMシークレットキー

# ===== DynamoDB関連 =====
DYNAMO_TABLE_PREFIX=            # DynamoDBテーブル接頭辞（例: bizbot-prd）
DYNAMO_TABLE_PREFIX_MASTER=     # マスターテーブル接頭辞
DYNAMO_SOFT_DELETE=true         # 論理削除の有効化

# ===== アプリケーション設定 =====
API_ENV=PRD                     # 環境（PRD/STG/TEST）
API_NAME=Bizen API              # API名
PROVIDER_URL=                   # フロントエンドURL（https://example.com）
```

### 3. 環境変数の取得方法

#### Discord設定値の取得

1. **DISCORD_PUB_KEY**
   - [Discord Developer Portal](https://discord.com/developers/applications)
   - アプリケーション選択 → General Information → Public Key

2. **DISCORD_CHANNEL_ID**
   - Discordで対象チャンネルを右クリック
   - 「IDをコピー」（開発者モードを有効にする必要あり）

3. **ロールID**
   - サーバー設定 → ロール → 対象ロール右クリック → IDをコピー

#### AWS設定値の取得

1. **AWS認証情報**
   - AWS IAMコンソール → ユーザー → セキュリティ認証情報
   - アクセスキーを作成
   - 必要な権限: DynamoDB, S3, SQS

### 4. Railway CLIから設定（オプション）

```bash
# Railway CLIインストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクトにリンク
railway link

# 環境変数設定
railway variables set DISCORD_PUB_KEY=your_key_here
railway variables set AWS_ACCESS_KEY_ID=your_aws_key_here
# ... 他の変数も同様に設定
```

### 5. 一括設定（.env形式）

Railwayダッシュボードの「Raw Editor」を使用：

```
DISCORD_PUB_KEY=your_discord_public_key
DISCORD_CHANNEL_ID=1234567890
DISCORD_ADMIN_USER_ID=0987654321
DISCORD_HOLDER_ROLE=1111111111
DISCORD_SYNC_ROLE=2222222222
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DYNAMO_TABLE_PREFIX=bizbot-prd
DYNAMO_TABLE_PREFIX_MASTER=bizbot-master
DYNAMO_SOFT_DELETE=true
API_ENV=PRD
API_NAME=Bizen API
PROVIDER_URL=https://your-frontend-domain.com
```

## セキュリティ注意事項

1. **環境変数は機密情報** - GitHubにコミットしない
2. **最小権限の原則** - AWSは必要な権限のみ付与
3. **定期的な更新** - APIキーは定期的に更新
4. **アクセス制限** - Railwayプロジェクトへのアクセスを制限

## トラブルシューティング

- **環境変数が読み込まれない**: デプロイの再実行
- **値が正しくない**: スペースや改行が含まれていないか確認
- **権限エラー**: AWS IAMポリシーを確認