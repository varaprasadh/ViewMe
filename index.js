var express = require('express')
var app = express();
var path = require('path');
var fs = require('fs');
var https=require('https');

var options = {
    key: fs.readFileSync('./file.pem'),
    cert: fs.readFileSync('./file.crt')
};
// var serverPort = 443;
  
var server = https.createServer(options, app);
var io = require('socket.io')(server);

var users = {};

app.use(express.static(path.join(__dirname, 'client')));

//send initial webPage;
app.get(/\/(|id)/, function(req, res) {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

io.on('connection', function(socket) {
    console.log('a user connected');
    console.log(socket.id, "length" + users.length);

    users[socket.id] = {
        peerId:'',
        socket:socket
    }
    socket.on('SavePeerId',(id)=>{
        console.log("saving id to the socket:",socket.id,"as peerid:",id);
        users[socket.id].peerId=id;
    })
    //delete user from array when disconnected..
    socket.on('disconnect', () => {
        users[socket.id] = null;
    });
});
server.listen(process.env.PORT||3000, function() {
    console.log('listening on *:3000');
});
