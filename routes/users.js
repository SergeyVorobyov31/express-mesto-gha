const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers, getUsersById, updateUser, updateAvatar, getMyUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getMyUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string(),
    about: Joi.string(),
  }),
}), updateUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string(),
  }),
}), updateAvatar);
router.get('/:userId', getUsersById);

module.exports = router;
