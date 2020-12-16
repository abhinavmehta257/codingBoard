const router = require('express').Router();
const express = require('express');
const User = require("../model/User");
const roomData = require("../model/roomData");
const path = require('path');
const {auth} = require('../validToken');
const {checkSubscriptionStatus} = require('../validToken');
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

router.get('/startclass',checkSubscriptionStatus, async (req,res)=>{
    user_id = req.user.id;
    const user = await User.findOne({_id:user_id});
    
    if(!user) return res.status(401).render('page-error', {title:'401',error_code:'401', error_message:'User is unauthorised to create room.'});
    classUrl = `/codingboard/room?name=${user.first_name}+${user.last_name}&roomId=${user.roomId}&lang=68&isAdmin=on`;
    roomDatas = new roomData({
        email:user.email,
        room:user.roomId
    });
    
    res.status(200).redirect(classUrl);
    try{
        roomdata = await roomData.findOne({email:roomDatas.email});
        if(roomdata){
            await roomData.updateOne({email:roomDatas.email},{$inc: {roomCreated:1}});
        }else{
            await roomDatas.save().catch(err => console.log(err)); 
        }
    }catch(err){
        console.log(err);
    }
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