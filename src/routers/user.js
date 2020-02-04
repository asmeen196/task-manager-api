const express = require('express')
const User = require('../models/user')
const auth =  require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendCancelationEmail} = require('../emails/account')
const router = new express.Router()

router.get('/', (req, res) => {
  res.send(req.body)
})
router.get('/user/me',auth,async (req,res)=>{
        res.status(200).send(req.user)
})

const avatar = multer({
    limits: {
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
        cb(new Error('Wrong File type'),undefined)
    }
    cb(undefined,true)

    }

})

router.post('/user/me/avatar',auth,avatar.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()        
    res.send()
},(error,req,res,next)=>{ 
        res.status(400).send({error:error.message})
})
router.get('/user/:id/avatar',async (req,res)=>{
    try{
     const user= await User.findById(req.params.id)
     if(!user||!user.avatar){
         throw new Error()
     }
     res.set('Content-Type','image/jpg')
     res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
})

router.delete('/user/me/avatar',auth,async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()

})

router.post('/user/signup',async (req,res)=>{
    const user = new User(req.body)
    try{
       sendWelcomeEmail(user.email,user.name)
       await user.save()
       const token = await user.generateAuthtoken()
       res.status(201).send({user,token})


    } catch(e){
        res.status(400).send(e)
    }
})

router.post('/user/login', async (req,res)=>{
    try {
        const user = await User.findByCredintals(req.body.email,req.body.password)
        const token = await user.generateAuthtoken()
       
        res.send({user,token})
    } catch(e){
            res.status(400).send('wrong credintals')
    }
})

router.post('/users/logout',auth, async (req,res)=>{
    try{    console.log(req.token)
           req.user.tokens = req.user.tokens.forEach((token)=>{
                return token.token !== req.token
           }) 

           await req.user.save()
           res.send('Logged Out')
    } catch {
                res.status(500).send()
    }
})

router.post('/users/logoutAll',auth, async (req,res)=>{
    try{    
           req.user.tokens = [ ]     
           await req.user.save()
           res.send('Logged Out From everywhere')
    } catch {
                res.status(500).send()
    }
})

router.patch('/user/me',auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>{return allowedUpdates.includes(update)})

    if(!isValidOperation){
        return res.status(404).send({'error':'invalid update'})
    }
    try{
        
      //  const user = await User.findById(req.user._id)
        updates.forEach((update)=> {
        req.user[update] = req.body[update] 
    })
    await req.user.save()
        
        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators: true})
     
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})


router.delete('/user/me',auth,async (req,res)=>{
   try{   
            await req.user.remove()
            sendCancelationEmail(req.user.email,req.user.name)
            res.send(req.user)
}
     catch(e) {
        res.status(500).send()
    }
})



module.exports = router