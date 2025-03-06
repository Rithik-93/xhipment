import {
  SESClient,
  SendEmailCommand,
  VerifyEmailIdentityCommand,
} from "@aws-sdk/client-ses";
import { accessKeyId, region, secretAccessKey } from "../config/config";

const sesClient = new SESClient({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

const senderEmail = "rithik7899@gmail.com";

const subject = "Test email from AWS SES";
const bodyText =
  "Hello, this is a test email sent using AWS SES with Node.js and TypeScript!";

export async function sendEmail(recipientEmail: string) {
  const params = {
    Source: senderEmail,
    Destination: {
      ToAddresses: [recipientEmail],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: bodyText,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    console.log("Email sent successfully. Message ID:", result.MessageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

//---------------- NOT NEEDED IN PRODUCTION -----------------

export async function verifyEmail(email: string) {
  try {
    const command = new VerifyEmailIdentityCommand({ EmailAddress: email });
    const response = await sesClient.send(command);
    console.log(`Verification email sent to ${email}:`, response);
  } catch (error) {
    console.error("Error verifying email:", error);
  }
}
