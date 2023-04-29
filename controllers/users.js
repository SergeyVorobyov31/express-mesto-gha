const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomSecretKey = require('../constants/constants');
const { BadRequestError, NotFoundError, ServerError, UnauthorizedError } = require('../errors/errors');

const User = require('../models/user');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send(user))
    .catch(() => {
      next(new ServerError('Ошибка на сервере.'));
    });
};

module.exports.getMyUser = (req, res, next) => {
  const userId = req.user.id;
  return User.findById(userId)
    .orFail(() => {
      throw NotFoundError('Пользователь с таким id не найден. Несуществующий id.');
    })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequestError('Пользователь с таким id не найден. Некорректный id.'));
      } else if (e.name === 'NotFound') {
        next(new NotFoundError('Пользователь с таким id не найден. Несуществующий id.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
      }
      next(e);
    });
};

module.exports.getUsersById = (req, res, next) => {
  const { userId } = req.params;
  return User.findById(userId)
    .orFail(() => {
      throw NotFoundError('Пользователь с таким id не найден. Несуществующий id.');
    })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequestError('Пользователь с таким id не найден. Некорректный id.'));
      } else if (e.name === 'NotFound') {
        next(new NotFoundError('Пользователь с таким id не найден. Несуществующий id.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
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
        next(new BadRequestError('Введены некоректные данные.'));
      } else if (e.code === 11000) {
        next(new UnauthorizedError('Пользователь с таким email уже существует.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
      }
      next(e);
    });
};

module.exports.updateUser = (req, res, next) => {
  const userId = req.user.id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      throw NotFoundError('Пользователь с таким id не найден.');
    })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === 'NotFound') {
        next(new NotFoundError('Пользователь с таким id не найден.'));
      } else if (e.name === 'ValidationError') {
        next(new BadRequestError('Введены некоректные данные.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
      }
      next(e);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const userId = req.user.id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      throw NotFoundError('Пользователь с таким id не найден.');
    })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === 'NotFound') {
        next(new NotFoundError('Пользователь с таким id не найден.'));
      } else if (e.name === 'ValidationError') {
        next(new BadRequestError('Введены некоректные данные.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
      }
      next(e);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        next(new UnauthorizedError('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            next(new UnauthorizedError('Неправильные почта или пароль'));
          }
          const token = jwt.sign({ id: user._id }, randomSecretKey);
          res.cookie('jwt', token, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
          });
          res.send({ message: 'Успешно' });
          return token;
        });
    })
    .catch(() => {
      next(new UnauthorizedError('Неправильные почта или пароль'));
    });
};
