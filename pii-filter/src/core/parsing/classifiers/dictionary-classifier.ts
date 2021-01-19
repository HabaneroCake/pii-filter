import { Classifier, AssociationScore, ClassificationScore } from '../classification';
import { Trie } from '../../structures/trie';
import { Token } from '../token';
import { ILanguage } from '../../interfaces/language';
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
    public classify_associative(token: Token): [Array<Token>, AssociationScore]
    {
        return [new Array<Token>(), new AssociationScore(
            null, 0.0, 0.0, this
        )];
    }
    public bind_language_model(language_model: ILanguage): void {}
    public classify_confidence(token: Token): [Array<Token>, ClassificationScore]
    {
        let [matches, value] = tokens_trie_lookup<number>(token, this.main_trie);

        if (value)
        {
            return [matches, new ClassificationScore(
                value, 0.0, this
            )];
        }
        else
            return [new Array<Token>(), new ClassificationScore(
                0.0, 0.0, this
            )];
    }
    public abstract name: string;
};