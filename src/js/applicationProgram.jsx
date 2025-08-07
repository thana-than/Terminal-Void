import '../css/os.css'
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Program from "./program";

export default class Application extends Program {
    examine() { return "An Application." }

    static DefaultInputTestMessage = "PRESS A KEY";
    caseSensitiveInputs = true;
    activeInputs = new Set()

    message = this.DefaultInputTestMessage;
    draw() {
        return (
            <div className="app">
                <p>{this.message}</p>
            </div>
        );
    }

    updateMessage() {
        let text = "";
        this.activeInputs.forEach(function (value) {
            text += '\n' + value;
        })
        if (text == "")
            this.message = this.DefaultInputTestMessage;
        else
            this.message = text;
    }

    processKeyId(event) {
        let key = event.key;
        if (this.caseSensitiveInputs)
            key = key.toLowerCase();

        return key;
    }


    onKeyDown(event) {
        if (event.key == "Escape")
            this.close();

        let key = this.processKeyId(event);

        if (!this.activeInputs.has(key))
            this.activeInputs.add(key);

        this.updateMessage();
        this.refresh();
    }

    onKeyUp(event) {
        let key = this.processKeyId(event);

        this.activeInputs.delete(key);
        this.updateMessage();
        this.refresh();
    }
}