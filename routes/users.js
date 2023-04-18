const router = require('express').Router();

const { createUser, getUsers, getUsersById, updateUser, updateAvatar } = require('../controllers/users');

router.get('/', getUsers);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);
router.get('/:userId', getUsersById);
router.post('/', createUser);

module.exports = router;