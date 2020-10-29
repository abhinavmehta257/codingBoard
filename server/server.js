const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/isRealString');
const {Users} = require('./utils/users');
const {Rooms} = require('./utils/rooms');
dotenv = require('dotenv').config();


const publicPath = path.join(__dirname, '/../public');
const homePath = path.join(__dirname, '/../homePage');
const adminPath = path.join(__dirname, '/admin.html');
const chatPath = path.join(__dirname, '/../public/chat.html');
const port = process.env.PORT || 3000
let app = express();
let server = http.createServer(app);
let io = socketIO(server,{
  pingInterval: 25000,
  pingTimeout: 15000,
  cookie: false
});

let users = new Users();
let roomList = new Rooms();
app.use(express.static(publicPath));

app.use("/codingboard",express.static(chatPath));
app.use("/home",express.static(homePath));
app.use("/adminPanal",express.static(adminPath));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get("/codingboard", function(req,res){
  console.log(req.params.name);
})
//admin
app.post("/adminPanal",(req,res)=>{
  if(req.body.name == "abhinav" && req.body.password == "vaishu@26912")
  res.send({users, roomList});
  else
  res.send("You are not admin");
})

//ioconnection
io.on('connection', (socket) => {
 
  
    socket.on('join', (params, callback) => {
        try {
          if(!isRealString(params.name)){
            return callback('Name and room are required');
          }
          if(params.isAdmin == 'on' && !roomList.getRoom(params.roomId)){
            params.isAdmin = true;
            roomList.addRoom(params.roomId);
          }else if(roomList.getRoom(params.roomId) && params.isAdmin == 'on'){
            return callback("Room alredy exist");
          }else{
            if(!roomList.getRoom(params.roomId)){
            return callback("room donot exist try again");}
          }
      
          socket.join(params.roomId);
          users.removeUser(socket.id);
          users.addUser(socket.id, params.name, params.roomId, params.isAdmin);

          console.log("A new user just connected", params);
          io.to(params.roomId).emit('updateUsersList', users.getUserList(params.roomId));
          if(params.isAdmin){
            socket.emit("youAreNewAdmin",{ isAdmin : true });
            socket.emit('newMessage', generateMessage('Coding Room', `Welocome Admin😊`,'Admin'));
          }else{
            socket.emit('newMessage', generateMessage('Admin', `Welocome 😊`,'all'));
          }
          
          callback();
        
        } catch (error) {
          socket.emit('connectionError',{error:"connection Error"});
          users.removeUser(socket.id);
          socket.disconnect();
        }
    });
      
    socket.on("getCode",(data)=>{
      try{
        admin = users.checkIsAdmin(data.senderId);
        if(admin){
          io.sockets.sockets[data.userId].emit("giveCode",data)
        }
      }catch(err){
        console.log(err);
      }
      
    });

    socket.on("sendCode",(codeData,callback)=>{
        try{
          user = users.getUser(codeData.from)
          userTo= users.getUser(codeData.to)
          if(codeData.to == "all"){
            if(user.isAdmin){
              socket.broadcast.to(user.roomId).emit("gotCode",{codeData,user});
              callback("code send to all");
            }else{
              callback("you don't have permission to send code to all");
            }
          }else{
            io.sockets.sockets[codeData.to].emit("gotCode",{codeData,user});
            callback("code send to "+userTo.name);
          }
          // console.log("server got code",codeData);
        }catch(err){
          console.log(err);
        }
    })

    socket.on('createMessage', (message, callback) => {
      try{
        let user = users.getUser(socket.id);

        if(message.to == 'all'){
          if(user && isRealString(message.text)){
            to='all';
            io.to(user.roomId).emit('newMessage', generateMessage(user.name, message.text, to));
          }
        }else{
          if(user && isRealString(message.text)){
            to = "admin"
            admin = users.getRoomAdmin(user.roomId);
            io.to(admin.id).emit('newMessage', generateMessage(user.name, message.text, to));
            io.to(socket.id).emit('newMessage', generateMessage(user.name, message.text, to));
          }
        }
        
        callback('This is the server:');
      }catch(err){
        console.log(err);
      }
    });

    socket.on('removeUser',(data)=>{
      try{
        console.log("remove user called");
        isAdmin = users.checkIsAdmin(data.senderId);
        // console.log(isAdmin);
        // console.log(data.userId);
        if(isAdmin){
          let user = users.getUser(data.userId);
          // console.log(user);
          if(user && !user.isAdmin){
            console.log(`user ${data.senderId} does have permission to remove user`);
            io.to(user.roomId).emit('updateUsersList', users.getUserList(user.roomId));
            io.sockets.sockets[user.id].disconnect();
          }else{
            console.log(`user: ${data.senderId} does not have permission to remove user: ${data.userId}`);
          }
        }
      }catch(err){
        console.log(err);
      }
      
    })
    
    socket.on("raiseHand", (id)=>{
      try{
        let user = users.getUser(id);
          name = user.name;
          // console.log(users.getRoomAdmin(user.roomId));
          io.sockets.sockets[users.getRoomAdmin(user.roomId).id].emit("handRaised",name);
        }catch(err){
          console.log(err);
        }
    })

    socket.on("submitAssignment",(resultData)=>{
      try{
        user = users.getUser(resultData.from);
        admin = users.getRoomAdmin(user.roomId);
        io.sockets.sockets[admin.id].emit("gotAssignment",{resultData,user});
      }catch(err){
        console.log(err);
      }
    });

    socket.on("makeAdmin", (user)=>{
      try{
        newAdmin = users.getUser(user.id);
        if(newAdmin.isAdmin != true ){
          newAdmin.isAdmin = true;
          previousAdmin = users.getRoomAdmin(newAdmin.roomId);
          previousAdmin.isAdmin = false;
          io.to(newAdmin.id).emit('youAreNewAdmin', { isAdmin : true });
          io.to(newAdmin.roomId).emit('updateUsersList', users.getUserList(newAdmin.roomId));
        }
      }catch(err){
        console.log(err);
      }
      
    })

    socket.on('disconnect', (reason) => {
      let user = users.removeUser(socket.id);
      try{
        if (reason === 'io server disconnect') {
          socket.connect();
        }else{
          if(user){
            if(users.getUserList(user.roomId).length ==0){
              roomList.removeRoom(user.roomId);
            
            }else{
              if(user.isAdmin){
                newAdmin = users.getUserList(user.roomId)[0];
                newAdmin.isAdmin = true;
                io.to(user.roomId).emit('updateUsersList', users.getUserList(user.roomId));
                
                io.to(newAdmin.id).emit('youAreNewAdmin', { isAdmin : true });
              }else{
                io.to(user.roomId).emit('updateUsersList', users.getUserList(user.roomId));
                
              }
              
            }
          }
        }
      
      }catch(err){
        console.log(err);
        socket.emit('connectionError',{error:"connection Error"});
        users.removeUser(socket.id);
        // var roomId = users.getRoomId(socket.id).roomId;
        
        socket.disconnect();
      }
    });
    
    socket.on('error', (error) => {
      console.log("socket error: ",error,"user: ",users.getUser(socket.id));
    });
    socket.on('connect_error', (error) => {
      console.log("Connection Error: ",error,"user: ",users.getUser(socket.id));
    });
    socket.on('connect_timeout', (timeout) => {
      console.log("connection timeout: ",timeout,"user: ",users.getUser(socket.id));
    });
    socket.on('reconnect', (attemptNumber) => {
      console.log("Reconnect: ", attemptNumber,"user: ",users.getUser(socket.id));
    });
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log("reconnect attempt: ",attemptNumber,"user: ",users.getUser(socket.id));
    });
    socket.on('reconnecting', (attemptNumber) => {
      console.log("reconnecting: ",attemptNumber,"user: ",users.getUser(socket.id));
    });
    socket.on('reconnect_error', (error) => {
      console.log("Reconnect Error: ",error,"user: ",users.getUser(socket.id));
    });
    socket.on('reconnect_failed', () => {
      console.log("failed to reconnect: ","user: ",users.getUser(socket.id));
    });
    // socket.on('ping', () => {
    //   console.log("ping to user: ",users.getUser(socket.id));
    // });
    // socket.on('pong', (latency) => {
    //   console.log("pong from user: ",users.getUser(socket.id),"latency: ",latency);
    // });
});    

server.listen(port, ()=>{
  console.log(`Server is up on port ${port}`);
})
