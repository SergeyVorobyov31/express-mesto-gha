const jwt = require('jsonwebtoken');

const ERROR_CODE_401 = 401;
const regexJWT = /\w.+\.+\w.+\.+\w.+;/gi;
const regexSK = /secretKey=\w+/gi;

module.exports = (req, res, next) => {
  const authorization = req.headers.cookie;
  if (!authorization || !authorization.startsWith('jwt=')) {
    return res.status(ERROR_CODE_401).send({ message: 'Необходима авторизация' });
  }
  const token = authorization.match(regexJWT).toString().replace('jwt=', '').replace(';', '');
  const randomSecretKey = authorization.match(regexSK).toString().replace('secretKey=', '');
  // console.log('auth', token, randomSecretKey);
  let payload;
  try {
    payload = jwt.verify(token, randomSecretKey);
  } catch (e) {
    const err = new Error('Необходима авторизация');
    err.statusCode = 401;
    next(err);
    // return res.status(ERROR_CODE_401).send({ message: 'Необходима авторизация' });
  }

  req.user = payload;
  next();
  return payload;
};
