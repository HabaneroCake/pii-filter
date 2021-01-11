"""
brand-name wordlists (currently very limited)
"""

from . import supermarkets
from . import apothecaries
from . import pharmaceutical_companies

from .. import word_list_counter

NAME = 'brand_name'

all = [brand.lower() for brand in supermarkets.all + apothecaries.all + pharmaceutical_companies.all]

def get_wordlists(line_printer_cb):
    word_list = word_list_counter.WordListCounter(all)
    line_printer_cb('main: {}'.format(word_list.count))
    return {'main': word_list.keys}