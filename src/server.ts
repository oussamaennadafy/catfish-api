import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import 'dotenv/config';
import './config/database.ts';
import initializeSocketIO from '@/events/index.ts';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import AppError from '@/common/classes/AppError.ts';
import userRouter from '@/features/authentication/routes/UserRoutes.ts';
import globalErrorHandler from './common/controllers/errorController.ts';
import SocketManager from './events/socketManager.ts';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

app.enable('trust proxy');

app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against XSS
app.use(compression());

// 3) ROUTES
app.use('/api/v1/users', userRouter);

// io middleware to attach user to socket
io.use(SocketManager.protect);

// Initialize Socket.IO
initializeSocketIO(io);

// catch all wrong routes calls
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});