# Ethereum 設定ガイド

## 必要な環境変数

Discord BOT が NFT/SBT の所有状況を確認するために、以下の Ethereum 関連の環境変数が必要です。

### 1. RPC_URL

Ethereum ノードの RPC エンドポイント URL

**取得方法：**

- [Alchemy](https://www.alchemy.com/)
- [Infura](https://infura.io/)
- [QuickNode](https://www.quicknode.com/)

例：

```
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### 2. MANAGER_CA

NFT/SBT 管理コントラクトのアドレス

### 3. DONATE_CA

寄付管理コントラクトのアドレス

## Railway 環境変数設定

1. Railway ダッシュボード → Variables
2. 以下を追加：

```
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
MANAGER_CA=0x実際のコントラクトアドレス
DONATE_CA=0x実際のコントラクトアドレス
```

## エラー対処

**「invalid value for Contract target」エラー**

- 原因：コントラクトアドレスが設定されていない
- 解決：上記の環境変数を設定

**「システムの設定が完了していません」メッセージ**

- 原因：Ethereum 関連の環境変数が未設定
- 解決：管理者が環境変数を設定する必要がある

## 確認方法

1. ルートエンドポイントにアクセス
2. 「External Services」セクションで設定状態を確認
3. `/apply`コマンドで NFT 所有確認機能をテスト
