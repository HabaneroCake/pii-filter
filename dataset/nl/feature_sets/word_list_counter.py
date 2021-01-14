class WordListCounter(object):
    """Wordlist wrapper"""
    def __init__(self, init_wordlist=[]):
        if init_wordlist and isinstance(init_wordlist[0], str):
            self._word_counter = len(init_wordlist)
            self._all = dict.fromkeys(init_wordlist)
        elif not init_wordlist:
            self._word_counter = 0
            self._all = {}
        else:
            raise ValueError('Other types than str are currently unsupported')
    @property
    def keys(self):
        ret_list = list(self._all.keys())
        ret_list.sort()
        return ret_list
    @property
    def items(self):
        ret_list = list(self._all.items())
        ret_list.sort()
        return ret_list
    def check_and_add(self, word, value=None, min_len=1):
        """Adds word to wordlist if it conforms to logic"""
        word = word.lower().strip()
        if len(word) > min_len and word not in self._all:
            self._all.setdefault(word, value)
            self._word_counter += 1
    @property
    def count(self):
        return self._word_counter