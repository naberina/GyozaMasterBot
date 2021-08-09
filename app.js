const { App, AwsLambdaReceiver } = require('@slack/bolt');
const { KintoneRestAPIClient } = require("@kintone/rest-api-client");

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,  //lambdaに対応
  processBeforeResponse: true // FaaS環境で必須、処理を待たせる
});

// クライアントの作成
const kintone_client = new KintoneRestAPIClient({
  baseUrl: process.env.KINTONE_SUBDOMAIN,
  auth: {
    apiToken: process.env.KINTONE_API_TOKEN
  }
});

app.message('餃子', async ({ message, say }) => {
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `餃子を受信しました！<@${message.user}>さん、呼んだ？`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "もしかして、自主練した？🥟"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `<@${message.user}>さん、自主練報告ありがとうございます！`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  await ack();
  await say(`<@${body.user.id}>さん、偉すぎる!👏`);
});

app.message('またね', async ({ message, say }) => {
  await say(`また自主練しようね！, <@${message.user}> :wave:`);
});

app.event('reaction_added', async ({ event, say }) => {
  console.log('event')
  console.log(event)
  if (event.reaction === 'gyoza') {
    await say({
      blocks: [{
        "blocks": [
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "kintoneに自主練登録する",
                  "emoji": true
                },
                "value": "click_me_kintone",
                "action_id": "actionId-0"
              }
            ]
          },
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": "今月の自主練回数は〇〇回です🎉",
              "emoji": true
            }
          }
        ]
      }]
    });
  }
});

app.command('/gyoza', async ({ ack, body, client }) => {
  await ack(); //コマンドのリクエストを確認

  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id, //3秒以内に渡す
      view: {
        type: 'modal',
        callback_id: 'view_modal', //callback_idがviewを特定するための識別子
        title: {
          type: 'plain_text',
          text: '自主練報告をする🥟'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '自主練報告を記録します。'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'いえ、まだ自主練をしていません'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'input_gyoza_memo',
            label: {
              type: 'plain_text',
              text: '自主練内容を記載してください'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'gyoza_title_input',
              multiline: true
            }
          },
          {
            type: 'input',
            block_id: 'input_gyoza_link',
            label: {
              type: 'plain_text',
              text: 'お店を記載してください'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'gyoza_link_input',
              multiline: true
            }
          },
          {
            type: 'input',
            block_id: 'input_gyoza_body',
            label: {
              type: 'plain_text',
              text: '感想・内容を記載してください'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'gyoza_body_input',
              multiline: true
            }
          },
          {
            "type": "input",
            "block_id": 'input_gyoza_review',
            "element": {
              "type": "radio_buttons",
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "★",
                    "emoji": true
                  },
                  "value": "★"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "★★",
                    "emoji": true
                  },
                  "value": "★★"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "★★★",
                    "emoji": true
                  },
                  "value": "★★★"
                }
              ],
              "action_id": "radio_buttons-review"
            },
            "label": {
              "type": "plain_text",
              "text": "レビュー",
              "emoji": true
            }
          },
        ],
        submit: {
          type: 'plain_text',
          text: '送信する'
        }
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.view('view_modal', async ({ ack, body, view, client }) => {
  await ack(); //モーダルでのデータ送信イベントを確認

  console.log('params')
  const val_title = view['state']['values']['input_gyoza_memo']['gyoza_title_input']['value']; //block_idを取得する
  const val_link = view['state']['values']['input_gyoza_link']['gyoza_link_input']['value'];
  const val_body = view['state']['values']['input_gyoza_body']['gyoza_body_input']['value'];
  const val_review = view['state']['values']['input_gyoza_review']['radio_buttons-review']['selected_option']['value'];
  const user = body['user']['id'];

  let msg = '';
  await kintone_client.record
  .addRecord({
    app: process.env.KINTONE_APP_ID,
    record: {
      "title": {
        "value": val_title
      },
      "link": {
        "value": val_link
      },
      "review": {
        "value": val_review
      },
      "body": {
        "value": val_body
      },
    }
  })
  .then((resp) => {
    console.log(resp.records);
    msg = "kintoneに登録しました"
  })
  .catch((err) => {
    console.log(err);
    msg = "登録できませんでした"
  });

  // ユーザーにメッセージを送信
  try {
    await client.chat.postMessage({
      channel: 'C02A3JKNQ6B',
      text: `<@${body.user.id}>さん!自主練したって〜🎉 `
    });
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  }
  catch (error) {
    console.error(error);
  }

});

module.exports.handler = async (event, context, callback) => {
  const handler = await app.start();
  return handler(event, context, callback);
}