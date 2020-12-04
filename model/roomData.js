const mongoose = require('mongoose');

const roomDataSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    room:{
        type:String,
        required:true,
    },
    roomCreated:{
        type:Number,
        required:false,
        default:1
    }
});


module.exports = mongoose.model('roomData', roomDataSchema);