import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { REDIS_URI } from '../config/config';

const redis = new Redis(REDIS_URI, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Redis retry attempt #${times}, retrying in ${delay}ms...`);
    return delay;
  },
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redis.on('connect', () => {
  logger.info('Connected to Redis successfully');
});

export default redis;
