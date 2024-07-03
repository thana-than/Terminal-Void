import '../css/os.css'
import Interpreter from './command.js';
import CLI from "./cliProgram";
import { Directory } from './dir.js';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const CD = {
    keys: ['cd', 'goto'],
    help: "Navigate to the folder at the given path",
    verboseHelp: function () {
        return (
            <>
                {this.help}
                <div style={{ color: 'var(--secondary-color)' }}>Required Parameter: Directory path</div>
            </>
        );
    },
    invoke: function (params) {
        if (params.length != 1)
            return "cd command takes 1 parameter (path)";
        return Directory.cd(params[0])
    }
}

const RUN = {
    keys: ['run', 'r', 'open', 'o'],
    help: "Runs the file at the given path",
    verboseHelp: function () {
        return (
            <>
                {this.help}
                <div style={{ color: 'var(--secondary-color)' }}>Required Parameter: File path</div>
            </>
        );
    },
    invoke: function (params) {
        if (params.length != 1)
            return "run command takes 1 parameter (path)";

        return Directory.run(params[0]);
    }
}

const LIST = {
    keys: ['list', 'ls'],
    help: "Lists the files in the given directory",
    verboseHelp: function () {
        return (
            <>
                {this.help}
                <div style={{ color: 'var(--secondary-color)' }}>Optional Parameter: Directory path</div>
            </>
        );
    },
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
    keys: ['clear', 'cls'],
    help: "Clears the terminal screen",
    allowCommandDisplay: false,
    invoke: function (params, context) {
        context.cli.clear();
    }
};

const HELP = {
    keys: ['help', 'h'],
    invoke: function (params, context) {
        const len = params.length;
        if (len > 1) {
            return "help command takes 0 or more parameters (command)";
        }
        else if (len == 1) {
            const command = context.interpreter.Get(params[0]);
            if (command) {
                if (command.verboseHelp)
                    return this.getVerboseHelpBlock(command);
                else if (command.help)
                    return this.getHelpBlock(command);
            }
            return `Help - Parameter ${params[0]} not recognized as a command`;
        }
        else {
            var str = [];
            context.interpreter.commandArray.forEach(command => {
                if (command.help)
                    str.push(this.getHelpBlock(command));
            });
        }

        return <>{str}</>;
    },
    getHelpBlock: function (command) {
        return (<div key={uuidv4()}>{this.prefix(command)} {command.help}</div>);
    },
    getVerboseHelpBlock: function (command) {
        return (<div key={uuidv4()}>{this.prefix(command)} {command.verboseHelp()}</div>);
    },
    prefix: function (command) {
        return <>{command.keys[0]}<span style={{ color: 'var(--secondary-color)' }}> [{command.keys.join(', ')}]</span>:</>
    }
}

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
    [CD, RUN, LIST, CLEAR, HELP],
    smartCommand
);

const Terminal = new CLI(interpreter);
Terminal.themeStyle = "terminalTheme";
export default Terminal;