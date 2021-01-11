#!/usr/local/bin/python3

"""
Script to build the database of dutch PII
"""

import os
import json

from . import feature_templates
from . import feature_sets

LANG = 'nl'

def generate_dataset(build_path, benchmark_path, aggregate_path, print_cb):
    def print_line(line=''):
        print_cb(line)
        print_cb(None)

    ds_full_output_path = os.path.join(
        aggregate_path,
        'ds_full.json'
    )
    ds_severity_output_path = os.path.join(
        build_path,
        'ds_severity.json'
    )
    benchmark_output_path = os.path.join(
        benchmark_path,
        'benchmark.json'
    )

    if not os.path.exists(build_path):
        os.mkdir(build_path)

    # load wordlists
    wordlists = {}
    print_line('Loading sets:')
    for feature_set in feature_sets.all:
        print_line('* {}'.format(feature_set.NAME))
        wordlist = feature_set.get_wordlists(print_cb)
        wordlists[feature_set.NAME] = wordlist
        print_line()
        ds_partial_output_path = os.path.join(
            build_path,
            'ds_{}.json'.format(feature_set.NAME)
        )
        with open(ds_partial_output_path, 'w') as f:
            print_line('saving to {}'.format(ds_partial_output_path))
            json.dump(wordlist, f)

    # store severity mapping
    print_line('Storing severity mapping.')
    with open(ds_severity_output_path, 'w') as f:
        print_line('saving to {}'.format(ds_severity_output_path))
        json.dump(feature_templates.severity_mapping, f)

    # store aggregated ds
    all_data = {
        'name':                 'pii_dataset_nl',
        'version':              0,
        'wordlists':            wordlists,
        'severity_mapping':     feature_templates.severity_mapping
    }
    print_line('Storing pii dataset.')
    with open(ds_full_output_path, 'w') as f:
        print_line('saving to {}'.format(ds_full_output_path))
        json.dump(all_data, f)

    print_line('Storing benchmark dataset.')
    # store benchmark ds
    with open(benchmark_output_path, 'w') as f:
        print_line('saving to {}'.format(benchmark_output_path))
        json.dump(feature_templates.benchmark_data, f)

    print_line('done.')