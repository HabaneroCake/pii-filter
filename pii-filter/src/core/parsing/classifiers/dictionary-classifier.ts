import { ILanguage } from '../../interfaces/language';

import {
    IAssociationScore,
    IClassificationScore
} from '../../interfaces/parsing/classification';

import { IToken } from '../../interfaces/parsing/tokens';

import {
    Classifier,
    AssociationScore,
    ClassificationScore
} from '../classification';

import { Trie } from '../../structures/trie';
import { tokens_trie_lookup } from '../trie-lookup';

export abstract class SimpleDictionary extends Classifier
{
    protected main_trie:        Trie<number> =      new Trie();

    constructor(
        protected dataset: object,
        general_word_score: number,
        popular_word_score: number
    )
    {
        super();
        // add main word list to trie
        if ('main' in this.dataset && this.dataset['main'].length > 0)
            this.main_trie.add_list(this.dataset['main'], general_word_score)
        // add popular word list to trie (overwrites previous score if it exists)
        if ('pop' in this.dataset && this.dataset['pop'].length > 0)
            this.main_trie.add_list(this.dataset['pop'], popular_word_score)
    }
    public classify_associative(token: IToken): [Array<IToken>, IAssociationScore]
    {
        return [new Array<IToken>(), new AssociationScore(
            null, 0.0, 0.0, this
        )];
    }
    public bind_language_model(language_model: ILanguage): void {}
    public classify_confidence(token: IToken): [Array<IToken>, IClassificationScore]
    {
        let [matches, value] = tokens_trie_lookup<number>(token, this.main_trie);

        if (value)
        {
            return [matches, new ClassificationScore(
                value, 0.0, this
            )];
        }
        else
            return [new Array<IToken>(), new ClassificationScore(
                0.0, 0.0, this
            )];
    }
    public abstract name: string;
};