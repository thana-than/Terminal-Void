import { gameFiles } from '../.generated/dynamicImports';
import Global from './global'
import Program from "./program";
import React from 'react';
import { runProgram } from './OS.jsx';
import DOMPurify from 'dompurify';

class FileHandle {
    static fileHandles = new Map();

    static async open(node) {
        const handle = this.fileHandles.get(node.type)
        if (!handle) {
            Global.log(`File '${node.pathLink}' is not a recognized type.`)
            return `File '${node.fullName}' is not a recognized type.`;
        }

        Global.log(`Opening ${node.fullName} at ${node.pathLink}`);

        const file = await load(node.hash);
        if (file) {
            Global.log(`Reading file at path ${node.pathLink}.`)
            return handle.read(node, file);
        }

        return null;
    }

    static async examine(node) {
        const handle = this.fileHandles.get(node.type)
        if (!handle) {
            return defaultExamine;
        }

        Global.log(`Examining ${node.fullName} at ${node.pathLink}`);

        const file = await load(node.hash);
        if (file) {
            Global.log(`Examining file at path ${node.pathLink}.`)
            const desc = handle.examine(node, file);
            if (desc)
                return desc;
        }

        return defaultExamine;
    }

    constructor(extensions) {
        this.extensions = extensions;
        this.extensions.forEach(key => {
            FileHandle.fileHandles.set(key, this);
        });
    }
}

const defaultExamine = "A file.";

async function load(hash) {
    const importComponent = gameFiles[hash];

    if (importComponent) {
        const result = await importComponent()
            .then((module) => {
                return module.default || module;
            })
            .catch((error) => {
                console.error(`Error loading file with hash ${hash}:`, error);
                throw error;
            });
        return result;
    } else {
        console.error(`File with hash: ${hash} not found`);
        return Promise.reject(new Error(`File with hash: ${hash} not found`));
    }
}

function fileHandleFactory(properties) {
    //* Proxy class to allow for dynamic property assignment
    class FileHandleProxy extends FileHandle {
        constructor() {
            //* Ensure the 'extensions' property is assigned before calling the parent constructor
            const { extensions, ...rest } = properties;
            super(extensions);
            Object.assign(this, rest);
        }
    }

    return new FileHandleProxy();
}

const TextHandle = fileHandleFactory({
    extensions: ['txt', 'html'],
    read: function (node, file) {
        return file;
    },

    examine: function (node, file) {
        return defaultExamine;
    },
})

const HTMLHandle = fileHandleFactory({
    extensions: ['html'],
    read: function (node, file) {
        const sanitizedHtml = DOMPurify.sanitize(file);
        const markup = { __html: sanitizedHtml };
        return (
            <div dangerouslySetInnerHTML={markup}></div>
        );
    },

    examine: function (node, file) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(file, 'text/html');

        let metaTag = doc.querySelector('meta[name="examine"]');
        if (!metaTag) metaTag = doc.querySelector('meta[name="description"]');
        if (!metaTag) return null;

        return metaTag.getAttribute('content');
    }
})

const JSHandle = fileHandleFactory({
    extensions: ['js'],
    read: async function (node, file) {
        if (typeof file.run === "function")
            return file.run();

        return null;
    },

    examine: function (node, file) {
        if (typeof file.examine === "function")
            return file.examine();

        return null;
    }
})

const JSXHandle = fileHandleFactory({
    extensions: ['jsx'],
    read: async function (node, file) {
        const fileType = file.prototype || file;
        if (fileType instanceof Program) {
            const program = file.prototype ? new file() : file; //*Either creates a new instance if this is a type, or just grabs the existing instance
            runProgram(program);

            while (program.isRunning()) {
                await new Promise(resolve => setTimeout(resolve, 100)); //*Wait 100 ms in loop while waiting for program to stop
            }

            if (program.postMessage)
                return program.postMessage;

            return `Finished running ${node.fullName}`;
        }

        try {
            const Component = file;
            return <Component />;
        } catch (error) {
            console.error(`Error loading JSX component for node ${node}:`, error);
            throw error;
        }
    },

    examine: function (node, file) {
        if (file.examine) {
            if (typeof file.examine === 'function')
                return file.examine();
            return file.examine;
        }

        const fileType = file.prototype || file;
        if (fileType instanceof Program) {
            return 'A Program.'
        }

        //* we read the meta tag based off of the way webpack compresses it.
        //*Captures the content in a block similar to this:
        //* ("meta", {
        //*     name: "examine",
        //*     content: "this is a description"
        //* }));

        const regex = /(?:"meta",)(?:(?:.|\n)*)name:\s*?"(?:examine|description)"(?:(?:.|\n)*)content:\s*?"(.*)"/;
        const regex_match = file.toString().match(regex);
        if (regex_match)
            return regex_match[1]; //*return first capture group

        return null;
    }
})

export { FileHandle };