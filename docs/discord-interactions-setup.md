# Discord Interactions エンドポイント設定ガイド

## エラー: 「interactions_endpoint_url: 指定されたインタラクション・エンドポイントURLを認証できませんでした」

このエラーはDiscordがあなたのアプリケーションのエンドポイントを検証できない場合に発生します。

## 解決手順

### 1. Railway URLの確認
1. Railwayダッシュボードにログイン
2. サービスの「Settings」タブを開く
3. 「Domains」セクションで公開URLを確認（例: `https://your-app.railway.app`）

### 2. Discord Developer Portalでの設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 対象のアプリケーションを選択
3. 左メニューの「General Information」で以下を確認：
   - **APPLICATION ID**
   - **PUBLIC KEY** → これを`DISCORD_PUB_KEY`として設定

4. 左メニューの「Bot」で以下を確認：
   - **TOKEN** → これを`DISCORD_BOT_KEY`として設定

5. 左メニューの「OAuth2」→「General」で：
   - **Interactions Endpoint URL**に以下を設定：
   ```
   https://your-app.railway.app/interactions
   ```
   - 「Save Changes」をクリック

### 3. 認証が失敗する理由

1. **環境変数の不一致**
   - `DISCORD_PUB_KEY`がDiscord Developer Portalの値と一致していない
   - Railwayで環境変数が正しく設定されていない

2. **エンドポイントの問題**
   - アプリケーションが起動していない
   - `/interactions`エンドポイントが正しく動作していない
   - HTTPSが必須（RailwayはデフォルトでHTTPS）

3. **検証レスポンスの問題**
   - Discordは`type: 1`のPINGに対して`{ type: 1 }`を返すことを期待

### 4. デバッグ手順

1. **エンドポイントの動作確認**
   ```bash
   curl https://your-app.railway.app/
   ```
   → APIの情報が表示されることを確認

2. **環境変数の確認**
   - Railwayのログで起動時の環境変数を確認
   - `DISCORD_PUB_KEY`が正しく設定されているか

3. **一時的な回避策**
   認証を一時的に無効にしてテスト（本番環境では使用しないこと）：
   ```typescript
   app.post("/interactions", async (req, res) => {
     if (req.body.type === 1) {
       return res.send({ type: 1 });
     }
     // ... 他の処理
   });
   ```

### 5. 正しい設定例

**Railway環境変数:**
```
DISCORD_PUB_KEY=あなたのPublic Key（64文字の16進数）
DISCORD_BOT_KEY=あなたのBot Token
DISCORD_GUILD_ID=サーバーID
API_ENV=PRD
```

**Discord Interactions Endpoint URL:**
```
https://your-railway-app.railway.app/interactions
```

### 6. よくある間違い

- URLの末尾に`/`を付けている → `/interactions`で終わること
- HTTPでアクセスしている → HTTPSが必須
- Public KeyとBot Tokenを混同している
- 環境変数名が間違っている

## 確認チェックリスト

- [ ] Railway環境変数に`DISCORD_PUB_KEY`が設定されている
- [ ] Public Keyが正確にコピーされている（スペースなし）
- [ ] アプリケーションが正常に起動している
- [ ] Interactions Endpoint URLがHTTPSで正しい
- [ ] `/interactions`エンドポイントがPOSTリクエストを受け付ける