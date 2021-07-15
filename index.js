const express = require('express')
const app = express()
const path = require('path')

require('./configuration/configdb')

const Task = require('./models/modelTask')

const hbs = require('express-handlebars');


app.use(express.urlencoded({extended:true}))
app.use(express.json())

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
 



app.listen(3000, ()=>console.log("running in port 3000"))