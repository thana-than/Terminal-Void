import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from "./terminal";
import '../css/os.css'

let initialized = false;
let baseTerminalRef;
let programRef;
let updateOutput;
let updateRef;
let previousTimeRef;

//* Setup update callback
const refreshCallback = (newOutput) => {
    updateOutput(newOutput);
};

const updateLoop = (time) => {
    if (previousTimeRef !== undefined) {
        const deltaTime = time - previousTimeRef;

        //* If a program has an update function, run it!
        if (typeof programRef.update === "function") {
            programRef.update(deltaTime);
        }
    }

    previousTimeRef = time;
    updateRef = requestAnimationFrame(updateLoop);
};

export function closeProgram() {
    runProgram(null);
}

export function runProgram(program) {
    if (programRef) {
        programRef.refreshCallback = null;
        programRef.closeCallback = null;
    }


    if (program == null)
        program = baseTerminalRef;

    programRef = program;
    programRef.refreshCallback = refreshCallback;
    programRef.closeCallback = closeProgram;

    //* Initialize the programs's initial output
    updateOutput(programRef.draw());
}

export default function OS() {
    const [output, setOutput] = useState('');

    function Initialize() {
        baseTerminalRef = new Terminal();
        updateOutput = (newOut) => { setOutput(newOut); }
        runProgram(baseTerminalRef);
        initialized = true;
    }

    useEffect(() => {
        //* Define the keydown event handler
        const handleKeyDown = (event) => {
            if (programRef) {
                programRef.onKeyDown(event);
            }
        };

        //* Add the event listener
        window.addEventListener('keydown', handleKeyDown);

        updateRef = requestAnimationFrame(updateLoop);

        //* Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(programRef);
        };
    }, []);

    if (!initialized)
        Initialize();

    return (
        <div className="program" >
            {output}
        </div >
    );
}