import '../css/os.css'
import Interpreter from './command.js';
import CLI from "./cliProgram";
import { Directory } from './dir.js';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Global from './global.js';
import { Folder, File, Key } from './icons';

export const CD = {
    keys: ['goto', 'cd'],
    help: "Navigate to the folder at the given path",
    accessKey: 'CLIENT',
    accessFailed: <>COMMAND ACCESS DENIED: Permission <Key /> Required: CLIENT</>,
    autoContexts: [['folders']],
    verboseHelp: function () {
        return (
            <>
                {this.help}
                <div className='subtext'>Required Parameter: <Folder /> path</div>
                <div className='tip'>Entering "goto BACK" will bring you up one <Folder /></div>
                <div className='tip'>TIP! Entering a <Folder /> path without this command will still work.</div>
            </>
        );
    },
    invoke: function (params) {
        if (params && params.length > 1)
            return "cd command takes 1 parameter (path)";

        const dirParam = (params) ? params[0] : './';

        const newDir = Directory.cd(dirParam);
        if (newDir.success)
            return <>{LIST.invoke()}</>;
        return newDir.message;
    }
}

export const RUN = {
    keys: ['run', 'open'],
    help: <>Runs the <File /> at the given path</>,
    autoContexts: [['files']],
    verboseHelp: function () {
        return (
            <>
                {this.help}
                <div className='subtext'>Required Parameter: <File /> path</div>
                <div className='tip'>TIP! Entering a <File /> path without this command will still work.</div>
            </>
        );
    },
    invoke: async function (params) {
        if (params.length != 1)
            return <>run command takes 1 parameter (<File /> path)</>;

        return await Directory.run(params[0]);
    }
}

export const LIST = {
    keys: ['list', 'ls'],
    help: <>Lists the <File />s in the current <Folder /></>,
    autoContexts: [['folders'], '...'],
    verboseHelp: function () {
        return (
            <>
                Lists the <File />s in the given <Folder />
                <div className='subtext'>Entering "list" alone will use the current <Folder /></div>
                <div className='subtext'>Optional Parameters: <Folder /> paths</div>
            </>
        );
    },
    invoke: function (params) {
        if (!params || params.length == 0)
            params = ['./']

        const contents = [];
        params.forEach(path => {
            const result = Directory.get(path);
            if (result.node && !result.node.isFile) {
                if (result.success) {
                    contents.push(listBlock(result.node));
                }
                else {
                    contents.push(result.message);
                }
            }
            else {
                contents.push(<div>Path '{path}' is not a <Folder />.</div>);
            }
        });

        return contents.map((c, index) => {
            const spacing = index < contents.length - 1 ? <br></br> : <></>;
            return <div key={uuidv4()}>{c}
                {spacing}</div>
        });

        // return str(contents);

        function listBlock(dirNode) {
            const arr = Array.from(dirNode.children.values());
            arr.sort((a, b) => { return a.isFile - b.isFile; });

            return (
                <div>
                    ⬎ {dirNode.path()}:
                    <ul className='directoryList'>
                        {arr.map(node => {
                            const icon = node.isFile ? <File text='' /> : <Folder text='' />;
                            return (<li className={node.getClassName()} key={uuidv4()}>
                                <span>{icon}</span>
                                {node.fullName}
                            </li>);
                        })}
                    </ul>
                </div>
            );
        }
    }
};

export const CLEAR = {
    keys: ['clear', 'cls'],
    help: "Clears the terminal screen",
    autoCustomContext: ['restore', 'undo'],
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

export const HELP = {
    keys: ['help'],
    help: <>Enter "help &#40;command_name&#41;" for more info.</>,
    autoContexts: [['commands'], '...'],
    verboseHelp: function () {
        return <>
            Describes available commands.
            <div className='subtext'>{this.help}</div>
        </>;
    },
    invoke: function (params, context) {
        const len = params.length;

        var str = [];
        if (len > 0) {
            params.forEach(param => {
                const command = context.interpreter.Get(param);
                if (command) {
                    if (command.verboseHelp)
                        str.push(this.getVerboseHelpBlock(command));
                    else if (command.help)
                        str.push(this.getHelpBlock(command));
                }
                else {
                    str.push(<div key={uuidv4()}>Help - Parameter {param} not recognized as a command</div>);
                }

            });
        }
        else {
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

export const EXAMINE = {
    keys: ['examine'],
    autoContexts: [['files', 'folders']],
    help: <>Examines the target <File /> or <Folder /></>,
    invoke: function (params, context) {
        if (params.length != 1)
            return "examine command takes 1 parameter (path)";
        return Directory.examine(params[0]);
    }
};

async function smartCommand(command, context) {
    const result = Directory.get(command)
    if (result.node) //* Start by seeing if the command is a path to a directory
    {
        //* We don't check success until after the node is identified so that we can keep the messages related to the context of the users intent (navigation)
        if (!result.success)
            return result.message;

        if (result.node.isFile) {
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
Terminal.autoCompleteContext.firstWordFlags = ['commands', 'folders', 'files'];

if (Global.GOD_MODE)
    var godModeMessage = <div>God mode activated.</div>

Terminal.startMessage = (<>
    Welcome!<br></br>
    Enter "help" to view available commands.
    {godModeMessage}
</>);
export default Terminal;