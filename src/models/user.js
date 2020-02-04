const mongoose = require('mongoose')
const validator = require('validator')
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')
const userShcema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    age : {
        type:Number,
        default: 0,
        validate(value) {
            if(value<0) {
                throw new Error('Age should be positive')
            }         
        },
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value) { 
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value) {
            if(value.toLowerCase().includes("password")){
                throw new Error('Password is weak')
            }
        }
    },
    tokens :[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar :{
        type:Buffer
    }

},{
    timestamps:true
})

userShcema.methods.generateAuthtoken = async function () {
    const user = this
    const token =  jwt.sign({_id:user._id.toString()},process.env.JWT_SECERT)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userShcema.methods.toJSON = function() {
    const user = this
    const userobject = user.toObject()
    delete userobject.password
    delete userobject.tokens
   return userobject
}
userShcema.statics.findByCredintals = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('unable to login')
    }
     isMatch = await bycrypt.compare(password,user.password)
     if(!isMatch){
         throw new Error('unable to login')
     }
  
     return user
  }


userShcema.pre('save',async function (next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bycrypt.hash(user.password,8)
    }
    next()
})

userShcema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})
userShcema.virtual('tasks',{
    ref:'Task',
    localField: '_id',
    foreignField : 'owner'
})
const User = mongoose.model('User',userShcema)


module.exports = User