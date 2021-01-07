"""
pet_name wordlists
"""

import os

from .. import word_list_counter
from .. import parse_assoc
from .. import dictionaries

NAME = 'pet_name'

pet_name_paths = []
for i in range(1, 8):
    pet_name_paths.append(
        os.path.join(
            os.path.dirname(os.path.realpath(__file__)),
            'raw',
            'pet_names_{}_nl.txt'.format(i)
        )
    )

raw_association_multipliers_1_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'association_multipliers',
    'pet_name.txt'
)

def get_wordlists(line_printer_cb):
    word_list = word_list_counter.WordListCounter()
    for path in pet_name_paths:
        with open(path) as f:
            data = f.readlines()
            for row in data:
                row = row.lower().strip()
                if row not in dictionaries.popular_words.top_40:
                    word_list.check_and_add(row)
                    line_printer_cb('main: {}'.format(word_list.count))

    # new line
    line_printer_cb(None)

    return {
        **{'main': word_list.keys},
        **parse_assoc.read_assoc_data([raw_association_multipliers_1_path], line_printer_cb)
    }