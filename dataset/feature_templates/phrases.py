import os
import re

raw_phrases_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'Testzinnen.txt'
)

pii_re = re.compile('\{(.*?)\}')

def get_phrases():
    result = []
    with open(raw_phrases_path) as f:
        data = f.readlines()
        for row in data:
            row = row.strip()
            if len(row) <= 2:
                continue
            
            if ' //' in row:
                pii_res = pii_re.findall(row)
                phrase, severity = row.split(' //')
                result.append([phrase, pii_res, severity])
                # eventually .format(**{key:x})
    return result
            
phrases = get_phrases()