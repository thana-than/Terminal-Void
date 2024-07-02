import '../css/os.css'
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Program from "./program";

export default class CLI extends Program {
    commandHistory = [];
    historyIndex = -1;
    commandHistory_maxSize = 50;
    blocks = [];
    commandRunning = false;
    startMessage = <p>Welcome!<br></br></p>;
    pressToCloseMessage = <p>Press any key to continue.</p>
    initialized = false;

    ready_pressToClose = false;
    queue_pressToClose = false;

    constructor(interpreter) {
        super();
        this.interpreter = interpreter;
    }

    initialize() {
        this.blocks.push({ key: uuidv4(), type: 'response', content: this.startMessage })
        this.initialized = true;
    }

    pressToClose(refreshImmediate = false) {
        this.queue_pressToClose = true;
        if (refreshImmediate)
            this.refresh();
    }

    clear() {
        this.blocks.length = 0;
    }

    printCommand(command, response) {
        const commandId = uuidv4();
        const responseId = uuidv4();

        if (command)
            this.blocks.push({ key: commandId, type: 'command', content: `> ${command}` });

        this.blocks.push({ key: responseId, type: 'response', content: response });

        //TODO this only kind of works and only if the command doesn't have an await.
        //TODO find a way to ensure the update only occurs once it's ready
        setTimeout(() => {
            this.scrollOutputToBottom();
        }, 0);
    }

    async sendCommand(command) {
        this.commandRunning = true;
        const cleaned_command = command.toLowerCase()

        const context = {
            cli: this
        }

        const interpret = typeof this.interpreter.Run === 'function' ? this.interpreter.Run : this.interpreter;
        const response = await interpret.call(this.interpreter, cleaned_command, context);

        if (typeof this.interpreter.AllowCommandDisplay === 'function') {
            if (!this.interpreter.AllowCommandDisplay(cleaned_command))
                command = null;
        }

        this.printCommand(command, response);

        this.commandRunning = false;
        this.refresh()
    }

    onKeyDown(event) {
        if (this.commandRunning) {
            event.preventDefault();
            return;
        }

        if (this.ready_pressToClose) {
            this.ready_pressToClose = false;
            this.close();
        }

        const inputElement = document.getElementById('input');

        if (event.key === 'Enter') {
            const command = inputElement.value;
            inputElement.value = '';

            if (this.commandHistory[this.commandHistory.length - 1] != command)
                this.commandHistory.push(command);

            //* If we are using a max size for our command history, enforce it by removing the first element of the history (if over max)
            if (this.commandHistory_maxSize > 0 && this.commandHistory.length > this.commandHistory_maxSize)
                this.commandHistory.shift();

            this.historyIndex = this.commandHistory.length;

            this.sendCommand(command);
        } else if (event.key === 'ArrowUp') {
            if (this.historyIndex > 0) {
                this.historyIndex -= 1;
                inputElement.value = this.commandHistory[this.historyIndex];
            }
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex += 1;
                inputElement.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
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
        if (!this.initialized)
            this.initialize();

        if (this.queue_pressToClose) {
            this.queue_pressToClose = false;
            this.ready_pressToClose = true;
            this.blocks.push({ key: uuidv4(), type: 'response', content: this.pressToCloseMessage })
        }

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