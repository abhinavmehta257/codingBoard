const { connect, createLocalTracks, LocalVideoTrack, createLocalVideoTrack} = require('twilio-video');
function createTracks(token, user){
  
    if(user.isAdmin == true){
      camRes = {width:640, height: 360}
    }else{
      camRes = false;
    }
  
      createLocalTracks({ 
              audio: true,
              video: camRes
          }).then(localTracks => {
              return connect(token, {
              name: user.roomId,
              tracks: localTracks
              });
          }).then(room =>{
                  room.on('dominantSpeakerChanged', participant => {
                    console.log('The new dominant speaker in the Room is:', participant);
                  });
  
                  room.on('participantConnected', participant => {
                          console.log(`Participant "${participant.identity}" connected`);
                        
                          participant.tracks.forEach(publication => {
                            if (publication.isSubscribed) {
                              const track = publication.track;
                              $("video").remove();
                              document.getElementById('localTrack').appendChild(track.attach());
                              $("video").css("width","inherit");
                              $("video").css("height","inherit");
                            }
                          });
                        
                          participant.on('trackSubscribed', track => {
                            $("video").remove();
                            document.getElementById('localTrack').appendChild(track.attach());
                            $("video").css("width","inherit");
                            $("video").css("height","inherit");
    
                          });
                      });
  
                  socket.on("muteAudio", function(){
                    room.localParticipant.audioTracks.forEach(publication => {
                      publication.track.disable();
                      console.log("audio muted");
                    });  
                  });
                  
                  socket.on("unmuteAudio", function(){
                    room.localParticipant.audioTracks.forEach(publication => {
                      publication.track.enable();
                      console.log("audio unmuted");
                    });  
                  });
  
                  socket.on("muteVideo", function(){
                    room.localParticipant.videoTracks.forEach(publication => {
                      publication.track.disable();
                      console.log("video muted");
                    });  
                  });
                  
                  socket.on("unmuteVideo", function(){
                    createLocalVideoTrack().then(localVideoTrack => {
                      return room.localParticipant.publishTrack(localVideoTrack);
                    }).then(publication => {
                      console.log('Successfully unmuted your video:', publication);
                    }); 
                  });
  
                  socket.on("shareScreen", function(){
                    
                      navigator.mediaDevices.getDisplayMedia().then(stream => {
                      const screenLocalTrack = LocalVideoTrack(stream.getVideoTracks()[0]);
  
                      screenLocalTrack.once('stopped', () => {
                        room.localParticipant.unpublishTrack(screenLocalTrack);
                      });
  
                      room.localParticipant.publishTrack(screenLocalTrack);
                      return room;
                    })
                  });
  
                  room.participants.forEach(participant => {
                    participant.tracks.forEach(publication => {
                      if (publication.track) {
                        $("video").remove();
                        document.getElementById('localTrack').appendChild(publication.track.attach());
                          $("video").css("width","inherit");
                          $("video").css("height","inherit");
                      }
                    });
                  
                    participant.on('trackSubscribed', track => {
                      $("video").remove();
                        document.getElementById('localTrack').appendChild(track.attach());
                        $("video").css("width","inherit");
                        $("video").css("height","inherit");
                      });
                  });
                    
                });
  }
  
  socket.on('AccessToken', function(roomData){
      createTracks(roomData.token, roomData.params);
      console.log(roomData);
  })