class GameData {
    accessKeys = new Set();

    HasAccess(key) {
        return this.accessKeys.has(key);
    }
}

const Data = new GameData();
export default Data;