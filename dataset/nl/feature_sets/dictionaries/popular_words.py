import os

raw_pop_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'raw',
    'top1000.txt'
)

all =       {}
top_40 =    {}

with open(raw_pop_path) as dict_file:
    dict_words = dict_file.readlines()
    n_rows = len(dict_words)
    for index, word in enumerate(dict_words):
        s_words = word.lower().strip().split(' ')
        for s_word in s_words:
            if index < 40:
                top_40[s_word] = None

            all[s_word] = None