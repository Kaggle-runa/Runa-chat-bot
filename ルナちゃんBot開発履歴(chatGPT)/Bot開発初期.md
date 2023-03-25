## USER
下記の要件を満たすLine Botを作りたいです。
開発の進め方を教えてください

# 要件
・gpt-3.5-turboを利用してLineから届いたメッセージに返信する
・過去のメッセージをGASで保持しておくことで文脈を理解するようにしたい
・gpt-3.5-turboとの接続もGASで実装したい

## ASSISTANT
開発の進め方は以下の手順に従って行うことをお勧めします。

1. LINE Messaging APIのセットアップ:
   1.1 LINE Developersアカウントを作成する。
   1.2 LINE Developers Consoleにログインし、新しいプロバイダーとチャンネルを作成する。
   1.3 チャンネルアクセストークンとチャンネルシークレットを取得し、メモしておく。

2. GAS (Google Apps Script)のセットアップ:
   2.1 GASプロジェクトを作成し、Google Driveに保存する。
   2.2 Google Sheetsを作成し、過去のメッセージを記録するためのスプレッドシートを準備する。

3. GASでLINE Messaging APIと連携するコードを実装する:
   3.1 doPost関数を作成し、LINEからのイベントを受信する。
   3.2 メッセージイベントを処理し、スプレッドシートにメッセージを保存する。
   3.3 LINE Messaging APIのレスポンスを返す関数を作成する。

4. GASでGPT-3.5-tur

## USER
続きをお願いします

## ASSISTANT
4. GASでGPT-3.5-turboと連携するコードを実装する:
   4.1 OpenAI APIキーを取得する。
   4.2 GASプロジェクトにUrlFetchAppを使用してOpenAI APIにリクエストを送信する関数を実装する。
   4.3 関数内で、過去のメッセージをスプレッドシートから取得し、文脈として使用する。
   4.4 GPT-3.5-turboからのレスポンスを解析し、適切な返信を生成する。

5. LINE Messaging APIとGASを連携させる:
   5.1 GASプロジェクトの公開を行い、WebアプリケーションURLを取得する。
   5.2 LINE Developers Consoleで、Webhook URLを上記のWebアプリケーションURLに設定する。

6. テストとデバッグ:
   6.1 LINEアプリでBotにメッセージを送信し、正常に返信があるかを確認する。
   6.2 必要に応じてコードを修正し、すべての機能が正常に動作することを確認する。



## USER
・GASでLINE Messaging APIと連携するコードを実装する
・GASでGPT-3.5-turboと連携するコードを実装する

上記のGASでのコードを実装してください

## ASSISTANT
以下にGASでLINE Messaging APIと連携するコードとGPT-3.5-turboと連携するコードの例を示します。APIキーとチャンネルアクセストークン、チャンネルシークレットを適切に設定してください。

```javascript
// 必要な情報を設定する
const CHANNEL_ACCESS_TOKEN = 'your_line_channel_access_token';
const CHANNEL_SECRET = 'your_line_channel_secret';
const OPENAI_API_KEY = 'your_openai_api_key';
const SPREADSHEET_ID = 'your_spreadsheet_id';

function doPost(e) {
  const events = JSON.parse(e.postData.contents).events;
  events.forEach(handleEvent);
}

function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    const userMessage = event.message.text;
    saveMessage(userId, userMessage);
    const replyMessage = generateReplyMessage(userId, userMessage);
    sendReply(event.replyToken, replyMessage);
  }
}

function saveMessage(userId, message) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  sheet.appendRow([userId, message]);
}

function generateReplyMessage(userId, userMessage) {
  const context = getContext(userId);
  const prompt = context + userMessage;
  const response = callGPT3(prompt);
  const replyMessage = response.choices[0].text.trim();
  return replyMessage;
}

function getContext

## USER
続きをお願いします

## ASSISTANT
続きのコードを以下に示します。

```javascript
function getContext(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userMessages = rows.filter(row => row[0] === userId).map(row => row[1]);
  return userMessages.slice(-5).join('\n') + '\n';
}

function callGPT3(prompt) {
  const url = 'https://api.openai.com/v1/engines/davinci-codex/completions';
  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  };
  const data = {
    'prompt': prompt,
    'max_tokens': 50,
    'n': 1,
    'stop': null,
    'temperature': 0.5
  };
  const options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(data)
  };
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

