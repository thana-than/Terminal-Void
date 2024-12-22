import Global from './global.js';

export default class UserPerms {
    superuser = false;
    devcommand = false;

    constructor(superuser = false) {
        this.superuser = superuser;
    }

    isSuperuser() {
        return Global.GOD_MODE || this.devcommand || this.superuser;
    }
}
export const SUPERUSER = new UserPerms(true);