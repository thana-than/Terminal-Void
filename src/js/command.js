const REGEX_SPACE = /\s+/ //TODO allow quotes to keep spaces

export default class Interpreter {
    commands = new Map();
    commandArray = [];
    defaultCommand;
    constructor(commands, defaultCommand) {
        //*If commands aren't an array, we are going to assume this is a simple interpreter that takes one function
        if (!Array.isArray(commands)) {
            this.defaultCommand = commands;
            return;
        }
        this.commandArray = commands;

        commands.forEach(command => {
            const keys = command.keys;
            if (keys) {
                keys.forEach(key => {
                    this.commands.set(key, command);
                });
            }
        });

        this.defaultCommand = defaultCommand;
    }

    Get(command) {
        return this.commands.get(command);
    }

    Run(command, context) {
        const cmd = command.split(REGEX_SPACE); //*Splits / removes whitespace chunks
        const params = cmd.slice(1);

        const requested = this.commands.get(cmd[0])
        if (!requested) {
            if (this.defaultCommand && params.length == 0) {
                const response = this.defaultCommand(cmd[0]);
                if (response) return response;
            }

            return `Command ${cmd[0]} does not exist!`;
        }

        return requested.invoke(params, context);
    }

    //*Checks if we want the command used to call the designated command shown in the display
    AllowCommandDisplay(command) {
        const cmd = command.split(REGEX_SPACE);
        const requested = this.commands.get(cmd[0])
        if (requested && requested.allowCommandDisplay != null) {
            return requested.allowCommandDisplay;
        }

        return true;
    }
}