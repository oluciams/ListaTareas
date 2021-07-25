const express = require('express')
const app = express()
const path = require('path')
const hbs = require('express-handlebars');
const cookieSession = require('cookie-session')
const methodOverride = require('method-override')
const flash = require('connect-flash');

require('./configuration/configdb')


app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieSession({
    secret: 'una_session',
    maxAge: 24 * 60 * 60 *1000
}))

app.use(methodOverride('_method', {methods: ['POST', 'GET']}))
app.use(flash())

const User = require('./models/modelUser')
const Task = require('./models/modelTask')

//variables globales

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.danger_msg = req.flash('danger_msg')
    next()

})


// middlewares
const requireUser = (req, res, next) => {
    if(!res.locals.user){
        return res.redirect('/login')            
        }
        next()    
 }

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

//handlebars

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

// Rutas de usuario
  
 
app.get('/', requireUser, async (req, res)=>{  
    try{
        req.session.views = (req.session.views || 0) + 1
        res.render('index', {views:req.session.views} )
        
    } catch (error) {
        throw new Error(error)
    }
})



//crear tarea
app.post('/', requireUser, async(req,res)=>{
    const data = {
        user: res.locals.user,
        title: req.body.title,
        description: req.body.description
    }
    try{
        const task = new Task(data);
        await task.save();        
        req.flash('success_msg', 'Task added successfully')
        res.redirect('tasks');        
    }catch (error) {
        throw new Error(error)
    }
})


// Rutas de tareas


 
app.get('/tasks',requireUser, async (req, res) => {
    try {
        const tasks = await Task.find({user: res.locals.user});
        res.render('tasks', { tasks });

    }catch (error) {
        throw new Error(error)
    }
});


app.get('/task/edit/:id', requireUser, async (req, res) => {
    const task = await Task.findById(req.params.id)
    res.render('edit-task', { task })    
})

app.put('/edit-task/:id', requireUser, async(res, req)=>{
    try{
        console.log(req.body)
        const {title, description} = req.body
        await Task.findByIdAndUpdate(req.params.id, {title, description})
        req.flash('success_msg', 'Task updated successfully')
        res.redirect('/tasks')         
    }catch(error) {
        throw new Error(error)
    }  
})


app.delete('/tasks/delete/:id',requireUser, async (req, res) => {
    try {        
        const { id } = req.params;
        await Task.deleteOne({_id:id }) 
        req.flash('success_msg', 'Task deleted successfully')           
        res.redirect('/tasks');        

    }catch (error) {
        throw new Error(error)
    }
});

app.get('/register', (req,res)=>{      
    res.render('register')    
})

app.post('/register', async(req,res)=>{
    try{ 
        const user = await User.create({
            email: req.body.email,
            password: req.body.password
        })
        req.flash('success_msg', 'User registered successfully')
        res.redirect('/login')      
        
    }catch (error) {
        throw new Error(error)
    }
})

app.get('/login', (req,res)=>{
    res.render('login')
})

app.post('/login', async(req,res)=>{
    try{
        const user = await User.authenticate(req.body.email, req.body.password)
        if(user){
            req.session.userId = user._id
            req.flash('success_msg', 'User logged in successfully')
            return res.redirect('/tasks')
        }else{
            req.flash('danger_msg', 'wrong email or password. Try again!')
            res.redirect('/login')
        }            
    }catch (error) {
        throw new Error(error)
    }
})

app.get('/logout', (req,res)=>{
    
    req.session = null    
    res.clearCookie('session')
    res.clearCookie('session.sig')    
    res.redirect('/login')
})


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
  });



app.listen(3000, ()=>console.log("running in port 3000"))