import Interpreter, { BASE_COMMANDS } from './command.js';
import CLI from "./cliProgram";

//TODO:
/////! Clean data on exit (temp/instance state, maybe define temp/instance object in command?) (maybe we just create a new instance every time this is run??) (make optional)
/////! Exiting on fail state (make optional)
/////! State machine - Next prompt branching instead of simple indexing (provided by QuizPrompt answers) (should just index if undefined) (exits on null)
//! Provide example quiz in dev folder
/////! Custom invokes for quiz success or failures
/////! press any button to exit on prompt finish
//! start at top
/////! dont clear on next prompt?
//!  handle a way to make the "next" reference circular (right now TEST is undefined on compile for EULAPROMPT) (see EULA.exe.jsx)

export class QuizPrompt {
    constructor(prompt, answers) {
        this.prompt = prompt;

        const commands = Array(answers.length);
        for (let i = 0; i < commands.length; i++) {
            let invoke = function () {
                if (answers[i].invoke !== undefined)
                    answers[i].invoke();

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
}

export class Quiz extends CLI {
    constructor(startingPrompt, completeMessage = null) {
        super(startingPrompt.interpreter);
        this.prompts = startingPrompt;
        //this.stage = 0;
        this.currentPrompt = startingPrompt;
        this.completeMessage = completeMessage;
        //this.reprintPromptOnIncorrect = false;
        this.startMessage = startingPrompt.prompt;
        this.allowAutoComplete = false;
        this.instanced = true;
        this.allow_printCulling = false; //* Allows unlimited printing (could be dangrerous)
    }

    async sendCommand(command) {
        if (this.currentPrompt === undefined)
            return;

        const response = await super.sendCommand(command)
        if (response === undefined)
            return;

        console.log(response);

        this.currentPrompt = response.next;
        if (this.currentPrompt !== undefined) {
            this.interpreter = this.currentPrompt.interpreter;
            this.print(response.next.prompt);
        }
        else {
            this.print(this.completeMessage);
            this.pressToClose(true);
        }

        // if (response.isCorrect)
        //     this.nextPrompt();
        // else {
        //     if (this.reprintPromptOnIncorrect)
        //         this.printCurrentPrompt();
        // }
    }

    // isCompleted() {
    //     return this.stage >= this.prompts.length;
    // }

    // printCurrentPrompt() {
    //     this.print(this.prompts[this.stage].prompt);
    // }

    // nextPrompt() {
    //     this.stage++;
    //     if (!this.isCompleted()) {
    //         this.interpreter = this.prompts[this.stage].interpreter;
    //         this.printCurrentPrompt();
    //     } else {
    //         this.print(this.completeMessage);
    //         this.pressToClose(true);
    //     }
    // }
}