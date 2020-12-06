const router = require('express').Router();
const roomMessages = require('../model/message');

router.get('/getMessages',async (req,res)=>{
   messages = await roomMessages.findOne().catch(err =>console.log(err));
    res.json(messages)
    // console.log(messages);
});

router.post('/newMessages', async (req, res)=>{
   const roomalerts = new roomMessages({
        info:req.body.info,
        messages: req.body.message,
        alerts: req.body.alerts
    });
    // console.log('req', req.body, "room", roomalerts);
    // res.json(roomalerts);
    await roomalerts.save().catch(err =>console.log(err)); 
})

module.exports = router;