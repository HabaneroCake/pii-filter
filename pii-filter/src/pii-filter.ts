
import dataset from './dataset.json';
import { Trie } from './trie';

export class PII_Filter
{
    private static readonly tries: Map<string, Trie> = PII_Filter.init_tries();

    private static init_tries(): Map<string, Trie>
    {
        let tries = new Map<string, Trie>();
        for (const key in dataset['wordlists'])
            tries.set(key, Trie.make(dataset['wordlists'][key]['main']))

        let test_word = 'paracetamol';
        for (const [key, trie] of tries)
        {
            if (trie.matches(test_word))
                console.log(`${key} matches ${test_word}`)
        }

        // med_names > dict > (family_names > first_names)
        return tries;
    }

};

// TODO:
// add test text
// convert test texts
// generate tests
// build tests
// attempt to complete tests
// what coverage should succeed? or is integration testing a separate from benchmark?