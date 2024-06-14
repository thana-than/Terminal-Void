const commandHistory = [];
let historyIndex = -1;
let fileSystem;
let currentDirectory;
let build;
const REGEX_SLASH = /\/|\\/

//TODO clean this shit up (move to other files)

async function initialize() {
    //*Load json
    const response = await fetch('fileStructure.json');
    const json = await response.json()

    //*Get build type
    build = json["build"]

    //* Build file structure
    fileSystem = buildNodes(json["file_structure"], null);
    fileSystem.name = "ROOT" //*We rename the gameFolder to ROOT for gameplay
    currentDirectory = fileSystem;

    log(`Initialized virtual file system.\nCurrent Directory: ${currentDirectory.name}`);
    log(fileSystem);
}

function log(logText) {
    if (build != "RELEASE")
        console.log(logText)
}

function buildNodes(jsonNode, parent) {
    let node = new PathNode(jsonNode, parent)

    if (node.isFile)
        return node;

    jsonNode["children"].forEach(child => {
        let cNode = buildNodes(child, node)
        node.children.set(cNode.name.toLowerCase(), cNode)
    });

    return node
}

class PathNode {
    constructor(jsonNode, parent) {
        this.name = jsonNode["name"];
        this.pathLink = jsonNode["pathLink"]
        this.type = jsonNode["type"]
        this.isFile = this.type != "directory"
        this.parent = parent
        if (!this.isFile)
            this.children = new Map();
    }

    toPath() {
        if (this.parent == null)
            return this.name;

        return `${this.parent.toPath()}/${this.name}`
    }
}

function toNode(path) {
    //* If the path starts with a slash, we start at root. If not, this is a local path
    let currentNode = REGEX_SLASH.test(path.charAt(0)) ? fileSystem : currentDirectory;

    //* Splits the path up so we can work through each part
    const pathArray = path.split(REGEX_SLASH)
    const len = pathArray.length;

    for (let i = 0; i < len; i++) {
        next = pathArray[i];

        let nextNode = currentNode

        //* ".." means go up one directory
        if (next == "..") {
            if (currentNode.parent)
                nextNode = currentNode.parent;
            else return currentNode; //* If theres no parent, we're at the root, just return this!
        }
        //* Test for a child in our current node
        //* Ignore dots or blanks, as that keeps us on the current node
        else if (next != "." && next != '') {
            nextNode = currentNode.children.get(next);
        }

        //* If at any point we lose our node (or the node is a file), that means the path is invalid
        if (!nextNode || nextNode.isFile)
            return null;

        currentNode = nextNode
    }

    return currentNode;
}

// Function to change directory
function changeDirectory(dirName) {
    let n = toNode(dirName)
    if (!n) return `Path '${dirName}' is not a directory.`;

    currentDirectory = n;
    return n.toPath();
}

// Function to list contents of the current directory
function listContents() {
    const contents = Array.from(currentDirectory.children.values(), (n) => n.name);
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
        response = changeDirectory(cleaned_command);
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
