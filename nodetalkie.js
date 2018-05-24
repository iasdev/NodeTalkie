var express = require("express");
var ws = require("ws");

var httpPort = 27080;
var wsPort = httpPort + 1;

var httpsvc = express();
httpsvc.use(express.static(__dirname));
httpsvc.listen(httpPort);
console.log("Setting HTTP server on " + httpPort);
console.log("Setting WS server on " + wsPort);

var connectedClients = [];

var wssvc = new ws.Server({ port: wsPort });
wssvc.on('connection', function connection(wsClient) {
    wsClient.on('message', function incoming(message) {
        //Log the new message
        console.log("New message: " + message);

        //Handle JSON. We've assume we receive an stringify JSON.
        var jsonMsg = JSON.parse(message);

        switch (jsonMsg.type) {
            case "login":
                doLogin(jsonMsg.loginContent, wsClient);
                doBroadcastConnectedUsers();
                break;
            case "data":
                doBroadcast(jsonMsg.dataContent);
                break;
        }
    });
});

function doLogin(newLogin, newWSClient) {
    if (newLogin) {
        connectedClients.push({
            login: newLogin,
            connection: newWSClient
        });
    }
}

function doBroadcastConnectedUsers() {
    var connectedClientsLoginArray = [];

    connectedClients.forEach(client => {
        connectedClientsLoginArray.push(client.login);
    });

    var responseMessage =
        '{"type":"availableUsers","response":$data}'.replace("$data", JSON.stringify(connectedClientsLoginArray));

    connectedClients.forEach(client => {
        sendMessageIfConnected(client.connection, responseMessage);
    });
}

function doBroadcast(newMessage) {
    if (newMessage) {
        connectedClients.forEach(client => {
            var newMessageJSON = '{"type":"data","response":"$data"}'.replace("$data", newMessage);
            sendMessageIfConnected(client.connection, newMessageJSON);
        });
    }
}

function sendMessageIfConnected(connection, msg) {
    if (ws.OPEN == connection.readyState) {
        connection.send(msg);
    }
}