import { FileHandle } from './fileHandle.js';
import Data from "./gameData";
import React from "react";

const REGEX_SLASH = /[\\/]/;
const REGEX_ROOT = /^(\s*(?:\/|\\))/i;
const ROOT_NAME = 'ROOT';
const START_DIR = '/instance/'
import { File, Folder, Key } from './icons';

class Directory {
    static root;
    static current;

    static cd(path, forceUnsafe = false) {
        const result = Directory.get(path)

        if (!forceUnsafe) {
            if (!result.success) return result;

            if (result.node.isFile) {
                result.success = false;
                result.message = <>Path '{path}' is a <File />, not a <Folder />.</>;
                return result;
            }
        }

        this.cdNode(result.node);
        return result;
    }

    static cdNode(node) {
        Directory.current = node;
        node.hasOpened = true;
        return node.path();
    }

    static async run(path) {
        const result = Directory.get(path)
        if (!result.success) return result.message;
        if (!result.node.isFile) return <>Path '{path}' is a <Folder />, not a <File />.</>;

        return await Directory.runNode(result.node);
    }

    static examine(path) {
        const result = Directory.get(path)
        if (!result.node) return result.message; //* We don't check for success, just if we found a node at all. we should be allowed to examine a file or folder even if we don't have access

        if (result.node.examine) { console.log("RESULT " + result.node.examine); return result.node.examine; }

        if (!result.node.isFile) return <>A <Folder />.</>;
        return FileHandle.examine(result.node);
    }

    static async runNode(node) {
        node.hasOpened = true;
        return await FileHandle.open(node);
    }

    //*builds an array that includes the most straightforward node path from the start to end node
    static tracePath(startNode, endNode) {
        var startParents = startNode.getParents(true);
        var endParents = endNode.getParents(true);

        if (startParents[0] != endParents[0]) throw `Nodes ${startNode.fullName} and ${endNode.fullName} have no common ancestor.`; //*Should never happen in out game, since all nodes are based in ROOT but it's here in case

        //*Walk through the array until we find the last common parent
        const len = startParents.length;
        for (var i = 0; i < len; i++) {
            if (startParents[i] != endParents[i]) {
                break;
            }
        }

        startParents.splice(0, i - 1); //*Common parent is [i-1], so we delete before that
        endParents.splice(0, i); //*Since we only need the command parent once, we cut it out of the endParents array

        return [...startParents.reverse(), ...endParents] //*merge the two arrays, reversing the start parents as we are walking up from there
    }

    static travelCheck(startNode, endNode) {
        const pathTrace = this.tracePath(startNode, endNode);
        const len = pathTrace.length;
        for (var i = 0; i < len; i++) {
            if (!pathTrace[i].hasAccess())
                return {
                    success: false,
                    message: pathTrace[i].accessFail,
                    failedKey: pathTrace[i].key
                };
        }
        return { success: true }
    }

    static get(path) {
        //* If the path starts with a slash, we start at root. If not, this is a local path
        let targetNode = this.current;

        if (path == null)
            path = './';

        const rootMatch = path.match(REGEX_ROOT);
        if (rootMatch) {
            targetNode = targetNode.getParentMost();
            path = path.replace(rootMatch[1], "");
        }

        //* Splits the path up so we can work through each part
        let payload = { success: false };
        const pathArray = path.split(REGEX_SLASH)

        //* Quick little check here to see if the user has input a location parented from this node, if so we jump back to there for our path
        //* But only if the first node cannot be gathered via getChild!
        if (!targetNode.getChild(pathArray[0])) {
            const parents = targetNode.getParents();
            for (let i = parents.length - 1; i >= 0; i--) {
                if (pathArray[0] == parents[i].name.toLowerCase()) {
                    targetNode = parents[i];
                    pathArray.shift();
                    break;
                }
            }
        }

        const len = pathArray.length;
        for (let i = 0; i < len; i++) {
            let next = pathArray[i];

            let nextNode = targetNode

            //* ".." means go up one directory
            if (next == ".." || next == "back") {
                if (targetNode.parent)
                    nextNode = targetNode.parent;
                //* If theres no parent, we're at the root and we can just keep the currentNode
            }
            //* Test for a child in our current node
            //* Ignore dots or blanks, as that keeps us on the current node
            else if (next != "." && next != '') {
                nextNode = targetNode.getChild(next);
            }

            //* This check confirms that a file isn't used mid-path. Files are only allowed to be at the end of the path
            if (nextNode != targetNode && targetNode.isFile) {
                payload.message = <>Path cannot navigate through a <File /> {targetNode.fullName}</>;
                return payload;
            }

            //* If at any point we lose our node, that means the path is invalid
            if (!nextNode) {
                payload.message = <>'{pathArray[i]}' does not exist in <Folder text='' /> {targetNode.name}.</>;
                return payload;
            }

            targetNode = nextNode
        }

        payload.node = targetNode;

        const travelResult = this.travelCheck(this.current, targetNode);
        if (!travelResult.success) {
            if (travelResult.message)
                payload.message = travelResult.message;
            else {
                const label = targetNode.isFile ? <File text='' /> : <Folder text='' />;
                payload.message = <>{label} ACCESS DENIED, Permission <Key /> Required: {travelResult.failedKey}</>;
            }

            return payload;
        }

        payload.success = true;
        payload.message = targetNode.path();
        return payload;
    }

    static generateFileSystem(json) {
        this.root = this.current = this.buildNodes(json, null);
        //*We rename the gameFolder to ROOT for gameplay
        this.root.fullName = this.root.name = ROOT_NAME;
        //*Set our start point
        Directory.cd(START_DIR, true);
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
        this.isFolder = !this.isFile;
        this.parent = parent
        this.gameExt = jsonNode["gameExt"]
        this.fullName = this.name;
        this.key = jsonNode["key"]
        this.examine = jsonNode["examine"]
        this.accessFail = jsonNode["accessFail"]
        this.hasOpened = false;
        //TODO appropriate messaging when navigating through a hidden node
        this.hiddenWhenLocked = jsonNode["hidden"];
        if (this.isFile) { this.fullName += `\.${this.gameExt}`; }
        else { this.children = new Map(); }
    }

    getClassName() {
        if (!this.hasAccess())
            return 'lockedItem';

        if (!this.hasOpened)
            return 'freshItem'

        return 'listItem';
    }

    getParentMost(forceAccess = false) {
        if (this.parent == null)
            return this;

        if (!forceAccess && !this.parent.hasAccess())
            return this;

        return this.parent;
    }

    getParents(forceAccess = false) {
        var nodes = []
        for (let node = this; node != null && (forceAccess || node.hasAccess()); node = node.parent) {
            nodes.unshift(node)
        }
        return nodes;
    }

    hasParent(node) {
        if (this.parent == node)
            return true;

        if (node == Directory.root)
            return false;

        return this.parent.hasParent(node);
    }

    hasAccess() {
        if (this.key == null)
            return true;
        return Data.HasAccess(this.key);
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
        if (this.parent == null || !this.parent.hasAccess())
            return this.fullName;

        return `${this.parent.path()}/${this.fullName}`
    }
}

export { Directory };