import { gameFiles } from '../.generated/dynamicImports';
import { Program } from './program.js'

class FileHandle {
    static fileHandles = new Map();

    static async open(node) {
        const handle = this.fileHandles.get(node.type)
        if (!handle) {
            Program.log(`File '${node.pathLink}' is not a recognized type.`)
            return `File '${node.fullName}' is not a recognized type.`;
        }

        Program.log(`Opening ${node.fullName} at ${node.pathLink}`);

        const file = await load(node.hash);
        if (file) {
            Program.log(`Reading file at path ${node.pathLink}.`)
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

function load(hash) {
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
    extensions: ['txt'],
    read: function (node, file) {
        return file;
    }
})

const JSHandle = fileHandleFactory({
    extensions: ['js'],
    read: async function (node, file) {
        return `Reading file ${node.pathLink}.`;
    }
})

export { FileHandle };