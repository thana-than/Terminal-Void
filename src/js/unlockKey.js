import Data from './gameData'

export default class UnlockKey {
    msg_unlock = () => `Key unlocked: ${this.key}`;
    msg_alreadyUnlocked = () => `Key ${this.key} already unlocked`;
    msg_examine = "Unlocks a new command";
    msg_examine_alreadyUnlocked = () => this.msg_examine;

    constructor(key) {
        this.key = key;
    }

    run() {
        if (Data.accessKeys.has(this.key))
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