import os
import json
import shutil
import sys

def build_file_structure(directory, isReleaseBuild):
    file_structure = {
        "pathLink": "" if isReleaseBuild else directory,
        "name": os.path.basename(directory),
        "type": "directory",
        "children": []
    }

    children = os.listdir(directory)
    if len(children) == 0: return

    for entry in os.listdir(directory):
        source_path = os.path.join(directory, entry)
        path_link = source_path
        if os.path.isdir(source_path):
            #* Add directory to json (recursively) ((if it's not empty))
            subDir = build_file_structure(source_path, isReleaseBuild)
            if subDir: file_structure["children"].append(subDir)
        else:
            if isReleaseBuild: #* If release build, copy the object to the build folder
                linkName = generate_file_hash_name(source_path, entry) #* Generate a name using a hash of the path so that there are no accidental copies
                path_link = os.path.join(release_build_path, linkName)
                print(f"Creating file link {path_link}")
                shutil.copy(source_path, path_link)

            #* Add file to json
            splitPath = entry.rsplit(os.extsep,1)
            _name = splitPath[0]
            _ext = ''
            if len(splitPath) > 1: _ext = splitPath[1]

            
            #* If theres another ext separator in the name (ie, text.txt.js), use the "fake" one (txt)
            splitPath = _name.split(os.extsep, 1);
            _name = splitPath[0]
            _gameExt = _ext
            if len(splitPath) > 1: _gameExt = splitPath[1]

            file_structure["children"].append({
                "pathLink": path_link,
                "name": _name,
                "type": _ext,
                "gameExt": _gameExt
            })
    return file_structure

def generate_file_hash_name(full_path, file_name):
    _file, _ext = os.path.splitext(file_name)
    return f"{_file}_{hash(full_path)}{_ext}"

isDevBuild = len(sys.argv) > 1 and sys.argv[1] in ("--dev", "-d")
isReleaseBuild = not isDevBuild
buildTypeName = "RELEASE" if isReleaseBuild else "DEV"
fileStructureJSON = 'dist/fileStructure.json'
print(f"Creating {buildTypeName} build.")

directory_path = './gameFolders'
release_build_path = './dist/build'

if (isReleaseBuild):
    print(f"Cleaning build folder {release_build_path}")
    shutil.rmtree(release_build_path, True)
    os.mkdir(release_build_path)

print(f"Building file structure from folder {directory_path}")
file_structure = build_file_structure(directory_path, isReleaseBuild)

json_structure = {
    "build": buildTypeName,
    "file_structure": file_structure 
}

print(f"Saving {fileStructureJSON}")
with open(fileStructureJSON, 'w') as f:
    json.dump(json_structure, f, indent=2)
print(f'File structure has been saved to {fileStructureJSON}')
print(f"{buildTypeName} build complete!")
