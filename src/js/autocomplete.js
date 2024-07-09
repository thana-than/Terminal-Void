import React from "react";

export default function inputFilter(str, context) {
    const possibilities = getContexts(context).filter(item => item.toLowerCase().startsWith(str));

    return possibilities;
}

const pathingContexts = ['../', 'BACK'];

function getContexts(context) {
    const arr = []
    if (context.flags.has('commands')) arr.push(...getCommandContexts(context.interpreter));
    if (context.flags.has('folders')) arr.push(...getFolderContexts(context.node));
    if (context.flags.has('files')) arr.push(...getFileContexts(context.node));
    if (context.custom != null) arr.push(...context.custom);

    return arr;
}

function getCommandContexts(interpreter) {
    const result = Array.from(interpreter.commands).reduce((arr, [name, value]) => {
        const requested = interpreter.Get(name);

        //*If it's one of these then it's an error message, get it out of here!
        if (requested == null || typeof requested === 'string' || React.isValidElement(requested))
            return arr;

        arr.push(name);
        return arr;
    }, []);
    return result.sort();
}

function getFolderContexts(node) {
    const result = Array.from(node.children).reduce((arr, [name, child]) => {
        if (child.isFolder) {
            arr.push(child.fullName);
        }
        return arr;
    }, []);
    result.push(...pathingContexts);
    return result;
}

function getFileContexts(node) {
    const result = Array.from(node.children).reduce((arr, [name, child]) => {
        if (child.isFile) {
            arr.push(child.fullName);
        }
        return arr;
    }, []);
    return result;
}