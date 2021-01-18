"""
medicine_names wordlists
"""

from .gip_data import *
from .gmib_data import *

from .. import parse_assoc
from .. import word_list_counter

raw_association_multipliers_1_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'association_multipliers',
    'medicine_names.txt'
)

raw_basic_list_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'basic_list.txt'
)

NAME = 'medicine_name'
def get_wordlists(line_printer_cb):
    word_list = word_list_counter.WordListCounter(gip_data.all)
    for elem in gmib_data.all:
        word_list.check_and_add(elem)
        line_printer_cb('main: {}'.format(word_list.count))

    with open(raw_basic_list_path) as f:
        data = f.readlines()
        for row in data:
            row = row.lower().strip()
            word_list.check_and_add(row)
            line_printer_cb('main: {}'.format(word_list.count))

    line_printer_cb(None)

    return {
        'main': word_list.keys,
        **parse_assoc.read_assoc_data([raw_association_multipliers_1_path], line_printer_cb)
    }