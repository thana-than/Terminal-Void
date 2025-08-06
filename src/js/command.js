import Data from "./gameData";
import React from 'react';
const REGEX_COMMAND_SEPARATOR = /(?:"([^"]+)"|'([^']+)')|(\S+)/g //*Matches commands and parameters split between spaces and double or single quotes. quotes are removed when matching
import inputFilter from './autocomplete';
import { v4 as uuidv4 } from 'uuid';


export const BASE_COMMANDS = {
    HELP: {
        keys: ['help'],
        help: <>Enter "help &#40;command_name&#41;" for more info.</>,
        autoContexts: [['commands'], '...'],
        verboseHelp: function () {
            return <>
                Describes available commands.
                <div className='subtext'>{this.help}</div>
            </>;
        },
        invoke: function (params, context) {
            const len = params.length;

            var str = [];
            if (len > 0) {
                params.forEach(param => {
                    let command = context.interpreter.Get(param, context);
                    if (command && command.alias) {
                        command = context.interpreter.Get(command.alias, context);
                    }

                    if (Interpreter.commandIsValid(command)) {
                        if (command.verboseHelp)
                            str.push(this.getVerboseHelpBlock(command, context));
                        else if (command.help)
                            str.push(this.getHelpBlock(command, context));
                    }
                    else {
                        str.push(<div key={uuidv4()}>Help - Parameter {param} not recognized as a command</div>);
                    }

                });
            }
            else {
                context.interpreter.commandArray.forEach(command => {
                    if (command == this)
                        str.push(<div key={uuidv4()} className='subHead'>{this.help}</div>);
                    else if (context.interpreter.HasAccess(command, context.superuser) && command.help)
                        str.push(this.getHelpBlock(command, context));
                });
            }

            return <>{str}</>;
        },
        getHelpBlock: function (command, context) {
            return (<div key={uuidv4()}>{this.prefix(command, context)} <span className='small'>{command.help}</span></div>);
        },
        getVerboseHelpBlock: function (command, context) {
            return (<div key={uuidv4()}>{this.prefix(command, context)}<br></br>{command.verboseHelp()}</div>);
        },
        prefix: function (command, context) {
            const keys = command.keys.map((key, idx) =>
                <React.Fragment key={key}>
                    <a className="cliLink" onClick={() => this.keyLink(key, context)}>{key}</a>
                    {idx < command.keys.length - 1 ? ', ' : ''}
                </React.Fragment>
            )
            return <><a className="cliLink" onClick={() => this.keyLink(command.keys[0], context)}>{command.keys[0]}</a><span className='subHead'> [{keys}]</span>:</>
        },
        keyLink(key, context) {
            return context.cli.sendCommand(`help "${key}"`)
        }
    },

    EXIT: {
        keys: ['exit', 'close', 'quit'],
        help: "Closes the actively running program.",
        invoke: function (params, context) {
            context.cli.close();
        }
    }
}

export default class Interpreter {
    commands = new Map();
    commandArray = [];
    defaultCommand;
    constructor(commands, defaultCommand) {
        //*If commands aren't an array, we are going to assume this an object containing commands as values
        if (!Array.isArray(commands)) {
            commands = Object.values(commands);

            //* If commands still aren't an array, we are going to assume this is a simple interpreter that takes one function
            if (!Array.isArray(commands)) {
                this.defaultCommand = commands;
                return;
            }
        }
        this.commandArray = commands;

        commands.forEach(command => {
            const keys = command.keys;
            if (keys) {
                keys.forEach(key => {
                    if (!this.commands.has(key))
                        this.commands.set(key, command);
                });
            }
        });

        this.defaultCommand = defaultCommand;
    }

    Get(command, context) {
        const commandObj = this.commands.get(command);

        if (!commandObj)
            return null;

        //*If the command requires an accessKey but we don't have it, return null
        if (!this.HasAccess(commandObj, context)) {
            if (commandObj.accessFailed)
                return commandObj.accessFailed;

            return null;
        }

        return commandObj;
    }

    HasAccess(command, context) {
        const commandObj = (typeof command === 'string') ? this.commands.get(command) : command;

        if (!commandObj)
            return false;

        //*If the command requires an accessKey but we don't have it, return null
        if (commandObj.accessKey && !Data.HasAccess(commandObj.accessKey, context))
            return false;

        return true;
    }

    autoComplete(words, context) {
        const wordIndex = words.length - 1;
        const startWord = words[0];
        const currentWord = words[wordIndex];

        //*Set up some important context properties
        context.interpreter = this;
        context.flags = new Set();

        if (currentWord == undefined)
            currentWord = '';

        if (wordIndex == 0) { //* if we're on our first word, then we're just starting off! apply whatever flags are specified by our initial context
            if (currentWord == '') //*If we're at no letters whatsoever, get outa here
                return [];

            if (context.firstWordFlags)
                context.firstWordFlags.forEach((flag) => context.flags.add(flag));
        }
        else { //* Following words are more complex

            //* try to get a command from the interpreter for our first word, if we can't then we're out of luck on any more predictions
            const parameterIndex = wordIndex - 1;
            const cmd = this.Get(startWord, context);
            if (!Interpreter.commandIsValid(cmd))
                return [];

            //* we go through the command to gather any specified contexts
            if (cmd.autoContexts != null) {
                const contextLen = cmd.autoContexts.length;
                const contextIndex = Math.min(parameterIndex, contextLen - 1);
                //*the '...' at an index means repeat the item before it. this allows for endless word prediction if necessary
                const available = cmd.autoContexts[contextLen - 1] === '...' || parameterIndex < contextLen;

                if (available) {
                    //*Get the last applicable context set and apply the flags
                    const contextSet = cmd.autoContexts[contextIndex] !== '...' ? cmd.autoContexts[contextIndex] : cmd.autoContexts[contextIndex - 1];
                    contextSet.forEach((flag) => context.flags.add(flag));
                }
            }

            //*If there's any custom context specified, we add those as well
            if (cmd.autoCustomContext) {
                if (typeof cmd.autoCustomContext === 'function')
                    context.custom = cmd.autoCustomContext(context);
                else
                    context.custom = cmd.autoCustomContext;
            }
        }

        //*Heres where we send the word + context to get our result!
        const predictions = inputFilter(currentWord, context);
        return predictions;
    }

    static commandIsValid(command) {
        if (command == null || typeof command === 'string' || React.isValidElement(command))
            return false;

        return true;
    }

    static splitCommand(command) {
        return [...command.matchAll(REGEX_COMMAND_SEPARATOR)].map(match => match[1] || match[2] || match[3]);
    }

    async Run(command, context) {
        //*Still don't fully understand regex, but we want to map through match[1] [2] then [3] as they are the matches using double quotes, single quotes, and regular spacing respectively
        const cmd = Interpreter.splitCommand(command);
        const params = cmd.slice(1);
        context.key = cmd[0];
        context.fullCommand = command;

        const requested = this.Get(cmd[0], context)
        if (!requested) {
            if (this.defaultCommand && params.length == 0) {
                const response = await this.defaultCommand(cmd[0], context);
                if (response) return response;
            }

            return `Command ${cmd[0]} does not exist!`;
        }
        else if (!Interpreter.commandIsValid(requested))
            return requested;

        const response = await requested.invoke(params, context);
        return response;
    }
}