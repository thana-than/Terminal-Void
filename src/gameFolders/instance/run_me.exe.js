import UnlockKey from "/src/js/unlockKey";
import React from "react";
import { CD } from "/src/js/terminal"

const Unlock = new UnlockKey('CLIENT');
//* Can put alternate messages here before exporting (string or function allowed):
Unlock.msg_unlock = () => <>
    <div className="head"><span>PERMISSION GRANTED:</span> ACCESS LEVEL: {Unlock.key}</div>
    <div className="text">New Command Unlocked: GOTO. Help command list expanded.</div>
    <div className="tip">Enter "help goto" for specific details on the goto command.</div><br></br>
    <div>{CD.invoke()}</div>
</>;
// Unlock.msg_alreadyUnlocked = () => `PERMISSION LEVEL: ${Unlock.key} already granted`;
Unlock.msg_examine = "It shouldn't hurt to try running this program... (hopefully)";
// Unlock.msg_examine_alreadyUnlocked = "I've already run this program!";
export default Unlock;