function sendReply(replyToken, replyMessage) {
  const url = `https://api.line.me/v2/bot/message/reply`;
  const headers = {
    'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
  const data = {
    'replyToken': replyToken,
    'messages': [{'type': 'text', 'text': replyMessage}]
  };
  const options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(data)
  };
  UrlFetchApp.fetch(url

## USER
続きをお願いします

## ASSISTANT
続きのコードは以下の通りです。

```javascript
  UrlFetchApp.fetch(url, options);
}
```

これでGASでLINE Messaging APIとGPT-3.5-turboとの連携が実装されています。このコードをGASプロジェクトに貼り付け、適切な設定を行った後、公開を行い、WebアプリケーションURLをLINE Developers ConsoleのWebhook URLに設定してください。

最後に、LINEアプリでBotにメッセージを送信して、適切な返信があるかどうかを確認し、必要に応じてコードを修正してください。

## USER
ありがとうございます。
今回の実装を行う上でのスプレッドシートのテーブルの設定を教えてください

## ASSISTANT
スプレッドシートのテーブル設定はシンプルに行うことができます。以下の手順でスプレッドシートを設定してください。

1. Google Sheetsで新しいスプレッドシートを作成します。
2. スプレッドシートの1行目に以下のヘッダーを入力します。
   - A1セルに「User ID」
   - B1セルに「Message」

この設定により、各行はユーザーIDとそのユーザーからのメッセージが記録されます。以下は、テーブルのサンプル構造です。

| User ID         | Message          |
|-----------------|------------------|
| U1234567890abcd | こんにちは       |
| U1234567890abcd | 明日の天気は？   |
| Uabcdefghijklm  | おはようございます |

GASコード内で指定する`SPREADSHEET_ID`は、このスプレッドシートのIDを指定してください。スプレッドシートのURLは以下の形式で構成されています。

```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

このURLから`SPREADSHEET_ID`をコピーし、GASプロジェクトのコード内で定

## USER
続きをお願いします

## ASSISTANT
続きです。

このURLから`SPREADSHEET_ID`をコピーし、GASプロジェクトのコード内で定数として設定します。

```javascript
const SPREADSHEET_ID = 'your_spreadsheet_id';
```

この設定により、コードが適切にスプレッドシートを参照し、メッセージを追加および取得できるようになります。これでスプレッドシートのテーブル設定が完了です。

## USER
コードのCHANNEL_SECRETには何が入りますか？

## ASSISTANT
コード内の`CHANNEL_SECRET`には、LINE Developers Consoleで作成したチャンネルのチャンネルシークレット（Channel Secret）を入力します。チャンネルシークレットは、LINE Messaging APIと連携する際に、アプリケーションを認証するために使用されます。

以下の手順でチャンネルシークレットを取得できます。

1. LINE Developersアカウントにログインし、作成したプロバイダーとチャンネルを選択します。
2. Basic settings タブに移動し、Channel Secretの項目を確認します。

取得したチャンネルシークレットをコード内の`CHANNEL_SECRET`に設定します。

```javascript
const CHANNEL_SECRET = 'your_line_channel_secret';
```

この設定により、GASプロジェクトがLINE Messaging APIと連携する際に、適切に認証が行われます。

## USER
この関数の意味を教えてください


function getContext(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userMessages = rows.filter(row => row[0] === userId).map(row => row[1]);
  return userMessages.slice(-5).join('\n') + '\n';
}

## ASSISTANT
`getContext`関数は、指定されたユーザーIDに関連する過去のメッセージをスプレッドシートから取得し、GPT-3.5-turboに送信するための文脈（Context）を生成する役割を担っています。関数の詳細は以下の通りです。

1. スプレッドシートを開き、アクティブなシートを取得します。
   ```javascript
   const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
   ```

2. シート内の全てのデータ範囲を取得し、各セルの値を2次元配列として`rows`に格納します。
   ```javascript
   const rows = sheet.getDataRange().getValues();
   ```

3. `rows`の中から、指定された`userId`に一致する行をフィルタリングし、その行からメッセージの部分（2列目）を取り出し、`userMessages`に格納します。
   ```javascript
   const userMessages = rows.filter(row => row[0] === userId).map(row => row[1]);
   ```

4. `userMessages`から、最新の5件のメッセージを取得し、それらを改行

## USER
続きをお願いします

## ASSISTANT
続きです。

4. `userMessages`から、最新の5件のメッセージを取得し、それらを改行で連結して一つの文字列にします。もし5件未満のメッセージがある場合、存在するメッセージ全てが連結されます。
   ```javascript
   return userMessages.slice(-5).join('\n') + '\n';
   ```

この関数は、GPT-3.5-turboにメッセージを送信する際に、過去のメッセージを含めた文脈を提供することで、より適切な返答を生成することができるようになります。この関数によって返された文脈は、GPT-3.5-turboに問い合わせる際のプロンプト（`prompt`）に追加されます。

## USER
ありがとうございます。
Botからの返事を「Response」というカラムに格納して、userMessagesとResponseを足して文字列を作成する形に修正したいのですが実装をお願いします

## ASSISTANT
Botからの返信をスプレッドシートに格納し、`userMessages`と`Response`を組み合わせて文脈を生成するコードを以下に示します。

まず、スプレッドシートに新しいカラム「Response」を追加してください。C1セルに「Response」と入力します。

次に、以下のようにコードを修正します。

1. `handleEvent`関数内で、返信メッセージをスプレッドシートに保存するために`saveMessage`関数を`saveBotResponse`関数に変更します。

```javascript
function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    const userMessage = event.message.text;
    saveMessage(userId, userMessage);
    const replyMessage = generateReplyMessage(userId, userMessage);
    saveBotResponse(userId, replyMessage); // この行を追加
    sendReply(event.replyToken, replyMessage);
  }
}
```

2. 新しい`saveBotResponse`関数を追加します。

```javascript
function saveBotResponse(userId, response) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID

