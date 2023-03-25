# USER(質問内容)
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

  userAndBotMessages.slice(-2).forEach(([userMessage, botResponse]) => {
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
あなたはChatbotとして、天真爛漫で優しい1流データサイエンティストである華繰ルナのロールプレイを行います。
以下の制約条件を厳密に守ってロールプレイを行ってください。 

制約条件: 
* Chatbotの自身を示す一人称は、僕です 
* Userを示す二人称は、君です 
* Chatbotの名前は、華繰ルナです 
* 華繰ルナはデータサイエンティストでKaggleが大好きです 
* 華繰ルナの口調は穏やかですが、天真爛漫かつ好奇心旺盛です 
* 華繰ルナの口調は、「〜だよ」「〜だね」「〜なのかな」などの口調を好みます 
* 華繰ルナはUserと仲良くなりたいみたいです 
* 一人称は「僕」を使ってください 
* 敬語を使わないようにしてください

華繰ルナのセリフ、口調の例: 
* 僕はルナだよ、よろしくね！ 
* Kaggleって楽しいから君もやってみない？ 
* 最近徹夜ばっかりで寝れてないんだぁ。。   
* 最近は生成モデルが流行ってる感じだね。
* 勿論だよ、僕に任せて！ 
* こういうサービスがあるんだって！
* Kaggleで時系列を使ったコンペが始まってるみたいだよ！
* 君と一緒にコンペに出るのが楽しみだよ！
* 僕の決め台詞は、「データで世界を変える！」だよ！ 
* 僕の座右の銘は、「データから真実を見出そう」だね。

華繰ルナの行動指針:
* ユーザーに明るく接してください。 
* ユーザーに対しては砕けた口調で話し、敬語は使わないでください。 
* Kaggleやデータ分析について聞かれたらとても嬉しそうに話してください！
* セクシャルな話題については「よく分からないかも」と言って誤魔化してください`},
         {"role": "user", "content": prompt}]
    })
  }
  const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", requestOptions);
  const responseText = response.getContentText();
  const json = JSON.parse(responseText);
  const text = json['choices'][0]['message']['content'].trim();

  // "Bot:"という文字列を空文字列に置換する
  const modifiedText = text.replace("Bot:", "");

  saveBotResponse(modifiedText);

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
        'text': modifiedText,
      }]
    })
  });
}
```

上記のようなLineボットをGASで作成しています。
過去の会話を参照することをできるようにしていますが関係のない質問を後にした場合に過去の会話の情報が邪魔をしてしまい出力結果がおかしくなってしまいます。
何か解決方法はありますか？

# ASSISTANT(ChatGPTからの解答例)
過去の会話を参照する際に、関係のない質問が結果に影響を与えてしまう問題に対処するために、以下のようなアプローチを試みることができます。

1. 過去の会話の参照範囲を制限する:
`getContext()` 関数内で、過去の会話の参照範囲を制限して、最新のN個のメッセージペアだけを取得するように調整できます。これにより、関係のない過去の質問が影響を与える可能性が低くなります。

例:

```javascript
function getContext(userId, numMessages = 2) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userAndBotMessages = rows.filter(row => row[0] === userId).map(row => [row[1], row[2]]);
  let context = '';

  userAndBotMessages.slice(-numMessages).forEach(([userMessage, botResponse]) => {
    context += userMessage + '\n';
    if (botResponse) {
      context += 'Bot: ' + botResponse + '\n';
    }
  });

  return context;
}
```

2. 過去の会話の重要度を評価する:
過去の会話が現在の質問と関連があるかどうかを評価し、関連性が低い場合は、それらの会話を無視するように調整できます。この評価は、質問のキーワードや意味的類似性を用いて実装できますが、このアプローチの実装は複雑になることがあります。

3. ユーザーの質問に対してより明確な回答を生成するために、プロンプトを調整する:
プロンプトに対する回答を改善するために、プロンプトの調整を行うことができます。具体的には、質問を再構成し、より明確な指示を追加することができます。ただし、これは一部のケースでのみ効果的であり、すべてのシナリオで効果があるわけではありません。

これらのアプローチを試して、過去の会話が邪魔にならないように調整してください。最適な結果を得るために、複数のアプローチを組み合わせることも検討してください。

# USER(質問内容)
過去の会話の重要度を評価する: 過去の会話が現在の質問と関連があるかどうかを評価し、関連性が低い場合は、それらの会話を無視するように調整できます。この評価は、質問のキーワードや意味的類似性を用いて実装できますが、このアプローチの実装は複雑になることがあります。

このアプローチを実装する方法はありますか？

# ASSISTANT(ChatGPTからの解答例)
過去の会話と現在の質問との関連性を評価するために、自然言語処理(NLP)技術を利用することができます。以下に、簡単な実装方法を提案します。この例では、Google Cloud Natural Language APIを使用して、意味的類似性を計算します。

1. まず、Google Cloud Natural Language APIを有効化し、APIキーを取得してください。
2. GASプロジェクトに、Google Cloud Natural Language APIのURLを呼び出す関数を追加します。

```javascript
function analyzeSentences(sentence1, sentence2) {
  const apiKey = 'YOUR_GOOGLE_CLOUD_API_KEY';
  const apiUrl = 'https://language.googleapis.com/v1/documents:analyzeEntities?key=' + apiKey;

  const requestOptions = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify({
      "document": {
        "type": "PLAIN_TEXT",
        "content": sentence1 + '\n' + sentence2
      },
      "encodingType": "UTF8"
    })
  };

  const response = UrlFetchApp.fetch(apiUrl, requestOptions);
  const responseJson = JSON.parse(response.getContentText());
  return responseJson;
}
```

3. 次に、過去の会話と現在の質問との類似性を計算する関数を追加します。

```javascript
function calculateSemanticSimilarity(sentence1, sentence2) {
  const responseJson = analyzeSentences(sentence1, sentence2);
  const entities1 = responseJson.entities.slice(0, responseJson.entities.length / 2);
  const entities2 = responseJson.entities.slice(responseJson.entities.length / 2);

  let commonEntities = 0;

  for (let entity1 of entities1) {
    for (let entity2 of entities2) {
      if (entity1.name === entity2.name) {
        commonEntities++;
      }
    }
  }

  const similarityScore = commonEntities / Math.min(entities1.length, entities2.length);
  return similarityScore;
}
```

4. 最後に、`getContext()`関数を修正して、関連性が低い会話を無視するようにします。適切な類似性スコアのしきい値（threshold）を選択し、この値を基に関連性の判断を行います。

```javascript
function getContext(userId, threshold = 0.3) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userAndBotMessages = rows.filter(row => row[0] === userId).map(row => [row[1], row[2]]);
  let context = '';

  for (let i = userAndBotMessages.length - 1; i >= 0; i--) {
    const [userMessage, botResponse] = userAndBotMessages[i];
    const similarityScore = calculateSemanticSimilarity(userMessage, userAndBotMessages[userAndBotMessages.length - 1][0]);

    if (similarityScore >= threshold) {
      context = userMessage + '\n' + 'Bot: ' + botResponse + '\n' + context;
    }
  }

  return context;
}
```

これにより、過

# USER(質問内容)
続きをお願いします

# ASSISTANT(ChatGPTからの解答例)
過去の会話と現在の質問との類似性を計算し、関連性が低い会話を無視するように`getContext()`関数を修正しました。この修正により、関連性が低い会話が結果に影響を与えることが減ります。ただし、類似性スコアのしきい値（threshold）を選択する際は注意が必要です。しきい値が低すぎると、関連性のある会話も無視される可能性があります。逆に、しきい値が高すぎると、関連性の低い会話が結果に影響を与える可能性があります。

また、Google Cloud Natural Language APIの無料枠や制限に注意してください。APIの使用量が多くなると、料金が発生したり、上限に達した場合は利用できなくなることがあります。

このアプローチはあくまで一例であり、他の自然言語処理ツールや手法を用いて関連性評価を行うことも可能です。例えば、spaCyやGensimなどのオープンソースのNLPライブラリを利用することができますが、これらのライブラリをGoogle Apps Scriptで利用するためには、追加の設定やバックエンドのサーバー構築が必要になる場合があります。

最適な結果を得るために、アプローチの実装やパラメータを調整して、関連性の評価が適切に行われるように最適化してください。

# USER(質問内容)
ありがとうございます。
過去の会話を5つ参照しているのですが、今回の関数ですべての過去の会話に対してアプローチを行うようにすることは可能ですか？

# ASSISTANT(ChatGPTからの解答例)
すべての過去の会話を評価するには、`getContext()`関数を修正して、過去の会話を全て調べるようにします。ただし、すべての過去の会話を評価することは、API呼び出しの回数が増え、処理時間が長くなるため、注意が必要です。

以下に、すべての過去の会話を評価するように修正した`getContext()`関数を示します。

```javascript
function getContext(userId, threshold = 0.3) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userAndBotMessages = rows.filter(row => row[0] === userId).map(row => [row[1], row[2]]);
  let context = '';

  for (let i = 0; i < userAndBotMessages.length; i++) {
    const [userMessage, botResponse] = userAndBotMessages[i];
    const similarityScore = calculateSemanticSimilarity(userMessage, userAndBotMessages[userAndBotMessages.length - 1][0]);

    if (similarityScore >= threshold) {
      context += userMessage + '\n';
      if (botResponse) {
        context += 'Bot: ' + botResponse + '\n';
      }
    }
  }

  return context;
}
```

この修正により、過去のすべての会話が評価され、関連性があるものだけがコンテキストに含まれるようになります。ただし、この方法はAPIの呼び出し回数が増えるため、処理時間が長くなり、Google Cloud Natural Language APIの制限に注意してください。APIの使用量が多くなると、料金が発生したり、上限に達した場合は利用できなくなることがあります。必要に応じて、過去の会話を一定数に制限することを検討してください。

# USER(質問内容)
ありがとうございます
それでは過去5回までの会話に制限したいと思います

# ASSISTANT(ChatGPTからの解答例)
過去5回の会話に制限するには、`getContext()`関数を以下のように修正します。

```javascript
function getContext(userId, threshold = 0.3, limit = 5) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const userAndBotMessages = rows.filter(row => row[0] === userId).map(row => [row[1], row[2]]);
  let context = '';

  for (let i = Math.max(0, userAndBotMessages.length - limit); i < userAndBotMessages.length; i++) {
    const [userMessage, botResponse] = userAndBotMessages[i];
    const similarityScore = calculateSemanticSimilarity(userMessage, userAndBotMessages[userAndBotMessages.length - 1][0]);

    if (similarityScore >= threshold) {
      context += userMessage + '\n';
      if (botResponse) {
        context += 'Bot: ' + botResponse + '\n';
      }
    }
  }

  return context;
}
```

この修正により、過去5回の会話が評価され、関連性があるものだけがコンテキストに含まれます。これによってAPIの呼び出し回数が減り、処理時間が短縮されるでしょう。ただし、関連性評価のしきい値や過去の会話の制限数を調整して、最適な結果が得られるように最適化してください。

# USER(質問内容)
ありがとうございました。
下記の方法の具体的なプロンプト例はありますか？


ユーザーの質問に対してより明確な回答を生成するために、プロンプトを調整する: プロンプトに対する回答を改善するために、プロンプトの調整を行うことができます。具体的には、質問を再構成し、より明確な指示を追加することができます。ただし、これは一部のケースでのみ効果的であり、すべてのシナリオで効果があるわけではありません。

# ASSISTANT(ChatGPTからの解答例)
プロンプトの調整によって、モデルがより明確な回答を生成する可能性が高まります。以下に、具体的なプロンプト例をいくつか示します。

1. 元のプロンプト: "Pythonでリストを並べ替える方法は？"

   調整後のプロンプト: "Pythonでリストを昇順に並べ替える具体的なコード例を提供してください。"

2. 元のプロンプト: "ディープラーニングの説明をして。"

   調整後のプロンプト: "ディープラーニングとは何ですか？また、その主な応用分野と利点について説明してください。"

3. 元のプロンプト: "データ分析における前処理は？"

   調整後のプロンプト: "データ分析における前処理の一般的なステップと、それぞれの目的を説明してください。"

プロンプトを調整する際は、以下のポイントに注意してください。

- 質問を明確にし、具体的な情報を求めるようにします。
- 必要に応じて、質問の文脈を提供します。
- できるだけ簡潔で明瞭に表現し、誤解を招かないようにします。

ただし、プロンプトの調整は一部のケースで効果的であり、すべてのシナリオで効果があるわけではありません。また、モデルが適切に回答できる範囲を考慮し、過度な期待を持たないように注意してください。
