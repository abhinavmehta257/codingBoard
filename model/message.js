const mongoose = require('mongoose');

const codingRoomMessages = new mongoose.Schema({
    info:{
        type:String,
        required:false
    },
    messages:{
        type:String,
        required:false
    },
    alerts:{
        type:String,
        required:false
    }

});

module.exports = mongoose.model('codingRoomMessages', codingRoomMessages);