import { FileHandle } from './fileHandle.js';

const REGEX_SLASH = /[\\/]/;

class Directory {
    static root;
    static current;

    static cd(path) {
        let n = Directory.get(path)
        if (!n) return `Directory '${path}' does not exist.`;
        if (n.isFile) return `Path  '${path}' is a file, not a directory.`;

        return this.cdNode(n);
    }

    static cdNode(node) {
        Directory.current = node;
        return node.path();
    }

    static async run(path) {
        let node = Directory.get(path)
        if (!node) return `File '${path}' does not exist.`;
        if (!node.isFile) return `Path '${path}' is a directory, not a file.`;

        return await Directory.runNode(node);
    }

    static examine(path) {
        let node = Directory.get(path)
        if (!node) return `'${path}' does not exist.`;
        if (!node.isFile) return 'A file directory.';

        return FileHandle.examine(node);
    }

    static async runNode(node) {
        return await FileHandle.open(node);
    }

    static get(path) {
        //* If the path starts with a slash, we start at root. If not, this is a local path
        let currentNode = REGEX_SLASH.test(path.charAt(0)) ? this.root : this.current;

        //* Splits the path up so we can work through each part
        const pathArray = path.split(REGEX_SLASH)
        const len = pathArray.length;

        for (let i = 0; i < len; i++) {
            let next = pathArray[i];

            let nextNode = currentNode

            //* ".." means go up one directory
            if (next == "..") {
                if (currentNode.parent)
                    nextNode = currentNode.parent;
                //* If theres no parent, we're at the root and we can just keep the currentNode
            }
            //* Test for a child in our current node
            //* Ignore dots or blanks, as that keeps us on the current node
            else if (next != "." && next != '') {
                nextNode = currentNode.getChild(next);
            }

            //* If at any point we lose our node (or the node is a file), that means the path is invalid
            if (!nextNode)
                return null;

            //* This check confirms that a file isn't used mid-path. Files are only allowed to be at the end of the path
            if (nextNode != currentNode && currentNode.isFile)
                return null;

            currentNode = nextNode
        }

        return currentNode;
    }

    static generateFileSystem(json) {
        this.root = this.buildNodes(json, null);
        this.root.name = "ROOT" //*We rename the gameFolder to ROOT for gameplay
        this.current = this.root;
        return this.root;
    }

    static buildNodes(jsonNode, parent) {
        let node = new PathNode(jsonNode, parent)

        if (node.isFile)
            return node;

        jsonNode["children"].forEach(child => {
            let cNode = this.buildNodes(child, node)
            node.children.set(cNode.name.toLowerCase(), cNode)
        });

        return node
    }
}

class PathNode {
    constructor(jsonNode, parent) {
        this.name = jsonNode["name"];
        this.hash = jsonNode["hash"];
        this.pathLink = jsonNode["pathLink"]
        this.type = jsonNode["type"]
        this.isFile = this.type != "directory"
        this.parent = parent
        this.gameExt = jsonNode["gameExt"]
        this.fullName = this.name;
        if (this.isFile) { this.fullName += `\.${this.gameExt}`; }
        else { this.children = new Map(); }
    }

    getChild(node) {
        if (!this.children)
            return false;

        const arr = node.split(/\.(.*)/)
        const _name = arr[0]
        const _ext = arr[1]

        const child = this.children.get(_name);
        if (!child) { return null; }

        if (_ext && _ext != "" && _ext != child.gameExt) { return null; }

        return child;
    }

    path() {
        if (this.parent == null)
            return this.fullName;

        return `${this.parent.path()}/${this.fullName}`
    }
}

export { Directory };