const User = require('../models/user')
const jwt = require('jsonwebtoken')
const auth =  async (req,res,next)=>{
  try{
  token = req.header('Authorization').replace('Bearer ','')
  const decode  = jwt.verify(token,process.env.JWT_SECERT)
  const user = await User.findOne({_id:decode._id,'tokens.token':token})
  if(!user){
      throw new Error()
  }
 
  req.user = user
  req.token = token
  next()
      }catch(e){
          res.status(401).send({'error':'Please authenticate'})
  
    }
}

module.exports = auth