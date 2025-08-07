import '../css/os.css'
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Program from "./program";
import Interpreter from './command';
import UserPerms from './userperms.js';

function isWhitespaceString(str) { return !/\S/.test(str); }

export default class CLI extends Program {
    commandHistory = [];
    commandBuffer = '';
    historyIndex = -1;
    commandHistory_maxSize = 50;
    blocks = [];
    clearedBlocks = []
    commandRunning = false;
    startMessage = <>Welcome!</>;
    pressToCloseMessage = <>Press any key to continue.</>
    initialized = false;
    showSendButton = true;

    ready_pressToClose = false;
    queue_pressToClose = false;
    queue_snapToBottom = false;
    queue_snapTotop = true;

    scroll_target

    getFontSize() { return parseFloat(getComputedStyle(document.querySelector('.program')).fontSize) };

    autoScrollTargetDivID = 0;

    themeStyle = "cliTheme";


    allow_printCulling = true;
    cullMax_commandBlocks = 100;
    cullMax_scrollHeight = 5000;

    firstWordFlags = ['commands', 'folders', 'files'];
    allowAutoComplete = true;

    autoCompleteState = {
        words: [],
        index: 0,
    }

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

    async interpret(cleaned_command, context) {
        const interpret = typeof context.interpreter.Run === 'function' ? context.interpreter.Run : context.interpreter;
        const payload = await interpret.call(context.interpreter, cleaned_command, context);
        return payload;
    }

    createContext() {
        const context = new UserPerms();
        context.cli = this;
        context.interpreter = this.interpreter;
        return context;
    }

    async sendCommand(command) {
        this.commandRunning = true;
        const cleaned_command = command.toLowerCase().trim()

        const context = this.createContext();
        const payload = await this.interpret(cleaned_command, context);

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

            if (typeof response === 'function') {
                response = response();
            }

            this.printCommand(command, response);
        }
        else {
            //! If this happens it's because response crapped out! Right now we just don't do anything :/
        }

        this.commandRunning = false;

        return payload;
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

        let inputElement = document.getElementById('input');
        const autoCompleteDiv = document.getElementById('autoComplete');
        const inputElementFocussed = inputElement == document.activeElement;

        if (this.isUserAttemptingAutoComplete(event, inputElement)) { //* Autocomplete
            this.assignAutoComplete(inputElement, autoCompleteDiv);
            event.preventDefault();
        }
        else if (event.key === 'Tab') { //* Tab between the output block and the input element
            if (inputElementFocussed) {
                let outputDiv = document.getElementById('output');
                outputDiv?.focus({ focusVisible: false });
            }
            else
                inputElement.focus();
            event.preventDefault();
        }
        else if (event.key === 'ArrowUp') { //* Scroll up in command history
            if (!inputElementFocussed)
                return;

            const wordsLen = this.autoCompleteState.words.length;
            if (wordsLen > 0) {
                this.autoCompleteState.index = (this.autoCompleteState.index - 1 + wordsLen) % wordsLen;
                this.assignAutoCompleteIndex(this.autoCompleteState.index, inputElement.value, autoCompleteDiv);
            }
            else if (this.historyIndex > 0) {
                if (this.historyIndex == this.commandHistory.length)
                    this.commandBuffer = inputElement.value;

                this.historyIndex -= 1;
                inputElement.value = this.commandHistory[this.historyIndex];
                this.clearAutoComplete(autoCompleteDiv);
            }
            event.preventDefault();
        } else if (event.key === 'ArrowDown') { //* Scroll down in command history
            if (!inputElementFocussed)
                return;

            const wordsLen = this.autoCompleteState.words.length;
            if (wordsLen > 0) {
                this.autoCompleteState.index = (this.autoCompleteState.index + 1) % this.autoCompleteState.words.length;
                this.assignAutoCompleteIndex(this.autoCompleteState.index, inputElement.value, autoCompleteDiv);
            }
            else {
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex += 1;
                    inputElement.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    inputElement.value = this.commandBuffer;
                }
                this.clearAutoComplete(autoCompleteDiv);
            }

