import os
import json

def build_file_structure(directory):
    file_structure = {
        "path": directory,
        "name": os.path.basename(directory),
        "type": "directory",
        "children": []
    }

    for entry in os.listdir(directory):
        full_path = os.path.join(directory, entry)
        if os.path.isdir(full_path):
            file_structure["children"].append(build_file_structure(full_path))
        else:
            file_structure["children"].append({
                "path": full_path,
                "name": entry,
                "type": "file"
            })
    return file_structure

directory_path = './gameFolders'
file_structure = build_file_structure(directory_path)

with open('fileStructure.json', 'w') as f:
    json.dump(file_structure, f, indent=2)

print('File structure has been saved to fileStructure.json')