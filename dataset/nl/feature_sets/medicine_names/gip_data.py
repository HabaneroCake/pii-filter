"""
gip_data wordlist
"""

import csv
import sys
import re
import os

from .. import word_list_counter
from . import filters

# alphanumerical and spaces
alpha_numerical_regex = re.compile(r'[^a-zA-Z0-9\ ]')

raw_gmib_data_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'gipdatabank',
    'gip_farmacie_zvw_meerjaren_2015_2019_20102020.csv'
)

all = []

with open(raw_gmib_data_path) as csvfile:
    word_list = word_list_counter.WordListCounter()

    data = list(csv.DictReader(csvfile, delimiter='#'))
    for row in data:
        if '__' in row['atclaatst']:
            continue
        full_name = alpha_numerical_regex.sub(' ', row['atclaatst_naam_tekst']).lower().split(' ')[0]
        if len(full_name) > 2 and full_name not in filters.ignore_names:
            word_list.check_and_add(full_name)

    all = word_list.keys