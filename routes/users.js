const router = require('express').Router();

const {
  getUsers, getUsersById, updateUser, updateAvatar, getMyUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getMyUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);
router.get('/:userId', getUsersById);

module.exports = router;
