#!/usr/local/bin/python3

"""
Script to build the PII database
"""

import os
import json
import nl

languages = [nl]

current_folder =    os.path.dirname(os.path.realpath(__file__))
pii_filter_path =   os.path.join(current_folder, os.pardir, 'pii-filter')

# provide some form of progress indication
def print_cb(msg):
    """Provides a callback to print progress"""
    if msg:
        print('---- ' + msg, end="\r", flush=True)
    else:
        print()

MAX_CHUNK_SIZE = 2000000
# callback for saving files
def json_dump_cb(file_path, obj):
    # TODO: configure above for max size and split chunks
    chunk = 0
    objects = []
    s = json.dumps(obj)
    if len(s) >= MAX_CHUNK_SIZE:
        OBJ_BASE_SIZE = len('{}\r\n')
        KEY_BASE_SIZE = len('"": []')
        current_object = {}
        current_size = OBJ_BASE_SIZE

        # iterate over keys (flat)
        for key in obj.keys():
            # calc size of key including "":\r\n\s\s, use as base
            empty_key_size = KEY_BASE_SIZE + len(key)
            if current_size + empty_key_size >= MAX_CHUNK_SIZE:
                objects.append(current_object)
                current_object = {}
                current_size = OBJ_BASE_SIZE
            
            current_object[key] = type(obj[key])()
            current_size += KEY_BASE_SIZE

            values = obj[key]
            if isinstance(values, list):
                for value in values:
                    value_str_len = len(str(value)) + len(' "", ')
                    if current_size + value_str_len >= MAX_CHUNK_SIZE:
                        objects.append(current_object)
                        current_object = {}
                        current_object[key] = type(obj[key])()
                        current_size = OBJ_BASE_SIZE + KEY_BASE_SIZE

                    current_object[key].append(value)
                    current_size += value_str_len
            else: # TODO:
                raise ValueError(f'{key} is not a list')

        objects.append(current_object)
    else:
        objects = [obj]
    
    for index, o in enumerate(objects):
        new_file_path = f'{file_path}_{index}.json'
        with open(new_file_path, 'w') as f:
            print_cb('saving to {}'.format(new_file_path))
            print()
            print()
            json.dump(o, f)

print("Generating PII database.")
for lang in languages:
    print("[{}] Generating".format(lang.LANG))
    build_path =        os.path.join(pii_filter_path, 'src', 'lang', lang.LANG, 'dataset')
    benchmark_path =    os.path.join(pii_filter_path, 'tests', 'lang', lang.LANG)
    aggregate_path =    os.path.join(current_folder, 'aggregate', lang.LANG)

    if not os.path.exists(build_path):
        os.makedirs(build_path)
    if not os.path.exists(benchmark_path):
        os.makedirs(benchmark_path)
    if not os.path.exists(aggregate_path):
        os.makedirs(aggregate_path)

    lang.generate_dataset(
        build_path,
        benchmark_path,
        aggregate_path,
        json_dump_cb,
        print_cb
    )