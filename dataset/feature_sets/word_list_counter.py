class WordListCounter(object):
    """Wordlist wrapper"""
    def __init__(self, init_wordlist=[]):
        self._word_counter = len(init_wordlist)
        self._all = dict.fromkeys(init_wordlist)
    @property
    def all(self):
        ret_list = list(self._all.keys())
        ret_list.sort()
        return ret_list
    def check_and_add(self, word):
        """Adds word to wordlist if it conforms to logic"""
        word = word.lower().strip()
        if len(word) > 1 and word not in self._all:
            self._all.setdefault(word, None)
            self._word_counter += 1
    @property
    def count(self):
        return self._word_counter