import { gameComponents } from '../.generated/dynamicImports';

const delay = ms => new Promise(res => setTimeout(res, ms));

class FileHandle {
    static fileHandles = new Map();

    static async open(node) {
        const handle = this.fileHandles.get(node.type)
        if (!handle) {
            console.log(`File '${node.pathLink}' is not a recognized type.`) //TODO console.log should be replaced so it doesn't show up in build
            return `File '${node.fullName}' is not a recognized type.`;
        }

        console.log(`Opening ${node.fullName} at ${node.pathLink}`);  //TODO console.log should be replaced so it doesn't show up in build
        //TODO load file first then pass
        return handle.read(node);
    }

    constructor(extensions) {
        this.extensions = extensions;
        this.extensions.forEach(key => {
            FileHandle.fileHandles.set(key, this);
        });
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
    read: function (file) {
        return `Reading file ${file.pathLink}.`;
    }
})

const JSHandle = fileHandleFactory({
    extensions: ['js'],
    read: async function (file) {
        return `Reading file ${file.pathLink}.`;
    }
})

export { FileHandle };