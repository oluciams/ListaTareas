const express = require('express')
const app = express()
const path = require('path')
const methodOverride = require('method-override')

require('./configuration/configdb')

const Task = require('./models/modelTask')

const hbs = require('express-handlebars');


app.use(express.urlencoded({extended:true}))
app.use(express.json())

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
  
 app.get('/', async (req, res)=>{  
    try{
        res.render('index')
    } catch (error) {
        throw new Error(error)
    }
})

app.post('/', async(req,res)=>{
    try{
        const task = new Task(req.body);
        await task.save();
        const tasks = await Task.find();
        res.render('tasks', { tasks });

    }catch (error) {
        throw new Error(error)
    }
})
 
app.get('/tasks',async (req, res) => {
    try {
        const tasks = await Task.find();
        res.render('tasks', { tasks });

    }catch (error) {
        throw new Error(error)
    }
});

app.delete('/delete/task/:id',async (req, res) => {

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


app.listen(3000, ()=>console.log("running in port 3000"))