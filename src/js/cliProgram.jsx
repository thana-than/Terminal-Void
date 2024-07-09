import '../css/os.css'
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Program from "./program";
import Interpreter from './command';

function isWhitespaceString(str) { return !/\S/.test(str); }

export default class CLI extends Program {
    commandHistory = [];
    historyIndex = -1;
    commandHistory_maxSize = 50;
    blocks = [];
    clearedBlocks = []
    commandRunning = false;
    startMessage = <>Welcome!</>;
    pressToCloseMessage = <>Press any key to continue.</>
    initialized = false;

    ready_pressToClose = false;
    queue_pressToClose = false;
    queue_snapToBottom = false;

    scroll_target

    getFontSize() { return parseFloat(getComputedStyle(document.querySelector('.program')).fontSize) };

    autoScrollTargetDivID = 0;

    themeStyle = "cliTheme";

    cullMax_commandBlocks = 100;
    cullMax_scrollHeight = 5000;

    autoCompleteWord = '';
    autoCompleteContext = { cli: this };

    constructor(interpreter) {
        super();
        this.interpreter = interpreter;
    }

    initialize() {
        this.initialized = true;
        this.print(<div>{this.startMessage}</div>, false);
    }

    pressToClose(refreshImmediate = false) {
        this.queue_pressToClose = true;
        if (refreshImmediate)
            this.refresh();
    }

    clear() {
        this.clearedBlocks = [...this.blocks];
        this.blocks.length = 0;
    }

    undoClear() {
        if (this.clearedBlocks.length == 0)
            return "No history to restore"
        this.blocks = [...this.clearedBlocks, ...this.blocks]
        this.clearedBlocks.length = 0;
        return "Terminal history restored";
    }

    print(markup, refresh = true, autoScrollTarget = true) {
        const id = uuidv4();
        const block = <div id={id} className='commandBlock'> {markup} </div>
        this.blocks.push(block);

        if (autoScrollTarget) {
            this.autoScrollTargetDivID = id;
        }

        if (refresh) {
            this.refresh()
        }
    }

