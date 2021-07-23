const express = require('express')
const app = express()
const path = require('path')
const methodOverride = require('method-override')
const cookieSession = require('cookie-session')



require('./configuration/configdb')

const Task = require('./models/modelTask')
const User = require('./models/modelUser')

const hbs = require('express-handlebars');


app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieSession({
    secret: 'una_session',
    maxAge: 24 * 60 * 60 *1000
}))

app.use(methodOverride('_method', {methods: ["POST", "GET"] }))

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
  
 app.get('/', requireUser, async (req, res)=>{  
    try{
        req.session.views = (req.session.views || 0) + 1
        res.render('index', {views:req.session.views} )
        
    } catch (error) {
        throw new Error(error)
    }
})



app.post('/', requireUser, async(req,res)=>{
    const data = {
        user: res.locals.user,
        title: req.body.title,
        description: req.body.description
    }
    try{
        const task = new Task(data);
        await task.save();
        const tasks = await Task.find({user: res.locals.user});
        res.render('tasks', { tasks });

    }catch (error) {
        throw new Error(error)
    }
})
 
app.get('/tasks',requireUser, async (req, res) => {
    try {
        const tasks = await Task.find({user: res.locals.user});
        res.render('tasks', { tasks });

    }catch (error) {
        throw new Error(error)
    }
});

app.delete('/delete/task/:id',requireUser, async (req, res) => {

    try {        
        const { id } = req.params;
        await Task.deleteOne({_id:id })            
        res.redirect('/tasks');        

    }catch (error) {
        throw new Error(error)
    }
});

app.get('/updateForm/task/:id',async (req, res) => {

    try {        
        let task
        const { id } = req.params;
        task = await Task.findOne({_id:id});
        console.log(task)
        res.render('updateForm', {task})
    }catch (error) {
        throw new Error(error)
    }
});


app.put('/task/:taskId', (res, req)=>{
    console.log(req.body)    

    try {
        let taskId = req.params.taskId
        let update = req.body
        
        Task.findByIdAndUpdate(taskId, update, (err, taskUpdate)=>{
            if(err) res.status(500).send({message: `error al actualizar la tarea: ${err}`})
        })
        res.status(200).send({task: taskUpdated})
    } catch (error) {
        throw new Error(error)        
    }
})

app.get('/register', (req,res)=>{      
    res.render('register')    
})

app.post('/register', async(req,res)=>{
    try{ 
        const user = await User.create({
            email: req.body.email,
            password: req.body.password
        })
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
            return res.redirect('/tasks')
        }else{
            res.render('/login', {error: 'wrong email or password. Try again!'})
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