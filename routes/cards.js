const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getCard, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/', getCard);
router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string(),
  }),
}), deleteCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);
router.post('/', createCard);

module.exports = router;
