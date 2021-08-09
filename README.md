# SlackBot ⚡️ Bolt for JavaScript
> Slack app example from 📚 [Getting started with Bolt for JavaScript tutorial][1]

## Overview
[Bolt for JavaScript framework](https://slack.dev/bolt-js/concepts) を使用したSlackBotアプリです。

## Running locally

### 1. Setup environment variables

```zsh
# Setup my Environment variable
export SLACK_BOT_TOKEN=<your-bot-token>
export SLACK_APP_TOKEN=<your-app-level-token>
```

### 2. Setup my local project
- [Install AWS CLI](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2.html)
- [AWS Lambda へのデプロイ](https://slack.dev/bolt-js/ja-jp/deployments/aws-lambda)

### 3. Start my local servers
```zsh
npx serverless offline --noPrependStageInUrl
```

### 5. Deploy my Lambda function
```zsh
npx serverless deploy
```

### 5. Update my Lambda function
```zsh
npx serverless deploy
```

### MIT
Copyright (c) 2020 Slack Technologies, Inc.
[Released under the MIT license](https://github.com/slackapi/bolt-js-getting-started-app)