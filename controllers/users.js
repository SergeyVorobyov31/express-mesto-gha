const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
  .populate(['name', 'about', 'avatar'])
  .then(user => res.send({data: user}))
  .catch(err => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
}

module.exports.getUsersById = (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  return User.findById(userId)
  .orFail(() => {
    const error = new Error("user not found");
    Error.statusCode = 404
  })
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((err) => {
    console.log(err);
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
}

module.exports.createUser = (req, res) => {
  const {name, about, avatar} = req.body;
  console.log(req.body);
  User.create({name, about, avatar})
  .then((newUser) => {
    res.send(newUser);
    console.log(newUser);
  })
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError") {
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
  .then((user) => res.send(user))
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError") {
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
  .then((user) => res.send(user))
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Пользователь с таким id не найден."});
    } else if (err.name === "CastError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  })
}