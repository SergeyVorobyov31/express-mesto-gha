const Card = require('../models/card');

const ERROR_CODE_400 = 400;
const ERROR_CODE_404 = 404;
const ERROR_CODE_500 = 500;

module.exports.getCard = (req, res) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => {
      res.status(ERROR_CODE_500).send({ message: 'Ошибка на сервере.' });
    });
};

module.exports.createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((newCard) => {
      res.send(newCard);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Введены некоректные данные.' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка на сервере.' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        res.status(ERROR_CODE_404).send({ message: 'Карточка не найдена' });
        return;
      }
      res.send(card);
      console.log('Карточка успешно удалена');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Передан некорректный id.' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка на сервере.' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate('owner')
    .then((like) => {
      if (!like) {
        res.status(ERROR_CODE_404).send({ message: 'Данная карточка не найдена' });
        return;
      }
      res.send(like);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Передан некорректный id.' });
      } else {
        res.status(ERROR_CODE_500).send({ message: 'Ошибка на сервере.' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .populate('owner')
    .then((like) => {
      if (!like) {
        res.status(ERROR_CODE_404).send({ message: 'Данная карточка не найдена' });
        return;
      }
      res.send(like);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Передан некорректный id.' });
      } else {
        res.status(500).send({ message: 'Ошибка на сервере.' });
      }
    });
};
