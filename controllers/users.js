const User = require('../models/user');
const ERROR_CODE_400 = 400;
const ERROR_CODE_404 = 404;
const ERROR_CODE_500 = 500;

module.exports.getUsers = (req, res) => {
  User.find({})
  .then(user => res.send(user))
  .catch(err => {
    res.status(ERROR_CODE_500).send({message: "Ошибка на сервере."});
  });
}

module.exports.getUsersById = (req, res) => {
  const userId = req.params.userId;
  return User.findById(userId)
  .orFail(() => {
    const error = new Error("Пользователь с таким id не найден. Несуществующий id.");
    error.statusCode = 404;
    error.name = "NotFound";
    throw error;
  })
  .then((user) => {
    res.send(user);
  })
  .catch((err) => {
    if(err.name === "CastError") {
      res.status(ERROR_CODE_400).send({message: "Пользователь с таким id не найден. Некорректный id"});
    } else if (err.name === "NotFound") {
      res.status(ERROR_CODE_404).send({message: "Пользователь с таким id не найден. Несуществующий id"});
    } else {
      res.status(ERROR_CODE_500).send({message: "Ошибка на сервере."});
    }
  });
}

module.exports.createUser = (req, res) => {
  const {name, about, avatar} = req.body;
  User.create({name, about, avatar})
  .then((newUser) => {
    res.send(newUser);
  })
  .catch((err) => {
    if(err.name === "ValidatorError") {
      res.status(ERROR_CODE_400).send({message: "Введены некоректные данные."});
    } else {
      res.status(ERROR_CODE_500).send({message: "Ошибка на сервере."});
    }
  });
};

module.exports.updateUser = (req, res) => {
  const userId = req.user._id;
  const {name, about} = req.body;
  User.findByIdAndUpdate(userId, {name, about}, {new : true, runValidators: true})
  .orFail(() => {
    const error = new Error("Пользователь с таким id не найден.");
    error.statusCode = 404;
    error.name = "NotFound";
    throw error;
  })
  .then((user) => {
    res.send(user)
  })
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(ERROR_CODE_404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "ValidatorError") {
      res.status(ERROR_CODE_400).send({message: "Введены некоректные данные."});
    } else {
      res.status(ERROR_CODE_500).send({message: "Ошибка на сервере."});
    }
  })
}

module.exports.updateAvatar = (req, res) => {
  const userId = req.user._id;
  const {avatar} = req.body;
  User.findByIdAndUpdate(userId, {avatar}, {new : true, runValidators: true})
  .orFail(() => {
    const error = new Error("Пользователь с таким id не найден.");
    error.statusCode = 404;
    error.name = "NotFound";
    throw error;
  })
  .then((user) => {
    res.send(user)
  })
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(ERROR_CODE_404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "ValidatorError") {
      res.status(ERROR_CODE_400).send({message: "Введены некоректные данные."});
    } else {
      res.status(ERROR_CODE_500).send({message: "Ошибка на сервере."});
    }
  })
}