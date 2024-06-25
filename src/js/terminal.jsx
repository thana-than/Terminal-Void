import '../css/terminal.css'
import React, { useState, useEffect } from 'react';
import { Command } from './command.js';
import { v4 as uuidv4 } from 'uuid';

export default function Terminal() {
    const [blocks, setBlocks] = useState([]);
    useEffect(() => {
        const commandHistory = [];
        let historyIndex = -1;
        let commandRunning = false;

        function printCommand(command, response) {
            const commandId = uuidv4();
            const responseId = uuidv4();

            setBlocks(prevBlocks => {
                return [...prevBlocks,
                { key: commandId, type: 'command', content: `> ${command}` },
                { key: responseId, type: 'response', content: response }
                ]
            });
        }

        async function sendCommand(command) {
            commandRunning = true;
            let response;
            const cleaned_command = command.toLowerCase()
            response = await Command.Run(cleaned_command);
            printCommand(command, response);
            commandRunning = false;
        }

        const inputElement = document.getElementById('input');

        function handleKeyDown(event) {
            if (commandRunning) {
                event.preventDefault();
                return;
            }

            if (event.key === 'Enter') {
                const command = inputElement.value;
                inputElement.value = '';
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                sendCommand(command);
            } else if (event.key === 'ArrowUp') {
                if (historyIndex > 0) {
                    historyIndex -= 1;
                    inputElement.value = commandHistory[historyIndex];
                }
                event.preventDefault();
            } else if (event.key === 'ArrowDown') {
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex += 1;
                    inputElement.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    inputElement.value = '';
                }
                event.preventDefault();
            }
        }

        inputElement.addEventListener('keydown', handleKeyDown);

        return () => {
            inputElement.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div id="cli" >
            <div id="output">
                {blocks.map(block => (
                    <React.Fragment key={block.key}>
                        <div className={block.type}>{block.content}</div>
                    </React.Fragment>
                ))}
            </div>
            <input type="text" id="input" autofocus></input>
        </div >
    );
}
