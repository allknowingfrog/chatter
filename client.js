var address = process.argv.length > 2 ? process.argv[2] : 'localhost:3636';
var color = require('ansi-color');
var input = require('readline').createInterface(process.stdin, process.stdout);
input.setPrompt(color.set('<me> ', 'green'));

var socket = require('socket.io-client').connect('http://' + address);
out('Connected to ' + address);

input.on('SIGINT', quit);

login();

function login() {
    input.question('Please enter a nickname: ', function(name) {
        socket.emit('nick', name, function(data) {
            if(data) {
                init();
            } else {
                out(color.set(name + ' is invalid or unavailable', 'red'));
                login();
            }
        });
    });
}

function init() {
    input.prompt(true);

    input.on('line', function(data) {
        if(data.length) {
            if(data[0] == '/') {
                var index = data.indexOf(' ');
                var cmd = index == -1 ? data.substring(1) : data.substring(1, index);
                switch(cmd) {
                    case 'quit':
                    case 'q':
                        quit();
                        break;
                    case 'whisper':
                    case 'w':
                        var next = data.indexOf(' ', index + 1);
                        socket.emit('whisper', {
                            username: data.substring(index + 1, next),
                            message: data.substring(next + 1)
                        });
                        break;
                    case 'me':
                    case 'm':
                        socket.emit('me', data.substring(index + 1));
                        break;
                    default:
                        out('Unknown command: ' + cmd);
                }
            } else {
                socket.emit('message', data);
            }

            input.prompt(true);
        }
    });

    socket.on('message', function(data) {
        out(color.set('<' + data.username + '> ', 'green') + data.message);
    });

    socket.on('whisper', function(data) {
        out(color.set('<' + data.username + '> ', 'yellow') + data.message);
    });

    socket.on('notice', function(data) {
        out(color.set(data, 'cyan'));
    });
}

function out(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    input.prompt(true);
}

function quit() {
    socket.disconnect();
    input.close();
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log('Goodbye!');
    process.exit();
}
