
$("<link/>", {
    rel: "stylesheet",
    type: "text/css",
    href: "./css/admin.css"
}).appendTo("body");

let assignmentResult = '';
let studentAssignment;
class assignments{
  constructor(){
    this.assignments = [];
  }

  getAssignment(id){
    let assignment = this.assignments.filter((assignment) => assignment.user.id == id)[0];
    return assignment;
  }

  addAssignment(assignment){
    let currentAssignment = this.getAssignment(assignment.user.id);
    if(currentAssignment){
      currentAssignment.resultData.codeString  = assignment.resultData.codeString;
      if(assignment.resultData.resultString == assignmentResult){
        currentAssignment.resultData.result = "right";
      }else{
        currentAssignment.resultData.result = "wrong";
      }
    }else{
      this.assignments.push(assignment);
    }
  }


}
studentAssignment = new assignments();

function removeUser(id){
    userId = id;
    senderId = socket.id;
    // console.log(userId);
    data = {userId, senderId}
    let removeUser = confirm(`Do you want to remove the user`);
    if(removeUser){
        socket.emit('removeUser',data);
    }
};

function getCode(id){
    userId = id;
    senderId = socket.id;
    data = {userId, senderId}
    socket.emit("getCode",data)
}


function sendCode(btn = null){
  if(btn!= null){
    var to = btn.id;
    to.trim();
  }else{
    to = "all";
   var assignment = false; //----------------------------
  }
    
  var from = socket.id;
  activeEditorCode = layout.root.contentItems[ 0 ].contentItems[0].getActiveContentItem().container.getElement()[0].getElementsByClassName("view-lines")[0].innerText;

  // console.log(activeEditorCode);
    if(activeEditorCode){
        codeString = encode(activeEditorCode);
    }else{
     codeString = encode(sourceEditor.getValue());
    }
    
  codeData = {
    to,from,codeString,assignment //------------------
  }
  socket.emit("sendCode",codeData,function(message){
    liveBoardAttached(message);
  });

}

function openAssignmentPopup(reciver = false){
  if(reciver == false){
    reciver = 'all';
  }else{
    reciver = `'${reciver}'`;
  }
  assignmentPopup = document.createElement("div");
  assignmentPopup.id = "assignmentPopup";
		assignmentPopup.innerHTML = `<div id="assignmentPopupBackground">
		<div id="assignmentPopupBox">
			<h2 style="margin: 0">Assignment</h2>
			<label>Question <span style="color: red">*</span></label><br>
			<textarea id="assignmentQuestion" rows="5" cols="40" placeholder="Question for Assignment...."></textarea><br>
			<label>Answer (Optional)</label><br>
			<textarea id="assignmentAnswer" rows="5" cols="40" placeholder="Answer for Assignment...."></textarea><br>
			<label>Sample Inputs(Optional)</label><br>
			<textarea id="assignmentInput" rows="5" cols="40" placeholder="Sample inputs for Assignment...."></textarea><br>
			<button id="sendAssignment" onclick="sendAssignment(${reciver})">Send Assignmet</button>
			<button id="closeAssignmentPopup" onclick="closePopup()">Cancle</button>
			</textarea>
		</div>
	</div>`;
  document.body.appendChild(assignmentPopup);
  
}

function closePopup(){
  document.body.removeChild(document.getElementById("assignmentPopup"));
}

function sendAssignment(reciver = 'all'){

  if(confirm("Download any previous assignment before moving forward, as it will delete them all")){
  question = $("#assignmentQuestion").val();
  result =$("#assignmentAnswer").val().trim();
  if(reciver == 'all'){
    assignmentResult = encode(result);
  }
  assignmentInput = $("#assignmentInput").val();
  codeString = encode(`/*Your Assignment is: \n${question} \nDESIRED ANSWER:\n ${result} \n**your output should match exactly otherwise it will consider WRONG**\nSAMPLE INPUTS FOR PROGEAM ARE:\n${assignmentInput}*/`);
  from = socket.id;
  to = reciver;
  // console.log(reciver);
  assignment = true//-------------------
  codeData = {
    to,from,codeString,assignment //------------------
  }
  socket.emit("sendCode",codeData,function(msg){
    liveBoardAttached(msg);
    closePopup();
  });
  if(reciver =='all'){
    studentAssignment = new assignments();
  }
  
}

}


function makeAdmin(id){
  socket.emit("makeAdmin",{id});
    $('.admin').remove();
   
}

