const Card = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ServerError = require('../errors/ServerError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => {
      next(new ServerError('Ошибка на сервере'));
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
        next(new BadRequestError('Введены некоректные данные.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const owner = req.user.id;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка не найдена.'));
        return;
      }
      const cardOwner = card.owner.toString();
      if (owner !== cardOwner) {
        next(new ForbiddenError('Карточка не принадлежит данному пользователю.'));
      } else {
        Card.findByIdAndRemove(cardId)
          .then(() => {
            res.send({ message: 'Карточка успешно удалена' });
          })
          .catch(() => {
            next(new ServerError('Ошибка на сервере.'));
          });
      }
    })
    .catch((e) => {
      res.send(e);
      if (e.name === 'CastError') {
        next(new BadRequestError('Передан некорректный id.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user.id } }, { new: true })
    .populate('owner')
    .then((like) => {
      if (!like) {
        next(new NotFoundError('Данная карточка не найдена.'));
        return; // если поставить return перед next, eslint вызывает ошибку
      }
      res.send(like);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequestError('Передан некорректный id.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user.id } }, { new: true })
    .populate('owner')
    .then((like) => {
      if (!like) {
        next(new NotFoundError('Данная карточка не найдена.'));
        return; // если поставить return перед next, eslint вызывает ошибку
      }
      res.send(like);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequestError('Передан некорректный id.'));
      } else {
        next(new ServerError('Ошибка на сервере.'));
      }
    });
};
