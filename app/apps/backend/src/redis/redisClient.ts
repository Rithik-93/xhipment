import Redis from 'ioredis';
import { REDIS_URI } from '../config/config';

const redis = new Redis(REDIS_URI, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 3000);
    console.log(`Redis retry attempt #${times}, retrying in ${delay}ms...`);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});

export default redis;
