import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { createOrder, getOrderDetails } from "../controllers/inventoryController";

const router: Router = Router();

router.use(authMiddleware);

router.post("/", createOrder);
router.get("/:orderId", getOrderDetails);

export default router;
