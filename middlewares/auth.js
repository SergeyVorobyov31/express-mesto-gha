const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/errors');
const randomSecretKey = require('../constants/constants');

module.exports = (req, res, next) => {
  const authorization = req.headers.cookie;
  if (!authorization || !authorization.startsWith('jwt=')) {
    next(new UnauthorizedError('Необходима авторизация'));
  }
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, randomSecretKey);
  } catch (e) {
    next(new UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload;
  next();
  return payload;
};
