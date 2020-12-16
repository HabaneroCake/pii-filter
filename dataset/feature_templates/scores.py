import os

raw_scores_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'PII_waarden.txt'
)

def get_scores():
    result = []
    with open(raw_scores_path) as f:
        data = f.readlines()
        for row in data:
            row = row.strip()
            pii_var, value = row.split(' //')
            result.append([pii_var[1:-1], value])
    return result
            
scores = get_scores()