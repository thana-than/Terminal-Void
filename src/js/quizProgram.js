import Interpreter from "./command";
import CLI from "./cliProgram";

//TODO:
//! Quick exiting with Esc
//! Exiting on fail state (make optional)
//! Next prompt branching instead of simple indexing (provided by QuizPrompt answers) (should just index if undefined) (exits on null)
//! Provide example quiz in dev folder
//! Custom invokes for quiz success or failures

export class QuizPrompt {
    constructor(prompt, answers) {
        this.prompt = prompt;

        const commands = Array(answers.length);
        for (let i = 0; i < commands.length; i++) {

            let invokeTest = answers[i].isCorrect;
            if (invokeTest == undefined)
                invokeTest = true;

            if (typeof invokeTest !== 'function') {
                invokeTest = function () {
                    if (answers[i].invoke !== undefined)
                        answers[i].invoke();

                    const resp = {
                        response: answers[i].response,
                        isCorrect: answers[i].isCorrect == undefined || answers[i].isCorrect,
                    }
                    return resp;
                }
            }

            commands[i] = {
                keys: answers[i].keys,
                invoke: invokeTest,
            }
        }

        this.interpreter = new Interpreter(commands);
    }
}

export class Quiz extends CLI {
    constructor(prompts, completeMessage = null) {
        super(prompts[0].interpreter);
        this.prompts = prompts;
        this.stage = 0;
        this.completeMessage = completeMessage;
        this.startMessage = prompts[0].prompt;
        this.allowAutoComplete = false;
    }

    async sendCommand(command) {
        const response = await super.sendCommand(command)
        if (this.isCompleted())
            return;

        if (response.isCorrect)
            this.nextPrompt();
        else
            this.printCurrentPrompt();
    }

    isCompleted() {
        return this.stage >= this.prompts.length;
    }

    printCurrentPrompt() {
        this.print(this.prompts[this.stage].prompt);
    }

    nextPrompt() {
        this.stage++;
        if (!this.isCompleted()) {
            this.interpreter = this.prompts[this.stage].interpreter;
            this.printCurrentPrompt();
        } else {
            this.print(this.completeMessage);
            this.pressToClose(true);
        }
    }
}