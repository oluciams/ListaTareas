const mongoose = require ('mongoose')


const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title:{
        type: String, 
        required: true
    },
    description: String,     
    status: {
        type: Boolean,
        default: false
    },
    date: { 
        type: Date,
        default: Date.now()
    }    
})

module.exports = mongoose.model('tasks', taskSchema) 