var io = require('socket.io').listen(3636);
console.log('Listening on 3636');

var users = {};

io.sockets.on('connection', function(socket) {
    var added = false;

    socket.on('nick', function(data) {
        if(added) return;

        added = true;
        socket.username = data;
        users[data] = socket;

        socket.broadcast.emit('notice', socket.username + ' has joined');

        socket.on('message', function(data) {
            socket.broadcast.emit('message', {
                username: socket.username,
                message: data
            });
        });

        socket.on('whisper', function(data) {
            if(users.hasOwnProperty(data.username)) {
                users[data.username].emit('whisper', {
                    username: socket.username,
                    message: data.message
                });
            }
        });

        socket.on('disconnect', function () {
            socket.broadcast.emit('notice', socket.username + ' has left');
        });
    });
});
