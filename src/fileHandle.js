class FileHandle {
    static open(node) {
        return `opened ${node.fullName} at ${node.pathLink}`;
    }
}

export { FileHandle };