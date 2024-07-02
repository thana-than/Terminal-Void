import '../css/os.css'
import React from 'react';
import { Command } from './command.js';
import { v4 as uuidv4 } from 'uuid';
import { Program } from "./program";

class CLI extends Program {
    static commandHistory = [];
    static historyIndex = -1;
    blocks = [];
    commandRunning = false;


    printCommand(command, response) {
        const commandId = uuidv4();
        const responseId = uuidv4();

        this.blocks.push({ key: commandId, type: 'command', content: `> ${command}` },
            { key: responseId, type: 'response', content: response });

        //TODO this only kind of works and only if the command doesn't have an await.
        //TODO find a way to ensure the update only occurs once it's ready
        setTimeout(() => {
            this.scrollOutputToBottom();
        }, 0);
    }

    async sendCommand(command) {
        this.commandRunning = true;
        const cleaned_command = command.toLowerCase()

        const response = await Command.Run(cleaned_command);
        this.printCommand(command, response);

        this.commandRunning = false;
        this.refresh()
    }

    onKeyDown(event) {
        if (this.commandRunning) {
            event.preventDefault();
            return;
        }

        const inputElement = document.getElementById('input');

        if (event.key === 'Enter') {
            const command = inputElement.value;
            inputElement.value = '';
            CLI.commandHistory.push(command);
            CLI.historyIndex = CLI.commandHistory.length;
            this.sendCommand(command);
        } else if (event.key === 'ArrowUp') {
            if (CLI.historyIndex > 0) {
                CLI.historyIndex -= 1;
                inputElement.value = CLI.commandHistory[CLI.historyIndex];
            }
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (CLI.historyIndex < CLI.commandHistory.length - 1) {
                CLI.historyIndex += 1;
                inputElement.value = CLI.commandHistory[CLI.historyIndex];
            } else {
                CLI.historyIndex = CLI.commandHistory.length;
                inputElement.value = '';
            }
            event.preventDefault();
        }
    }

    scrollOutputToBottom() {
        const outputDiv = document.getElementById('output');
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    draw() {
        return (
            <div className="cli">
                <div id="output">
                    {this.blocks.map(block => (
                        <React.Fragment key={block.key}>
                            <div className={block.type}>{block.content}</div>
                        </React.Fragment>
                    ))}
                </div>
                <input type="text" id="input" autoFocus></input>
            </div>
        );
    }
}

export { CLI };