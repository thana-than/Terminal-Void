import '../css/os.css'
import Interpreter from './command.js';
import CLI from "./cliProgram";
import { Directory } from './dir.js';

const CD = {
    keys: ['cd', 'goto'],
    invoke: function (params) {
        if (params.length != 1)
            return "cd command takes 1 parameter (path)";
        return Directory.cd(params[0])
    }
}

const RUN = {
    keys: ['run', 'r', 'open', 'o'],
    invoke: function (params) {
        if (params.length != 1)
            return "run command takes 1 parameter (path)";

        return Directory.run(params[0]);
    }
}

const LIST = {
    keys: ['ls', 'list'],
    invoke: function (params) {
        if (params.length == 0)
            return str(ls(Directory.current));

        let contents = [];
        params.forEach(path => {
            const n = Directory.get(path);
            if (n)
                contents.push(...ls(n));
            else
                contents.push(`Path '${path}' is not a directory.`);
        });

        return str(contents);

        function str(contents) {
            return contents.map(name => `-${name} `);
        }

        function ls(node) {
            return Array.from(node.children.values(), (n) => n.fullName);
        }
    }
};

const CLEAR = {
    keys: ['cls', 'clear'],
    allowCommandDisplay: false,
    invoke: function (params, context) {
        context.cli.clear();
    }
};

function smartCommand(command, context) {
    let node = Directory.get(command)
    if (node) //* Start by seeing if we can navigate a directory
    {
        if (node.isFile)
            return Directory.runNode(node); //* Run if file
        else
            return Directory.cdNode(node); //* Nav if folder
    }

    return null;
}

const interpreter = new Interpreter(
    [CD, RUN, LIST, CLEAR],
    smartCommand
);

const Terminal = new CLI(interpreter);
Terminal.themeStyle = "terminalTheme";
export default Terminal;