var express = require("express");
var ws = require("ws");

var httpPort = 27080;
var wsPort = httpPort + 1;

var httpsvc = express();
httpsvc.use(express.static(__dirname));
httpsvc.listen(httpPort);
console.log("HTTP server listening on " + httpPort);

var connections = [];

var wssvc = new ws.Server({port: wsPort});
wssvc.on('connection', function connection(wsClient) {
    connections.push(wsClient);
    
    wsClient.on('message', function incoming(message) {
        console.log("New message: " + message);
        
        connections.forEach(client => {
            if (client.readyState === ws.OPEN){
                client.send(message);
            }
        });
    });
});
console.log("WS server listening on " + wsPort);