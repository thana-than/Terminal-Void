import '../css/os.css'
import Interpreter from './command.js';
import CLI from "./cliProgram";
import { Directory } from './dir.js';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const CD = {
    keys: ['goto', 'go', 'cd'],
    help: "Navigate to the folder at the given path",
    accessKey: 'CLIENT',
    accessFailed: "ACCESS DENIED: Permission level required: CLIENT",
    verboseHelp: function () {
        return (
            <>
                {this.help}
                <div className='subtext'>Required Parameter: Folder path</div>
                <div className='tip'>Entering "goto BACK" will bring you up one folder</div>
                <div className='tip'>TIP! Entering a folder path without this command will still work.</div>
            </>
        );
    },
    invoke: function (params) {
        if (params.length != 1)
            return "cd command takes 1 parameter (path)";

        const newDir = Directory.cd(params[0]);
        const node = Directory.get(newDir);
        if (node && node.isFolder)
            return <>{newDir}:{LIST.invoke()}</>;
        return newDir;
    }
}

const RUN = {
    keys: ['run', 'r', 'open', 'o'],
    help: "Runs the file at the given path",
    verboseHelp: function () {
        return (
            <>
                {this.help}
                <div className='subtext'>Required Parameter: File path</div>
                <div className='tip'>TIP! Entering a file path without this command will still work.</div>
            </>
        );
    },
    invoke: async function (params) {
        if (params.length != 1)
            return "run command takes 1 parameter (folder path)";

        return await Directory.run(params[0]);
    }
}

const LIST = {
    keys: ['list', 'ls'],
    help: "Lists the files in the current folder",
    verboseHelp: function () {
        return (
            <>
                Lists the files in the given folder
                <div className='subtext'>Entering "list" alone will use the current folder</div>
                <div className='subtext'>Optional Parameters: Folder paths</div>
            </>
        );
    },
    invoke: function (params) {
        if (!params || params.length == 0)
            return str(ls(Directory.current));

        let contents = [];
        params.forEach(path => {
            const n = Directory.get(path);
            if (n && !n.isFile) {
                contents.push(`${n.fullName}:`)
                contents.push(...ls(n));
            }
            else {
                contents.push(`Path '${path}' is not a folder.`);
            }
        });

        return str(contents);

        function str(contents) {
            return contents.map(node => {
                if (typeof node === 'string')
                    return node;

                let icon = '🗀';
                if (node.isFile)
                    icon = '🗎';

                return <div key={uuidv4()}>{icon} {node.fullName}</div>
            });
        }

        function ls(node) {
            const arr = Array.from(node.children.values());
            arr.sort((a, b) => { return a.isFile - b.isFile; });

            return arr;
        }
    }
};

const CLEAR = {
    keys: ['clear', 'cls'],
    help: "Clears the terminal screen",
    verboseHelp: function () {
        return (
            <>
                {this.help}
                <div className='tip'>TIP! Entering "clear restore" will restore your last cleared screen</div>
            </>
        );
    },
    accessKey: 'CLIENT',
    restore_regex: /restore|undo/i,
    invoke: function (params, context) {
        if (params.length > 0) {
            if (params.length == 1 && this.restore_regex.test(params[0])) {
                return context.cli.undoClear();
            }
            else {
                return `Clear command does not take "${params}" as a parameter`
            }
        }

        context.cli.clear();
        const payload = {
            ignorePrintCommand: true,
            ignorePrintResponse: true,
        }
        return payload;
    }
};

const HELP = {
    keys: ['help', 'h'],
    help: <>Enter "help &#40;command_name&#41;" for more info.</>,
    verboseHelp: function () {
        return <>
            Describes available commands.
            <div className='subtext'>{this.help}</div>
        </>;
    },
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
                if (command == this)
                    str.push(<div key={uuidv4()} className='subHead'>{this.help}</div>);
                else if (interpreter.HasAccess(command) && command.help)
                    str.push(this.getHelpBlock(command));
            });
        }

        return <>{str}</>;
    },
    getHelpBlock: function (command) {
        return (<div key={uuidv4()}>{this.prefix(command)} <span className='small'>{command.help}</span></div>);
    },
    getVerboseHelpBlock: function (command) {
        return (<div key={uuidv4()}>{this.prefix(command)}<br></br>{command.verboseHelp()}</div>);
    },
    prefix: function (command) {
        return <>{command.keys[0]}<span className='subHead'> [{command.keys.join(', ')}]</span>:</>
    }
}

const EXAMINE = {
    keys: ['examine', 'ex'],
    help: "Examines the target file or folder",
    invoke: function (params, context) {
        if (params.length != 1)
            return "examine command takes 1 parameter (path)";
        return Directory.examine(params[0]);
    }
};

async function smartCommand(command, context) {
    let node = Directory.get(command)
    if (node) //* Start by seeing if we can navigate a directory
    {
        if (node.isFile) {
            //* Run if file
            return await context.interpreter.Run(`run ${command}`, context);
        }
        else {
            //* Nav if folder
            return context.interpreter.Run(`cd ${command}`, context);
        }
    }

    return null;
}

const interpreter = new Interpreter(
    [HELP, LIST, EXAMINE, RUN, CD, CLEAR],
    smartCommand
);

const Terminal = new CLI(interpreter);
Terminal.themeStyle = "terminalTheme";
Terminal.startMessage = <>Welcome!<br></br>Enter "help" to view available commands.</>;
export default Terminal;