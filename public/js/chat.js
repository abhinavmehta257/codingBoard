let socket = io();
window.editors = [];
let editorNumber=1;
let numberOfChat = 0;
let searchQuery = window.location.search.substring(1);
let params = JSON.parse('{"' + decodeURI(searchQuery ).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g, '":"') + '"}');
  console.log(params);
//function used
function scrollToBottom() {
  let messages = document.querySelector('#messages').lastElementChild;
  messages.scrollIntoView();
}

isStream = false;
isPreviouslyStreamed = false;
previouslyStreamedEditor=[];
firstTimeStream = true;
function startStream(sourceEditor){
  require(["MonacoCollabExt"], function (MonacoCollabExt) {
  // activeEditorname = layout.root.contentItems[ 0 ].contentItems[0].getActiveContentItem().componentName
    
  //   if(activeEditorname && activeEditorname!='source'){
  //     activeEditor = editors.filter((editor)=>editor.editorId == activeEditorname)[0].newEditor;
  //     stream = activeEditor;
  //   }else{
  //     stream = sourceEditor;
  //   }
  
    const sourceContentManager = new MonacoCollabExt.EditorContentManager({
          editor: sourceEditor,
          onInsert(index, text) {
          if(isStream){
          let action ='onInsert';
          socket.emit("stream",{action,index,text});
        }
          },
          onReplace(index, length, text) {
          if(isStream){
          let action ='onReplace';
          socket.emit("stream",{action,index,length,text});
          }
          },
          onDelete(index, length) {
          if(isStream){
          let action ='onDelete';
          socket.emit("stream",{action,index,length});
          }
          }
        });
    
  });
  
    sourceEditor.onDidChangeCursorPosition(e => {
      const offset = sourceEditor.getModel().getOffsetAt(e.position);
      if(isStream){
      action = 'onDidChangeCursorPosition'
      socket.emit("stream",{action,offset});
      }
    });

    sourceEditor.onDidChangeCursorSelection(e => {
      const startOffset = sourceEditor.getModel().getOffsetAt(e.selection.getStartPosition());
      const endOffset = sourceEditor.getModel().getOffsetAt(e.selection.getEndPosition());
      if(isStream){
      action = 'onDidChangeCursorSelection';
      socket.emit("stream",{action,startOffset,endOffset});
      }
    });
  }

function encode(str) {
  return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
  var escaped = escape(atob(bytes || ""));
  try {
      return decodeURIComponent(escaped);
  } catch {
      return unescape(escaped);
  }
}

function getDate() {
  
  var d = new Date();
    let date = d.toString();
  var hh = d.getHours();
  var m = d.getMinutes();
  var s = d.getSeconds();
  var dd = "AM";
  var h = hh;
  if (h >= 12) {
    h = hh - 12;
    dd = "PM";
  }
  if (h == 0) {
    h = 12;
  }
  m = m < 10 ? "0" + m : m;

  s = s < 10 ? "0" + s : s;

 
  h = h<10?"0"+h:h;
 var replacement = h + ":" + m;

  replacement += " " + dd;

  return replacement;
}

socket.on('connect', function() {
  console.log("shocket connected");
  
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
  const authToken = getCookie('authentication');
  
    socket.emit('join', {params,authToken}, function(err) {
      if(err){

        alert(err)
        window.location.href = '/';
      }else {

      }
    });

  socket.on('connectionError', function(error){
    showError("Connection Error", "connection error occured please reconnect");
    window.location.href = '/';
  })
});

socket.on('disconnect', function() {
  showError('Disconnect', 'You are disconnected from server.');
  // alert('disconnected from server.');
  window.location.href = '/';
  
});

socket.on('updateUsersList', function (users) {
  let ol = document.createElement('ul');
  $('#numberOfUser').text(`Users(${users.length})`);
  // console.log(users);
  users.forEach(function (user) {
    const template = document.querySelector('#participent-template').innerHTML;
    const newUserTemplate = Mustache.render(template,{
      User:user,
      func:'getCodeStream(this)'
    })
    let li = document.createElement('li');
    li.innerHTML = newUserTemplate;
    li.setAttribute('class','participant')
    li.setAttribute('data-id' , `${user.id}`);
    ol.appendChild(li);
  });
  let usersList = document.querySelector('#users');
  usersList.innerHTML = "";
  usersList.appendChild(ol);
});

socket.on('newMessage', function(message) {
  numberOfChat++;
  $("#Nochat").show();
  $("#Nochat").text(`${numberOfChat}`);
  const formattedTime = getDate();
  const template = document.querySelector('#message-template').innerHTML;
  const newMessageTemplate = Mustache.render(template, {
    from: message.from,
    text: message.text,
    to: message.to,
    createdAt: formattedTime
  });

  const div = document.createElement('div');
  div.innerHTML = newMessageTemplate

  document.querySelector('#messages').appendChild(div);
  scrollToBottom();
});

document.querySelector('#submit-btn').addEventListener('click', function(e) {
  e.preventDefault();

  socket.emit("createMessage", {
    text: document.querySelector('input[name="message"]').value,
    to: document.querySelector('#messageTo').value
  }, function() {
    document.querySelector('input[name="message"]').value = '';
  })
})

socket.on('youAreNewAdmin',function(isAdmin){
  if(isAdmin){
   $.getScript('./js/adminWindow.js', function() {
      console.log("admin script loaded");
   });
   $(".admin").show(); 
  }else{
    console.log("wrong person");
  }
});

