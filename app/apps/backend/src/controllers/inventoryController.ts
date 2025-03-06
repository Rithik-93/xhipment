import { Request, Response } from "express";
import prisma from "@repo/database/client";
import redisClient from "../redis/redisClient";
import { generateRandomString } from "../utils/utils";
import { orderSchema } from "../schema/types";
import { pushToQueue } from "../aws/sqs";

// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
  const validationResult = orderSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      message: "Invalid input",
      errors: validationResult.error.format(),
    });
    return;
  }
  const { location, items, totalAmount } = validationResult.data;

  if (!items || !totalAmount || !location) {
    res
      .status(400)
      .json({ message: "Location, Items and totalAmount are required" });
    return;
  }

  const productIds = items.map((item) => item.productId);

  try {
    const inventories = await prisma.inventory.findMany({
      where: {
        productId: {
          in: productIds,
        },
        location,
      },
    });

    const allProductsAvailable = items.every((item) => {
      const inventory = inventories.find(
        (inv: any) => inv.productId === item.productId
      );
      return inventory && inventory.stock >= item.quantity;
    });

    if (!allProductsAvailable) {
      res.json({
        message: `Some products are out of stock in ${location}`
      }).status(400);
      return
    }

    console.log(
      `All products are available in ${location} with sufficient stock!`
    );

    const redisPayload = {
      items,
      status: "Pending",
    };

    const orderUniqueId = generateRandomString(12);

    await redisClient.set(orderUniqueId, JSON.stringify(redisPayload), "EX", 600);
    await pushToQueue(orderUniqueId, validationResult.data);
    const payload = await redisClient.get(orderUniqueId);
    console.log(payload);

    res.status(201).json({
      message: "Order created successfully",
      orderId: orderUniqueId,
    });
    return;
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// GET /api/orders/:id
export const getOrderDetails = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  if (!orderId) {
    res.status(400).json({
      message: "orderId not found in params",
    });
    return;
  }

  try {
    const data = await redisClient.get(orderId);

    if (data !== null) {
      const { status } = JSON.parse(data);

      res.status(200).json({ status });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (order.userId !== req.userId) {
      res.status(403).json({ message: "Unauthorized to view this order" });
    }

    res.json({ status: order.status });
    return;
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to fetch order details" });
    return;
  }
};
