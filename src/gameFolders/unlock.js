import UnlockKey from "/src/js/unlockKey";

const Unlock = new UnlockKey('CLEAR');
//* Can put alternate messages here before exporting (string or function allowed):
// Unlock.msg_unlock = () => `Key unlocked: ${this.key}`;
// Unlock.msg_alreadyUnlocked = () => `Key ${this.key} already unlocked`;
// Unlock.msg_examine = "Unlocks a new command";
// Unlock.msg_examine_alreadyUnlocked = () => this.msg_examine;
export default Unlock;