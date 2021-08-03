const router = require('express').Router()

const validator = require('../middlewares/register.validator.middleware')
const userSchemaValidator = require('../validators/user.validator')

const {getHome, createUserForm, createUser, loginUserForm, loginUser, logoutUser} = require('../controllers/user.controller')

router.get('/', getHome);

router.get('/register', createUserForm)
router.post('/register', validator(userSchemaValidator), createUser)

router.get('/login', loginUserForm)
router.post('/login', loginUser)

router.get('/logout', logoutUser)

module.exports = router