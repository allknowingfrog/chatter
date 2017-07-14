var address = process.argv.length > 2 ? process.argv[2] : 'localhost:3636';
var chalk = require('chalk');
var input = require('readline').createInterface(process.stdin, process.stdout);
input.setPrompt(chalk.magenta(tag('me')));

var socket = require('socket.io-client').connect('http://' + address);

input.on('SIGINT', quit);

socket.on('connect_error', function() {
    console.log('Unable to connect, retrying...');
});

socket.on('disconnect', function() {
    out('Server has disconnected');
    quit();
});

socket.on('connect', function() {
    out('Connected to ' + address);
    login();
});

function login() {
    input.question(chalk.green('Please enter a nickname: '), function(name) {
        socket.emit('nick', name, function(data) {
            if(data) {
                init();
            } else {
                out(chalk.red(name + ' is invalid or unavailable'));
                login();
            }
        });
    });
}

function init() {
    out('Type "/help" for available commands');

    input.prompt(true);

    input.on('line', function(data) {
        if(data.length) {
            if(data[0] == '/') {
                var index = data.indexOf(' ');
                var cmd = index == -1 ? data.substring(1) : data.substring(1, index);
                switch(cmd) {
                    case 'h':
                    case 'help':
                        out('Available commands: (h)elp, (m)e, (q)uit, (u)sers, (w)hisper');
                        break;
                    case 'me':
                    case 'm':
                        socket.emit('me', data.substring(index + 1));
                        break;
                    case 'quit':
                    case 'q':
                        quit();
                        break;
                    case 'users':
                    case 'u':
                        socket.emit('users', null, function(data) {
                            out(data);
                        });
                        break;
                    case 'whisper':
                    case 'w':
                        var next = data.indexOf(' ', index + 1);
                        socket.emit('whisper', {
                            username: data.substring(index + 1, next),
                            message: data.substring(next + 1)
                        });
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
        out(chalk.green(tag(data.username)) + data.message);
    });

    socket.on('whisper', function(data) {
        out(chalk.yellow(tag(data.username) + data.message));
    });

    socket.on('notice', function(data) {
        out('              ' + chalk.cyan(data));
    });
}

function out(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    input.prompt(true);
}

function tag(str) {
    return String('            ' + str).slice(-12) + ': ';
}

function quit() {
    socket.disconnect();
    input.close();
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log('Goodbye!');
    process.exit();
}
