import '../css/terminal.css'
import React, { useEffect } from 'react';
import { Directory } from './dir.js';
import { Command } from './command.js';
import json from '../.generated/fileStructure.json';

export default function Terminal() {
    useEffect(() => {
        const commandHistory = [];
        let historyIndex = -1;
        let build;
        let commandRunning = false;

        function initialize() {
            //*Get build type
            build = json["build"]

            //* Build file structure
            const dirResponse = Directory.generateFileSystem(json["file_structure"]);
            log(dirResponse);
        }

        function log(logText) {
            if (build != "RELEASE")
                console.log(logText)
        }

        function print(text) {
            const output = document.getElementById('output');
            const div = document.createElement('div');
            div.classList.add('content');
            div.innerHTML = text;
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
        }


        function printCommand(command, response) {
            print(`<div class='command'>> ${command}</div><div class='response'>${response}</div>`);
        }

        async function sendCommand(command) {
            commandRunning = true;
            let response;
            const cleaned_command = command.toLowerCase()
            response = await Command.Run(cleaned_command);
            printCommand(command, response);
            commandRunning = false;
        }

        document.getElementById('input').addEventListener('keydown', async function (event) {
            const inputElement = event.target;
            if (commandRunning) {
                event.preventDefault(); //TODO Send inputs to command instead of just halting input
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
                event.preventDefault(); // Prevent default behavior of the arrow key
            } else if (event.key === 'ArrowDown') {
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex += 1;
                    inputElement.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    inputElement.value = '';
                }
                event.preventDefault(); // Prevent default behavior of the arrow key
            }
        });

        // Initialize the directory structure when the page loads
        initialize();
    })
    return (
        <div id="cli" >
            <div id="output"></div>
            <input type="text" id="input" autofocus></input>
        </div >
    );
}
