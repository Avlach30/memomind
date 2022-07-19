import { validationResult } from 'express-validator';

import User from '../model/user.js';
import Memo from '../model/memo.js';

const validationChecker = (reqObj) => {
  const validationError = validationResult(reqObj);
  if (!validationError.isEmpty()) {
    const error = new Error('Validation Failed');
    error.statusCode = 422;
    error.data = validationError.array()[0].msg;
    throw error;
  }
}

const checkDataById = async (model, dataId) => {
  const data = await model.findById(dataId);

  if (!data) {
    const error = new Error('Data not found');
    error.statusCode = 404;
    throw error;
  } else {
    return data;
  }
};

const checkAuthorizationOfData = async (reqObj, model, dataId) => {
  const data = await checkDataById(model, dataId);

  if (data.creator.toString() != reqObj.userId) {
    const error = new Error('Forbidden to access this resource');
    error.statusCode = 403;
    throw error;
  } 
};

const getAllMemo = async (req, res, next) => {
  try {
    const memos = await Memo.find();
    const totalAllMemos = memos.length;

    const loggedUserMemos = memos.filter((memo) => memo.creator.toString() == req.userId);
    const totalUserMemos = loggedUserMemos.length;

    res.status(200).json({
      status: 200,
      message: 'Success get all memo data',
      memo: memos,
      total: totalAllMemos,
      userMemo: {
        memo: loggedUserMemos,
        total: totalUserMemos
      },
    });

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const createMemo = async (req, res, next) => {
  const { title, content } = req.body;

  try {
    validationChecker(req);

    const memo = new Memo({
      title: title,
      content: content,
      creator: req.userId,
    });

    await memo.save();

    const user = await User.findById(req.userId);
    user.memos.push(memo);
    await user.save();

    res.status(201).json({
      status: 201,
      message: 'Success write a new memo',
    });

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const getSingleMemo = async (req, res, next) => {
  const { memoId } = req.params;

  try {
    const memo = await checkDataById(Memo, memoId);

    res.status(200).json({ status:200, message: 'Get single memo data successfully', memo: memo });

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const updateExistingMemo = async (req, res, next) => {
  const { title, content } = req.body;
  const { memoId } = req.params;

  try {
    validationChecker(req);

    const memo = await checkDataById(Memo, memoId);

    await checkAuthorizationOfData(req, Memo, memoId);

    memo.title = title;
    memo.content = content;
    await memo.save();

    res.status(200).json({ status:200, message: 'Updated memo data successfully'});


  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const deleteMemo = async (req, res, next) => {
  const { memoId } = req.params;
  try {
    const memo = await checkDataById(Memo, memoId);

    await checkAuthorizationOfData(req, Memo, memoId);

    await Memo.deleteOne({ _id: memoId });

    const user = await User.findById(req.userId);
    user.memos.pull(memo);
    await user.save();

    res.status(200).json({
      status: 200,
      message: 'Delete memo successfully',
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export { getAllMemo, createMemo, getSingleMemo, updateExistingMemo, deleteMemo };