socket.on("gotAssignment",function(data){
  // console.log(data.resultData.resultString == assignmentResult,decode(data.resultData.resultString));
  let user = data.user;
  let resultData = data.resultData;
  if(assignmentResult !='' || assignmentResult==null){
    if(data.resultData.resultString == assignmentResult){
      result = 'right';
    }else{
      result = "wrong";
    }
  }else{
    result = '';
  }

  let assignment = {
    user,
    resultData,
    result
  }
  studentAssignment.addAssignment(assignment);
  // console.log(student,studentResult);
  showSubmittedAssignmentList();
});

function downloadAssignments(){
  file = `CLASS ASSIGNMENT`;
  for(var i=0; i<studentAssignment.assignments.length;i++){
     file= file + `\n\n ${studentAssignment.assignments[i].user.name}'s CODE: \n ${decode(studentAssignment.assignments[i].resultData.codeString)}`;
    }
  download(file, "Students Assignments", "text/plain");
}

function getAssignmentCode(btn){
  userId = btn.id;

  data = studentAssignment.assignments.filter((assignment) => assignment.user.id == userId)[0];
   
   newCode = data.resultData.codeString;
  editorId = `editor${editorNumber++}`;
  var newItemConfig = {
    title: `${data.user.name}`,
    type: 'component',
    componentName: `${editorId}`,
    isClosable: true,
    componentState: { 
        readOnly : false
    }                                       
  };
  
    layout.registerComponent(`${editorId}`, function(container, state){
       
      
        container.getElement().html(`<button class="send-btn admin" style="float:right; padding:2px !important" id="${data.user.id}" onclick='sendCode(this)'>Send Code<button>`);
      
      let newEditor = monaco.editor.create(container.getElement()[0], {
          automaticLayout: true,
          theme: "vs-dark",
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
}

function showSubmittedAssignmentList(){
  let ol = document.createElement('ul');
  // console.log(users);
  studentAssignment.assignments.forEach(function (assignment) {
    user = assignment.user;
    const template = document.querySelector('#participent-template').innerHTML;
    const newUserTemplate = Mustache.render(template,{
      User:user,
      func:'getAssignmentCode(this)'
    })
    let li = document.createElement('li');
    li.innerHTML = newUserTemplate;
    li.setAttribute('class',`participant ${assignment.result}`)
    li.setAttribute('data-id' , `${user.id}`);
    ol.appendChild(li);
  });
  let studentAssignmentList = document.querySelector('#studentAssignmentsList');
  studentAssignmentList.innerHTML = "";
  studentAssignmentList.appendChild(ol);
}
$.getScript('./js/contextMenu.js', function() {
  console.log("context loaded");
});

let isAssignmentOpen = false;
function assignmentToggle(){
  if(isAssignmentOpen){
    $("#studentAssignments").slideUp();
    $("#assignment-btn").show();

    isAssignmentOpen = false;
  }else{
    $("#studentAssignments").slideDown();
    $("#assignment-btn").hide();

    isAssignmentOpen = true;
  }
}

$("#studentAssignments .close").on('click', function(){
  assignmentToggle();
})


function getCodeStream(btn) {
  id = btn.id;
  let student =  studentBoards.filter((editor)=>editor.editorId == id);
  if(student.length == 0){
    data ={
      senderId:socket.id,
      userId:id
    }
    socket.emit('startStream',data);
    liveBoardAttached(btn);
  }
  
}
let studentsourceUserCursor = [];
let studentBoards = [];
// let remoteSelectionManager;
socket.on("streamStarted", function(info) {
  // console.log(info);
  let studentEditor =  studentBoards.filter((editor)=>editor.editorId == info.user.id)[0];
  if(studentEditor){
    let cursor = studentsourceUserCursor.filter((cursor)=>cursor.id == info.user.id);
    if(cursor.length == 0){
      sourceUserCursor = null;
    }else{
      sourceUserCursor = cursor[0].cursor;
    }
    addCollabExt(info,studentEditor.editor,sourceUserCursor);
  }else{
    createStudentBoard(info);
  }
});

isStudentBoardInFocus = false;

function addCollabExt(info,editor, sourceUserCursor){
  require(["MonacoCollabExt"], function (MonacoCollabExt) {
    
    const remoteCursorManager = new MonacoCollabExt.RemoteCursorManager({
      editor: editor,
      tooltips: true,
      tooltipDuration: 2
    });
     
    if(!sourceUserCursor || sourceUserCursor == null){
       sourceUserCursor = remoteCursorManager.addCursor('source', 'orange',info.user.name);
       studentsourceUserCursor.push({id:info.user.id, cursor:sourceUserCursor});
    }
    
    
  const targetContentManager = new MonacoCollabExt.EditorContentManager({
    editor: editor
  });
  let action = info.data.action;
  switch (action){
    case "onInsert":
      editor.updateOptions({readOnly: false});
      targetContentManager.insert(info.data.index, info.data.text);
      editor.updateOptions({readOnly: true});  
      break;
    case "onReplace":
      editor.updateOptions({readOnly: false});
      targetContentManager.replace(info.data.index, info.data.length, info.data.text);
      editor.updateOptions({readOnly: true});
      break; 
    case  "onDelete":
      editor.updateOptions({readOnly: false});
      targetContentManager.delete(info.data.index, info.data.length);
      editor.updateOptions({readOnly: true}); 
    break;
    case "onDidChangeCursorPosition":
      sourceUserCursor.setOffset(info.data.offset);
      if(!isStudentBoardInFocus){
        editor.revealLineInCenter(info.data.offset);
      }
      break;
    
  }
  });
}

function createStudentBoard(data){
 
  let board = document.createElement('div');
  if(studentBoardSize.value != '2'){
    board.className = `${studentBoardSize.value} mb-5 student-board`;
    board.style.height = '230px';
  }else{
    board.className = `col-6 p-1 mb-5 student-board`;
    board.style.height = '460px';
  }
  
  // board. = "student-board";
  // board.style.background = 'whitesmoke';
  board.style.color = 'black';
  board.style.borderRadius = '10px';
  id = data.user.id;
  board.innerHTML = `<div class'p-1' style="background:whitesmoke; border-radius:5px;height: inherit;"><span data-id='${id}' onclick='stopStream(this)' class="close">×</span><p class = 'name' style="padding-left:20px">${data.user.name}</p><div style = 'height: inherit;'data-user='${id}' class='editor student_board'><div></div>`;
  $('.boards').append(board);
  let codeArea = document.querySelector(`[data-user = '${id}']`);
  let newEditor = monaco.editor.create(codeArea, {
    automaticLayout: true,
    value:data.data.code,
    theme: "vs-dark",
    scrollBeyondLastLine: true,
    readOnly: true,
    language: data.data.lang,
    minimap: {
        enabled: false
    },
    rulers: [80, 120]
  });
  
  codeBoard = {
    editorId:data.user.id,
    editor:newEditor
  }
  studentBoards.push(codeBoard);
  $('.student_board').hover(function(){
    isStudentBoardInFocus = true;
    console.log('in');
  },function(){
    isStudentBoardInFocus = false;
    console.log('out');
  });
}

function stopStream(btn){
id = btn.getAttribute("data-id");
// console.log(id);

 socket.emit('stopStream',id);
 document.querySelector(`[data-user = '${id}'`).parentElement.parentElement.remove();
 studentBoards =  studentBoards.filter((editor)=>editor.editorId != id)
 studentsourceUserCursor = studentsourceUserCursor.filter((cursor)=>cursor.id != id);
}

isLiveBoard = false
function liveBoardsToggle(){
  if(!isLiveBoard){
    $('.live_boards').slideDown();
    isLiveBoard = true;
  }else{
    $('.live_boards').slideUp();
    isLiveBoard = false;
  }
}

isLeaveConfirm = false;
function leaveRoomToggle(){
  if(!isLeaveConfirm){
    $('.leave_confirm').slideDown();
    isLeaveConfirm = true;
  }else{
    isLeaveConfirm = false;
    $('.leave_confirm').slideUp();
  }
 
}

function endAndLeaveRoom(){
  socket.emit('endAndLeaveRoom');
}

$(document).ready(function(){
  studentBoardSize = document.querySelector('#studentBoardSize');
      studentBoardSize.addEventListener('change',function(){
          console.log(studentBoardSize.value);
          block = document.getElementsByClassName('student-board');
         for(i=0;i<block.length;i++){
          block[i].style.height = '230px';
              block[i].className = studentBoardSize.value + " mb-5 student-board";
              if(studentBoardSize.value=='2'){
                block[i].className = 'col-6 p-1 mb-5 student-board';
                block[i].style.height = '460px';
              }
          }
      });
});



socket.on('userDissconected',function(user){
  // console.log(user);
  
  //removing realtime board
  let studentEditor =  studentBoards.filter((editor)=>editor.editorId == user.id)[0];
  if(studentEditor){
    if(studentEditor.editorId == user.id){
      document.querySelector(`[data-user = '${user.id}'`).parentElement.parentElement.remove();
      studentBoards = studentBoards.filter((editor)=>editor.editorId != user.id);
    }
  }
})