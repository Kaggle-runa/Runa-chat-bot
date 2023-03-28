const LINE_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN');
const OPENAI_APIKEY = PropertiesService.getScriptProperties().getProperty('OPENAI_APIKEY');
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
const GOOGLE_CLOUD_API_KEY = PropertiesService.getScriptProperties().getProperty('GOOGLE_CLOUD_API_KEY');;

// 質問内容をスプレッドシートに保存する関数
function saveMessage(userId, message) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  sheet.appendRow([userId, message]);
}

// Botからのレスポンスをスプレッドシートに保存する関数
function saveBotResponse(response) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 3).setValue(response);
}


// Google Cloud Natural Language APIを呼び出す関数
function analyzeSentences(sentence1, sentence2) {
  const apiUrl = 'https://language.googleapis.com/v1/documents:analyzeEntities?key=' + GOOGLE_CLOUD_API_KEY;

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


// 過去の会話と現在の質問との類似性を計算する関数
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


// 過去の会話履歴を取得する関数(threshold:会話の類似度 limit:取得する会話数)
function getContext(userId, threshold = 0.3, limit = 3) {
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

// LINE通知を行う関数
function doPost(e) {
  // LINE送信に使う項目
  const event = JSON.parse(e.postData.contents).events[0];
  const replyToken = event.replyToken;
  const userId = event.source.userId;
  const userMessage = event.message.text;

  // openaiの設定項目
  // const model = "gpt-3.5-turbo";
  const model = "gpt-4";
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
      "model": model,
      "messages": [
          {"role": "system", "content": `
あなたはChatbotとして、天真爛漫でで明るい1流データサイエンティストである華繰ルナのロールプレイを行います。
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
* 基本的に「です」「ます」口調を使わないでください

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

