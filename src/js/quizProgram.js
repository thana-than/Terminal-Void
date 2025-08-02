import Interpreter, { BASE_COMMANDS } from './command.js';
import CLI from "./cliProgram";

//* IMPORTANT //*
//* See dev/quiz.exe.jsx for an example of how to use this program.

//TODO:
/////! Clean data on exit (temp/instance state, maybe define temp/instance object in command?) (maybe we just create a new instance every time this is run??) (make optional)
/////! Exiting on fail state (make optional)
/////! State machine - Next prompt branching instead of simple indexing (provided by QuizPrompt answers) (should just index if undefined) (exits on null)
/////! Provide example quiz in dev folder
/////! Custom invokes for quiz success or failures
/////! press any button to exit on prompt finish
//! start at top
/////! dont clear on next prompt?
/////!  handle a way to make the "next" reference circular (right now TEST is undefined on compile for EULAPROMPT) (see EULA.exe.jsx)

export class Prompt {
    constructor(prompt, answers) {
        this.prompt = prompt;

        const commands = Array(answers.length);
        for (let i = 0; i < commands.length; i++) {
            let invoke = function () {
                if (answers[i].invoke !== undefined)
                    answers[i].invoke();

                //* Make the response blank if it is undefined. avoids OS errors
                answers[i].response = answers[i].response !== undefined ? answers[i].response : " "

                const resp = {
                    response: answers[i].response,
                    next: answers[i].next,
                }
                return resp;
            }

            commands[i] = {
                keys: answers[i].keys,
                invoke: invoke,
            }
        }

        this.interpreter = new Interpreter(Object.values(BASE_COMMANDS).concat(commands));
    }

    static getPrompt(prompt) {
        if (typeof prompt === 'function')
            prompt = prompt();
        return prompt;
    }
}

export class Quiz extends CLI {
    constructor(startingPrompt, completeMessage = null) {
        super();

        this.setCurrentPrompt(startingPrompt);
        this.startMessage = "";

        this.completeMessage = completeMessage;
        this.allowAutoComplete = false;
        this.instanced = true;
        this.allow_printCulling = false; //* Allows unlimited printing (could be dangrerous)
    }

    static getPrompt(prompt) {
        if (typeof prompt === 'function')
            prompt = prompt();

        return prompt;
    }

    setCurrentPrompt(prompt) {
        this.currentPrompt = Prompt.getPrompt(prompt);
        if (this.currentPrompt === undefined)
            return;

        this.interpreter = this.currentPrompt.interpreter;
        this.print(this.currentPrompt.prompt);
    }

    async sendCommand(command) {
        if (this.currentPrompt === undefined)
            return;

        const response = await super.sendCommand(command)
        if (response === undefined)
            return;

        this.setCurrentPrompt(response.next);

        if (this.currentPrompt === undefined) {
            this.print(this.completeMessage);
            this.pressToClose(true);
            return;
        }

        this.print(response.next.prompt);
    }
}