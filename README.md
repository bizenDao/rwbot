# bizapi

bizen dao api

# ローカル起動

sh deploy/build.sh local

# 実行環境 aws LAMBDA 設定

lambda
Node.js 20.x
role : nodoapi-role
ロギング設定
Api gateway ステージ作成 {proxy+}で接続する設定
https://xxxxxxx.execute-api.ap-northeast-1.amazonaws.com/{proxy+}
ロググループ作成をする際は Lambda 側から。
CORS の許可/タイムアウト設定に注意

# 外部連携設定

[discord bot 設定](/doc/discord_setting.md)

[notion 連携設定](/doc/notion_setting.md)

# スラッシュコマンド登録

[スラッシュコマンド登録](/doc/slashcommand/slash_command.md)
