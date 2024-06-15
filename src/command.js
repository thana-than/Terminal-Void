import { Directory } from './dir.js';

const REGEX_SPACE = /\s+/ //TODO allow quotes to keep spaces

class Command {
    static commands = new Map();

    static Run(command) {
        const cmd = command.split(REGEX_SPACE); //*Splits / removes whitespace chunks
        const params = cmd.slice(1);

        const requested = Command.commands.get(cmd[0])
        if (!requested) {
            if (params.length == 0) {
                const response = smartCommand(cmd[0]);
                if (response) return response;
            }

            return `Command ${cmd[0]} does not exist!`;
        }

        return requested.invoke(params);
    }

    constructor(keys) {
        this.keys = keys;
        this.keys.forEach(key => {
            Command.commands.set(key, this);
        });
    }
}

function commandFactory(properties) {
    //* Proxy class to allow for dynamic property assignment
    class CommandProxy extends Command {
        constructor() {
            //* Ensure the 'keys' property is assigned before calling the parent constructor
            const { keys, ...rest } = properties;
            super(keys);
            Object.assign(this, rest);
        }
    }

    return new CommandProxy();
}

function smartCommand(command) {
    if (Directory.get(command)) //* Start by seeing if we can navigate a directory
        return Directory.cd(command);

    return null;
}

const CD = commandFactory({
    keys: ['cd', 'goto'],
    invoke: function (params) {
        if (params.length != 1)
            return "cd command takes 1 parameter (path)";
        return Directory.cd(params[0])
    }
})

const LIST = commandFactory({
    keys: ['ls', 'list'],
    invoke: function (params) {
        if (params.length == 0)
            return str(ls(Directory.current));

        let contents = [];
        params.forEach(path => {
            const n = Directory.get(path);
            if (n)
                contents.push(...ls(n))
            else
                contents.push(`Path '${path}' is not a directory.`);
        });

        return str(contents);

        function str(contents) {
            return contents.join('<br>');
        }

        function ls(node) {
            return Array.from(node.children.values(), (n) => n.fullName);
        }
    }
})

export { Command };