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
  status: "Processed" | "Failed",
  items: {
    name: string;
    quantity: number;
}[]
) {
  const subject =
    status === "Processed"
      ? `Order Confirmation - #${orderId}`
      : `Order Failed - #${orderId}`;

  const itemsListText = items
    .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
    .join("\n");

  const itemsListHtml = items
    .map((item) => `<li>${item.name} (Qty: ${item.quantity})</li>`)
    .join("");

  const bodyText =
    status === "Processed"
      ? `Hello,\n\nYour order #${orderId} has been successfully processed.\n\nItems:\n${itemsListText}\n\nThank you for shopping with us!\n\nBest regards,\nXhipment Team`
      : `Hello,\n\nUnfortunately, your order #${orderId} could not be processed.\n\nItems:\n${itemsListText}\n\nPlease try again.\n\nBest regards,\nXhipment Team`;

  const bodyHtml =
    status === "Processed"
      ? `
      <h1>Order Confirmation</h1>
      <p>Your order has been <strong>successfully processed</strong>.</p>
      <p><strong>Order ID:</strong> #${orderId}</p>
      <h3>Items:</h3>
      <ul>${itemsListHtml}</ul>
      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br/>Xhipment Team</p>
    `
      : `
      <h1>Order Failed</h1>
      <p>Unfortunately, your order <strong>#${orderId}</strong> could not be processed.</p>
      <h3>Items:</h3>
      <ul>${itemsListHtml}</ul>
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
