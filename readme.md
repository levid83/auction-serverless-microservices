# The Auction House - Microservices with Serverless Framework & AWS - demo project

### Services

- Auth service - an Auth0 based Lambda Authorizer used to protect API endpoints for authorized users
- Auction service - a simple auction marketplace using DynamoDB as database, SQS as a notification queue and S3 as an image storage
- Notification service - sends out emails on auction events by consuming the SQS notification queue and using SES email service

### Global settings

1. To deploy your application in the cloud you need an AWS account.
2. Also you need to install and configure [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) and [serverless CLI](https://www.serverless.com/framework/docs/getting-started/)
3. Create a `.env` file in the root folder (see [.env.example](.env.example)). You need to specify 3 variables:
   - `AWS_ACCOUNT_ID`: your AWS Account Id without dashes
   - `AWS_REGION_ID`: AWS datacenter location id (for example eu-west-1)
   - `SENDER_EMAIL`: a valid email address from where the auction notifications will be sent (should be validated in AWS SES )

### Auth service

1. Install NPM dependencies.
   ```
   cd services/auth
   npm install
   ```
2. Set up an [auth0 application](https://auth0.com/docs/applications).

3. Get your `public key` (under `applications->${YOUR_APP_NAME}->settings->Show Advanced Settings->Certificates->DOWNLOAD CERTIFICATE`). Download it as `PEM` format and save it as a new file called `secret.pem` in `services/auth/` directory.

4. Deploy service.
   ```
   serverless deploy -v
   ```
5. Deploy [front-end](https://github.com/levid83/auction-frontend) to the host of your choosing and make sure to configure the `Allowed Callback URL` and `Allowed Origins` in your [auth0 dashboard](https://manage.auth0.com) (under `applications->${YOUR_APP_NAME}->settings`).

### Notification service

1. Install the NPM dependencies.
   ```
   cd services/notification
   npm install
   ```
2. Don't forget to set up the `SENDER_EMAIL` (see global settings above)
3. Deploy service.
   ```
   serverless deploy -v
   ```

### Auction service

1. Install the NPM dependencies.
   ```
   cd services/auction
   npm install
   ```
2. Don't forget to set up the `AWS_ACCOUNT_ID` (see global settings above)
3. Deploy service.
   ```
   serverless deploy -v
   ```

### Front-end

- Here you can find the frontend for the [Auction House](https://github.com/levid83/auction-frontend) project
