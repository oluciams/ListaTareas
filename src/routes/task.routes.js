const router = require('express').Router()

const {getHome, createTask, showTasks, deleteTask, renderEditForm, updateTask, statusTask, updateStatus} = require('../controllers/task.controller')
const {requireUser} = require ('../middlewares/auth.middleware')
const app = require('../index')


router.get('/', requireUser, getHome)

router.post('/', requireUser, createTask)

router.get('/tasks',requireUser, showTasks)

router.get('/tasks/edit/:id', requireUser, renderEditForm)

router.put('/edit/:id', requireUser, updateTask)

router.post('/status/:id', requireUser, updateStatus)


router.delete('/tasks/delete/:id',requireUser, deleteTask)





module.exports = router 