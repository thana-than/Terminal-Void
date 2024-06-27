
import json from '../.generated/fileStructure.json';
import { Directory } from './dir.js';

class Global {
    static build

    static initialize() {
        //*Get build type
        this.build = json["build"]

        //* Build file structure
        const dirResponse = Directory.generateFileSystem(json["file_structure"]);
        this.log(dirResponse);
    }

    static log(logText) {
        if (this.build != "RELEASE")
            console.log(logText)
    }
}

export { Global }