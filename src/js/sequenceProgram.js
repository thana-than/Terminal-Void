import Interpreter from './command.js';
import CLI from "./cliProgram";

const NEXT_SEQUENCE_COMMAND = {
    keys: ['next'],
    invoke: function (params, context) {
        return {
            ignorePrintCommand: true,
            response: context.cli.sequence[context.cli.sequenceIndex]
        }
    }
}

export class Sequence extends CLI {
    constructor(sequence, startImmediate = false, startMessage = "") {
        super();
        this.sequenceIndex = 0;
        this.sequence = sequence;
        this.startMessage = startMessage;
        this.interpreter = new Interpreter([NEXT_SEQUENCE_COMMAND], NEXT_SEQUENCE_COMMAND);
        if (startImmediate)
            this.sendCommand('next');
    }

    onKeyDown(event) {
        event.preventDefault();

        if (this.commandRunning) {
            return;
        }

        this.sendCommand('next');
    }

    async sendCommand(command) {
        let len = this.sequence.length;
        if (this.sequenceIndex >= len) {
            this.close();
            return;
        }

        await super.sendCommand(command);
        this.sequenceIndex++;
    }
}