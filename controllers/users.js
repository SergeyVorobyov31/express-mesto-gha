const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
  .populate(['name', 'about', 'avatar'])
  .then(user => res.status(200).send(user))
  .catch(err => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError" || "ValidatorError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
}

module.exports.getUsersById = (req, res) => {
  const userId = req.params.userId;
  return User.findById(userId)
  .orFail(() => {
    const error = new Error("Пользователь с таким id не найден.");
    Error.statusCode = 404
  })
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((err) => {
    console.log(err.name);
    if(err.name === 'NotFound') {
      res.status(400).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError" || "ValidatorError") {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
}

module.exports.createUser = (req, res) => {
  const {name, about, avatar} = req.body;
  User.create({name, about, avatar})
  .then((newUser) => {
    res.status(200).send(newUser);
  })
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError" || "ValidatorError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
};

module.exports.updateUser = (req, res) => {
  const userId = req.user._id;
  const {name, about} = req.body;
  User.findByIdAndUpdate(userId, {name, about}, {new : true})
  .then((user) => {
    if(user.name.length < 2 || user.about.length < 2) {
      res.status(400).send({message: "Минимальная длина 2 символа"});
      return
    } else if (user.name.length > 30 || user.about.length > 30) {
      res.status(400).send({message: "Максимальная длина 30 символов"});
      return
    }
    res.status(200).send(user)
  })
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError"|| "ValidatorError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  })
}

module.exports.updateAvatar = (req, res) => {
  const userId = req.user._id;
  const {avatar} = req.body;
  User.findByIdAndUpdate(userId, {avatar}, {new : true})
  .then((user) => {
    if(user.avatar.length < 2) {
      res.status(400).send({message: "Минимальная длина 2 символа"});
      return
    } else if (user.avatar.length > 30) {
      res.status(400).send({message: "Максимальная длина 30 символов"});
      return
    }
    res.status(200).send(user)
  })
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError" || "ValidatorError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  })
}