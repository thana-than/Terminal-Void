import '../css/os.css'
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Program from "./program";

function isWhitespaceString(str) { return !/\S/.test(str); }

export default class CLI extends Program {
    commandHistory = [];
    historyIndex = -1;
    commandHistory_maxSize = 50;
    blocks = [];
    commandRunning = false;
    startMessage = <>Welcome!</>;
    pressToCloseMessage = <>Press any key to continue.</>
    initialized = false;

    ready_pressToClose = false;
    queue_pressToClose = false;
    queue_scrollToLastOnRefresh = false;
    offset_scrollToLast = 10;

    lastCommandBlockDivID = 0;

    themeStyle = "cliTheme";

    constructor(interpreter) {
        super();
        this.interpreter = interpreter;
    }

    initialize() {
        this.initialized = true;
        this.print(<div className='response'>{this.startMessage}</div>, false);
    }

    pressToClose(refreshImmediate = false) {
        this.queue_pressToClose = true;
        if (refreshImmediate)
            this.refresh();
    }

    clear() {
        this.blocks.length = 0;
    }

    async refresh() {
        super.refresh();
        if (this.queue_scrollToLastOnRefresh) {
            await this.scrollOutputToLastDiv();
        }
    }

    print(markup, refresh = true) {
        this.lastCommandBlockDivID = uuidv4();

        const block = <div id={this.lastCommandBlockDivID} className='commandBlock'> {markup} </div>
        this.blocks.push(block);
        this.queue_scrollToLastOnRefresh = true;
        if (refresh) this.refresh()
    }

    printCommand(command, response) {
        if (command) {
            var commandMarkup = <div className='command'>&gt; {command}</div>
        }
        var responseMarkup = <div className='response'>{response}</div>

        this.print(<>{commandMarkup}{responseMarkup}</>);

    }

    async sendCommand(command) {
        this.commandRunning = true;
        const cleaned_command = command.toLowerCase().trim()

        const context = {
            cli: this,
            interpreter: this.interpreter,
        }

        const interpret = typeof this.interpreter.Run === 'function' ? this.interpreter.Run : this.interpreter;
        const response = await interpret.call(this.interpreter, cleaned_command, context);

        if (typeof this.interpreter.AllowCommandDisplay === 'function') {
            if (!this.interpreter.AllowCommandDisplay(cleaned_command))
                command = null;
        }

        this.printCommand(command, response);
        this.commandRunning = false;
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

            if (!isWhitespaceString(command) && this.commandHistory[this.commandHistory.length - 1] != command)
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

    async scrollOutputToLastDiv() {
        this.queue_scrollToLastOnRefresh = false;
        var lastTop = -1;
        for (let i = 0; i < 60; i++) {

            var outputDiv = document.getElementById('output');
            var lastCommandDiv = document.getElementById(this.lastCommandBlockDivID);

            if (lastTop != -1 && outputDiv.scrollTop !== lastTop) {
                console.log("SCROLL UPDATED FRAME " + i + " | before: " + lastTop + " | after: " + outputDiv.scrollTop);
                break;
            }

            lastTop = outputDiv.scrollTop;
            if (lastCommandDiv != null)
                outputDiv.scrollTop = lastCommandDiv.offsetTop - this.offset_scrollToLast;

            //*Wait one frame!
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
    }

    draw() {
        if (!this.initialized)
            this.initialize();

        if (this.queue_pressToClose) {
            this.queue_pressToClose = false;
            this.ready_pressToClose = true;
            this.print(<div className='response'>{this.pressToCloseMessage}</div>, false);
        }

        return (
            <div className="cli">
                <div id="output">
                    {this.blocks.map(block => (
                        <React.Fragment key={block.props.id}>{block}</React.Fragment>
                    ))}
                </div>
                <input type="text" id="input" autoFocus></input>
            </div>
        );
    }
}