var port = process.argv.length > 2 ? process.argv[2] : 3636;
var io = require('socket.io').listen(port);
console.log('Listening on ' + port);

var users = {};

process.on('SIGINT', function() {
    for(var u in users) {
        users[u].emit('notice', 'Server is shutting down');
        users[u].disconnect();
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log('Goodbye!');
    process.exit();
});

io.sockets.on('connection', function(socket) {
    var added = false;

    socket.on('nick', function(data, callback) {
        if(added || users.hasOwnProperty(data)) return callback(false);

        callback(true);

        added = true;
        socket.username = data;
        users[data] = socket;

        var msg = data + ' has joined';
        console.log(msg);
        socket.broadcast.emit('notice', msg);

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
            } else {
                socket.emit('notice', 'No user named ' + data.username);
            }
        });

        socket.on('me', function(data) {
            io.emit('notice', socket.username + ' ' + data);
        });

        socket.on('users', function(data, callback) {
            callback('Users: ' + Object.keys(users).join(', '));
        });

        socket.on('disconnect', function () {
            var msg = socket.username + ' has left';
            console.log(msg);
            socket.broadcast.emit('notice', msg);
            delete users[socket.username];
        });
    });
});
