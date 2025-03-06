import express, { Express } from 'express';
import { config } from 'dotenv';
import { popQueue } from './aws/sqs';
import { logger } from './utils/logger';

config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

const listenQueues = async () => {
  try {
    while (true) {
      await popQueue();
    }
  } catch (error) {
    logger.error("Error in queue listening loop:", error);
  }
};

app.listen(PORT, () => {
  logger.info(`Server is listening on port ${PORT}`);
  listenQueues();
});

export default app;
