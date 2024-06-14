const REGEX_SLASH = /[\\/]/; // Assuming this is defined somewhere

class Directory {
    static root;
    static current;

    static cd(path) {
        let n = Directory.get(path)
        if (!n) return `Path '${path}' is not a directory.`;

        Directory.current = n;
        return n.path();
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
        this.pathLink = jsonNode["pathLink"]
        this.type = jsonNode["type"]
        this.isFile = this.type != "directory"
        this.parent = parent
        if (!this.isFile)
            this.children = new Map();
    }

    path() {
        if (this.parent == null)
            return this.name;

        return `${this.parent.path()}/${this.name}`
    }
}

export { Directory };