const router = require('express').Router();
const {auth} = require('../validToken');
const User = require("../model/User");
const {scheduleValidation} = require("../validation");
const generateRoomId = require('../server/utils/generateRoomId');

router.get('/',auth, async (req,res)=>{
    user_id = req.user.id;
    const user = await User.findOne({_id:user_id}).catch(err => console.log(err));
    if(!user) return res.status(400).render('login', {title:'Login',error:"User doesn't exist, please sign up"});
    userInfo = {
        name:`${user.first_name} ${user.last_name}`,
        email: user.email,
        roomId: user.roomId
    }
    let today = new Date();
    if(user.subscription_status != 'active'){
        trial = Math.floor(parseInt(user.trial_end-today)/86400000);
        if(trial<0){
            trial='0';
        }
    }else{
        trial = false
    }
    // console.log(req.url);
    res.render('userInfo',{dashboard:true,user:userInfo,layout:'dashboard',trial_left:trial});
});

router.get('/schedule',auth,async (req,res)=>{
    const user = await User.findOne({_id:user_id}).catch(err => console.log(err));
    if(!user) return res.status(400).render('login', {title:'Login',error:"User doesn't exist, please sign up"});
    let today = new Date();
    if(user.subscription_status != 'active'){
        trial = Math.floor(parseInt(user.trial_end-today)/86400000);
        if(trial<0){
            trial='0';
        }
    }else{
        trial = false
    }
    res.render('schedule',{schedule:true,layout:'dashboard',trial_left:trial});
});
router.get('/upcomming',auth, async (req,res)=>{
    user_id = req.user.id;
    const user = await User.findOne({_id:user_id}).catch(err => console.log(err));
    if(!user) return res.status(400).render('login', {title:'Login',error:"User doesn't exist, please sign up"});
    let today = new Date();
    if(user.subscription_status != 'active'){
        trial = Math.floor(parseInt(user.trial_end-today)/86400000);
        if(trial<0){
            trial='0';
        }
    }else{
        trial = false
    }
    todayDate = today.toISOString().split('T')[0];
    todayTime = `${today.getHours()}:${today = today.getMinutes()}`;
    
    classes = user.schedule;
    // classes = classes.filter((classes) =>classes.date >= todayDate || classes.time >=todayTime);
    res.render('upcomming-classes',{upcomming:true,classes:classes,layout:'dashboard',trial_left:trial});
});

router.post('/schedule',auth, async (req,res)=>{
    // res.send("class scheduled");
    const {error} = scheduleValidation(req.body);

    if(error) return res.status(400).render('schedule',{error:error.details[0].message,layout:'dashboard'});
    classId = new generateRoomId(4);
    // console.log(classId.generate());
    user_id = req.user.id;
    schedule = {
        topic:req.body.topic,
        language:req.body.lang,
        date:req.body.date,
        time:req.body.time,
        classCode: classId.generate()
    }
    const user = await User.updateOne({_id:user_id},{$push:{schedule:schedule}}).catch(err => console.log(err));
    if(!user) return res.status(400).render('login', {title:'Login',error:"User doesn't exist, please sign up"});
    res.status(200).render('schedule-success',{layout:'dashboard'});
})
module.exports = router;