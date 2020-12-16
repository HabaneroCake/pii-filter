"""
mobile_number wordlists
"""

import os

from .. import parse_assoc

NAME = 'mobile_number'

raw_association_multipliers_1_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'association_multipliers',
    'mobile_number.txt'
)

def get_wordlists(line_printer_cb):
    return {**{'main': []}, **parse_assoc.read_assoc_data([raw_association_multipliers_1_path], line_printer_cb)}