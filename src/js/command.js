import Data from "./gameData";
import React from 'react';
const REGEX_COMMAND_SEPARATOR = /(?:"([^"]+)"|'([^']+)')|(\S+)/g //*Matches commands and parameters split between spaces and double or single quotes. quotes are removed when matching
import inputFilter from './autocomplete';
import { Directory } from './dir';

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

        if (!commandObj)
            return null;

        //*If the command requires an accessKey but we don't have it, return null
        if (!this.HasAccess(commandObj)) {
            if (commandObj.accessFailed)
                return commandObj.accessFailed;

            return null;
        }

        return commandObj;
    }

    HasAccess(command) {
        const commandObj = (typeof command === 'string') ? this.commands.get(command) : command;

        if (!commandObj)
            return false;

        //*If the command requires an accessKey but we don't have it, return null
        if (commandObj.accessKey && !Data.HasAccess(commandObj.accessKey))
            return false;

        return true;
    }

    autoComplete(portion, index) {
        const context = {
            interpreter: this,
            node: Directory.current,
            //TODO properly read context
            commands: true,
            folders: true,
            files: true,
        };

        if (portion == undefined || portion == '')
            return '';

        console.log(index);
        const predictedStr = inputFilter(portion, context);
        if (predictedStr == undefined)
            return '';

        return predictedStr;
    }

    static splitCommand(command) {
        return [...command.matchAll(REGEX_COMMAND_SEPARATOR)].map(match => match[1] || match[2] || match[3]);
    }

    async Run(command, context) {
        //*Still don't fully understand regex, but we want to map through match[1] [2] then [3] as they are the matches using double quotes, single quotes, and regular spacing respectively
        const cmd = Interpreter.splitCommand(command);
        const params = cmd.slice(1);

        const requested = this.Get(cmd[0])
        if (!requested) {
            if (this.defaultCommand && params.length == 0) {
                const response = await this.defaultCommand(cmd[0], context);
                if (response) return response;
            }

            return `Command ${cmd[0]} does not exist!`;
        }
        else if (typeof requested === 'string' || React.isValidElement(requested))
            return requested;

        const response = await requested.invoke(params, context);
        return response;
    }
}