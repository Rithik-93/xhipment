// export const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";
// export const DOMAIN = process.env.DOMAIN || "http://localhost:3000";
// export const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

import { config } from 'dotenv';

config();

export const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

export const region = process.env.region || "ap-south-1";
export const accessKeyId = process.env.accessKeyId || "";
export const secretAccessKey = process.env.secretAccessKey || "";

export const queueUrl = process.env.SQSQueue || "";
export const queueName = process.env.queueName || "";
