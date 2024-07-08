import React from "react";

export default function inputFilter(str, context) {
    const possibilities = getContexts(context).filter(item => item.toLowerCase().startsWith(str));
    possibilities.sort();

    return possibilities[0];
}

function getContexts(context) {
    const arr = []
    if (context.commands) arr.push(...getCommandContexts(context.interpreter));
    if (context.folders) arr.push(...getFolderContexts(context.node));
    if (context.files) arr.push(...getFileContexts(context.node));
    if (context.custom != null) arr.push(...context.custom);

    return arr;
}

function getCommandContexts(interpreter) {
    return Array.from(interpreter.commands).reduce((arr, [name, value]) => {
        const requested = interpreter.Get(name);

        //*If it's one of these then it's an error message, get it out of here!
        if (requested == null || typeof requested === 'string' || React.isValidElement(requested))
            return arr;

        arr.push(name);
        return arr;
    }, []);
}

function getFolderContexts(node) {
    return Array.from(node.children).reduce((arr, [name, child]) => {
        if (child.isFolder) {
            arr.push(name);
        }
        return arr;
    }, []);
}

function getFileContexts(node) {
    return Array.from(node.children).reduce((arr, [name, child]) => {
        if (child.isFile) {
            arr.push(name);
        }
        return arr;
    }, []);
}