import express from 'express';
import { body } from 'express-validator';

import { signUp, logIn, updateLoggedUser } from '../controller/auth.js';

import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post(
  '/signup', 
  body('email').isEmail().withMessage('Please, input a valid email type'),
  body('name').trim().not().isEmpty().withMessage('Please, input name is required'),
  body('password').trim().isLength({min: 8}).withMessage('Please, required minimum 8 character for input password'),
  signUp);

router.post('/login', logIn);

router.patch(
  '/profile', 
  body('email').isEmail().withMessage('Please, input a valid email type'),
  body('name').trim().not().isEmpty().withMessage('Please, input name is required'),
  isAuth,
  updateLoggedUser,
  )

export default router;