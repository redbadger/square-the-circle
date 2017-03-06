# Square the circle

This is a CircleCI builds statistics serverless lambda that runs on AWS. The report is sent out periodically to your chosen Slack channel.

At the moment we derive from CircleCI API the following stats:
* Percentage of failed builds
* Number of code deployments
* Average Build time

### Number of code deployments

To distinguish deployments from usual builds the script checks CircleCI `build_parameters` which can be set in your deployment script. `build_parameters` should containt `PRODUCTION` flag set to `true`.
```
build_parameters: { PRODUCTION: 'true' }
```

## Configuration

Make sure your AWS credentials are properly configured on your machine. For more information head to [this page](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

Copy `src/config.example.js` to `src/config.js`
```
cp src/config.example.js src/config.js
```

Edit `src/config.js` and set your config variables
```javascript
config.circleCItoken = '123abc';
config.slackEndpoint = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX';
config.organisationName = 'redbadger'; // Github account name
config.projectName = 'website-honestly'; // Github repo name
config.timeSpan = 7; // Report time span. 7 means weekly
```

CircleCI token can be obtained [here](https://circleci.com/account/api).
For Slack webook endpoint head to [this page](https://api.slack.com/incoming-webhooks)

By default the report is scheduled every week on Monday at 9:00 am. If you want to change it you should head to `serverless.yml` file. The schedule is configured in [AWS cron format](http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions).

```
functions:
  stats:
    handler: dist/index.handler
    events:
      - schedule: cron(0 9 ? * 2 *)
```

## Setup

Run:
```
npm install
npm run deploy
```

The expected result should be similar to:
```
src/config.js -> dist/config.js
src/getStats.js -> dist/getStats.js
src/index.js -> dist/index.js
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (14.24 MB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.........
Serverless: Stack update finished...
Serverless: Removing old service versions...
Service Information
service: square-the-circle
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  stats: square-the-circle-dev-stats

```

After that your new scheduled lambda is ready.
