const router = require('express').Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const {loginValidation, registerValidation} = require("../validation");
const generateRoomId = require('../server/utils/generateRoomId');
// const { date } = require('@hapi/joi');


//register
router.get("/register",(req,res)=>{
  const usertoken = req.cookies['authentication'];
    if(usertoken) if (jwt.verify(usertoken, process.env.TOKEN_SECRET)) return res.redirect('/dashboard');
  res.render('register');
});
  //login
router.get("/login",(req,res)=>{
  const usertoken = req.cookies['authentication'];
    if(usertoken) if (jwt.verify(usertoken, process.env.TOKEN_SECRET)) return res.redirect('/dashboard');
  res.render('login');
});
  
router.post("/register",async (req,res)=>{
    // Validation
    const {error} = registerValidation(req.body);

    //check user exist 
    const emailExist = await User.findOne({email:req.body.email}).catch(err => console.log(err));

    if(emailExist) return res.status(400).render('register',{error:'User alredy exist please login'});
    
    //hash
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    roomId = new generateRoomId(10);
    //creatw new user
    if(error) return res.status(400).render('register',{error:error.details[0].message});
    const user = new User({
        first_name:req.body.first_name,
        last_name:req.body.last_name,
        email:req.body.email,
        password:hashedPassword,
        trial_end: new Date(Date.now() + 604800000),
        roomId: roomId.generate()
    });
    try {
        await user.save().catch(err => console.log(err)); 
        res.render('register',{title:'register',error:'Signup Success. Please login'});
    } catch (error) {
        res.status(400).send(error); 
    }
});

router.post("/login",async (req,res)=>{
    
     // Validation
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send({error:error.details[0].message});
    // if(error) return res.status(400).render('login', {title:'Login',error:error.details[0].message});
    //check user exist 
    const user = await User.findOne({email:req.body.email}).catch(err => console.log(err));
    if(!user) return res.status(400).send({error:"Email Or Password is wrong"});
    // if(!user) return res.status(400).render('login', {title:'Login',error:"Email Or Password is wrong"});
    //check pass
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass){
       return res.status(400).send({error:"Email Or Password is wrong"});
      //  return res.status(400).render('login', {title:'Login',error:"Email Or Password is wrong"});
    }else{
    //create auth token
      const token = jwt.sign({id: user._id}, process.env.TOKEN_SECRET);
      res.setHeader('auth-token', token);
      res.send();
    }
},function(err) {
  console.log(err);
});

router.get('/logout',(req,res)=>{
  res.cookie('authentication','',{maxAge: 1});
  res.redirect('/');
})
module.exports = router;