const commandHistory = [];
let historyIndex = -1;
let build;

import { Directory } from './dir.js';

//TODO clean this shit up (move to other files)

async function initialize() {
    //*Load json
    const response = await fetch('fileStructure.json');
    const json = await response.json()

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

// Function to list contents of the current directory
function listContents() {
    const contents = Array.from(Directory.current.children.values(), (n) => n.name);
    return contents.join('<br>');
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

function sendCommand(command) {
    let response;
    //TODO command parsing
    const cleaned_command = command.toLowerCase().trim()
    if (cleaned_command == "ls")
        response = listContents();
    else
        response = Directory.cd(cleaned_command);
    printCommand(command, response);
}

document.getElementById('input').addEventListener('keydown', async function (event) {
    const inputElement = event.target;

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
