import * as Parsing from '../../../core/parsing';
import ds_email_address from '../dataset/ds_email_address_0.json';

/**
 * Validate an email-address.
 * @private
 * @param str 
 */
function validate_email(str: string)
{
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(str);
}

/**
 * A simple Dutch e-mail address classifier.
 * @private
 */
export class EmailAddress extends Parsing.CoreAssociativeClassifier
{
    /**
     * Creates a new Dutch e-mail address classifier.
     */
    constructor() { super(ds_email_address); }
    
    /** @inheritdoc */
    public classify_confidence(token: Parsing.CoreToken): 
        [Array<Parsing.CoreToken>, Parsing.CoreClassificationScore]
    {
        const is_break_symbol = (token: Parsing.CoreToken) =>
        {
            return this.language_model.punctuation_map.has(token.symbol);
        };

        let final_matches: Array<Parsing.CoreToken> = new Array<Parsing.CoreToken>();
        let full_str: string = '';
        let at_index = token.symbol.indexOf('@');
        if (at_index > -1)
        {
            let left_it = token;
            while (left_it.previous != null && left_it.previous.symbol != ' ')
            {
                left_it = left_it.previous;
                full_str = left_it.symbol + full_str;
            }
            
            let t_it: Parsing.CoreToken = left_it;
            while (t_it.index < token.index)
            {
                final_matches.push(t_it);
                t_it = t_it.next;
            }

            full_str += token.symbol;
            final_matches.push(token);
            
            let right_it = token;
            while (right_it.next != null)
            {
                right_it = right_it.next;

                if (right_it.symbol == ' ' ||
                    (is_break_symbol(right_it) && (right_it.next == null ||
                                                    is_break_symbol(right_it.next) ||
                                                    right_it.next.symbol == ' ')))
                    break;

                full_str = full_str + right_it.symbol;
                final_matches.push(right_it);
            }

            let valid_email:    boolean = validate_email(full_str);

            let assoc_sum:      number = 0.0;
            let score:          number = 0.0;
            let severity_sum:   number = 0.0;
            
            let at_split:       Array<string> = full_str.split('@');
            let before_at:      string = at_split.length > 0 ? at_split[0] : '';
            let after_at:       string = at_split.length > 1 ? at_split[1] : '';
            let sub_domains:    Array<string> = after_at.split('.');

            let name_length:            number = before_at.length;
            let domain_name_length:     number = 0;
            let final_extension_length: number = 0;
            if (sub_domains.length > 0)
            {
                final_extension_length = sub_domains[sub_domains.length-1].length;
                for (let i = 0; i < sub_domains.length-1; ++i)
                    domain_name_length += sub_domains[i].length;
            }

            if (full_str.replace(/[^/@]/g, "").length > 1 ||
                name_length == 0 ||
                final_matches.length == 0 ||
                (before_at.length + after_at.length) == 0)
            {
                return [[], new Parsing.CoreClassificationScore(
                    0.0, 0.0, this
                )];
            }

            [score, severity_sum] = (valid_email) ? 
                [score+0.30, severity_sum+0.05] : [score, severity_sum];

            // check front
            [score, severity_sum] = (name_length >= 3) ? 
                [score+0.25, severity_sum+0.05] : [score+0.05, severity_sum+0.05];

            // check mid
            [score, severity_sum] = (domain_name_length >= 3) ?
                [score+0.25, severity_sum+0.05] : [score+0.05, severity_sum+0.05];

            // check back
            [score, severity_sum] = (final_extension_length >= 2) ?
                [score+0.50, severity_sum+0.05] : [score+0.1, severity_sum+0.025];

            let [assoc_sum_, severity_sum_] = Parsing.calc_assoc_severity_sum(
                left_it,
                right_it,
                this,
                this.language_model,
                this.language_model.max_assoc_distance
            );
            assoc_sum +=    assoc_sum_;
            severity_sum += severity_sum_;

            return [final_matches, new Parsing.CoreClassificationScore(
                Math.min(score + assoc_sum, 1.0), Math.min(severity_sum, 1.0), this
            )];
        }
        else
            return [final_matches, new Parsing.CoreClassificationScore(
                0.0, 0.0, this
            )];
    }

    /** @inheritdoc */
    public name: string = 'email_address';
};