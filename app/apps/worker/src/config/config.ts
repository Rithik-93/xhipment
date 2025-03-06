import { config } from 'dotenv';

config();

export const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
export const senderEmail = process.env.senderEmail || "";

export const region = process.env.region || "ap-south-1";
export const accessKeyId = process.env.accessKeyId || "";
export const secretAccessKey = process.env.secretAccessKey || "";

export const queueUrl = process.env.SQSQueue || "";
export const queueName = process.env.queueName || "";
