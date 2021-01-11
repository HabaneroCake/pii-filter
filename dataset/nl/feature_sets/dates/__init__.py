"""
date wordlists
"""

import os

from .. import word_list_counter
from .. import parse_assoc

NAME = 'date'

raw_association_multipliers_1_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'association_multipliers',
    'date.txt'
)

raw_days_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'days.txt'
)

raw_months_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'months.txt'
)

raw_ordinals_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'ordinals.txt'
)

raw_numbers_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'numbers.txt'
)

raw_units_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'units.txt'
)

def get_wordlists(line_printer_cb):
    def read_wordlist(path, name, line_printer_cb):
        word_list = word_list_counter.WordListCounter()
        with open(path) as f:
            data = f.readlines()
            for row in data:
                row = row.lower().strip()
                word_list.check_and_add(row)
                line_printer_cb('{}: {}'.format(name, word_list.count))

        # new line
        line_printer_cb(None)

        return {name: word_list.keys}

    return {
        **{'main': []},
        **read_wordlist(raw_days_path, 'day', line_printer_cb),
        **read_wordlist(raw_months_path, 'month', line_printer_cb),
        **read_wordlist(raw_ordinals_path, 'ordinal', line_printer_cb),
        **read_wordlist(raw_numbers_path, 'number', line_printer_cb),
        **read_wordlist(raw_units_path, 'unit', line_printer_cb),
        **parse_assoc.read_assoc_data([raw_association_multipliers_1_path], line_printer_cb)
    }