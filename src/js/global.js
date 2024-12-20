
import json from '../.generated/fileStructure.json';
import { Directory } from './dir.js';
import Data from './gameData';

export default class Global {
    static build
    static GOD_MODE = process.env.GODMODE === 'true';

    static initialize() {
        //*Get build type
        this.build = json["build"]
        Data.accessKeys.add(this.build);

        //* Build file structure
        const dirResponse = Directory.generateFileSystem(json["file_structure"]);
        this.log(dirResponse);
    }

    static log(logText) {
        if (this.build != "RELEASE")
            console.log(logText)
    }
}