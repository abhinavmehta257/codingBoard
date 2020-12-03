const router = require('express').Router();
const express = require('express');
const User = require("../model/User");
const path = require('path');
const {auth} = require('../validToken');
const { json } = require('express');


const publicPath = path.join(__dirname, '../public');

router.use('/room',express.static(publicPath));

router.get('/',(req,res)=>{
    classStarted = true;
    if(!classStarted){
        return res.render('waiting-room');
    }else{
        res.redirect('./join');
    }
});

router.get('/startclass',auth, async (req,res)=>{
    user_id = req.user.id;
    const user = await User.findOne({_id:user_id});
    if(user.subscription_status !='active'){
        let today = new Date();
        if(user.trial_end-today<=0){
            return res.status(401).render('page-error', {title:'400',error_code:'400', error_message:'Your trial period has ended please subscribe'});
        }
    } 
    if(!user) return res.status(401).render('page-error', {title:'401',error_code:'401', error_message:'User is unauthorised to create room.'});
    classUrl = `/codingboard/room?name=${user.first_name}+${user.last_name}&roomId=${user.roomId}&lang=68&isAdmin=on`;
    res.status(200).redirect(classUrl);
})


router.get('/join',(req,res)=>{

    classStarted = true;
    if(!classStarted){
        return res.render('waiting-room');
    }else{
        res.render('join',{title:'Join Room'});
    }
    
});
module.exports = router;