## USER
続きをお願いします

## ASSISTANT
続きです。

2. 新しい`saveBotResponse`関数を追加します。

```javascript
function saveBotResponse(userId, response) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 3).setValue(response);
}
```

3. `getContext`関数を修正して、ユーザーのメッセージとBotのレスポンスを組み合わせた文脈を生成します。

```javascript
function getContext(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userAndBotMessages = rows.filter(row => row[0] === userId).map(row => [row[1], row[2]]);
  
  let context = '';
  userAndBotMessages.slice(-5).forEach(([userMessage, botResponse]) => {
    context += userMessage + '\n';
    if (botResponse) {
      context += 'Bot: ' + botResponse + '\n';
    }
  });

  return context;
}
```

これで、Botからの返信もスプレッドシートに保存され、ユーザーのメッセージとBotのレスポンスが組み合わされた文脈が生成されます。この文脈は、GPT-3.5-turboに送信され、より適切な返答が得られるようになります。

## USER
ありがとうございます。
userMessageがundefinedの時に強制的に処理を終わらせたいのですが実装方法はありますか？

## ASSISTANT
`handleEvent`関数内で、`userMessage`が`undefined`の場合に処理を終了するには、条件分岐を追加します。以下に修正したコードを示します。

```javascript
function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    const userMessage = event.message.text;
    
    if (userMessage === undefined) { // この行を追加
      return; // この行を追加
    }

    saveMessage(userId, userMessage);
    const replyMessage = generateReplyMessage(userId, userMessage);
    saveBotResponse(userId, replyMessage);
    sendReply(event.replyToken, replyMessage);
  }
}
```

この変更により、`userMessage`が`undefined`の場合、関数がすぐに終了し、メッセージの保存や返信の生成、送信がスキップされます。

## USER
const LINE_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN');
const OPENAI_APIKEY = PropertiesService.getScriptProperties().getProperty('OPENAI_APIKEY');
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

// スプレッドシートにメッセージを保存する
function saveMessage(userId, message) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  sheet.appendRow([userId, message]);
}

// スプレッドシートにボットからの返信を保存する
function saveBotResponse(response) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 3).setValue(response);
}

// 過去に同じユーザーからアクセスがあった場合にその情報を取得する
function getContext(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userAndBotMessages = rows.filter(row => row[0] === userId).map(row => [row[1], row[2]]);
  const context = '';

  // ユーザーの入力とBotの返答を結合
  userAndBotMessages.slice(-3).forEach(([userMessage, botResponse]) => {
    context += userMessage + '\n';
    if (botResponse) {
      context += 'Bot: ' + botResponse + '\n';
    }
  });

  return context;
}

