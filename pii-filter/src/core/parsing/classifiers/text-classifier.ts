import { CoreAssociativeClassifier } from './associative-classifier';
import { ClassificationScore } from '../../interfaces/parsing/classification';
import { Token } from '../../interfaces/parsing/tokens';
import { Trie } from '../../structures/trie';
import { CoreClassificationScore } from '../classification';
import { tokens_trie_lookup } from '../trie-lookup';
import { calc_assoc_severity_sum } from '../calc-assoc-severity';

/**
 * A basic text classifier, which classifies tokens (and associative tokens) based on a dataset.
 * @private
 */
export abstract class CoreTextClassifier extends CoreAssociativeClassifier
{
    /**
     * The trie which stores the dataset.
     */
    protected main_trie:        Trie<boolean> =             new Trie();

    /**
     * Creates a new CoreTextClassifier.
     * @param dataset the dataset
     * @param classification_score_base the base classification score for a match
     * @param severity_score_base the base severity score for a match
     * @param use_stem whether to use the stem
     * @param main_name the key name of the word list in the dataset
     */
    constructor(
        protected dataset: object,
        protected classification_score_base: number,
        protected severity_score_base: number,
        protected use_stem: boolean,
        protected main_name: string = 'main'
    )
    {
        super(dataset);
        // add main word list to trie
        if (main_name in this.dataset && this.dataset[main_name].length > 0)
            this.main_trie.add_list(this.dataset[main_name], true)
    }
    /** @inheritdoc Classifier.classify_confidence */
    public classify_confidence(token: Token): [Array<Token>, ClassificationScore]
    {
        let [matches, value] = tokens_trie_lookup<boolean>(token, this.main_trie, this.use_stem);

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

            return [matches, new CoreClassificationScore(
                Math.min(this.classification_score_base + assoc_sum, 1.0), 
                Math.min(this.severity_score_base + severity_sum, 1.0), 
                this
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