            event.preventDefault();
        } else if (event.key === 'Enter') { //* Submit input
            const command = inputElement.value;
            inputElement.value = '';

            if (!isWhitespaceString(command) && this.commandHistory[this.commandHistory.length - 1] != command)
                this.commandHistory.push(command);

            //* If we are using a max size for our command history, enforce it by removing the first element of the history (if over max)
            if (this.commandHistory_maxSize > 0 && this.commandHistory.length > this.commandHistory_maxSize)
                this.commandHistory.shift();

            this.historyIndex = this.commandHistory.length;

            this.clearAutoComplete(autoCompleteDiv);
            this.commandBuffer = '';
            this.sendCommand(command);
        }
    }

    onInputChanged = (event) => {
        this.runAutoComplete(event.target);
    }

    isUserAttemptingAutoComplete(event, inputElement) {
        if (event.code === 'simulated')
            return false;

        const validKeyPress = event.key === 'Tab' || event.key === 'ArrowRight' || event.key === 'Enter';
        if (!validKeyPress)
            return false;

        if (!this.hasAutoComplete())
            return;

        const cursorAtEndOfText = inputElement.selectionStart >= inputElement.value.length;
        if (!cursorAtEndOfText)
            return false;

        //* Checks if the word we are focussed on in the autocomplete is already completed, if so we don't need to autocomplete
        const commandSplits = this.getSplits(inputElement.value);
        const word = commandSplits[commandSplits.length - 1];
        if (word !== undefined && word.toLowerCase().trim() == this.autoCompleteState.words[this.autoCompleteState.index].word)
            return false;

        return true;
    }

    runAutoComplete(inputDiv) {
        if (!this.allowAutoComplete)
            return;

        if (!this.interpreter || typeof this.interpreter.autoComplete !== 'function')
            return;

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

        const context = this.createContext();
        if (this.firstWordFlags != undefined)
            context.firstWordFlags = this.firstWordFlags;

        this.autoCompleteState.words = this.interpreter.autoComplete(words, context);
        if (this.autoCompleteState.words == undefined || this.autoCompleteState.words.length == 0) {
            this.clearAutoComplete(autoCompleteDiv);
            return;
        }

        this.autoCompleteState.index = 0;
        this.autoCompleteFillHTML(text, autoCompleteDiv);
    }

    autoCompleteFillHTML(text, autoCompleteDiv) {
        const space = '&nbsp;'.repeat(text.length);
        const end = this.autoCompleteState.words[this.autoCompleteState.index].end;
        autoCompleteDiv.innerHTML = `${space}${end}`;
    }

    assignAutoCompleteIndex(index, text, autoCompleteDiv) {
        if (!this.hasAutoComplete()) {
            this.clearAutoComplete(autoCompleteDiv);
            return;
        }

        this.autoCompleteState.index = index;
        this.autoCompleteFillHTML(text, autoCompleteDiv);
    }

    hasAutoComplete() {
        return this.autoCompleteState.words != undefined && this.autoCompleteState.words.length > 0;
    }

    getSplits(text) {
        const commandSplits = Interpreter.splitCommand(text);

        if (/\s$/.test(text))
            commandSplits.push(''); //*Make sure we add the last space if that's a thing

        return commandSplits;
    }

    getLastCompleteWordInInput(inputElement) {
        let text = inputElement.value;
        if (text == '' || !this.hasAutoComplete())
            return undefined;

        const commandSplits = this.getSplits(text);
        const last = commandSplits[commandSplits.length - 1];
        const lastLen = last.length;

        if (lastLen > 0)
            text = text.slice(0, -last.length);
        return text;
    }

    assignAutoComplete(inputElement, autoCompleteDiv) {
        const text = this.getLastCompleteWordInInput(inputElement);
        if (text === undefined)
            return;

        inputElement.value = `${text}${this.autoCompleteState.words[this.autoCompleteState.index].word}`;
        this.clearAutoComplete(autoCompleteDiv);
    }

    setTextBox(string) {
        const inputElement = document.getElementById('input');
        inputElement.value = string;
    }

    clearAutoComplete(autoCompleteDiv) {
        this.autoCompleteState.words = [];
        this.autoCompleteState.index = 0;
        autoCompleteDiv.innerHTML = '';
    }

    updateAutoCompletePosition(inputDiv, autoCompleteDiv) {
        const inputRect = inputDiv.getBoundingClientRect();
        const parentRect = inputDiv.parentElement.getBoundingClientRect();
        const relLeft = inputRect.left - parentRect.left;
        const relTop = inputRect.top - parentRect.top;

        autoCompleteDiv.style.left = `${relLeft}px`;
        autoCompleteDiv.style.top = `${relTop}px`;
    }

    async autoScroll() {
        var outputDiv = document.getElementById('output');
        if (!outputDiv)
            return;
        const autoScrollTargetDiv = document.getElementById(this.autoScrollTargetDivID);

        //* If we have queued to just snap to the top or bottom, lets do that and get outa here
        let snapQueued = this.queue_snapTotop || this.queue_snapToBottom || !autoScrollTargetDiv;
        if (snapQueued) {
            if (this.queue_snapTotop) {
                outputDiv.scrollTop = 0;
            } else {
                outputDiv.scrollTop = outputDiv.scrollHeight;
            }

            this.queue_snapToBottom = false;
            this.queue_snapTotop = false;
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
            if (!outputDiv)
                return;
            const bottomOut = outputDiv.scrollHeight - outputDiv.offsetHeight;
            scrollTop = Math.min(bottomOut, scrollTarget);
        }
    }

    cullingTest() {
        const outputDiv = document.getElementById('output');
        if (!outputDiv)
            return;

        let cullCount = 0;
        let scrollHeight = outputDiv.scrollHeight;

        if (this.allow_printCulling) {
            while (this.cullMax_scrollHeight >= 0 && scrollHeight > this.cullMax_scrollHeight) {
                const elementHeight = document.getElementById(this.blocks[cullCount].props.id).offsetHeight;
                scrollHeight -= elementHeight;
                cullCount++;
            }

            while (this.cullMax_commandBlocks >= 0 && this.blocks.length - cullCount > this.cullMax_commandBlocks) {
                cullCount++;
            }
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
                <div tabIndex="1" id="output">
                    {this.blocks.map(block => (
                        <React.Fragment key={block.props.id}>{block}</React.Fragment>
                    ))}
                </div>
                <div className='inputBox'>
                    <input type="text" tabIndex="2" id="input" onChange={this.onInputChanged} autoFocus></input>
                    <button className="sendButton" tabIndex="-1" onClick={() => this.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter', code: 'simulated' }))}>
                        <svg viewBox="0 0 1080 1080" className="arrowIcon">
                            <path d="M216.711,216.711L863.289,540L216.711,863.289" />
                        </svg>
                    </button>
                    <div id='autoComplete'></div>
                </div>
            </div>
        );
    }

    async postRenderCallback() {
        await this.autoScroll();
        this.cullingTest();
    }
}