import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import orderRouter from "./routes/inventoryRoutes";
import { apiLimiter, authLimiter } from "./rateLimiter";
import { Express } from "express";

export const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: ["*"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", apiLimiter);

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/orders", orderRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// app.use("/docs", route);

app.listen(3000, () => {
  console.log("running 3000");
});
