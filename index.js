var express = require("express"),
    app = express(),
    fs = require("fs"),
    server = require("http").createServer(app);

var io = require("socket.io").listen(server);

var db = {
    users: {
        id: 1, username: "rajesh", "password": "abc",
        id: 2, username: "urvashi", "password": "abc",
        id: 3, username: "jai", "password": "abc",
        id: 4, username: "radhika", "password": "abc",
        id: 5, username: "smeeta", "password": "abc",
    }
}

var users = [];
var connections = [];

var port = process.env.PORT || 7777;


app.use(express.static('public'));

server.listen(port, function () {
    console.log(`Server running on ${port}`);
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", function (socket) {
    connections.push(socket);
    console.log("Connected: %s sockets connected", connections.length);

    socket.on("disconnect", function (data) {

        users.splice(users.indexOf(socket.username), 1);
        updateUsers();

        connections.splice(connections.indexOf(socket), 1);
        console.log("Disconnected: %s sockets connected", connections.length);
    });

    // New users
    socket.on("new user", function (data, callback) {
        socket.username = data;
        users.push(data);
        updateUsers();

        callback(true);
    });


    socket.on("logout", function (username) {
        console.log(`Signing out ${username}`);
        socket.disconnect();
    });

    socket.on("start chat", function (chat) {
        console.log(`Initating chat with ${chat.from}->${chat.to}`);
        let userSocket = connections.find((c) => {
            return c.username == chat.to;
        });

        if (userSocket == null) return;

        userSocket.emit('user joined', chat.from);

        //io.sockets.emit('user joined', username);

    });

    socket.on("send_message", function (message) {
        console.log(`Message from  ${message.from} to ${message.to}}`);
        let userSocket = connections.find((c) => {
            console.log(c.name, message.to);
            return c.username == message.to;
        });

        if (userSocket == null) return;

        console.log("found: ", userSocket.username);

        userSocket.emit("on-message-received", message);

    });


    function updateUsers() {
        io.sockets.emit("get users", users);
    }

});