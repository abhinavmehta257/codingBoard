const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {createAccessToken} = require("./utils/generateAccessToken");
const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/isRealString');
const {Users} = require('./utils/users');
const {Rooms} = require('./utils/rooms');
dotenv = require('dotenv').config();
const client = require('twilio')(dotenv.parsed.TWILIO_ACCOUNT_SID, dotenv.parsed.TWILIO_AUTH_TOKEN);


const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();
let roomList = new Rooms();
app.use(express.static(publicPath));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


let newmember;
// Access the parse results as request.body
app.post('/chat.html', function(request, response){
  // console.log(request.body);
  newmember = request.body;
  if(request.body.isAdmin == 'on' && !roomList.getRoom(newmember.roomId)){
    newmember.isAdmin = true;
    roomList.addRoom(newmember.roomId);
  }
  if(roomList.getRoom(newmember.roomId) && request.body.isAdmin == 'on'){
    response.send("Room alredy exist");
  }
  if(roomList.getRoom(newmember.roomId) || newmember.isAdmin){
    response.redirect("/chat.html");
  }else{
    response.send("room donot exist try again");
  }
  
}) 

io.on('connection', (socket) => {
  // console.log("A new user just connected");
  console.log("A new user just connected: ",newmember);

  socket.emit('newmember',newmember, ()=>{});
  newmember = null;
  
  socket.on('join', (params, callback) => {
      try {
        if(!isRealString(params.name)){
          return callback('Name and room are required');
        }
    
        socket.join(params.roomId);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.roomId, params.isAdmin);

        token = createAccessToken(params.name, params.roomId);
        roomData = {token, params}
        // console.log(roomData);
        socket.emit("AccessToken",roomData);

        io.to(params.roomId).emit('updateUsersList', users.getUserList(params.roomId));
        if(params.isAdmin){
        socket.emit('newMessage', generateMessage('Coding Room', `Welocome Admin😊`));
        }else{
          socket.emit('newMessage', generateMessage('Admin', `Welocome 😊`));
        }
        
        callback();
      } catch (error) {
        socket.emit('connectionError',{error:"connection Error"});
        users.removeUser(socket.id);
        socket.disconnect();
      }
  });
    
  socket.on("getCode",(data)=>{
    admin = users.checkIsAdmin(data.senderId);

    if(admin){
      io.sockets.sockets[data.userId].emit("giveCode",data)
    }
  })

  socket.on("sendCode",(codeData)=>{
    user = users.getUser(codeData.from)
    io.sockets.sockets[codeData.to].emit("gotCode",{codeData,user});
    // console.log("server got code",codeData);
  })

  socket.on('createMessage', (message, callback) => {
    let user = users.getUser(socket.id);

    if(user && isRealString(message.text)){
        io.to(user.roomId).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback('This is the server:');
  })

  socket.on('removeUser',(data)=>{
    console.log("remove user called");
    isAdmin = users.checkIsAdmin(data.senderId);
    // console.log(isAdmin);
    // console.log(data.userId);
    if(isAdmin){
      let user = users.getUser(data.userId);
      // console.log(user);
      if(user){
        console.log(`user ${data.senderId} does have permission to remove user`);
        io.to(user.roomId).emit('updateUsersList', users.getUserList(user.roomId));
        io.sockets.sockets[user.id].disconnect();
      }else{
        console.log(`user: ${data.senderId} does not have permission to remove user: ${data.userId}`);
      }
    }
  })
  
  socket.on("raiseHand", (id)=>{
   let user = users.getUser(id);
    name = user.name;
    // console.log(users.getRoomAdmin(user.roomId));
    io.sockets.sockets[users.getRoomAdmin(user.roomId).id].emit("handRaised",name);
  })



  socket.on("muteAudio",()=>{
      socket.emit("muteAudio");
  });

  socket.on("muteVideo",()=>{
    user = users.getUser(socket.id);
    if(users.getRoomAdmin(user.roomId)){
    socket.emit("muteVideo");
    }
  });

  socket.on("unmuteAudio",()=>{
    socket.emit("unmuteAudio");
  });

  socket.on("unmuteVideo",()=>{
    user = users.getUser(socket.id);
    if(users.getRoomAdmin(user.roomId)){
    socket.emit("unmuteVideo");
    }
  });

  socket.on("shareScreen",()=>{
    user = users.getUser(socket.id);
    if(users.getRoomAdmin(user.roomId)){
    socket.emit("shareScreen");
    }
  });

  socket.on("makeAdmin", (user)=>{
    newAdmin = users.getUser(user.id);
    if(newAdmin.isAdmin != true ){
      newAdmin.isAdmin = true;
      previousAdmin = users.getRoomAdmin(newAdmin.roomId);
      previousAdmin.isAdmin = false;
      io.to(newAdmin.id).emit('youAreNewAdmin', { isAdmin : true });
      io.to(newAdmin.roomId).emit('updateUsersList', users.getUserList(newAdmin.roomId));
    }
    
  })


  socket.on('disconnect', () => {
    let user = users.removeUser(socket.id);
    try{
      if(users.getUserList(user.roomId).length ==0){
        roomList.removeRoom(user.roomId);
        client.video.rooms(user.roomId)
                    .fetch()
                    .then(room => console.log(room.uniqueName + " is completed"));
      }else{
        if(user.isAdmin){
          newAdmin = users.getUserList(user.roomId)[0];
          newAdmin.isAdmin = true;
          io.to(user.roomId).emit('updateUsersList', users.getUserList(user.roomId));
          
          io.to(newAdmin.id).emit('youAreNewAdmin', { isAdmin : true });
        }else{
          io.to(user.roomId).emit('updateUsersList', users.getUserList(user.roomId));
          
        }
        client.video.rooms(user.roomId)
                    .fetch()
                    .then(room => {
                      room.on('disconnected', room => {
                      // Detach the local media elements
                      room.localParticipant.tracks.forEach(publication => {
                        const attachedElements = publication.track.detach();
                        attachedElements.forEach(element => element.remove());
                      });
                    })
                    room.disconnect()});
      }
      
      
    }catch(err){
      console.log(err);
      socket.emit('connectionError',{error:"connection Error"});
      users.removeUser(socket.id);
      var roomId = users.getRoomId(socket.id).roomId;
      client.video.rooms(roomId)
                    .fetch()
                    .then(room => {
                      room.on('disconnected', room => {
                      // Detach the local media elements
                      room.localParticipant.tracks.forEach(publication => {
                        const attachedElements = publication.track.detach();
                        attachedElements.forEach(element => element.remove());
                      });
                    })
                    room.disconnect()});
      socket.disconnect();
    }
    
  });
});    

server.listen(port, ()=>{
  console.log(`Server is up on port ${port}`);
})
