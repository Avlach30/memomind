import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRouter from './router/auth.js';
import memoRouter from './router/memo.js';

const app = express();
dotenv.config();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});

app.use('/api/auth', authRouter);
app.use('/api', memoRouter);

//* Middleware for centralized error handler
app.use((error, req, res, next) => {
  // console.log(error.message);
  const statusCode = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(statusCode).json({message: message, data: data, statusCode: statusCode});
});

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.g6m6p.mongodb.net/${process.env.MONGO_DEFAULT_DB}?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI)
  .then(result => {
    app.listen(process.env.PORT, () => {
      console.log(`Connected to mongoDb atlas`);
      // console.log(result);
      console.log(`Server connected at http://localhost:${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.log(error)
  });
