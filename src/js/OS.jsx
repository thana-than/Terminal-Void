import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from "./terminal";
import { Program } from "./program";
import '../css/os.css'

let initialized = false;

export default function OS() {
    const [output, setOutput] = useState('');
    const baseTerminalRef = useRef(null);
    const programRef = useRef(null);
    const updateRef = useRef();
    const previousTimeRef = useRef();


    //* Setup update callback
    const refreshCallback = (newOutput) => {
        setOutput(newOutput);
    };

    const updateLoop = (time) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;

            //* If a program has an update function, run it!
            if (typeof programRef.current.update === "function") {
                // safe to use the function
                programRef.current.update(deltaTime);
            }
        }

        previousTimeRef.current = time;
        updateRef.current = requestAnimationFrame(updateLoop);
    };

    function focusProgram(program) {
        if (programRef.current)
            programRef.current.refreshCallback = null;

        programRef.current = program;
        programRef.current.refreshCallback = refreshCallback;

        //* Initialize the programs's initial output
        setOutput(programRef.current.draw());
    }

    function Initialize() {
        baseTerminalRef.current = new Terminal();
        focusProgram(new Terminal());
        initialized = true;
    }

    useEffect(() => {
        if (!initialized) {
            Initialize();
        }

        // Define the keydown event handler
        const handleKeyDown = (event) => {
            if (programRef.current) {
                programRef.current.onKeyDown(event);
            }
        };

        // Add the event listener
        window.addEventListener('keydown', handleKeyDown);

        updateRef.current = requestAnimationFrame(updateLoop);

        //* Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(programRef.current);
        };
    }, []);

    return (
        <div className="program" >
            {output}
        </div >
    );
}
