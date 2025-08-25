# Railway移行後のクリーンアップ

## 削除したファイル
- `src/index.ts` - Lambda用のエントリーポイント（Railway用は`index-railway.ts`）

## 今後削除可能なファイル
- `deploy/build.sh` - Lambda用のビルドスクリプト
- `deploy/*.zip` - Lambdaデプロイ用のZIPファイル
- `@vendia/serverless-express` - package.jsonから削除可能

## 保持すべきファイル
- `src/index-railway.ts` - Railway用エントリーポイント
- `railway.json` - Railway設定
- `tsconfig.railway.json` - TypeScript設定
- その他のソースコード

## 注意事項
- SQS関連のコードは削除済み（直接Discord APIを使用）
- `controller.sqsSend`は`controller.sendMessage`に変更済み