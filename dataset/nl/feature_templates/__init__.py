from . import phrases
from . import values

def get_severity_mapping():
    res = []
    for phrase in phrases.phrases:
        if len(phrase['pii']) > 0:
            res.append({'pii': phrase['pii'], 'severity': phrase['severity']})
    return res

severity_mapping = get_severity_mapping()

def get_benchmark_data():
    # init counters
    value_counters = {}
    for key in values.values:
        value_counters[key] = {'counter':0, 'max':len(values.values[key])}

    res = []
    for phrase in phrases.phrases:
        contained_pii = phrase['pii']
        severity = phrase['severity']

        new_contained_pii = []

        new_phrase = ""
        for segment in phrase['phrase']:
            # not using format because of duplicates
            if segment in contained_pii and segment in values.values:
                word = values.values[segment][value_counters[segment]['counter']]
                value_counters[segment]['counter'] = ((value_counters[segment]['counter'] + 1) % 
                                                       value_counters[segment]['max'])
                new_contained_pii.append([segment, word])
                new_phrase += word
            else:
                new_phrase += segment

        res.append({
            'phrase': new_phrase,
            'pii': new_contained_pii,
            'severity': severity
        })
    return res

benchmark_data = get_benchmark_data()