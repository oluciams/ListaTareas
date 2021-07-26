const app = require('../index')

const requireUser = (req, res, next) => {
    if(!res.locals.user){
        return res.redirect('/login')            
    }
    next()    
 }

 module.exports = {
     requireUser
 }