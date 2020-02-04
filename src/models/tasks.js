const mongoose = require('mongoose')
const taskSchema = new mongoose.Schema({
    description :{
        type:String,
        required:true,
        trim:true
    },
    completed :{
        type:Boolean,
        default:false,
        required:false
    },
    owner :{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})

const tasks = mongoose.model('Task',taskSchema)

module.exports = tasks