import { IClassificationScore } from '../../interfaces/parsing/classification';
import { IToken } from '../../interfaces/parsing/tokens';
import { SimpleTextClassifier } from './text-classifier';

export abstract class SimpleNameClassifier extends SimpleTextClassifier
{
    constructor(
        dataset: object,
        classification_score_base: number,
        protected uppercase_classification_score_base: number,
        protected pos_classification_score_base: number,
        protected pos_possible_classification_score_base: number,
        severity_score_base: number,
    ) 
    { 
        super(
            dataset,
            classification_score_base,
            severity_score_base,
            true
        );
    }
    public classify_confidence(token: IToken): 
        [Array<IToken>, IClassificationScore]
    {
        let [tokens, score] = super.classify_confidence(token);
        if (tokens.length > 0)
        {
            let any_uppercase: boolean = false;
            for (let r_token of tokens)
            {
                let first_letter = r_token.symbol[0];
                let first_uppercase: boolean = (first_letter == first_letter.toUpperCase() &&
                                                !this.language_model.punctuation_map.has(first_letter));

                let pos_tagged_n: boolean = token.tag.tag_base.toLowerCase() == 'n' &&
                                            token.tag.tag_rest.indexOf('eigen') > -1;
                    
                if (pos_tagged_n)
                    score.score += this.pos_classification_score_base;
                else if (token.tag.tag_base.toLowerCase() == this.language_model.pos_tagger.none_str)
                    score.score += this.pos_possible_classification_score_base;

                if (first_uppercase)
                {
                    score.score += this.uppercase_classification_score_base;
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
                    (this.language_model.punctuation_map.has(left_token.previous.symbol) &&
                    this.language_model.punctuation_map.get(left_token.previous.symbol) <= 0.5)))
                    score.score += this.uppercase_classification_score_base;
            }
        }
        score.score = Math.min(score.score, 1.0);
        return [tokens, score];
    }
    public abstract name: string;
};