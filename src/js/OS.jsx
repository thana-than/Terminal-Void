import React, { useState, useEffect, useRef } from 'react';
import Terminal from "./terminal";
import '../css/os.css'
import '../css/fonts.css'

let initialized = false;
let baseTerminal;
let runningProgram;
let updateOutput;
let update;
let previousTime;

//* Setup update callback
const refreshCallback = (newOutput) => {
    updateOutput(newOutput);
};

const updateLoop = (time) => {
    if (previousTime !== undefined) {
        const deltaTime = time - previousTime;

        //* If a program has an update function, run it!
        if (typeof runningProgram.update === "function") {
            runningProgram.update(deltaTime);
        }
    }

    previousTime = time;
    update = requestAnimationFrame(updateLoop);
};

export function closeProgram() {
    runProgram(null);
}

export function runProgram(program) {
    if (runningProgram) {
        runningProgram.refreshCallback = null;
        runningProgram.closeCallback = null;
    }

    if (program == null)
        program = baseTerminal;

    runningProgram = program;
    runningProgram.refreshCallback = refreshCallback;
    runningProgram.closeCallback = closeProgram;
    runningProgram.run();

    //* Initialize the programs's initial output
    updateOutput(runningProgram.draw());
}

export default function OS() {
    const [output, setOutput] = useState('');

    function Initialize() {
        baseTerminal = Terminal;
        updateOutput = (newOut) => { setOutput(newOut); }
        runProgram(baseTerminal);
        initialized = true;
    }

    useEffect(() => {
        //* Define the keydown event handler
        const handleKeyDown = (event) => {
            if (runningProgram) {
                runningProgram.onKeyDown(event);
            }
        };

        //* Add the event listener
        window.addEventListener('keydown', handleKeyDown);

        update = requestAnimationFrame(updateLoop);

        //* Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(runningProgram);
        };
    }, []);

    useEffect(() => {
        if (runningProgram && typeof runningProgram.postRenderCallback === 'function') {
            runningProgram.postRenderCallback();
        }
    }, [output]);

    if (!initialized)
        Initialize();

    return (
        <div className='os'>
            <div className="program" id={runningProgram.themeStyle}>
                {output}
            </div >
        </div>
    );
}