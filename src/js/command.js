import Data from "./gameData";
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
        const commandObj = this.commands.get(command);

        //*If the command requires an accessKey but we don't have it, return null
        if (!this.HasAccess(commandObj))
            return null;

        return commandObj;
    }

    HasAccess(command) {
        const commandObj = (typeof command === 'string') ? this.commands.get(command) : command;

        if (!commandObj)
            return false;

        //*If the command requires an accessKey but we don't have it, return null
        if (commandObj.accessKey && !Data.accessKeys.has(commandObj.accessKey))
            return false;

        return true;
    }

    async Run(command, context) {
        const cmd = command.split(REGEX_SPACE); //*Splits / removes whitespace chunks
        const params = cmd.slice(1);

        const requested = this.Get(cmd[0])
        if (!requested) {
            if (this.defaultCommand && params.length == 0) {
                const response = await this.defaultCommand(cmd[0]);
                if (response) return response;
            }

            return `Command ${cmd[0]} does not exist!`;
        }
        const response = await requested.invoke(params, context);
        return response;
    }

    //*Checks if we want the command used to call the designated command shown in the display
    AllowCommandDisplay(command) {
        const cmd = command.split(REGEX_SPACE);
        const requested = this.Get(cmd[0])
        if (requested && requested.allowCommandDisplay != null) {
            return requested.allowCommandDisplay;
        }

        return true;
    }
}