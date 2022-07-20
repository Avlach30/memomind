import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import { createClient } from 'redis';

import User from '../model/user.js';

dotenv.config();

const client = createClient();
await client.connect();

const validationChecker = (reqObj) => {
  const validationError = validationResult(reqObj);
  if (!validationError.isEmpty()) {
    const error = new Error('Validation Failed');
    error.statusCode = 422;
    error.data = validationError.array()[0].msg;
    throw error;
  }
}

const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    validationChecker(req);

    const existUser = await User.findOne({ email: email });

    if (existUser) {
      const error = new Error('Email already exist');
      error.statusCode = 400;
      throw error;
    }

    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      name: name,
      email: email,
      password: hashedPw
    });

    await user.save();

    res.status(201).json({
      message: 'Sign up successfully',
      email: email,
    });

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({email: email});
    if (!user) {
      const error = new Error(`Email ${email} doesn't exist`);
      error.statusCode = 404;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Incorrect password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({
      email: user.email,
      id: user._id.toString()
    }, process.env.TOKEN_SECRET_TEXT, { expiresIn: '1h' });

    res.status(200).json({
      message: `Successfully login as ${user.email}`,
      userId: user._id.toString(),
      token: token,
    });

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const getLoggedUser = async (req, res, next) => {
  let userId;
  try {
    //* Get logged userId value from redis cache store
    const getUserId = await client.get('loggedUserId');

    if (!getUserId) {
      //* If not available, make a new key-value pair of logged user id
      await client.set('loggedUserId', req.userId);
      userId = await client.get('loggedUserId');
    } else {
      //* If already available, reassign to another useful variable
      userId = getUserId;
    }

    const user = await User.findOne({ _id: userId }).select('-password');
    res.status(200).json({
      status: 200,
      message: 'Get logged user data successfully',
      data: user,
    });

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const updateLoggedUser = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    validationChecker(req);

    const user = await User.findById(req.userId);

    user.name = name;
    user.email = email;
    await user.save();

    res.status(200).json({
      status: 200,
      message: 'Successfully updated logged user data',
    });

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }

};


export { signUp, logIn, getLoggedUser, updateLoggedUser };