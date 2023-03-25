# Runa-chat-bot
ChatGPT APIを利用したLineBotです。動作環境はGASとなります。


## 使い方

- 1. openaiのアカウントを作成してアクセストークンを取得する  
     参考URL：https://808hanablog.com/explains-how-to-use-openai-api
<br>
- 2. LINE Developersアカウントを作成し、チャンネルアクセストークンを取得する  
     参考サイト：https://developers.line.biz/ja/docs/messaging-api/building-bot/  
<br>
- 3. スプレッドシートを作成し、下記のように列名を設定する
    - 1. A1セルに「User ID」
    - 2. B1セルに「Message」
    - 3. C1セルに「Response」  
<br>
- 3. GASプロジェクトを作成し、GitHubに添付しているコードを貼り付ける  
     (環境変数には下記を**スクリプトプロパティ**に設定する)
     - LINE_ACCESS_TOKEN：2.で作成したチャンネルアクセストークン
     - OPENAI_APIKEY：1.で作成したopenaiのアクセスキー
     - SPREADSHEET_ID：3.で作成したスプレッドシートのID
