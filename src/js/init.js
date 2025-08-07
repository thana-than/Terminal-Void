import Global from './global';
import Data from './gameData';
import { Directory } from './dir.js';
import json from '../.generated/fileStructure.json';

export default function init() {
    Global.initialize(json["build"]);
    Data.accessKeys.add(Global.build);

    //* Build file structure
    const dirResponse = Directory.generateFileSystem(json["file_structure"]);
    Global.log(dirResponse);
}