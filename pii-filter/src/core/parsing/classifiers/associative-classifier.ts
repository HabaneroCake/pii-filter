import { ILanguage } from '../../interfaces/language';
import { IToken } from '../../interfaces/parsing/tokens';
import { ITag } from '../../interfaces/parsing/tagging';

import {
    IAssociativeScore,
    IAssociationScore
} from '../../interfaces/parsing/classification';

import {
    Classifier,
    AssociativeScore,
    AssociationScore
} from '../classification';

import { tokens_trie_lookup } from '../trie-lookup';
import { Trie } from '../../structures/trie';
import { POS } from '../pos';

export abstract class SimpleAssociativeClassifier extends Classifier
{
    protected assoc_pos_map:    Map<string, Array<[ITag, IAssociativeScore]>> = 
                                                            new Map<string, Array<[ITag, IAssociativeScore]>>();
    protected association_trie: Trie<IAssociativeScore> =   new Trie();
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
                this.association_trie.insert(word, new AssociativeScore(left_max, right_max, score, severity));
        }
    }
    public bind_language_model(language_model: ILanguage): void
    {
        if (this.pos_associative_words_name in this.dataset && this.dataset[this.pos_associative_words_name].length > 0)
        {
            for (const [pos, [left_max, right_max, score, severity]] 
                of this.dataset[this.pos_associative_words_name] as
                    Array<[string, [number, number, number, number]]>)
            {
                let tag: ITag = POS.from_brill_pos_tag(pos);
                
                let assoc_score: IAssociativeScore = new AssociativeScore(left_max, right_max, score, severity);
                if (!this.assoc_pos_map.has(tag.tag_base))
                    this.assoc_pos_map.set(tag.tag_base, new Array<[ITag, IAssociativeScore]>());

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
                                new AssociativeScore(left_max, right_max, score, severity)
                            ]);
                        }
                        break;
                    }
                }
            }
        }
    }

    public classify_associative(token: IToken): [Array<IToken>, IAssociationScore]
    {
        let best_pos_score: IAssociativeScore = null;
        
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

        let [matches, value] = tokens_trie_lookup<IAssociativeScore>(token, this.association_trie);
        if (value != null)
        {
            if (best_pos_score != null && best_pos_score.score > value.score)
                return [matches, new AssociationScore(
                    best_pos_score, best_pos_score.score, best_pos_score.severity, this
                )];
            else
                return [matches, new AssociationScore(
                    value, value.score, value.severity, this
                )];
        }
        else if (best_pos_score != null)
        {
            return [[token], new AssociationScore(
                best_pos_score, best_pos_score.score, best_pos_score.severity, this
            )];
        }
        else
            return [new Array<IToken>(), new AssociationScore(
                null, 0.0, 0.0, this
            )];
    }
}