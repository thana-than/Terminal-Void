import CLI from "/src/js/cliProgram";
import React from 'react';

export default class Meaning extends CLI {
    interpreter = (arg) => {
        let message = "Incorrect :("
        if (arg == "42") {
            message = "Correct! :)"
            this.postMessage = "Good job on guessing 42!";
        }

        this.pressToClose();
        return message;
    }

    startMessage = <p>What is the meaning of life?<br></br></p>;

    static examine = "A short quiz!";
}