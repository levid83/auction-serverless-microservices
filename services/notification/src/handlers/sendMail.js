import AWS from "aws-sdk";

const ses = new AWS.SES({ region: process.env.AWS_REGION_ID });

function buildEmail(emailParams) {
  const { subject, body, recipient } = emailParams;
  return {
    Source: process.env.SENDER_EMAIL,
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  };
}

async function sendMail(event, _) {
  const params = JSON.parse(event.Records[0].body);
  const email = buildEmail(params);
  try {
    return ses.sendEmail(email).promise();
  } catch (error) {
    console.error(error);
  }
}

export const handler = sendMail;
