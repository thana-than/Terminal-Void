const commandHistory = [];
let historyIndex = -1;
let directories = {}; // Object to store the directory structure

// Function to initialize the directory structure
function initializeDirectories() {
    // Assuming your directory structure is provided in a JSON format
    // You can adjust this part based on how your directory structure is stored
    const directoryStructure = {
        "root": {
            "folder1": {
                "file1.html": "<h1>This is file1.html in folder1</h1>",
                "file2.html": "<h1>This is file2.html in folder1</h1>"
            },
            "folder2": {
                "file3.html": "<h1>This is file3.html in folder2</h1>"
            }
        }
    };

    // // Recursively build the directory structure
    // buildDirectoryStructure(directoryStructure, "");
}

// Function to recursively build the directory structure
// function buildDirectoryStructure(structure, currentPath) {
//     for (const [key, value] of Object.entries(structure)) {
//         const fullPath = currentPath === "" ? key : `${currentPath}/${key}`;
//         directories[fullPath] = value;
//         if (typeof value === "object") {
//             buildDirectoryStructure(value, fullPath);
//         }
//     }
// }

// Function to change directory
function changeDirectory(dirName) {
    const newPath = currentDirectory === "" ? dirName : `${currentDirectory}/${dirName}`;
    if (directories[newPath]) {
        currentDirectory = newPath;
        return '';
    } else {
        return `Directory '${dirName}' not found.`;
    }
}

// Function to list contents of the current directory
function listContents() {
    const contents = Object.keys(directories[currentDirectory] || {});
    return contents.join('<br>');
}

// Function to display command response
function displayResponse(command, response) {
    const output = document.getElementById('output');
    const div = document.createElement('div');
    div.classList.add('content');
    div.innerHTML = `<div class='command'>> ${command}</div><div class='response'>${response}</div>`;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

function sendCommand(command) {
    displayResponse(command, "");
}

let currentDirectory = '';

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
initializeDirectories();