socket.on("giveCode",function(data){
  var to = data.senderId;
  var from = socket.id;
  activeEditorname = layout.root.contentItems[ 0 ].contentItems[0].getActiveContentItem().componentName
  activeEditor = editors.filter((editor)=>editor.editorId == activeEditorname);
  if(activeEditor[0]){
    var sourceValue = encode(activeEditor[0].newEditor.getValue());
 }else{
   var sourceValue = encode(sourceEditor.getValue());
 }
  var codeString = sourceValue;
  // alert("code demanded by admin");
  codeData = {
    to,from,codeString
  }
  socket.emit("sendCode",codeData,function(message){
    liveBoardAttached(message);
  });
  // console.log("user send code: ",codeData);
})

socket.on("gotCode", function(data){
  // check mocha docs for getting data from jquery element
  newCode = data.codeData.codeString;
  editorId = `editor${editorNumber++}`;
  if(data.codeData.assignment){
    title = "Assignment";
  }else{
    title = data.user.name;
  }
  var newItemConfig = {
    title: `${title}`,
    type: 'component',
    componentName: `${editorId}`,
    isClosable: true,
    componentState: { 
        readOnly : false
    }                                       
  };
  
    layout.registerComponent(`${editorId}`, function(container, state){
       
      
        container.getElement().html(`<button class="send-btn admin" style="float:right; padding:2px !important" id="${data.user.id}" onclick='sendCode(this)'>Send Code to ${data.user.name}<button>`);
      if(data.codeData.assignment){
        container.getElement().html(`<button class="assignmentSubmitButton" style="float:right; padding:2px !important" id="${data.user.id}" onclick='run(true)'>Submit Code<button>`);
      }
      
      let newEditor = monaco.editor.create(container.getElement()[0], {
          automaticLayout: true,
          // theme: "vs-dark",
          scrollBeyondLastLine: true,
          readOnly: state.readOnly,
          language: "cpp",
          minimap: {
              enabled: false
          },
          rulers: [80, 120]
        });
        newEditor.setValue(decode(newCode));
        editorData = {editorId, newEditor};
        editors.push(editorData);
        monaco.editor.setModelLanguage(newEditor.getModel(), $selectLanguage.find(":selected").attr("mode"));
        });
        
      layout.root.contentItems[0].contentItems[0].addChild( newItemConfig );
      liveBoardAttached(`Got code from ${data.user.name}`);
});

function liveBoardAttached(btn){

  if(!btn.id){
    text = btn;
  }else{
    name = document.querySelector(`[data-id='${btn.id}']`).innerText;
    text = `${name}'s board is added`;
  }
  const template = document.querySelector('#snackbar-temp').innerHTML;
    const newUserTemplate = Mustache.render(template,{
      Text: text
    })
    let p = document.createElement("div");
    p.innerHTML = newUserTemplate;

  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
    x.innerHTML = p.innerHTML;
  // Add the "show" class to DIV
  x.className = "show";
  // raiseHandSound.play();
  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

socket.on('stopStream',function(){
  isStream = false;
  console.log('stream: ',isStream);
})

socket.on('startStream',function(){
  
  isStream = true;
  activeEditorname = layout.root.contentItems[ 0 ].contentItems[0].getActiveContentItem().componentName
    
    if(activeEditorname && activeEditorname!='source'){
      activeEditor = editors.filter((editor)=>editor.editorId == activeEditorname)[0].newEditor;
      stream = activeEditor;
    }else{
      stream = sourceEditor;
    }
    previousEditor = previouslyStreamedEditor.filter(editor => editor == activeEditorname)[0];
    if(!isPreviouslyStreamed || !previousEditor){
      startStream(stream);
      isPreviouslyStreamed = true;
      previouslyStreamedEditor.push(activeEditorname);
    }
    socket.emit("stream",{action:'code',code:stream.getValue(),lang:sourceEditor.getModel().getLanguageIdentifier().language});
    if(firstTimeStream){
      changeBoardStream();
    }
});

function changeBoardStream(){
    layout.root.contentItems[ 0 ].contentItems[0].on('activeContentItemChanged', function(component){
      editorName = component.componentName;
      activeEditorname = layout.root.contentItems[ 0 ].contentItems[0].getActiveContentItem().componentName
      console.log(component.componentName);
      if(activeEditorname && activeEditorname!='source'){
        activeEditor = editors.filter((editor)=>editor.editorId == editorName)[0].newEditor;
        stream = activeEditor;
      }else{
        stream = sourceEditor;
      }
      if(isStream){
        previousEditor = previouslyStreamedEditor.filter(editor => editor == activeEditorname)[0];
        if(!previousEditor){
          startStream(stream);
          previouslyStreamedEditor.push(activeEditorname);
        }
        socket.emit("stream",{action:'boardChanged',code:stream.getValue(),lang:stream.getModel().getLanguageIdentifier().language});
      }
    });
    firstTimeStream = false;
}

socket.on('classEnded',function(){
  alert('Class is ended');
  socket.disconnect();
})

function submitAssignment(data){
  if(confirm("Do you want to submite the assignment")){
    to = "admin";
  to.trim();
  from = socket.id;
  resultString = encode(decode(data.stdout).trim());
  activeEditorname = layout.root.contentItems[ 0 ].contentItems[0].getActiveContentItem().componentName;
    activeEditor = editors.filter((editor)=>editor.editorId == activeEditorname);
    if(activeEditor[0]){
      var codeString = encode(activeEditor[0].newEditor.getValue());
   }else{
     var codeString = encode(sourceEditor.getValue());
   }
   
  // alert("code demanded by admin");
  resultData = {
    to,from,resultString,codeString
  }
  socket.emit("submitAssignment",resultData);
  liveBoardAttached("assignment submitted");
  console.log("data send", resultData);
  }
}


window.addEventListener('click', function (evt) {
  if (evt.detail === 3) {
    fullscreenToggle();
  }
});