import {
  SESClient,
  SendEmailCommand,
  VerifyEmailIdentityCommand,
} from "@aws-sdk/client-ses";
import { accessKeyId, region, secretAccessKey, senderEmail } from "../config/config";

const sesClient = new SESClient({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

export async function sendEmail(
  recipientEmail: string,
  orderId: string,
  status: "Processed" | "Failed"
) {
  const subject =
    status === "Processed"
      ? `Order Confirmation - #${orderId}`
      : `Order Failed - #${orderId}`;

  const bodyText =
    status === "Processed"
      ? `Hello,\n\nYour order #${orderId} has been successfully processed.\nThank you for shopping with us!\n\nBest regards,\nXhipment Team`
      : `Hello,\n\nUnfortunately, your order #${orderId} could not be processed.\nPlease try again.\n\nBest regards,\nXhipment Team`;

  const bodyHtml =
    status === "Processed"
      ? `
      <h1>Order Confirmation</h1>
      <p>Your order has been <strong>successfully processed</strong>.</p>
      <p><strong>Order ID:</strong> #${orderId}</p>
      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br/>Xhipment Team</p>
    `
      : `
      <h1>Order Failed</h1>
      <p>Unfortunately, your order <strong>#${orderId}</strong> could not be processed.</p>
      <p>Please check your payment and try again.</p>
      <p>We apologize for the inconvenience.</p>
      <p>Best regards,<br/>Xhipment Team</p>
    `;

  const params = {
    Source: senderEmail,
    Destination: { ToAddresses: [recipientEmail] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Text: { Data: bodyText, Charset: "UTF-8" },
        Html: { Data: bodyHtml, Charset: "UTF-8" },
      },
    },
  };

  try {
    const result = await sesClient.send(new SendEmailCommand(params));
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
