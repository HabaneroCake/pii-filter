"""
gmib_data wordlist
"""

import csv
import sys
import re
import os

from .. import word_list_counter
from .. import brand_names
from . import filters

strip_all = filters.strip_words + brand_names.all
# alphanumerical, spaces and fwd slash
alpha_numerical_regex =     re.compile(r'[^a-zA-Z0-9\ \/]')
# find first number
numerical_regex =           re.compile(r'\d')

raw_gmib_data_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'gmib_scraper',
    'gmib.csv'
)

all = []
with open(raw_gmib_data_path) as csvfile:
    word_list = word_list_counter.WordListCounter()
    data = list(csv.DictReader(csvfile, delimiter=';'))
    for row in data:
        def add_new_row(new_name):
                new_row = row.copy()
                new_row['Productnaam'] = new_name
                data.append(new_row)
            
        name = alpha_numerical_regex.sub(' ', row['Productnaam']).lower()

        # filter out any brand names
        for strip_name in strip_all:
            strip_name = alpha_numerical_regex.sub(' ', strip_name).lower()
            if strip_name in name:
                name = name.replace(strip_name, '')

        # skip certain rows
        def should_skip_row():
            for skip_name in filters.skip_names:
                skip_name = skip_name.lower() + ' '
                if name.startswith(skip_name):
                    return True
            return False
        if should_skip_row():
            continue

        # get string before dose or other numerical identifier
        n_index = numerical_regex.search(name)
        if n_index is not None:
            name = name[:n_index.start()]

        # create full names from /ed or +ed names
        if '/' in name or '+' in name:
            tokens_by_slash_or_plus = re.split(r'/|\+', name)
            before_space = ''
            if ' ' in tokens_by_slash_or_plus[0]:
                before_space = re.split(r'\ ', tokens_by_slash_or_plus[0])[0] + ' '
            for token in tokens_by_slash_or_plus[1:]:
                add_new_row('{}{}'.format(before_space, token))
            name = tokens_by_slash_or_plus[0]

        full_name = ' '.join([token for token in name.split(' ') if len(token) > 2])

        if len(full_name) > 2 and full_name not in filters.ignore_names:
            word_list.check_and_add(full_name)
            
    all = word_list.all