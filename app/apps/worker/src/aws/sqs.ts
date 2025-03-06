import {
  ReceiveMessageCommand,
  SQSClient,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { logger } from "../utils/logger";
import { config } from "dotenv";
import redis from "../redis/redisClient";
import { orderSchema } from "../schema";
import {
  accessKeyId,
  queueUrl as QueueUrl,
  region,
  secretAccessKey,
} from "../config/config";
import prisma from "@repo/database/client";
import { sendEmail } from "./ses";

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
      try {
        // Adding a small delay to prevent tight loops
        await new Promise((resolve) => setTimeout(resolve, 100));

        const { Messages } = await sqsClient.send(command);

        if (!Messages || Messages.length === 0) {
          logger.info("No messages in queue.");
          continue;
        }

        for (const message of Messages) {
          const { MessageId, Body, ReceiptHandle } = message;
          if (!Body || !ReceiptHandle) continue;

          logger.info(`Message received. ID: ${MessageId}, Body: ${Body}`);

          try {
            const queueData = JSON.parse(Body);
            const payload = orderSchema.parse(queueData);

            const order = await prisma.order.create({
              data: {
                orderId: payload.orderId,
                products: {
                  connect: payload.items.items.map((x) => ({
                    id: x.productId,
                  })),
                },
                status: "Processed",
                userId: payload.userId,
                totalAmount: payload.totalAmount,
              },
              select: {
                products: true,
                orderId: true,
                status: true,
                userId: true,
                totalAmount: true,
              },
            });

            // BUSINESS LOGIC HERE

            try {
              const redisPayload = await redis.get(queueData.orderId);
              if (redisPayload) {
                const orderCache = JSON.parse(redisPayload);
                orderCache.status = "Processed";
                await redis.set(
                  queueData.orderId,
                  JSON.stringify(orderCache),
                  "EX",
                  300
                );
                logger.info(
                  `Order ${queueData.orderId} processed and updated in Redis.`
                );
              }
            } catch (redisError) {
              logger.error("Redis operation failed:", redisError);
            }

            const productIds = payload.items.items.map((x) => x.productId);

            const products = await prisma.product.findMany({
              where: { id: { in: productIds } },
              select: { id: true, name: true },
            });

            const productDetails = payload.items.items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return {
                name: product?.name || "Unknown Product",
                quantity: item.quantity,
              };
            });

            await sendEmail(
              order.userId,
              order.orderId,
              "Processed",
              productDetails
            );

            await sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: queueUrl,
                ReceiptHandle: ReceiptHandle,
              })
            );

            logger.info(
              `Successfully processed and deleted message ${MessageId}`
            );
          } catch (messageError) {
            logger.error("Error processing message:", messageError);

            try {
              if (Body) {
                const errorData = JSON.parse(Body);
                try {
                  const redisPayload = await redis.get(errorData.orderId);
                  if (redisPayload) {
                    const orderCache = JSON.parse(redisPayload);
                    orderCache.status = "Failed";
                    await redis.set(
                      errorData.orderId,
                      JSON.stringify(orderCache),
                      "EX",
                      300
                    );
                    await prisma.order.update({
                      where: {
                        orderId: orderCache.orderId,
                      },
                      data: {
                        status: "Failed",
                      },
                    });
                  }
                } catch (redisError) {
                  logger.error(
                    "Failed to update Redis for failed order:",
                    redisError
                  );
                }
              }
            } catch (fallbackError) {
              logger.error("Error in fallback error handling:", fallbackError);
            }

            try {
              await sqsClient.send(
                new DeleteMessageCommand({
                  QueueUrl: queueUrl,
                  ReceiptHandle: ReceiptHandle,
                })
              );
              logger.info(`Deleted problematic message ${MessageId}`);
            } catch (deleteError) {
              logger.error(
                "Failed to delete problematic message:",
                deleteError
              );
            }
          }
        }
      } catch (loopError) {
        logger.error("Error in message processing loop:", loopError);
      }
    }
  } catch (fatalError) {
    logger.error("Fatal error in queue processor:", fatalError);
    throw new Error(
      "Queue processor failed: " +
        (fatalError instanceof Error ? fatalError.message : String(fatalError))
    );
  }
};
