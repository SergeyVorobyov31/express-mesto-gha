const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');
const randomSecretKey = require('../constants/constants');

module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
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
