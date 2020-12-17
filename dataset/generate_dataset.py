#!/usr/local/bin/python3

"""
Script to build the database of dutch PII
"""

import os
import json

import feature_templates
from feature_sets import all


# paths
build_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'build'
)
dataset_output_path = os.path.join(
    build_path,
    'dataset.json'
)
benchmark_output_path = os.path.join(
    build_path,
    'benchmark.json'
)
if not os.path.exists(build_path):
    os.mkdir(build_path)

# provide some form of progress indication
def print_cb(msg):
    """Provides a callback to print progress"""
    if msg:
        print('--- ' + msg, end="\r", flush=True)
    else:
        print()

# load wordlists
wordlists = {}
print('Loading sets:')
for feature_set in all:
    print('* {}'.format(feature_set.NAME))
    wordlists[feature_set.NAME] = feature_set.get_wordlists(print_cb)
    print()

# store aggregated dataset
all_data = {
    'name':                 'pii_dataset_nl',
    'version':              0,
    'wordlists':            wordlists,
    'severity_mapping':     feature_templates.severity_mapping
}
print('Storing pii dataset.')
with open(dataset_output_path, 'w') as f:
    print('saving to {}'.format(dataset_output_path))
    json.dump(all_data, f)

print('Storing benchmark dataset.')
# store benchmark dataset
with open(benchmark_output_path, 'w') as f:
    print('saving to {}'.format(benchmark_output_path))
    json.dump(feature_templates.benchmark_data, f)

print('done.')