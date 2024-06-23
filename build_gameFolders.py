import os
import json
import shutil
import sys

def build_file_structure(directory, isReleaseBuild):
    file_structure = {
        "hash" : "",
        "pathLink": f'.{directory}', #*Add a dot before so the program know to go back one folder
        "name": os.path.basename(directory),
        "type": "directory",
        "children": []
    }

    children = os.listdir(directory)
    if len(children) == 0: return

    for entry in os.listdir(directory):
        source_path = os.path.join(directory, entry)
        path_link = f'.{source_path}'
        if os.path.isdir(source_path):
            #* Add directory to json (recursively) ((if it's not empty))
            subDir = build_file_structure(source_path, isReleaseBuild)
            if subDir: file_structure["children"].append(subDir)
        else:
            _hash = generate_file_hash_name(source_path, entry)

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
                "hash": _hash,
                "pathLink": path_link,
                "name": _name,
                "type": _ext,
                "gameExt": _gameExt
            })
            
            importComponents[_hash] = path_link.replace('\\','/')

    return file_structure

def generate_file_hash_name(full_path, file_name):
    _file, _ext = os.path.splitext(file_name)
    _file = os.path.basename(_file)
    return f"{_file}_{hash(full_path)}{_ext}"

def generate_dynamic_imports_js():
    #* Start the content of the dynamicImports.js file
    content = "export const gameFiles = {\n"
    
    #* Add each file to the gameFiles object
    #* Each line adds a dynamic import for webpack to handle. We use webpackChunkName to ensure the files all share the same pack.
    for component in importComponents:
        content += f"    '{component}': () => import(/* webpackChunkName: \"components\" */ '{importComponents[component]}'),\n"
    
    #* Close the object
    content += "};\n"

    #* Write the content to the output file
    with open(os.path.join(outDir ,dynImportJs), 'w') as f:
        f.write(content)

importComponents = {}
isDevBuild = len(sys.argv) > 1 and sys.argv[1] in ("--dev", "-d")
isReleaseBuild = not isDevBuild
buildTypeName = "RELEASE" if isReleaseBuild else "DEV"

os.chdir('./src/')
directory_path = './gameFolders'
outDir = './.generated/'

fileStructureJSON = 'fileStructure.json'
dynImportJs = 'dynamicImports.js'
print(f"Creating {buildTypeName} build.")

if not os.path.exists(outDir):
    os.mkdir(outDir)

print(f"Building file structure from folder {directory_path}")
file_structure = build_file_structure(directory_path, isReleaseBuild)

json_structure = {
    "build": buildTypeName,
    "file_structure": file_structure 
}

fileStructureOut = os.path.join(outDir, fileStructureJSON)
print(f"Saving {fileStructureOut}")
with open(fileStructureOut, 'w') as f:
    json.dump(json_structure, f, indent=2)
print(f'File structure has been saved to {fileStructureOut}')

print(f"Generating Dynamic js imports")
generate_dynamic_imports_js()
print(f"Generation complete! Saved to {dynImportJs}")

print(f"{buildTypeName} build complete!")
