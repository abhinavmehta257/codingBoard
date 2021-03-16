const router = require('express').Router();
const User = require("../model/User");
const jwt = require('jsonwebtoken');
router.get('/verify',async (req,res)=>{
   console.log(req.query.id);
   userinfo = jwt.verify(req.query.id, process.env.TOKEN_SECRET);
   if(!req.query.id) return res.status(404).render('show-messsage',{error:'ERROR',message:'Somehing went wrong, please try again'});

   const user = new User({
        first_name:userinfo.first_name,
        last_name:userinfo.last_name,
        email:userinfo.email,
        password:userinfo.password,
        trial_end:userinfo.trial_end,
        roomId:userinfo.roomId
    });
    
    try{
        await user.save().catch(err => console.log(err)); 
        res.render('show-message',{message:'Signup Success. You can login now'});
    }catch(err){
        console.log(err);
    }
})

module.exports = router;