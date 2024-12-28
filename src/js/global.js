export default class Global {
    static build
    static GOD_MODE = process.env.GODMODE === 'true';

    static initialize(build) {
        //*Get build type
        this.build = build

        // //* Build file structure
        // const dirResponse = Directory.generateFileSystem(json["file_structure"]);
        // this.log(dirResponse);
    }

    static log(logText) {
        if (this.build != "RELEASE")
            console.log(logText)
    }
}