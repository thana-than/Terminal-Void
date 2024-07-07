import Data from './gameData'

export default class UnlockKey {
    msg_unlock = () => `PERMISSION GRANTED: Access 🗝 Key: ${this.key}`;
    msg_alreadyUnlocked = () => `PERMISSION 🗝 KEY: ${this.key} already granted`;
    msg_examine = "I should try running this...";
    msg_examine_alreadyUnlocked = "I've already run this program!";

    constructor(key) {
        this.key = key;
    }

    run() {
        if (Data.accessKeys.has(this.key)) //* We do a raw key check instead of HasAccess here
            return returnMsg(this.msg_alreadyUnlocked);

        Data.accessKeys.add(this.key);
        return returnMsg(this.msg_unlock);
    }

    examine() {
        if (Data.accessKeys.has(this.key))
            return returnMsg(this.msg_examine_alreadyUnlocked);

        return returnMsg(this.msg_examine);
    }
}

function returnMsg(message) {
    if (typeof message === 'function')
        return message();
    return message;
}