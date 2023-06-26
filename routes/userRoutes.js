const router =require('express').Router();
const User = require("../models/User");

//creating User
router.post("/",async(req, res)=>{
    try{
        const {name, email, password, picture} =req.body;
        console.log(req.body);
        const user = await User.create({name,email,password,picture});
        res.status(201).json(user);
    } catch(e){
        let mesg;
        if(e.code ===11000){
            mesg ="user already exists"
        }else{
            mesg =e.message;
        }
        console.log(e);
        res.status(400).json(mesg)
    }
})

//login user

router.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user =await User.findByCredentials(email,password);
        user.status ='online';
        await user.save();
        res.status(200).json(user);
    } catch(e){
        res.status(400).json(e.message) 
    }
})

module.exports = router;