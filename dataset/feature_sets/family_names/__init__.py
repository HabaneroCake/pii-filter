"""
family_names wordlists
"""

import os
import csv
import json

from .. import word_list_counter

NAME = 'family_names'
 
raw_family_names_1_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'DutchNameGenerator',
    'MarkovDutchNameGenerator',
    'LastNames.txt'
)
raw_family_names_2_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'family-names-in-the-netherlands',
    'family_names.lst' # maybe filter out first names?
)
raw_family_names_3_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'name-dataset',
    'names_dataset',
    'last_names.all.txt'
)

def get_wordlists(line_printer_cb):
    word_list = word_list_counter.WordListCounter()
    for path in [raw_family_names_1_path, raw_family_names_2_path, raw_family_names_3_path]:
        with open(path) as f:
            data = f.readlines()
            for row in data:
                word_list.check_and_add(row)
                line_printer_cb('main: {}'.format(word_list.count))
    return {'main': word_list.all}
