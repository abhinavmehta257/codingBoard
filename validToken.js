const jwt = require('jsonwebtoken');
const User = require("./model/User");

 auth = function (req,res,next) {
    const token = req.cookies['authentication'];
    if(!token) return res.status(401).redirect('/login');

    try{
        const verified  = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    }catch(err){
        res.status(403).render('page-error', {title:'403',error_code:'403', error_message:'Forbidden Error.'});
    }
}
verifyAdmin = function (token) {
    
        if(!token) return res.status(401).render('page-error', {title:'401',error_code:'401', error_message:'User is unauthorised to create room.'});
        try{
            const verified  = jwt.verify(token, process.env.TOKEN_SECRET);
            if(!verified) return res.status(401).render('page-error', {title:'401',error_code:'401', error_message:'User user unauthorised to create room.'});
        }catch(err){
            res.status(403).render('page-error', {title:'403',error_code:'403', error_message:'Forbidden Error.'});
        }
}

checkSubscriptionStatus = async function(req,res,next){
    const token = req.cookies['authentication'];
    if(!token) return res.status(401).redirect('/login');

    try{
        const verified  = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        user_id = req.user.id;
        const user = await User.findOne({_id:user_id});
        if(user.subscription_status !='active'){
            let today = new Date();
            if(user.trial_end-today<=0){
                return res.status(401).render('page-error', {title:'Trial period Expire',error_message:'Your trial period has ended please purchase a plan'});
            }
        } 
        next();
    }catch(err){
        res.status(403).render('page-error', {title:'403',error_code:'403', error_message:'Forbidden Error.'});
    }   
}


module.exports.auth = auth;
module.exports.verifyAdmin = verifyAdmin;
module.exports.checkSubscriptionStatus = checkSubscriptionStatus;
