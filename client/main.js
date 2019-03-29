var localView,remoteView;
var localPeer;
var remotePeerConnection;
var remotePeerId
var socket;
var refText;
var _BASE_URL = location.origin|| "https://localhost:3000";
window.onload = function () {
    socket=io();
    localView = document.querySelector('.local-view');
    remoteView = document.querySelector('.remote-view');
    refText = document.querySelector('.ref-text');

    //check for url whether it is referral ?
    var _remotePeerId = location.pathname.replace('/', '');
    initLocalCameraStream().then(()=>{
        InitPeerConnection();
        if (_remotePeerId != '') {
            //connect both users
            console.log('something is not working');
            
            initRemotePeerConnection(_remotePeerId);
        } 
    })
    //listeners
    AddListeners();
}
function initLocalCameraStream() {
 return new Promise((resolve,reject)=>{
      var videoContraints = {
          audio: true,
          video: true
      }
      navigator.mediaDevices.getUserMedia(videoContraints).then(stream => {
          window.localStream = stream;
          localView.srcObject = stream;
          resolve(localStream);
      })
          .catch(err => {
              console.log(err);
              console.log("error");
              reject(err);
          })
  })
}

//  set OPENSSL_CONF=C:\OpenSSL\openssl.cnf

//local peer 
function InitPeerConnection(){
    localPeer = new Peer({ host: location.host.replace(/:\d+/, ''), port: 9000, path: '/peerServer' });
    console.log(localPeer);
    localPeer.on('open',(id)=>{
        console.log("peer id:",id);
        //put it in servers user peerid
        socket.emit('SavePeerId',id);
        refText.innerHTML=id;
    });
    localPeer.on('connection',(connection)=>{
        console.log("a peer is accepted your invitation"); 
    })
    //handle stream coming from remote peer
    localPeer.on('call',call=>{
        call.on('stream',remoteStream=>{
          remoteView.srcObject=remoteStream;
        })
        call.answer(localStream)
    })
    
}

function copyRefText() {
    refText.select();
    document.execCommand("copy");
    alert("Copied the text: " + copyText.value);
}
function AddListeners(){
    //to copy invation code
    var copyRefTextEl = document.querySelector('.ref-copy');
    copyRefTextEl.addEventListener('click',e=>{
        // copyRefText();
        copyClipboard()
    });
 
    //to invite a friend with link;
    var inviteBtn = document.querySelector('.invite .text');
    inviteBtn.addEventListener('click',e=>{
      var link=`${_BASE_URL}/${localPeer.id}`;
      copyStringToClipboard(link);
    })
    var JoinText = document.querySelector('.join .text');
    var JoinBtn = document.querySelector('.join-btn');
    JoinBtn.addEventListener('click',e=>{
        //get the id entered
     remotePeerId=JoinText.value;
         //connect to that  remotepeer id 
      if(localPeer.id!=remotePeerId){
          initRemotePeerConnection(remotePeerId);
      }else{
          alert("dont try to crash the system..")
      }

    })

}
function initRemotePeerConnection(remotePeerId){
    remotePeerConnection = localPeer.connect(remotePeerId);
    console.log(remotePeerConnection);
    //create a call object and send localstream to the remotepeer
    var call = localPeer.call(remotePeerId, localStream);
    call.on('stream', stream => {
        console.log("receiver peer", stream);
        remoteView.srcObject = stream;
    })
}

function copyStringToClipboard(str) {
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
    alert("link copied to the clipboard");
}


function copyClipboard() {
    var elm = refText;
    // for Internet Explorer
    if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(elm);
        range.select();
        document.execCommand("Copy");
        alert("Invitation Code Copied to ClipBoard ");
    }
    else if (window.getSelection) {
        // other browsers
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(elm);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("Copy");
        alert("Copied div content to clipboard");
    }
}