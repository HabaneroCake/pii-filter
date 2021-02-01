import {
    AssociationScore,
    ClassificationScore
} from '../../interfaces/parsing/classification';

import { Token } from '../../interfaces/parsing/tokens';

import {
    CoreClassifier,
    CoreAssociationScore,
    CoreClassificationScore
} from '../classification';

import { Trie } from '../../structures/trie';
import { tokens_trie_lookup } from '../trie-lookup';

/**
 * A simple dictionary classifier.
 * @private
 */
export abstract class CoreDictionary extends CoreClassifier
{
    /** The trie which stores the dictionary.  */
    protected main_trie:        Trie<number> =      new Trie();

    /**
     * Create a new CoreDictionary.
     * @param dataset the dataset which contains the words
     * @param general_word_score the classification score for 'plain' words
     * @param popular_word_score the classification score for 'popular' words
     * @param main_words_name the key name of the 'plain' words
     * @param popular_words_name the key name of the 'popular' words
     */
    constructor(
        dataset: object,
        general_word_score: number,
        popular_word_score: number,
        main_words_name: string = 'main',
        popular_words_name: string = 'pop',
    )
    {
        super();
        // add main word list to trie
        if (main_words_name in dataset && dataset[main_words_name].length > 0)
            this.main_trie.add_list(dataset[main_words_name], general_word_score)
        // add popular word list to trie (overwrites previous score if it exists)
        if (popular_words_name in dataset && dataset[popular_words_name].length > 0)
            this.main_trie.add_list(dataset[popular_words_name], popular_word_score)
    }
    /** @inheritdoc Classifier.classify_associative */
    public classify_associative(token: Token): [Array<Token>, AssociationScore]
    {
        return [new Array<Token>(), new CoreAssociationScore(
            null, 0.0, 0.0, this
        )];
    }
    /** @inheritdoc Classifier.classify_confidence */
    public classify_confidence(token: Token): [Array<Token>, ClassificationScore]
    {
        let [matches, value] = tokens_trie_lookup<number>(token, this.main_trie);

        if (value)
        {
            return [matches, new CoreClassificationScore(
                value, 0.0, this
            )];
        }
        else
            return [new Array<Token>(), new CoreClassificationScore(
                0.0, 0.0, this
            )];
    }
    /** @inheritdoc Classifier.name */
    public abstract name: string;
};