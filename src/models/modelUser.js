const mongoose = require ('mongoose')
const bcrypt = require ('bcrypt')


const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email:{
        type: String, 
        unique: true,
        lowercase: true,
        trim: true,
        required: [true, 'is required']
    },
    password: {
        type: String, 
        required: [true, 'is required']
    }    
})


UserSchema.pre('save', async function (next){
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash
        next()
    });

// UserSchema.methods.comparePassword = async function (password) {
//         return await bcrypt.compare(password, this.password);
//     }
    
UserSchema.statics.authenticate = async (email, password)=> {
    const user = await mongoose.model('User').findOne({email: email})
    if(user){
        return new Promise ((resolve, reject)=>{
            bcrypt.compare(password, user.password, (err, result)=>{
                if(err) reject(err)
                resolve(result === true ? user : null)
            })
        })
        return user
    }
    return null
}

module.exports = mongoose.model('User', UserSchema) 