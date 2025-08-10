import Global from './global';
import React, { useState, useEffect, useRef } from 'react';
import Terminal from "./terminal";
import '../css/os.css'
import '../css/fonts.css'
import { Howler } from 'howler';

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
    updateOutput(runningProgram.drawCall());
}

export default function OS() {
    const [output, setOutput] = useState('');

    function Initialize() {
        Howler.volume(.5); //* Set starting volume to 50%
        //TODO maybe consider loading the last stored volume setting

        baseTerminal = Terminal;
        updateOutput = (newOut) => { setOutput(newOut); }
        runProgram(baseTerminal);
        if (Global.START_COMMAND) {
            console.log("SENDING COMMAND " + Global.START_COMMAND);
            baseTerminal.sendCommand(Global.START_COMMAND);
        }

        initialized = true;
    }

    useEffect(() => {
        //* Define the keydown event handler
        const handleKeyDown = (event) => {
            if (runningProgram) {
                runningProgram.event_keyDown(event);
            }
        };

        const handleKeyUp = (event) => {
            if (runningProgram) {
                runningProgram.event_keyUp(event);
            }
        };

        //* Add the event listener
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        update = requestAnimationFrame(updateLoop);

        //* Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(runningProgram);
        };
    }, []);

    useEffect(() => {
        const scalePage = () => {
            //* Default window scale is 640 x 360
            const paddingX = 20;
            const paddingY = 20;
            const defW = 640 + paddingX;
            const defH = 360 + paddingY;

            const minScale = .502;

            const ratioW = window.innerWidth / defW;
            const ratioH = window.innerHeight / defH;

            const scale = Math.max(minScale, Math.min(ratioW, ratioH));

            const scaleWrapper = document.querySelector('.scaleWrapper');
            if (scaleWrapper && scaleWrapper.style)
                scaleWrapper.style.transform = `scale(${scale})`;

            window.globalScale = scale;
        }

        const handleResize = () => {
            scalePage();
            runningProgram?.event_resize();
        }

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleKeyDown);
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
        <div className="scaleWrapper">
            <div className='os'>
                <div className="program" id={runningProgram.themeStyle}>
                    {output}
                </div >
            </div>
        </div>
    );
}