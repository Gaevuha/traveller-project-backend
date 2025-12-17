import express from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import { getEnvVar } from './utils/getEnvVar.js';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import { UPLOAD_DIR } from './constants/index.js';

dotenv.config();

const PORT = Number(getEnvVar('PORT', '4000'));
const isProd = process.env.NODE_ENV === 'production';

export async function setupServer() {
  const app = express();

  // JSON
  app.use(express.json());

  //HEALTH
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // CORS
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'https://project-traveller-app.netlify.app',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'Accept',
        'Origin',
        'X-Requested-With',
      ],
      exposedHeaders: ['Set-Cookie'],
    }),
  );

  // Cookies
  app.use(cookieParser());

  // Логи pino
  const logger = isProd
    ? pinoHttp()
    : pinoHttp({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
          },
        },
      });
  app.use(logger);

  // Примітивний лог часу
  app.use((req, res, next) => {
    console.log(`Time: ${new Date().toISOString()} | ${req.method} ${req.url}`);
    next();
  });

  // Роути: всі роутери під /api
  app.use('/api', router);

  // Статика
  app.use('/uploads', express.static(UPLOAD_DIR));

  // Swagger docs
  app.use('/api-docs', swaggerDocs());

  // 404
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return new Promise((resolve, reject) => {
    try {
      app.listen(PORT, (error) => {
        if (error) {
          console.error('Server startup error:', error);
          reject(error);
          return;
        }
        console.log(`Server is running on port ${PORT}`);
        resolve();
      });
    } catch (error) {
      console.error('Server startup error (sync):', error);
      reject(error);
    }
  });
}
