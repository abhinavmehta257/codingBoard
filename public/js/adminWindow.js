
$("<link/>", {
    rel: "stylesheet",
    type: "text/css",
    href: "/css/admin.css"
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
ev
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
// studentAssignment = new assignments();

// function shareScreen(){
//   socket.emit("shareScreen");
// }

//remove user
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

function getCode(btn){
    userId = btn.id;
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
    alert(message);
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
  assignmentResult = encode(result);
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
    alert(msg);
    closePopup();
  });
  if(reciver =='all'){
    studentAssignment = new assignments();
  }
  
}

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
    // console.log(file);
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
  user = assignment.user;
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
$(".close").on('click', function(){
  assignmentToggle();
})