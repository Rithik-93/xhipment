import { ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { logger } from "../utils/logger";
import { config } from "dotenv";
import redis from "../redis/redisClient";
import { orderSchema } from "../schema";
import { accessKeyId, queueUrl as QueueUrl, region, secretAccessKey } from "../config/config";

config();

const sqsClient = new SQSClient({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

const queueUrl = QueueUrl;


export const popQueue = async (): Promise<void> => {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
  });

  try {
    while (true) {
      const { Messages } = await sqsClient.send(command);

      if (!Messages || Messages.length === 0) {
        logger.info("No messages in queue.");
        continue;
      }

      for (const message of Messages) {
        const { MessageId, Body } = message;
        logger.info(`Message received. ID: ${MessageId}, Body: ${Body}`);

        if (Body) {
          let queueData;
          try {
            queueData = JSON.parse(Body);
            orderSchema.parse(queueData);
          } catch (error) {
            logger.error("Invalid message format. Skipping message.", error);
            continue;
          }



          //WE DO ALL THE BUSINESS LOGIC HERE




          const redisPayload = await redis.get(queueData.orderId);
          if (redisPayload) {
            const order = JSON.parse(redisPayload);
            order.status = "Processed";

            await redis.set(
              queueData.orderId,
              JSON.stringify(order),
              "EX",
              300
            );
            logger.info(`Order ${queueData.orderId} processed and updated.`);
          }
        }
      }
    }
  } catch (error) {
    logger.error("Error receiving or processing SQS message:", error);
    if (error instanceof Error)
      throw new Error("Failed to pop messages from SQS: " + error.message);
  }
};