#!/usr/local/bin/python3

"""
Script to build the database of dutch PII
"""

import os
import json

from feature_sets import all


# paths
build_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'build'
)
output_path = os.path.join(
    build_path,
    'dataset.json'
)
if not os.path.exists(build_path):
    os.mkdir(build_path)

# provide some form of progress indication
def print_cb(msg):
    """Provides a callback to print progress"""
    print('--- ' + msg, end="\r", flush=True)

# load wordlists
wordlists = {}
print('Loading sets:')
for feature_set in all:
    print('* {}'.format(feature_set.NAME))
    wordlists[feature_set.NAME] = feature_set.get_wordlists(print_cb)
    print()

# store aggregated dataset
all_data = {
    'name':         'pii_dataset_nl',
    'version':      0,
    'wordlists':    wordlists
}
with open(output_path, 'w') as f:
    print('saving to {}'.format(output_path))
    json.dump(all_data, f)

print('done.')