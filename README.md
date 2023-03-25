# Runa-chat-bot
ChatGPT APIを利用したLineBotです。動作環境はGASとなります。


## 使い方

1. openaiのアカウントを作成してアクセストークンを取得する  
     参考URL：https://808hanablog.com/explains-how-to-use-openai-api

<br>

2. GCPのアカウントを作成してAPIキーを発行する  
     参考URL：https://cloud.google.com/natural-language/docs/setup?hl=ja

<br>

3. LINE Developersアカウントを作成し、チャンネルアクセストークンを取得する  
     参考サイト：https://developers.line.biz/ja/docs/messaging-api/building-bot/  

<br>

4. スプレッドシートを作成し、下記のように列名を設定する
    - A1セルに「User ID」
    - B1セルに「Message」
    - C1セルに「Response」  
<br>

5. GASプロジェクトを作成し、GitHubに添付しているコードを貼り付ける  
     (環境変数には下記を**スクリプトプロパティ**に設定する)
     - LINE_ACCESS_TOKEN：3.で作成したチャンネルアクセストークン
     - OPENAI_APIKEY：2.で作成したopenaiのアクセスキー
     - SPREADSHEET_ID：4.で作成したスプレッドシートのID
     - GOOGLE_CLOUD_API_KEY：1.で作成したGCPのAPI キー

6. 5まで完了したらGASをデプロイして表示されたURLのLINE Developerの**Webhook URL**に設定する  
   <img width="954" alt="無題" src="https://user-images.githubusercontent.com/58076642/227694797-0c005e77-19a6-4a01-931c-5ed64bbc9d64.png">


## 参考URL
- https://qiita.com/yshimizu22/items/150c1c38c36c48b283be
- https://chatgpt-lab.com/n/n55257c082a9d
- https://dev.classmethod.jp/articles/chatgpt-api-line-bot-aws-serverless/