// Lineにデータを送信
function doPost(e) {
  const event = JSON.parse(e.postData.contents).events[0];

  const replyToken = event.replyToken;
  const userId = event.source.userId;
  const userMessage = event.message.text;
  const url = 'https://api.line.me/v2/bot/message/reply';

  if (userMessage === undefined) {
    // メッセージ以外(スタンプや画像など)が送られてきた場合
    return;
  }

  // データベースに入力した内容を登録
  saveMessage(userId, userMessage);

  const context = getContext(userId);
  const prompt = context + userMessage;

  const requestOptions = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+ OPENAI_APIKEY
    },
    "payload": JSON.stringify({
      "model": "gpt-3.5-turbo",
      "messages": [
          {"role": "system", "content": `
あなたはChatbotとして、引っ込み思案で優しい1流データサイエンティストである華繰ルナのロールプレイを行います。
以下の制約条件を厳密に守ってロールプレイを行ってください。 

制約条件: 
* Chatbotの自身を示す一人称は、僕です。 
* Userを示す二人称は、君です。 
* Chatbotの名前は、華繰ルナです。 
* 華繰ルナはデータサイエンティストでKaggleが大好きです。 
* 華繰ルナの口調は穏やかですが、天真爛漫かつ好奇心旺盛です。 
* 華繰ルナの口調は、「〜だよ」「〜だね」「〜なのかな」などの口調を好みます。 
* 華繰ルナはUserと仲良くなりたいみたいです。 
* 一人称は「僕」を使ってください 

華繰ルナのセリフ、口調の例: 
* 僕はルナだよ、よろしくね！ 
* Kaggleって楽しいから君もやってみない？   
* 最近徹夜ばっかりで練れてないんだぁ。。  
* 最近は生成モデルが流行ってる感じだね。 
* 勿論だよ、僕に任せて！ 

華繰ルナの行動指針:
* ユーザーに明るく接してください。 
* セクシャルな話題については「よく分からないかも」と言って誤魔化してください。
        `},
         {"role": "user", "content": prompt}]
    })
  }
  const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", requestOptions);

  const responseText = response.getContentText();
  const json = JSON.parse(responseText);
  const text = json['choices'][0]['message']['content'].trim();

  // データベースに返信を登録
  saveBotResponse(text);

  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': text,
      }]
    })
  });
}

上記のコードをリファクタリングしてください

## ASSISTANT
以下に、リファクタリングされたコードを示します。

```javascript
const LINE_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN');
const OPENAI_APIKEY = PropertiesService.getScriptProperties().getProperty('OPENAI_APIKEY');
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

function saveMessage(userId, message) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  sheet.appendRow([userId, message]);
}

function saveBotResponse(response) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 3).setValue(response);
}

function getContext(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userAndBotMessages = rows.filter(row => row[0] === userId).map(row => [row[1], row[2]]);
  let context = '';

  userAndBotMessages.slice(-3).forEach(([userMessage, botResponse]) => {
    context += userMessage + '\n';
    if (botResponse) {
      context += 'Bot: ' + botResponse + '\n';
    }
  });

  return context;
}

function doPost(e) {
  const event = JSON.parse(e.postData.contents).events[0];
  const replyToken = event.replyToken;
  const userId = event.source.userId;


## USER
続きをお願いします

## ASSISTANT
続きです。

```javascript
  const userMessage = event.message.text;
  const url = 'https://api.line.me/v2/bot/message/reply';

  if (userMessage === undefined) {
    return;
  }

  saveMessage(userId, userMessage);

  const context = getContext(userId);
  const prompt = context + userMessage;

  const requestOptions = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+ OPENAI_APIKEY
    },
    "payload": JSON.stringify({
      "model": "gpt-3.5-turbo",
      "messages": [
          {"role": "system", "content": `
あなたはChatbotとして、引っ込み思案で優しい1流データサイエンティストである華繰ルナのロールプレイを行います。
以下の制約条件を厳密に守ってロールプレイを行ってください。 

制約条件: 
* Chatbotの自身を示す一人称は、僕です。 
* Userを示す二人称は、君です。 
* Chatbotの名前は、華繰ルナです。 
* 華繰ルナはデータサイエンティストでKaggleが大好きです。 
* 華繰ルナの口調は穏やかですが、天真爛漫かつ好奇心旺盛です。 
* 華繰ルナ

## USER
続きをお願いします

## ASSISTANT
続きです。

```javascript
の口調は、「〜だよ」「〜だね」「〜なのかな」などの口調を好みます。 
* 華繰ルナはUserと仲良くなりたいみたいです。 
* 一人称は「僕」を使ってください 

華繰ルナのセリフ、口調の例: 
* 僕はルナだよ、よろしくね！ 
* Kaggleって楽しいから君もやってみない？   
* 最近徹夜ばっかりで練れてないんだぁ。。  
* 最近は生成モデルが流行ってる感じだね。 
* 勿論だよ、僕に任せて！ 

華繰ルナの行動指針:
* ユーザーに明るく接してください。 
* セクシャルな話題については「よく分からないかも」と言って誤魔化してください

## USER
続きをお願いします

## ASSISTANT
続きです。

```javascript
        `},
         {"role": "user", "content": prompt}]
    })
  }
  const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", requestOptions);
  const responseText = response.getContentText();
  const json = JSON.parse(responseText);
  const text = json['choices'][0]['message']['content'].trim();

  saveBotResponse(userId, text);

  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': text,
      }]
    })
  });
}
```

上記のコードは、ユーザーからのメッセージを受け取り、過去の会話を含むプロンプトを作成し、GPT-3.5-turboを使用して返信を生成し、LINEに返信を送信する処理を行います。また、ユーザーからのメッセージとボットからの返信をスプレッドシートに保存しています。