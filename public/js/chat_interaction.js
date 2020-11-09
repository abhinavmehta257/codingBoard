
let participent_list_open = false
let chat_open = false
let filenumber = 1;
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

function addNewFile(isPrompt = false, name = ""){
    if(name == '' || name == null){
        newFile = `newFile${filenumber}`;
    }else{
        newFile = name;
    }
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
      try {
        layout.registerComponent(`${newFile}`, function(container, state){
            if(isPrompt){
                container.getElement().html(`<button class="send-btn admin" style="float:right; padding:2px !important" onclick='sendCode()'>Send Prompt<button>`);
            }
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
            monaco.editor.setModelLanguage(newEditor.getModel(), $selectLanguage.find(":selected").attr("mode"));
            });
          
            

          layout.root.contentItems[0].contentItems[0].addChild( newItemConfig );
          filenumber++;
      } catch (error) {
        //   console.log(error);
          showError("Error","The file name is alredy exist. Try different file name");
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
    $("#participant_earch_assignment").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#studentAssignmentsList li").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
  
          console.log($(this).text().toLowerCase().indexOf(value) > -1);
        });
      });

      isLeaveConfirm;
      $('#site-content').on('click',function(){
          if(isInfo){showInfoToggle()};
          if(participent_list_open){participentListToggle()};
          if(chat_open){chatToggle()};
          if(isLeaveConfirm){leaveRoomToggle()};
      });

      roomId = document.querySelector('.information .roomId');
      language = document.querySelector('.information .language');
      link = document.querySelector('.information .link');

      roomId.innerHTML = params.roomId;
      language.innerHTML = params.lang;
      link.innerHTML = `${document.location.origin}/codingboard/join?roomId=${params.roomId}`; 
      
      
    //   document.querySelector('.information').addEventListener('click',copy(`https://codingboard.herokuapp.com/codingboard/join?roomId = ${params.roomId}</a>`))
}); 

let invite_btn;
$(document).ready(function(){
    $('.admin').hide();

invite_btn = document.querySelector('#invite');

  function copy(txt){
    console.log("copy called");
    var cb = document.getElementById("cb");
    cb.value = txt;
    cb.style.display='block';
    cb.select();
    document.execCommand('copy');
    cb.style.display='none';
    console.log(txt);
    alert("room link copied");
  }
  invite_btn.addEventListener('click', function(){
    console.log('invie btn clicked');
    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery ).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g, '":"') + '"}');
    console.log(params);
    link = `${document.location.origin}/codingboard/join?roomId=`+params.roomId;
    console.log(link);
    copy(link);  
    });
    $('#info-link').on('click', function(){
        let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery ).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g, '":"') + '"}');
    console.log(params);
    link = `${document.location.origin}/codingboard/join?roomId=`+params.roomId;
    console.log(link);
    copy(link);
    })
});



function fullscreenToggle(){
    if(document.fullscreenElement || document.webkitFullscreenElement){
        document.exitFullscreen();
    }else{
        document.documentElement.requestFullscreen().catch(console.log);
    }
}
let isInfo = false 

function showInfoToggle(){
    if(!isInfo){
        $('.information').slideDown();
        isInfo = true;
    }else{
        $('.information').slideUp();
        isInfo = false;
    }
}

