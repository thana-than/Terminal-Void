import { gameFiles } from '../.generated/dynamicImports';
import { Global } from './global.js'
import Program from "./program";
import React from 'react';
import { runProgram } from './OS.jsx';
import DOMPurify from 'dompurify';

//TODO build examiner command that can parse the files for the "examine" tag
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

    constructor(extensions) {
        this.extensions = extensions;
        this.extensions.forEach(key => {
            FileHandle.fileHandles.set(key, this);
        });
    }
}

async function load(hash) {
    const importComponent = gameFiles[hash];

    if (importComponent) {
        return importComponent()
            .then((module) => {
                return module.default || module;
            })
            .catch((error) => {
                console.error(`Error loading file with hash ${hash}:`, error);
                throw error;
            });
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
        return "A file."; //TODO swap this out with default examine when possible 
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
        const tags = file().props.children;
        if (!tags)
            return null;

        //* Search the react tags to find a meta element with either the examine or description tag
        const match = tags.find((element) => element.type == 'meta' && (element.props.name == 'examine' || element.props.name == 'description'));
        if (match)
            return match.props.content;

        return null;
    }
})

export { FileHandle };