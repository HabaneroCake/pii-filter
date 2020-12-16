"""
medicine_names wordlists
"""

from .gip_data import *
from .gmib_data import *
from .. import word_list_counter

NAME = 'medicine_name'
def get_wordlists(line_printer_cb):
    word_list = word_list_counter.WordListCounter(gip_data.all)
    for elem in gmib_data.all:
        word_list.check_and_add(elem)
        line_printer_cb('main: {}'.format(word_list.count))

    return {'main': word_list.keys}