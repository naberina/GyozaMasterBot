const { App, AwsLambdaReceiver } = require('@slack/bolt');

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,  //lambdaに対応
  // `processBeforeResponse` FaaS環境で必須です。
  // このオプションにより、Bolt フレームワークが `ack()` などでリクエストへの応答を返す前に
  // `app.message` などのメソッドが Slack からのリクエストを処理できるようになります。FaaS では
  // 応答を返した後にハンドラーがただちに終了してしまうため、このオプションの指定が重要になります。
  processBeforeResponse: true
});

app.message('餃子', async ({ message, say }) => {
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `餃子！<@${message.user}>さん、自主練した？`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "自主練した🥟"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `<@${message.user}>さん、自主練報告ありがとうございます！`
  });
});

app.message('またね', async ({ message, say }) => {
  await say(`また自主練しようね！, <@${message.user}> :wave:`);
});

app.action('button_click', async ({ body, ack, say }) => {
  await ack();
  await say(`<@${body.user.id}>さん、偉すぎる!👏`);
});

module.exports.handler = async (event, context, callback) => {
  const handler = await app.start();
  return handler(event, context, callback);
}