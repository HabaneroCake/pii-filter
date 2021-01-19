import { ILanguage } from '../interfaces/language';
import { IAssociationScore, IClassifier } from '../interfaces/parsing/classification';
import { count_str_tokens } from './count-str-tokens';
import { IToken } from '../interfaces/parsing/tokens';
/**
 * sums the associative / severity scores for a classifier, taking into account punctuation distance
 * @param left_it left iterator token for the midpoint
 * @param right_it right iterator token for the midpoint
 * @param classifier classifier to match
 * @param language_model language_model to use
 * @param max_steps number of steps to stop after
 */
export function calc_assoc_severity_sum(
    left_it: IToken,
    right_it: IToken,
    classifier: IClassifier,
    language_model: ILanguage,
    max_steps: number
): [number, number]
{
    // TODO should this have a not recognizer?
    class DistanceIterator 
    {
        public associative_sum: number =    0.0;
        public severity_sum:    number =    0.0;
        public distance:        number =    0;
        public phrase_ends:     number =    0;
        public scalar:          number =    1.0;

        constructor(
            public it: IToken,
            public language_model: ILanguage,
            public iterate: (iterator: IToken) => IToken,
            public group_root_getter: (score: IAssociationScore) => IToken,
            public check_valid: (score: IAssociationScore, self: DistanceIterator) => boolean
            
        )
        {
            if (this.it != null)
            {
                // move iterator past current associative marker if it exists
                if (this.it.confidences_associative.has(classifier) && this.it.next)
                {
                    let score:          IAssociationScore =  this.it.confidences_associative.max(classifier);
                    let group_root:     IToken =            this.group_root_getter(score);
                    
                    let [l_it, r_it] = (this.it.index < group_root.index) ? 
                                    [this.it, group_root] : [group_root, this.it];

                    this.distance += count_str_tokens(
                        l_it,
                        r_it,
                        this.language_model.punctuation_map
                    );
                    this.it = this.iterate(this.group_root_getter(score));
                }
                else
                    this.it = this.iterate(this.it);
            }
        }

        public next(): boolean
        {
            if (this.it)
            {
                let is_punctuation: boolean = false;
                if (this.language_model.punctuation_map.has(this.it.symbol))
                {
                    is_punctuation = true;
                    
                    if (this.it.symbol == '.')
                        this.phrase_ends++;
                        
                    this.scalar *= this.language_model.punctuation_map.get(this.it.symbol);
                }
                else
                    this.distance++;

                // NOTE: some symbols split up text into more than 1 token
                // TODO: tokens are only counted as distance once a ' ' is encountered as well

                if (this.it.confidences_associative.has(classifier))
                {
                    if (is_punctuation)
                        this.distance++;
                        
                    let assoc_arr: Array<IAssociationScore> = this.it.confidences_associative.get(classifier);
                    let assoc: IAssociationScore;
                    for (assoc of assoc_arr)
                    {
                        if (this.check_valid(assoc, this))
                        {
                            this.associative_sum +=  assoc.score *       this.scalar;
                            this.severity_sum +=     assoc.severity *    this.scalar;
                        }
                    }
                    if (assoc != null)
                    {
                        this.distance += count_str_tokens(
                            assoc.group_root_start,
                            assoc.group_root_end,
                            this.language_model.punctuation_map
                        )
                        this.it = this.group_root_getter(assoc);
                    }
                }
                this.it = this.iterate(this.it);

                return true;
            }

            return false;
        }
    };

    let left_distance_iterator =    new DistanceIterator(
        left_it,
        language_model,
        (it: IToken): IToken => { return it.previous; },
        (score: IAssociationScore): IToken => { return score.group_root_start; },
        (score: IAssociationScore, self: DistanceIterator) => { 
            return score.valid_from_right(self.distance, self.phrase_ends);
        }
    );
    let right_distance_iterator =   new DistanceIterator(
        right_it,
        language_model,
        (it: IToken): IToken => { return it.next; },
        (score: IAssociationScore): IToken => { return score.group_root_end; },
        (score: IAssociationScore, self: DistanceIterator) => { 
            return score.valid_from_left(self.distance, self.phrase_ends);
        }
    );
    
    for (let step = 0; step < max_steps; ++step)
    {
        if (!left_distance_iterator.next() && !right_distance_iterator.next())
            break;
    }
    return [
        left_distance_iterator.associative_sum + right_distance_iterator.associative_sum,
        left_distance_iterator.severity_sum + right_distance_iterator.severity_sum
    ];
}