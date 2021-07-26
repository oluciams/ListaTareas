const mongoose = require('mongoose')

const URL = 'mongodb://localhost:27017/taskCRUD'

mongoose.connect(process.env.MONGO_DB_URL || URL, {
 useNewUrlParser: true,
 useUnifiedTopology: true
});
 
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {console.log('db connected')})