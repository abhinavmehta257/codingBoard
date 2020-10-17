
let participent_list_open = false
let chat_open = false
let filenumber = 1;
let isMicOn = true;
let isCamOn = true;
$("#Nochat").hide();

function participentListToggle(){
    if(participent_list_open){
        participentListClose();
    }
    else{
        participentListOpen();
        if(chat_open){
            chatClose();
        }
    }
} 
function chatToggle(){
    if(chat_open){
        chatClose();
        $("#Nochat").hide();
        numberOfChat = 0;
    }
    else{
        numberOfChat =0 ;
        $("#Nochat").hide();
        chatOpen();
        if(participent_list_open){
            participentListClose();
        }
    }
} 

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
}

function participentListOpen(){
    $(`.chat__sidebar`).animate({left:'0'});
    $('#sidebar-collapser').animate({left:'+=260px'});
    participent_list_open = true;
}

function participentListClose(){
    $(`.chat__sidebar`).animate({left:'-260'});
    $('#sidebar-collapser').animate({left:'-=260px'});
    participent_list_open = false;
}

function chatClose(){
    $(`.chat__main`).animate({left:'-275'});
    $('#chat-collapser').animate({left:'-=275px'});
    chat_open = false;
}

function chatOpen(){
    $(`.chat__main`).animate({left:'0'});
    $('#chat-collapser').animate({left:'+=275px'});
    chat_open = true;
}

const invite_btn = document.querySelector('#invite')

 invite_btn.addEventListener('click', function(){
        console.log('invie btn clicked');
        link = `${window.location.origin}/joinRoom.html?roomId=${window.roomId}`;
        copy(link);  
    });

function copy(txt){
    console.log("copy called");
  var cb = document.getElementById("cb");
  cb.value = txt;
  cb.style.display='block';
  cb.select();
  document.execCommand('copy');
  cb.style.display='none';
  alert("room link copied")
}

function addNewFile(){
    newFile = `newFile${filenumber}`;
    var newItemConfig = {
        title: `${newFile}`,
        type: 'component',
        componentName: `${newFile}`,
        isClosable: true,
        componentState: { 
            readOnly : false
        }
      };
      editorId = `${newFile}`;
        layout.registerComponent(`${newFile}`, function(container, state){
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
            newEditor.setValue("");
            editorData = {editorId, newEditor};
            editors.push(editorData);
            });
          
            

          layout.root.contentItems[0].contentItems[0].addChild( newItemConfig );
          filenumber++;
}

function micToggle(){
    if(isMicOn){
        socket.emit("muteAudio")
            
    }else{
        if(!isMicOn){
            socket.emit("unmuteAudio")
                
        }
    }
    
}

function camToggle(){
    if(isCamOn){
        socket.emit("muteVideo");
    }else{
        if(!isCamOn){
            socket.emit("unmuteVideo");
        }
    }
    
}

$(document).ready(function(){
    
    $("#participant_earch").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#users li").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)

        console.log($(this).text().toLowerCase().indexOf(value) > -1);
      });
    });
}); 

function fullscreenToggle(){
    if(document.fullscreenElement || document.webkitFullscreenElement){
        document.exitFullscreen();
    }else{
        document.getElementById('localTrack').requestFullscreen().catch(console.log);
    }
}


