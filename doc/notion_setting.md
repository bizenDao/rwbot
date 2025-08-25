## Notion Setting

### NOTION でワークスペースを作成

https://www.notion.so/ja-jp

### 作成したワークスペースでデータベースを作成

ページを追加 > テーブル > 新規データベース

```
カラム名:user 種類: ユーザー
カラム名:id 種類: テキスト
カラム名:name 種類: タイトル
カラム名:roles 種類: マルチセレクト
カラム名:icon 種類: ファイル＆メディア
カラム名:join 種類: 日付
カラム名:exit 種類: チェックボックス
```

作成したデータベースの URL は以下の通りになります。

```
https://www.notion.so/[ワークスペース名]/[データベース名]?v=XXXXXXXXXXXXXXXXXXXXXXXXX
```

### notion api setting

https://programming-zero.net/notion-api-setting/

上記サイトを参考に以下２点の設定を行なってください。

```
・インテグレーションを作成しシークレットを取得
・インテグレーション作成後、上で作成したデータベースのAPI操作を許可
```