    printCommand(command, response) {
        if (!command && !response) {
            this.refresh();
            return;
        }

        if (command) {
            var commandMarkup = <div className='command'>&gt; {command}</div>
        }
        if (response) {
            var responseMarkup = <div className='response'>{response}</div>
        }


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
        const payload = await interpret.call(this.interpreter, cleaned_command, context);

        //*Payload parsing
        let response = payload;
        if (response != null) {
            if (payload.ignorePrintCommand) {
                command = null;
            }

            if (payload.ignorePrintResponse) {
                response = null;
            }
            else if (payload.response) {
                response = payload.response;
            }

            this.printCommand(command, response);
        }
        else {
            //! If this happens it's because response crapped out! Right now we just don't do anything :/
        }

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
        const autoCompleteDiv = document.getElementById('autoComplete');

        if (event.key === 'Enter') {
            const command = inputElement.value;
            inputElement.value = '';

            if (!isWhitespaceString(command) && this.commandHistory[this.commandHistory.length - 1] != command)
                this.commandHistory.push(command);

            //* If we are using a max size for our command history, enforce it by removing the first element of the history (if over max)
            if (this.commandHistory_maxSize > 0 && this.commandHistory.length > this.commandHistory_maxSize)
                this.commandHistory.shift();

            this.historyIndex = this.commandHistory.length;

            this.clearAutoComplete(autoCompleteDiv);
            this.sendCommand(command);
        } else if (event.key === 'ArrowUp') {
            if (this.historyIndex > 0) {
                this.historyIndex -= 1;
                inputElement.value = this.commandHistory[this.historyIndex];
                this.clearAutoComplete(autoCompleteDiv);
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
            this.clearAutoComplete(autoCompleteDiv);
            event.preventDefault();
        } else if (event.key === 'Tab') {
            this.assignAutoComplete(inputElement, autoCompleteDiv);
            event.preventDefault();
        }
    }

    //TODO move input field to another class maybe?
    onInputChanged = (event) => {
        const inputDiv = event.target;
        const text = inputDiv.value;

        const autoCompleteDiv = document.getElementById('autoComplete');
        this.updateAutoCompleteText(text, autoCompleteDiv);
        this.updateAutoCompletePosition(inputDiv, autoCompleteDiv);
    }

    updateAutoCompleteText(text, autoCompleteDiv) {
        const words = this.getSplits(text);
        if (words.length == 0) {
            this.clearAutoComplete(autoCompleteDiv);
            return;
        }

        this.autoCompleteWord = this.interpreter.autoComplete(words, this.autoCompleteContext);
        autoCompleteDiv.innerHTML = this.autoCompleteWord.slice(words.pop().length);
    }

    getSplits(text) {
        const commandSplits = Interpreter.splitCommand(text);

        if (/\s$/.test(text))
            commandSplits.push(''); //*Make sure we add the last space if that's a thing

        return commandSplits;
    }

    assignAutoComplete(inputElement, autoCompleteDiv) {
        let text = inputElement.value;
        if (text == '' || this.autoCompleteWord == '')
            return;

        const commandSplits = this.getSplits(text);
        const last = commandSplits[commandSplits.length - 1];
        const lastLen = last.length;

        if (lastLen > 0)
            text = text.slice(0, -last.length);

        inputElement.value = `${text}${this.autoCompleteWord}`;
        this.clearAutoComplete(autoCompleteDiv);
    }

    clearAutoComplete(autoCompleteDiv) {
        this.autoCompleteWord = '';
        autoCompleteDiv.innerHTML = '';
    }

    updateAutoCompletePosition(inputDiv, autoCompleteDiv) {
        const cursorPosition = this.getCaretCoordinates(inputDiv, inputDiv.value.length);
        autoCompleteDiv.style.left = `${cursorPosition.x}px`;
        autoCompleteDiv.style.top = `${cursorPosition.y}px`;
        autoCompleteDiv.style.height = `${cursorPosition.height}px`;
    }

    getCaretCoordinates(inputElement, offset) {
        const inputRect = inputElement.getBoundingClientRect();
        const parentRect = inputElement.parentElement.getBoundingClientRect();

        const relLeft = inputRect.left - parentRect.left;
        const relTop = inputRect.top - parentRect.top;

        const inputStyle = window.getComputedStyle(inputElement);
        const fontSize = parseFloat(inputStyle.fontSize);
        //const letterSpacing = parseFloat(inputStyle.letterSpacing);
        const charWidth = fontSize;// + letterSpacing;

        const marginTop = parseFloat(inputStyle.paddingTop);
        const padding = parseFloat(inputStyle.paddingBlockEnd)

        //* 1.1) / 2 seems to be the magic number that works in my VERY specific case. Very hacky I know.
        //TODO find out how to actually properly map this!!!
        const x = relLeft + offset * (charWidth * 1.1) / 2;
        const y = relTop + marginTop + padding;
        const height = fontSize;

        return { x, y, height };
    }

    async autoScroll() {
        var outputDiv = document.getElementById('output');
        const autoScrollTargetDiv = document.getElementById(this.autoScrollTargetDivID);
        //* If we have queued to just snap to the bottom, lets do that and get outa here
        if (this.queue_snapToBottom || !autoScrollTargetDiv) {
            outputDiv.scrollTop = outputDiv.scrollHeight;
            this.queue_snapToBottom = false;
            return;
        }

        const scrollTarget = document.getElementById(this.autoScrollTargetDivID).offsetTop - this.getFontSize();
        var scrollTop;
        updateScrollTop();
        outputDiv.scrollTo({ top: scrollTop, behavior: 'smooth' });

        //*We keep checking for some frames ahead in case the last div will expand (due to images or otherwise)
        //*If there is an expansion, we'll scroll one more time then exit this function
        for (var i = 0; i < 60; i++) {
            let last_scrollTop = scrollTop;
            updateScrollTop();

            if (last_scrollTop != scrollTop) {
                console.log("SCROLL UPDATED: frame " + i);
                outputDiv.scrollTo({ top: scrollTop, behavior: 'smooth' });
                break;
            }

            await new Promise(resolve => requestAnimationFrame(resolve));
        }

        //*Detect where we can scroll based off of our target and max scroll capability
        function updateScrollTop() {
            outputDiv = document.getElementById('output');
            const bottomOut = outputDiv.scrollHeight - outputDiv.offsetHeight;
            scrollTop = Math.min(bottomOut, scrollTarget);
        }
    }

    cullingTest() {
        const outputDiv = document.getElementById('output');

        let cullCount = 0;
        let scrollHeight = outputDiv.scrollHeight;

        while (scrollHeight > this.cullMax_scrollHeight) {
            const elementHeight = document.getElementById(this.blocks[cullCount].props.id).offsetHeight;
            scrollHeight -= elementHeight;
            cullCount++;
        }

        while (this.blocks.length - cullCount > this.cullMax_commandBlocks) {
            cullCount++;
        }

        if (cullCount > 0) {
            this.blocks.splice(0, cullCount);
            console.log("CULLED " + cullCount);
        }
    }

    run() {
        this.queue_snapToBottom = true;
    }

    preDrawStep() {
        if (!this.initialized)
            this.initialize();

        if (this.queue_pressToClose) {
            this.queue_pressToClose = false;
            this.ready_pressToClose = true;
            this.print(<div>{this.pressToCloseMessage}</div>, false, false);
        }
    }

    draw() {
        this.preDrawStep();

        return (
            <div className="cli">
                <div id="output">
                    {this.blocks.map(block => (
                        <React.Fragment key={block.props.id}>{block}</React.Fragment>
                    ))}
                </div>
                <input type="text" id="input" onChange={this.onInputChanged} autoFocus></input>
                <div id='autoComplete'></div>
            </div>
        );
    }

    async postRenderCallback() {
        await this.autoScroll();
        this.cullingTest();
    }
}