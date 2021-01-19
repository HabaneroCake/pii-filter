import { SimpleAssociativeClassifier } from './associative-classifier';
import { Trie } from '../../structures/trie';
import { Token } from '../token';
import { ClassificationScore } from '../classification';
import { tokens_trie_lookup } from '../trie-lookup';
import { calc_assoc_severity_sum } from '../calc-assoc-severity';

export abstract class SimpleTextClassifier extends SimpleAssociativeClassifier
{
    protected main_trie:        Trie<boolean> =             new Trie();
    // assoc pii 3
    // then classify again

    constructor(
        protected dataset: object,
        protected classification_score_base: number,
        protected severity_score_base: number,
    )
    {
        super(dataset);
        // add main word list to trie
        if ('main' in this.dataset && this.dataset['main'].length > 0)
            this.main_trie.add_list(this.dataset['main'], true)
    }
    public classify_confidence(token: Token): [Array<Token>, ClassificationScore]
    {
        let [matches, value] = tokens_trie_lookup<boolean>(token, this.main_trie);

        if (value)
        {
            // check for associative multipliers
            let left_it:    Token = matches[0];
            let right_it:   Token = matches[matches.length-1];

            let [assoc_sum, severity_sum] = calc_assoc_severity_sum(
                left_it,
                right_it,
                this,
                this.language_model,
                this.language_model.max_assoc_distance
            );

            return [matches, new ClassificationScore(
                Math.min(this.classification_score_base + assoc_sum, 1.0), 
                Math.min(this.severity_score_base + severity_sum, 1.0), 
                this
            )];
        }
        else
            return [new Array<Token>(), new ClassificationScore(
                0.0, 0.0, this
            )];
    }
    public abstract name: string;
};