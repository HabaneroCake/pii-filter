from . import word_list_counter

# parsing of default association file formats
def read_assoc_data(paths, line_printer_cb=None):
    association_multipliers =       word_list_counter.WordListCounter()
    pii_association_multipliers =   word_list_counter.WordListCounter()
    pos_association_multipliers =   word_list_counter.WordListCounter()
    def add_and_print(row):
        tokens = row.strip().split(' //')
        word = tokens[0]
        values = [float(token) for token in tokens[1:]]
        assert(len(values) == 4)
        # check what row type is
        if word[0] == '{': # PII
            pii_association_multipliers.check_and_add(word[1:-1], values)
        elif word[0] == '[': # POS
            pos_association_multipliers.check_and_add(word[1:-1], values)
        else:
            association_multipliers.check_and_add(word, values)
            
        if line_printer_cb:
            line_printer_cb('assoc: {}, pos_assoc: {}, pii_assoc: {}'.format(association_multipliers.count, 
                pos_association_multipliers.count, pii_association_multipliers.count))

    for path in paths:
        with open(path) as f:
            data = f.readlines()
            for row in data:
                add_and_print(row)
    return {
        'association_multipliers':      association_multipliers.items,
        'pos_association_multipliers':  pos_association_multipliers.items,
        'pii_association_multipliers':  pii_association_multipliers.items
    }