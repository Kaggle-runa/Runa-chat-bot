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

