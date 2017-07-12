var ansi = require('ansi-color');
var input = require('readline').createInterface(process.stdin, process.stdout);

var socket = require('socket.io-client').connect('http://localhost:3636');
out('Connected on 3636');

var nick;

input.question("Please enter a nickname: ", function(name) {
    nick = name;
    socket.emit('send', {type: 'notice', message: nick + " has joined the chat"});
    input.prompt(true);
});

input.on('line', function(line) {
    if(line.length) {
        socket.emit('send', {type: 'chat', message: line, nick: nick});
        input.prompt(true);
    }
});

socket.on('message', function(data) {
    if(data.type == "notice") {
        out(color.set(data.message, 'cyan'));
    } else if(data.nick != nick) {
        out(color.set("<" + data.nick + "> ", "green") + data.message);
    }
});

function out(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    input.prompt(true);
}
