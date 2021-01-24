"""
family_names wordlists
"""

import os
import csv
import json

from .. import word_list_counter
from .. import parse_assoc
from .. import dictionaries

NAME = 'family_name'
 
raw_nl_family_names_1_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'DutchNameGenerator',
    'MarkovDutchNameGenerator',
    'LastNames.txt'
)
raw_nl_family_names_2_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'family-names-in-the-netherlands',
    'family_names.lst' # maybe filter out first names?
)
raw_us_family_names_1_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'name-dataset',
    'names_dataset',
    'last_names.all.txt'
)

raw_association_multipliers_1_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'association_multipliers',
    'family_name.txt'
)

def get_wordlists(line_printer_cb):
    word_list_nl = word_list_counter.WordListCounter()
    word_list_int = word_list_counter.WordListCounter()
    for path in [raw_nl_family_names_1_path, raw_nl_family_names_2_path]:
        with open(path) as f:
            data = f.readlines()
            for row in data:
                row = row.lower().strip()
                if row not in dictionaries.popular_words.top_40:
                    word_list_nl.check_and_add(row)
                    line_printer_cb('main: {}'.format(word_list_nl.count))

    # new line
    line_printer_cb(None)

    with open(raw_us_family_names_1_path) as f:
        data = f.readlines()
        for row in data:
            row = row.lower().strip()
            if row not in dictionaries.popular_words.top_40:
                word_list_int.check_and_add(row)
                line_printer_cb('international: {}'.format(word_list_int.count))

    # new line
    line_printer_cb(None)

    return {
        **{'main': word_list_nl.keys},
        **{'int': word_list_int.keys},
        **parse_assoc.read_assoc_data([raw_association_multipliers_1_path], line_printer_cb)
    }
