import { Language } from '../interfaces/language';
import { AssociationScore, Classifier } from '../interfaces/parsing/classification';
import { count_str_tokens } from './count-str-tokens';
import { Token } from '../interfaces/parsing/tokens';
/**
 * sums the associative / severity scores for a classifier, taking into account punctuation distance
 * @private
 * @param left_it left iterator token for the midpoint
 * @param right_it right iterator token for the midpoint
 * @param classifier classifier to match
 * @param language_model language_model to use
 * @param max_steps number of steps to stop after
 */
export function calc_assoc_severity_sum(
    left_it: Token,
    right_it: Token,
    classifier: Classifier,
    language_model: Language,
    max_steps: number
): [number, number]
{
    /** 
     * Associative token distance iterator.
     * @private 
     */
    class DistanceIterator 
    {
        /**
         * the sum of associative scores encountered 
         */
        public associative_sum: number =    0.0;
        /**
         * the sum of severity scores encountered
         */
        public severity_sum:    number =    0.0;
        /**
         * the distance traversed
         */
        public distance:        number =    0;
        /**
         * the number of phrase endings encountered
         */
        public phrase_ends:     number =    0;
        /**
         * the scalar which is applied before adding scores
         */
        public scalar:          number =    1.0;

        /**
         * Creates a new DistanceIterator
         * @param it the current token
         * @param language_model the language model
         * @param iterate callback that should move the iterator in a direction
         * @param group_root_getter callback that should move the iterator to the edge of a group in it's direction
         * @param check_valid callback that should return wether the associative token is valid
         */
        constructor(
            public it: Token,
            public language_model: Language,
            public iterate: (iterator: Token) => Token,
            public group_root_getter: (score: AssociationScore) => Token,
            public check_valid: (score: AssociationScore, self: DistanceIterator) => boolean
            
        )
        {
            if (this.it != null)
            {
                // move iterator past current associative marker if it exists
                if (this.it.confidences_associative.has(classifier) && this.it.next)
                {
                    let score:          AssociationScore =  this.it.confidences_associative.max(classifier);
                    let group_root:     Token =            this.group_root_getter(score);
                    
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
        /**
         * get the 'next' token
         */
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
                        
                    let assoc_arr: Array<AssociationScore> = this.it.confidences_associative.get(classifier);
                    let assoc: AssociationScore;
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
        (it: Token): Token => { return it.previous; },
        (score: AssociationScore): Token => { return score.group_root_start; },
        (score: AssociationScore, self: DistanceIterator) => { 
            return score.valid_from_right(self.distance, self.phrase_ends);
        }
    );
    let right_distance_iterator =   new DistanceIterator(
        right_it,
        language_model,
        (it: Token): Token => { return it.next; },
        (score: AssociationScore): Token => { return score.group_root_end; },
        (score: AssociationScore, self: DistanceIterator) => { 
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