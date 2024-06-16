class FileHandle {
    static async open(node) {
        await delay(2000);
        return `opened ${node.fullName} at ${node.pathLink}`;
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));
export { FileHandle };