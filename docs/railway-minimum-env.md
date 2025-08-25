# Railway最小限の環境変数

アプリを起動するために**必須**の環境変数：

```
API_ENV=PRD
API_NAME=Bizen API
VERSION=1.0.0
```

## 設定方法

1. Railwayダッシュボードを開く
2. サービスをクリック
3. 「Variables」タブを選択
4. 以下を追加：

```
API_ENV=PRD
API_NAME=Bizen API
VERSION=1.0.0
DISCORD_PUB_KEY=temporary_key
AWS_REGION=ap-northeast-1
DYNAMO_TABLE_PREFIX=temp
DYNAMO_TABLE_PREFIX_MASTER=temp
```

## 確認方法

1. **ログ確認**
   ```bash
   railway logs
   ```

2. **正常起動の確認**
   以下のメッセージが表示されれば成功：
   ```
   Server is running on port 8080
   Environment: PRD
   ```

3. **ドメイン生成**
   - Railwayダッシュボード → Settings
   - 「Generate Domain」をクリック
   - 生成されたURLにアクセス

## トラブルシューティング

- **"bizenAPI SETTING ERROR"** → 環境変数が不足
- **ポートエラー** → PORTはRailwayが自動設定（触らない）
- **アクセスできない** → ドメイン生成を確認