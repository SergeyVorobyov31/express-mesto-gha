const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers, getUsersById, updateUser, updateAvatar, getMyUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getMyUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
}), updateUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(/[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/i).required(),
  }),
}), updateAvatar);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUsersById);

module.exports = router;
