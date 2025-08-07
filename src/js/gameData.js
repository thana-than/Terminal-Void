class GameData {
    accessKeys = new Set();

    HasAccess(key, permissions) {
        if (permissions && typeof permissions.isSuperuser === 'function' && permissions.isSuperuser())
            return true;

        return this.accessKeys.has(key);
    }
}

const Data = new GameData();
export default Data;