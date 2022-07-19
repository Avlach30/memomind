import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const isAuth = (req, res, next) => {
  const authHeader = req.get('Authorization'); //* Get 'Authorization' header request

  if (!authHeader) {
    const error = new Error('Authorization header not found!');
    error.statusCode = 401;
    throw error;
  }

  //* Get token from 'Authorization' request header value
  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    //* verify jwt token with secret text
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_TEXT);
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }

  //* If token not verified with secret text
  if (!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.id;
  req.email = decodedToken.email;

  next();
};

export default isAuth;