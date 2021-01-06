from . import word_list_counter

# parsing of default association file formats
def read_assoc_data(paths, line_printer_cb=None):
    association_multipliers =       word_list_counter.WordListCounter()
    pii_association_multipliers =   word_list_counter.WordListCounter()
    def add_and_print(row):
        word, score = row.strip().split(' //')
        score = float(score)
        # check if this row is pii var
        if word[0] == '{':
            pii_association_multipliers.check_and_add(word[1:-1], score)
        else:
            association_multipliers.check_and_add(word, score)
            
        if line_printer_cb:
            line_printer_cb('assoc: {}, pii_assoc: {}'.format(association_multipliers.count, 
                                                                pii_association_multipliers.count))

    for path in paths:
        with open(path) as f:
            data = f.readlines()
            for row in data:
                add_and_print(row)
    return {
        'association_multipliers':      association_multipliers.items,
        'pii_association_multipliers':  pii_association_multipliers.items
    }