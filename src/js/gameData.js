import Global from './global.js';

class GameData {
    accessKeys = new Set();

    HasAccess(key) {
        if (Global.GOD_MODE)
            return true;

        return this.accessKeys.has(key);
    }
}

const Data = new GameData();
export default Data;