const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const User = require('../models/user');

const ERROR_CODE_400 = 400;
const ERROR_CODE_401 = 401;
const ERROR_CODE_404 = 404;
const ERROR_CODE_500 = 500;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send(user))
    .catch(() => {
      const err = new Error('Ошибка на сервере.');
      err.statusCode = 500;
      next(err);
    });
};

module.exports.getMyUser = (req, res, next) => {
  const userId = req.user.id;
  return User.findById(userId)
    .orFail(() => {
      const error = new Error('Пользователь с таким id не найден. Несуществующий id.');
      error.statusCode = ERROR_CODE_404;
      error.name = 'NotFound';
      throw error;
    })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        const err = new Error('Пользователь с таким id не найден. Некорректный id.');
        err.statusCode = ERROR_CODE_400;
        next(err);
      } else if (e.name === 'NotFound') {
        const err = new Error('Пользователь с таким id не найден. Несуществующий id.');
        err.statusCode = ERROR_CODE_404;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = ERROR_CODE_500;
        next(err);
      }
      next(e);
    });
};

module.exports.getUsersById = (req, res, next) => {
  const { userId } = req.params;
  return User.findById(userId)
    .orFail(() => {
      const error = new Error('Пользователь с таким id не найден. Несуществующий id.');
      error.statusCode = ERROR_CODE_404;
      error.name = 'NotFound';
      throw error;
    })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        const err = new Error('Пользователь с таким id не найден. Некорректный id.');
        err.statusCode = ERROR_CODE_400;
        next(err);
      } else if (e.name === 'NotFound') {
        const err = new Error('Пользователь с таким id не найден. Несуществующий id.');
        err.statusCode = ERROR_CODE_404;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = ERROR_CODE_500;
        next(err);
      }
      next(e);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      res.send({
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      });
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        const err = new Error('Введены некоректные данные.');
        err.statusCode = ERROR_CODE_400;
        next(err);
      } else if (e.statusCode === 11000) {
        const err = new Error('Пользователь с таким email уже существует.');
        err.statusCode = ERROR_CODE_401;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = ERROR_CODE_500;
        next(err);
      }
      next(e);
    });
};

module.exports.updateUser = (req, res, next) => {
  const userId = req.user.id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      const error = new Error('Пользователь с таким id не найден.');
      error.statusCode = ERROR_CODE_404;
      error.name = 'NotFound';
      throw error;
    })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === 'NotFound') {
        const err = new Error('Пользователь с таким id не найден.');
        err.statusCode = ERROR_CODE_404;
        next(err);
      } else if (e.name === 'ValidationError') {
        const err = new Error('Введены некоректные данные.');
        err.statusCode = ERROR_CODE_400;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = ERROR_CODE_500;
        next(err);
      }
      next(e);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const userId = req.user.id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      const error = new Error('Пользователь с таким id не найден.');
      error.statusCode = 404;
      error.name = 'NotFound';
      throw error;
    })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === 'NotFound') {
        const err = new Error('Пользователь с таким id не найден.');
        err.statusCode = 404;
        next(err);
      } else if (e.name === 'ValidationError') {
        const err = new Error('Введены некоректные данные.');
        err.statusCode = 400;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = 500;
        next(err);
      }
      next(e);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          const randomSecretKey = crypto.randomBytes(16).toString('hex');
          const token = jwt.sign({ id: user._id }, randomSecretKey);
          res.cookie('jwt', token, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
          });
          res.cookie('secretKey', randomSecretKey, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
          });
          res.send({ message: 'Успешно' });
          return token;
        });
    })
    .catch(() => {
      const err = new Error('Неправильные почта или пароль');
      err.statusCode = 401;
      next(err);
    });
};
