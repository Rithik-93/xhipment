import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import {
  accessKeyId,
  queueName,
  region,
  secretAccessKey,
  queueUrl as sqsQueueUrl,
} from "../config/config";

const sqsClient = new SQSClient({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

const queueUrl = sqsQueueUrl;

export async function pushToQueue(userId: string, orderId: string, items: any, totalAmount: number) {
  const messageBody = JSON.stringify({
    userId,
    orderId,
    items,
    totalAmount
  });

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: messageBody,
    MessageGroupId: queueName,
    MessageDeduplicationId: orderId,
  });

  try {
    const response = await sqsClient.send(command);
    console.log("Message sent to SQS:", response.MessageId, orderId);
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw new Error("Failed to send message to SQS");
  }
}
