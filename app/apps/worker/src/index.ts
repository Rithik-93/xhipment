import express, { Express } from 'express';
import { config } from 'dotenv';
import { popQueue } from './aws/sqs';
import { logger } from './utils/logger';

config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

const listenQueues = async () => {
    while (true) {
      await popQueue();
    }
};

app.listen(PORT, () => {
  logger.info(`Server is listening on port ${PORT}`);
  listenQueues();
});

export default app;
