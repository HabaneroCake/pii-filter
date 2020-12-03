"""
dictionary wordlists
"""


import os

from .. import word_list_counter

NAME = 'dictionary'

raw_dict_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'NL-dictionary-file',
    'dutch.dic'
)

def get_wordlists(line_printer_cb):
    word_list = word_list_counter.WordListCounter()
    with open(raw_dict_path) as dict_file:
        dict_words = dict_file.readlines()
        for word in dict_words:
            word_list.check_and_add(word)
            line_printer_cb('main: {}'.format(word_list.count))

    return {'main': word_list.all}