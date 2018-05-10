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
                wsConnection.send(username + ": " + newMsg);
                $("#newMsgBox").val(null);
            }
        }
    });
}

function connectAndConfigureWSServer() {
    wsConnection = new WebSocket(wsConnectionURL);

    wsConnection.onopen = function (event) {
        //Ask server for user list
        $("#chatBox").val(null);
    }
    wsConnection.onmessage = function (event) {
        //Add new msg to chat box
        var incomeMsg = $("#chatBox").val() + event.data + "\n";
        $("#chatBox").val(incomeMsg);
        $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight - $("#chatBox").height());
    }
    wsConnection.onerror = function (event) {
        //Notify username and treat
        alert("Connection error.");
    }
    wsConnection.onclose = function (event) {
        //Notify username and treat
        alert("Connection closed.");
    }
}