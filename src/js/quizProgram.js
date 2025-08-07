import Interpreter, { BASE_COMMANDS } from './command.js';
import CLI from "./cliProgram";

//* IMPORTANT //*
//* See dev/quiz.exe.jsx for an example of how to use this program.

export class Prompt {
    constructor(prompt, answers, invalidPrompt = "Invalid command. Please try again.") {
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

        this.invalidCommand = () => {
            return {
                response: " ",
                next: () => new Prompt(invalidPrompt, answers, invalidPrompt)
            }
        };

        this.interpreter = new Interpreter(Object.values(BASE_COMMANDS).concat(commands), this.invalidCommand);
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
        if (prompt === 'this')
            prompt = this.currentPrompt;
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