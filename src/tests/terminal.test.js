import ReactDOM from 'react-dom';
import Global from '../js/global';
import init from '../js/init.js'
import Data from '../js/gameData';
import Terminal, { CD } from '../js/terminal';

//* Expect Reference: https://jestjs.io/docs/expect

beforeAll(() => {
    init();
});

afterEach(() => {
    //* Disable god mode
    Global.GOD_MODE = false;

    //* Reset keys
    Data.accessKeys.clear();
    Data.accessKeys.add(Global.build);

    //* Clear terminal
    Terminal.clear();
});

// Extract raw text content from the JSX output
const getText = (jsx) => {
    const div = document.createElement('div');
    ReactDOM.render(jsx, div);
    return div.textContent || div.innerText || '';
};

test('Permission failure - via CD command.', async () => {
    const response = getText(await Terminal.sendCommand("cd dev"))
    expect(response).toBe(getText(CD.accessFailed));
});

test('Permission failure - via folder .', async () => {
    //* Clear access key to dev
    Data.accessKeys.delete(Global.build);
    //* Add CD access key
    Data.accessKeys.add(CD.accessKey);

    const response = await Terminal.sendCommand("cd dev")
    const responseStr = getText(response); //* Need to stringify react component cause we are doing a regex search
    expect(responseStr).toMatch("ACCESS DENIED");
});

test('cd dev - use Change Directory to enter dev folder.', async () => {
    //* Add CD access key
    Data.accessKeys.add(CD.accessKey);

    //* The folder we are coming from
    const initialFolder = getText(await Terminal.sendCommand("ls"))

    //* Enter dev folder
    await Terminal.sendCommand("cd dev")

    //* We should have moved folders
    const currentFolder = getText(await Terminal.sendCommand("ls"))

    expect(currentFolder).not.toBe(initialFolder);
});