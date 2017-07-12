var io = require('socket.io').listen(3636);
console.log('Listening on 3636');

io.sockets.on('connection', function(socket) {
    socket.on('send', function(data) {
        io.sockets.emit('message', data);
    });
});
