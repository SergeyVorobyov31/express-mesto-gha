const Card = require('../models/card');

const ERROR_CODE_400 = 400;
const ERROR_CODE_404 = 404;
const ERROR_CODE_500 = 500;

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => {
      const err = new Error('Ошибка на сервере.');
      err.statusCode = ERROR_CODE_500;
      next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const owner = req.user.id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((newCard) => {
      res.send(newCard);
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        const err = new Error('Введены некоректные данные.');
        err.statusCode = ERROR_CODE_400;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = ERROR_CODE_500;
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const owner = req.user.id;
  Card.findById(cardId)
    .then((card) => {
      const cardOwner = card.owner.toString();
      if (owner !== cardOwner) {
        res.status(ERROR_CODE_404).send({ message: 'Карточка не принадлежит данному пользователю' });
      } else {
        Card.findByIdAndRemove(cardId)
          .then(() => {
            if (!card) {
              res.status(ERROR_CODE_404).send({ message: 'Карточка не найдена' });
              return;
            }
            res.send(card, { message: 'Карточка успешно удалена' });
          });
      }
    })
    .catch((e) => {
      res.send(e);
      if (e.name === 'CastError') {
        const err = new Error('Передан некорректный id.');
        err.statusCode = ERROR_CODE_400;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = ERROR_CODE_500;
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user.id } }, { new: true })
    .populate('owner')
    .then((like) => {
      if (!like) {
        res.status(ERROR_CODE_404).send({ message: 'Данная карточка не найдена' });
        return;
      }
      res.send(like);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        const err = new Error('Передан некорректный id.');
        err.statusCode = ERROR_CODE_400;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = ERROR_CODE_500;
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user.id } }, { new: true })
    .populate('owner')
    .then((like) => {
      if (!like) {
        res.status(ERROR_CODE_404).send({ message: 'Данная карточка не найдена' });
        return;
      }
      res.send(like);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        const err = new Error('Передан некорректный id.');
        err.statusCode = ERROR_CODE_400;
        next(err);
      } else {
        const err = new Error('Ошибка на сервере.');
        err.statusCode = ERROR_CODE_500;
        next(err);
      }
    });
};
