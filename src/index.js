'use strict'

require('dotenv').config()

//express
const express = require('express')
const app = express()
const path = require('path')
const hbs = require('express-handlebars');
const cookieSession = require('cookie-session')
const methodOverride = require('method-override')  
const flash = require('connect-flash');
const taskRoutes = require('./routes/task.routes')
const userRoutes = require('./routes/user.routes')

require('./configuration/configdb')


app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieSession({
    secret: 'una_session',
    maxAge: 24 * 60 * 60 *1000
}))

app.use(flash())

//variables globales

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.danger_msg = req.flash('danger_msg')
    next()
    
})

app.use(methodOverride('_method', {methods: ['POST', 'GET']}))

const User = require('../src/models/modelUser')

app.use(async (req, res, next) => {
    const userId = req.session.userId
    if(userId){
        const user = await User.findById(userId)
        if(user){
            res.locals.user = user            
        }else{
            delete req.session.userId
        }
    }
    next()    
})

app.set('views', path.join(__dirname, 'views'))

app.engine('.hbs', hbs({ 
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },   
   layoutsDir:path.join(app.get('views'),'layouts'),
   partialsDir:path.join(app.get('views'),'partials'),
    extname:'.hbs',
    defaultLayout:'main'
 }))
  
 app.set('view engine', 'hbs')

app.use(userRoutes)
app.use(taskRoutes)

app.use((err, req, res, next) => {

    if (err.statusCode === 400) {
        
        const errors = [];
        errors.push({ text: err.message })
        res.status(err.statusCode).render("register", {
            errors,
        });
    } else {
        res.status(500).render('errors/serverError')
    }   

});



module.exports = app

app.listen(process.env.PORT || 3000, console.log(`running in port ${process.env.PORT || 3000}`))