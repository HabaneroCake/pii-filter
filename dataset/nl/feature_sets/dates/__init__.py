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

raw_numbers_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'numbers.txt'
)

def get_wordlists(line_printer_cb):
    def read_word_with_value(path, name, line_printer_cb):
        word_list = word_list_counter.WordListCounter()
        with open(path) as f:
            data = f.readlines()
            for row in data:
                word, value = row.lower().strip().split(' ')
                word_list.check_and_add(word, value)
                line_printer_cb('{}: {}'.format(name, word_list.count))

        # new line
        line_printer_cb(None)

        return {name: word_list.items}

    return {
        **{'main': []},
        **read_word_with_value(raw_numbers_path, 'number', line_printer_cb),
        **parse_assoc.read_assoc_data([raw_association_multipliers_1_path], line_printer_cb)
    }