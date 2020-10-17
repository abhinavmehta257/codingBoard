$("<link/>", {
    rel: "stylesheet",
    type: "text/css",
    href: "/css/admin.css"
}).appendTo("body");
// $('.raiseHand img').attr('src','images/share-square-solid.png');

// $('.raiseHand').attr('onclick','shareScreen()');
// $('.raiseHand #text').html("share screen");

function shareScreen(){
  socket.emit("shareScreen");
}

//remove user
function removeUser(btn){
    userId = btn.id;
    senderId = socket.id;
    // console.log(userId);
    data = {userId, senderId}
    let removeUser = confirm(`Do you want to remove the user`);
    if(removeUser){
        socket.emit('removeUser',data);
    }
};

function getCode(btn){
    userId = btn.id;
    senderId = socket.id;
    data = {userId, senderId}
    socket.emit("getCode",data)
}

function sendCode(btn){
    var to = btn.id;
    // console.log(to);
    to.trim();
  var from = socket.id;
  // console.log(to);
  
  // activeEditorname = layout.root.contentItems[ 0 ].contentItems[0].getActiveContentItem().componentName
  // activeEditor = editors.filter((editor)=>editor.editorId == activeEditorname);
  activeEditorCode = layout.root.contentItems[ 0 ].contentItems[0].getActiveContentItem().container.getElement()[0].getElementsByClassName("view-lines")[0].innerText;

  // console.log(activeEditorCode);
    if(activeEditorCode){
        codeString = encode(activeEditorCode);
    }else{
     codeString = encode(sourceEditor.getValue());
    }
    
  codeData = {
    to,from,codeString
  }
  socket.emit("sendCode",codeData);
}
const raiseHandSound = new sound("../Mallet.mp3");
socket.on("handRaised", function(name){

  const template = document.querySelector('#snackbar-temp').innerHTML;
    const newUserTemplate = Mustache.render(template,{
      Name:name
    })
    let p = document.createElement("div");
    p.innerHTML = newUserTemplate;

  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
    x.innerHTML = p.innerHTML;
  // Add the "show" class to DIV
  x.className = "show";
  raiseHandSound.play();
  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
});

function makeAdmin(id){
  socket.emit("makeAdmin",{id});
    socket.emit("muteVideo");
    socket.emit("muteAudio");
    $('.admin').hide();
   
}