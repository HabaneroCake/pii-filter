import { IClassificationScore } from '../../interfaces/parsing/classification';
import { IToken } from '../../interfaces/parsing/tokens';
import { SimpleTextClassifier } from './text-classifier';
import { SimpleAssociativeClassifier } from './associative-classifier';
import { ClassificationScore } from '../classification';
import { ILanguage } from '../../interfaces/language';
import { Trie } from '../../structures/trie';
import { tokens_trie_lookup } from '../trie-lookup';
import { calc_assoc_severity_sum } from '../calc-assoc-severity';

function add_name_score(
    first_token: IToken,
    tokens: Array<IToken>,
    score: IClassificationScore,
    language_model: ILanguage,
    uppercase_classification_score_base: number,
    pos_classification_score_base: number,
    pos_possible_classification_score_base: number
): [Array<IToken>, IClassificationScore]
{
    if (tokens.length > 0)
    {
        let any_uppercase: boolean = false;
        for (let r_token of tokens)
        {
            let first_letter = r_token.symbol[0];
            let first_uppercase: boolean = (first_letter == first_letter.toUpperCase() &&
                                            !language_model.punctuation_map.has(first_letter));

            let pos_tagged_n: boolean = first_token.tag.tag_base.toLowerCase() == 'n' &&
                                        first_token.tag.tag_rest.indexOf('eigen') > -1;
                
            if (pos_tagged_n)
                score.score += pos_classification_score_base;
            else if (first_token.tag.tag_base.toLowerCase() == language_model.pos_tagger.none_str)
                score.score += pos_possible_classification_score_base;

            if (first_uppercase)
            {
                score.score += uppercase_classification_score_base;
                any_uppercase = true;
            }
        }

        if (any_uppercase)
        {
            // adjust score to punctuation proximity
            let left_token = tokens[0];
            while (left_token.previous != null && left_token.previous.symbol == ' ')
                left_token = left_token.previous;

            if (!(left_token.previous == null ||
                (language_model.punctuation_map.has(left_token.previous.symbol) &&
                language_model.punctuation_map.get(left_token.previous.symbol) <= 0.5)))
                score.score += uppercase_classification_score_base;
        }
    }
    return [tokens, score];
}

export abstract class SimpleNameClassifier extends SimpleTextClassifier
{
    constructor(
        dataset: object,
        classification_score_base: number,
        protected uppercase_classification_score_base: number,
        protected pos_classification_score_base: number,
        protected pos_possible_classification_score_base: number,
        severity_score_base: number,
        main_name: string = 'main'
    ) 
    { 
        super(
            dataset,
            classification_score_base,
            severity_score_base,
            true,
            main_name
        );
    }
    public classify_confidence(token: IToken): 
        [Array<IToken>, IClassificationScore]
    {
        let [tokens, score] = super.classify_confidence(token);

        [tokens, score] = add_name_score(
            token,
            tokens,
            score,
            this.language_model,
            this.uppercase_classification_score_base,
            this.pos_classification_score_base,
            this.pos_possible_classification_score_base
        );

        score.score = Math.min(score.score, 1.0);
        return [tokens, score];
    }
    public abstract name: string;
};

// sum
export abstract class SimpleMultiNameClassifier extends SimpleAssociativeClassifier
{
    protected tries_and_settings: Array<SimpleMultiNameClassifier.TrieWithSettings> =
                                                        new Array<SimpleMultiNameClassifier.TrieWithSettings>()
    constructor(
        dataset: object,
        name_settings: Array<SimpleMultiNameClassifier.Settings>,
        protected sum_results: boolean = false
    )
    {
        super(dataset);
        for (let setting of name_settings)
        {
            this.tries_and_settings.push(
                new SimpleMultiNameClassifier.TrieWithSettings(
                    dataset,
                    setting
                )
            );
        }
    }
    public classify_confidence(token: IToken): 
        [Array<IToken>, IClassificationScore]
    {
        let [matches, value]: [Array<IToken>, number] = [new Array<IToken>(), 0.0];
        let top_match: SimpleMultiNameClassifier.TrieWithSettings = null;
        for (let trie_with_setting of this.tries_and_settings)
        {
            let [t_matches, t_value] = trie_with_setting.classify_confidence(
                token,
                false
            );
            if (t_value != null && (value == null || t_value > value))
                top_match = trie_with_setting;
            
            if (!this.sum_results && value > t_value)
            {
                matches =   t_matches;
                value =     t_value;
            }
            else if (this.sum_results)
            {
                if (t_matches.length > matches.length)
                    matches =   t_matches;
                
                value +=    t_value;
            }
        }
        if (matches.length > 0)
        {
            // check for associative multipliers
            let left_it:    IToken = matches[0];
            let right_it:   IToken = matches[matches.length-1];

            let [assoc_sum, severity_sum] = calc_assoc_severity_sum(
                left_it,
                right_it,
                this,
                this.language_model,
                this.language_model.max_assoc_distance
            );

            let score = new ClassificationScore(
                Math.min(value + assoc_sum, 1.0), 
                Math.min(top_match.settings.severity_score_base + severity_sum, 1.0), 
                this
            );

            [matches, score] = add_name_score(
                token,
                matches,
                score,
                this.language_model,
                top_match.settings.uppercase_classification_score_base,
                top_match.settings.pos_classification_score_base,
                top_match.settings.pos_possible_classification_score_base
            );

            return [matches, score];
        }
        else
            return [matches, new ClassificationScore(
                0.0, 0.0, this
            )];
    }
    public abstract name: string;
};

export namespace SimpleMultiNameClassifier
{
    export class Settings
    {
        constructor(
            public classification_score_base:              number,
            public uppercase_classification_score_base:    number,
            public pos_classification_score_base:          number,
            public pos_possible_classification_score_base: number,
            public severity_score_base:                    number,
            public dataset_name:                           string
        ) {}
    };
    export class TrieWithSettings
    {
        protected trie: Trie<number> = new Trie<number>();
        constructor(
            dataset: object,
            public settings: Settings
        ) 
        {
            if (settings.dataset_name in dataset && dataset[settings.dataset_name].length > 0)
                this.trie.add_list(dataset[settings.dataset_name], settings.classification_score_base)
        }
        public classify_confidence(token: IToken, use_stem: boolean): [Array<IToken>, number]
        {
            return tokens_trie_lookup<number>(token, this.trie, use_stem);
        }
    };
};