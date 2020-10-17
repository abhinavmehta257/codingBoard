
dotenv = require('dotenv').config();

var AccessToken = require('twilio').jwt.AccessToken;
let createAccessToken = (name, ROOMID)=>{

    try{var VideoGrant = AccessToken.VideoGrant;
        console.log(process.env.TWILIO_ACCOUNT_SID);
    // Substitute your Twilio AccountSid and ApiKey details
    const ACCOUNT_SID = dotenv.parsed.TWILIO_ACCOUNT_SID;
    const API_KEY_SID = dotenv.parsed.TWILIO_API_KEY;
    const API_KEY_SECRET = dotenv.parsed.TWILIO_API_SECRET;
    // var ACCOUNT_SID = 'AC3d6e8c655b2d44692b3ae8df9ce475ca';
    // var API_KEY_SID = "SKae0ef3a0826a6aa27a5993fc17ff1e64";
    // var API_KEY_SECRET = "process.env.TWILIO_API_SECRET";

    // Create an Access Token
    var accessToken = new AccessToken(
    ACCOUNT_SID,
    API_KEY_SID,
    API_KEY_SECRET
    );

    // Set the Identity of this token
    accessToken.identity = name;

    // Grant access to Video
    var grant = new VideoGrant();
    grant.room = ROOMID;
    accessToken.addGrant(grant);

    // Serialize the token as a JWT
    var jwt = accessToken.toJwt();
    return jwt;}
    catch(err){
            console.log(err);
    }
}

// console.log(createAccessToken("abi", "test"));

module.exports = {createAccessToken};