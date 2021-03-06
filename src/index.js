const express = require('express')
require('../src/db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const Task = require('./models/tasks')
const app = express()
const port = process.env.PORT 

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Server is up and running '+port)
})

