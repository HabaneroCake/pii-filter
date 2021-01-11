#!/usr/local/bin/python3

"""
Script to build the PII database
"""

import os
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

print("Generating PII database.")
for lang in languages:
    print("[{}] Generating".format(lang.LANG))
    build_path =        os.path.join(pii_filter_path, 'src', 'lang', lang.LANG, 'dataset')
    benchmark_path =    os.path.join(pii_filter_path, 'tests', 'lang', lang.LANG)
    aggregate_path =    os.path.join(current_folder, 'aggregate')

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
        print_cb
    )