var fs=require('fs');
var PeerServer = require('peer').PeerServer;
var server = PeerServer(
    {
        host:"192.168.0.103",
                  port: 9000, 
                  path: '/peerServer',
                ssl: {
                    key: fs.readFileSync('./file.pem'),
                    certificate: fs.readFileSync('./file.crt')
                }      
            });
server.listen(()=>{
    console.log("peer server started");
});

