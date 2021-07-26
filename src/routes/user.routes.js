const router = require('express').Router()

const {createUserForm, createUser, loginUserForm, loginUser, logoutUser} = require('../controllers/user.controller')

router.get('/register', createUserForm)

router.post('/register', createUser)

router.get('/login', loginUserForm)

router.post('/login', loginUser)

router.get('/logout', logoutUser)

module.exports = router