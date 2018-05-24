var escapeKeyCode = 13;
var username;
var wsConnectionHost = location.hostname;
var wsConnectionPort = parseInt(location.port) + 1;
var wsConnectionURL = "ws://" + wsConnectionHost + ":" + wsConnectionPort;
var wsConnection;

$(document).ready(function () {
    var userNameFieldRef = $("#userNameModal .modal-body input");

    configureUserNameModal(userNameFieldRef);
    showUserNameModal();
    configureNewMsgBox();
});

function configureUserNameModal(userNameFieldRef) {
    $("#userNameModal").on("shown.bs.modal", function () {
        userNameFieldRef.trigger("focus");
    });

    $("#userNameModal").on("hidden.bs.modal", function () {
        $("#newMsgBox").trigger("focus");
    });

    $("#userNameModal .modal-footer button").click(function () {
        return loadUserName(userNameFieldRef);
    });

    $("#userNameModal .modal-body input").keydown(function (event) {
        if (event.keyCode == escapeKeyCode) {
            loadUserName(userNameFieldRef);
        }
    });
}

function loadUserName(userNameFieldRef) {
    var isValidUserName = userNameFieldRef.val() && userNameFieldRef.val().trim().length > 0;

    if (isValidUserName) {
        username = userNameFieldRef.val().trim();
        connectAndConfigureWSServer();
        $("#userNameModal").modal('hide');
    } else {
        userNameFieldRef.focus();
    }

    userNameFieldRef.val(null);
}

function showUserNameModal() {
    $("#userNameModal").modal('show');
}

function configureNewMsgBox() {
    $("#newMsgBox").keydown(function (event) {
        if (event.keyCode == escapeKeyCode) {
            event.preventDefault();

            var newMsg = $("#newMsgBox").val();
            if (newMsg && newMsg.trim().length > 0) {
                wsConnection.send('{"type":"data","dataContent":"$data"}'.replace("$data", username + ": " + newMsg));
                $("#newMsgBox").val(null);
            }
        }
    });
}

function connectAndConfigureWSServer() {
    wsConnection = new WebSocket(wsConnectionURL);

    wsConnection.onopen = function (event) {
        //Clean default messages
        $("#chatBox").val(null);

        //Login
        wsConnection.send('{"type":"login","loginContent":"$username"}'.replace("$username", username));

        //Ask server for user list
        wsConnection.send('{"type":"availableUsers"}');
    }
    wsConnection.onmessage = function (event) {
        console.log(event.data);

        var messageJSON = JSON.parse(event.data);

        switch (messageJSON.type) {
            case "availableUsers":
                processAvailableUsers(messageJSON.response);
                break;
            case "data":
                processNewMessage(messageJSON.response);
                break;
        }
    }
    wsConnection.onerror = function (event) {
        //Notify username and treat
        alert("Connection error.");
        location.reload();
    }
    wsConnection.onclose = function (event) {
        //Notify username and treat
        alert("Connection closed.");
        location.reload();
    }
}

function processNewMessage(newMessage) {
    //Add new msg to chat box
    var incomeMsg = $("#chatBox").val() + newMessage + "\n";
    $("#chatBox").val(incomeMsg);
    $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight - $("#chatBox").height());
}

function processAvailableUsers(availableUsers) {
    $("#chatUsers").val(null);

    availableUsers.forEach(user => {
        var newUser = $("#chatUsers").val() + user + "\n";
        $("#chatUsers").val(newUser)
        $("#chatUsers").scrollTop($("#chatUsers")[0].scrollHeight - $("#chatUsers").height());
    });
}