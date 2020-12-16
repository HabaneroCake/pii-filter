import os
import re

raw_variables_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'Waarden'
)

def get_values():
    def get_paths_with_extension(origin_path, extension, recursive=False):
        """ returns the paths of all the files with the specified extension in the specified location """
        for file_name in os.listdir(origin_path):
            path = os.path.abspath(os.path.join(origin_path, file_name))
            if os.path.isfile(path) and path.endswith(extension):
                yield path
            elif recursive and os.path.isdir(path):
                yield from get_paths_with_extension(path, extension, recursive)


    result = {}
    ext = '.txt'
    for path in list(get_paths_with_extension(raw_variables_path, ext)):
        with open(path) as f:
            data = f.readlines()
            words = []
            for row in data:
                word = row.strip().lower()
                words.append(word)
            
            name = os.path.split(path)[1][:-len(ext)]
            result[name] = words
    return result
            
values = get_values()
print(values)