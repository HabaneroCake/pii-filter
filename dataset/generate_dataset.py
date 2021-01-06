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
    'build',
    'nl',
)
ds_full_output_path = os.path.join(
    build_path,
    'ds_full.json'
)
ds_severity_output_path = os.path.join(
    build_path,
    'ds_severity.json'
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
    wordlist = feature_set.get_wordlists(print_cb)
    wordlists[feature_set.NAME] = wordlist
    print()
    ds_partial_output_path = os.path.join(
        build_path,
        'ds_{}.json'.format(feature_set.NAME)
    )
    with open(ds_partial_output_path, 'w') as f:
        print('saving to {}'.format(ds_partial_output_path))
        json.dump(wordlist, f)

# store severity mapping
print('Storing severity mapping.')
with open(ds_severity_output_path, 'w') as f:
    print('saving to {}'.format(ds_severity_output_path))
    json.dump(feature_templates.severity_mapping, f)

# store aggregated ds
all_data = {
    'name':                 'pii_dataset_nl',
    'version':              0,
    'wordlists':            wordlists,
    'severity_mapping':     feature_templates.severity_mapping
}
print('Storing pii dataset.')
with open(ds_full_output_path, 'w') as f:
    print('saving to {}'.format(ds_full_output_path))
    json.dump(all_data, f)

print('Storing benchmark dataset.')
# store benchmark ds
with open(benchmark_output_path, 'w') as f:
    print('saving to {}'.format(benchmark_output_path))
    json.dump(feature_templates.benchmark_data, f)

print('done.')