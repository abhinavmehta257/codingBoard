const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true,
        min:6,
        max:255
    },
    last_name:{
        type:String,
        required:true,
        min:6,
        max:255
    },
    email:{
        type:String,
        required:true,
        min:6,
        max:255
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:1024
    },
    roomId:{
        type:Number,
        required:true,
    },
    schedule:{
        type:[],
        required:false
    },
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);