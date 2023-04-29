const Card = require('../models/card');
const { BadRequestError, NotFoundError, ServerError, ForbiddenError } = require('../errors/errors');

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => {
      next(new ServerError('Ошибка на сервере'));
    });
};

module.exports.createCard = (req, res, next) => {
  const owner = req.user.id;
  console.log(req.body);
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((newCard) => {
      res.send(newCard);
    })
    .catch((e) => {
      console.log(e);
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
        return;
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
