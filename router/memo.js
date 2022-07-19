import express from 'express';
import { body } from 'express-validator';

import { getAllMemo, createMemo, getSingleMemo, updateExistingMemo, deleteMemo } from '../controller/memo.js';
import isAuth from '../middleware/isAuth.js'

const router = express.Router();

router.get('/memos', isAuth, getAllMemo);

router.post(
  '/memos', 
  body('title').trim().isLength({min: 5}).withMessage('Please, required minimum 5 character for input memo title'),
  body('content').trim().isLength({min: 10}).withMessage('Please, required minimum 10 character for input content for memo'),
  isAuth, 
  createMemo);

router.get('/memos/:memoId', isAuth, getSingleMemo);

router.put(
  '/memos/:memoId', 
  body('title').trim().isLength({min: 5}).withMessage('Please, required minimum 5 character for input memo title'),
  body('content').trim().isLength({min: 10}).withMessage('Please, required minimum 10 character for input content for memo'),
  isAuth, 
  updateExistingMemo);

router.delete('/memos/:memoId', isAuth, deleteMemo);

export default router;