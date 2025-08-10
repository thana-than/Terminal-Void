import Interpreter from './command.js';
import { Directory } from './dir';

export default function inputFilter(str, context) {
    const parsedStr = getPathedString(str);
    context.complexPath = parsedStr.path != '';
    context.node = getContextNode(parsedStr.path, context);

    const collectedContexts = getContexts(context);
    const possibilities = collectedContexts.reduce((arr, item) => {
        if (item.toLowerCase().startsWith(parsedStr.end.toLowerCase())) {

            arr.push({
                word: `${parsedStr.path}${item}`,
                end: item.slice(parsedStr.end.length)
            });
        }
        return arr;
    }, []);

    return possibilities;
}

const backWords = ['..', 'BACK'];
const REGEX_PATH_SNIPPET = /^(.*[\\\/])/

function getContexts(context) {
    const arr = []

    if (context.custom != null) arr.push(...context.custom);
    if (context.flags.has('super')) context.superuser = true;
    if (!context.complexPath && context.flags.has('commands')) arr.push(...getCommandContexts(context));

    if (context.node) {
        if (context.flags.has('files')) arr.push(...getFileContexts(context));
        if (context.flags.has('files') || context.flags.has('folders')) arr.push(...getFolderContexts(context));
    }

    return arr;
}

function getPathedString(str) {
    const split = {
        path: '',
        end: str,
    }
    const pathMatch = str.match(REGEX_PATH_SNIPPET);
    if (pathMatch) {
        split.path = pathMatch[0];
        split.end = str.replace(REGEX_PATH_SNIPPET, '');
    }
    return split;
}

function getContextNode(path, context) {
    const dirResult = Directory.get(path, context);
    if (dirResult.success && dirResult.node.isFolder)
        return dirResult.node;

    return null;
}

function getCommandContexts(context) {
    const result = Array.from(context.interpreter.commands).reduce((arr, [name, value]) => {
        const requested = context.interpreter.Get(name, context);

        //*If it's one of these then it's an error message, get it out of here!
        if (!Interpreter.commandIsValid(requested))
            return arr;

        arr.push(name);
        return arr;
    }, []);
    return result.sort();
}

function getFolderContexts(context) {
    const result = Array.from(context.node.children).reduce((arr, [name, child]) => {
        if (child.isFolder) {
            arr.push(child.fullName);
        }
        return arr;
    }, []);

    //* Push backwards movemet context patterns only if this path isnt complex! (using slashes)
    if (!context.complexPath) {
        const parents = context.node.getParents().map((parent) => parent.fullName);
        result.push(...parents);
        result.push(...backWords);
    }

    return result;
}

function getFileContexts(context) {
    const result = Array.from(context.node.children).reduce((arr, [name, child]) => {
        if (child.isFile) {
            arr.push(child.fullName);
        }
        return arr;
    }, []);
    return result;
}