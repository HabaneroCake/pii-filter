import { Language } from '../../interfaces/language';
import { Token } from '../../interfaces/parsing/tokens';
import { POSInfo } from '../../interfaces/parsing/tagging';

import {
    AssociativeScore,
    AssociationScore
} from '../../interfaces/parsing/classification';

import {
    CoreClassifier,
    CoreAssociativeScore,
    CoreAssociationScore
} from '../classification';

import { tokens_trie_lookup } from '../trie-lookup';
import { Trie } from '../../structures/trie';
import { POS } from '../pos';

/**
 * A basic abstract associative classifier, which classifies associative tokens based on a dataset.
 * The confidence classifier is unimplemented.
 * @private
 */
export abstract class CoreAssociativeClassifier extends CoreClassifier
{
    /**
     * A map storing the parts of speech mappings for this classifier.
     */
    protected assoc_pos_map:    Map<string, Array<[POSInfo, AssociativeScore]>> = 
                                                            new Map<string, Array<[POSInfo, AssociativeScore]>>();
    /**
     * A trie storing associative words for this classifier.
     */
    protected association_trie: Trie<AssociativeScore> =   new Trie();
    
    /**
     * Create a new CoreAssociativeClassifier
     * @param dataset the dataset which the keys will be looked up in
     * @param associative_words_name the key name of the associative mappings in the dataset
     * @param pos_associative_words_name the key name of the parts of speech mappings in the dataset
     * @param pii_associative_words_name the key name of the associative pii mappings in the dataset
     */
    constructor(
        protected dataset: object,
        protected associative_words_name: string = 'association_multipliers',
        protected pos_associative_words_name: string = 'pos_association_multipliers',
        protected pii_associative_words_name: string = 'pii_association_multipliers'
    )
    {
        super();

        // add association multipliers to trie
        if (this.associative_words_name in this.dataset && this.dataset[this.associative_words_name].length > 0)
        {
            for (const [word, [left_max, right_max, score, severity]] of this.dataset[this.associative_words_name] as
                    Array<[string, [number, number, number, number]]>)
                this.association_trie.insert(word, new CoreAssociativeScore(left_max, right_max, score, severity));
        }
    }
    /** @inheritdoc Classifier.init */
    public init(language_model: Language): void
    {
        super.init(language_model);

        if (this.pos_associative_words_name in this.dataset && this.dataset[this.pos_associative_words_name].length > 0)
        {
            for (const [pos, [left_max, right_max, score, severity]] 
                of this.dataset[this.pos_associative_words_name] as
                    Array<[string, [number, number, number, number]]>)
            {
                let tag: POSInfo = POS.from_brill_pos_tag(pos);
                
                let assoc_score: AssociativeScore = new CoreAssociativeScore(left_max, right_max, score, severity);
                if (!this.assoc_pos_map.has(tag.tag_base))
                    this.assoc_pos_map.set(tag.tag_base, new Array<[POSInfo, AssociativeScore]>());

                this.assoc_pos_map.get(tag.tag_base).push([tag, assoc_score])
            }
        }
        if (this.pii_associative_words_name in this.dataset && this.dataset[this.pii_associative_words_name].length > 0)
        {
            for (const [name, array_of_pii_scores]
                    of this.dataset[this.pii_associative_words_name] as
                        Array<[string, Array<[number, number, number, number]>]>)
            {
                for (let classifier of language_model.classifiers)
                {
                    if (classifier.name == name)
                    {
                        for (let [left_max, right_max, score, severity] of array_of_pii_scores)
                        {
                            classifier.associative_references.push([
                                this,
                                new CoreAssociativeScore(left_max, right_max, score, severity)
                            ]);
                        }
                        break;
                    }
                }
            }
        }
    }
    /** @inheritdoc Classifier.classify_associative */
    public classify_associative(token: Token): [Array<Token>, AssociationScore]
    {
        let best_pos_score: AssociativeScore = null;
        
        let lower_tag_base: string = token.tag.tag_base.toLowerCase();
        if (this.assoc_pos_map.has(lower_tag_base))
        {
            let tags = this.assoc_pos_map.get(lower_tag_base);

            for (let [tag, score] of tags)
            {
                let match: boolean = true;

                for (let t_rest of tag.tag_rest)
                {
                    if (t_rest.length == 0)
                        continue;

                    let found: boolean = false;
                    for (let tt_rest of token.tag.tag_rest)
                    {
                        if (tt_rest.toLowerCase() == t_rest)
                            found = true;
                            break;
                    }
                    if (!found)
                    {
                        match = false;
                        break;
                    }
                }

                if (match && (best_pos_score == null || score.score > best_pos_score.score))
                    best_pos_score = score;
            }
            // let tag = null;
            // [tag, best_pos_score] = tags[0];
        }

        let [matches, value] = tokens_trie_lookup<AssociativeScore>(token, this.association_trie);
        if (value != null)
        {
            if (best_pos_score != null && best_pos_score.score > value.score)
                return [matches, new CoreAssociationScore(
                    best_pos_score, best_pos_score.score, best_pos_score.severity, this
                )];
            else
                return [matches, new CoreAssociationScore(
                    value, value.score, value.severity, this
                )];
        }
        else if (best_pos_score != null)
        {
            return [[token], new CoreAssociationScore(
                best_pos_score, best_pos_score.score, best_pos_score.severity, this
            )];
        }
        else
            return [new Array<Token>(), new CoreAssociationScore(
                null, 0.0, 0.0, this
            )];
    }
}