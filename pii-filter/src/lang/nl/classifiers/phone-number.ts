import { Parsing } from '../../../core/parsing';
import ds_phone_number from '../dataset/ds_phone_number.json';

function validate_phone_number(phone_number: string): boolean
{
    //((^(((\(?\s?\+\s?|\+|00(\s|\s?\-\s?)?)31\s?\)?(\s|\s?\-\s?)?(\(?\s?0?6\s?\)?[\-\s]?|0?6\s?)?|0?6))\s?([0-9](\s?|\s?\-\s?)){8,8}$)|(^(((\(?\s?\+\s?|\+|00(\s|\s?\-\s?)?)31\s?\)?(\s|\s?\-\s?)?(\(?\s?0\s?\)?[\-\s]?|0\s?)?|0))\s?([0-9](\s?|\s?\-\s?)){9,9}$)|(^((\(\s?\d+\s?\)\s?))\s?([0-9](\s?|\s?\-\s?)){7,8}$))
    return /^((00)?31)?((?!((00)?31))((0[1-9][0-9]{7,8})|([1-9][0-9]{7,8})))$/.test(phone_number.replace(/\D/g, ''));
}

function is_06(phone_number: string): boolean
{
    return /((00)?31)?0?6/.test(phone_number.replace(/\D/g, ''))
}

export class PhoneNumber extends Parsing.SimpleAssociativeClassifier
{
    constructor() { super(ds_phone_number); }
    public classify_confidence(token: Parsing.Token): 
        [Array<Parsing.Token>, Parsing.ClassificationScore]
    {
        if (/^(\+|\(|0|6)/.test(token.symbol))
        {
            const min_number_length:    number =                7;
            const max_number_length:    number =                15;

            let has_numbers:            RegExp =                /\d+/;
            let has_letters:            RegExp =                /[a-zA-Z]+/;
            let has_symbols:            RegExp =                /\-|\+|\(|\)/;

            let deferred_text:          string =                '';
            let number_value:           string =                '';
            let total_num_length:       number =                0;

            let [matched, [start_token, end_token, matches]] = Parsing.collect_tokens(
                token,
                (token: Parsing.Token,
                    deferred_matches: Array<Parsing.Token>
                ): Parsing.collect_tokens.Control =>
                {
                    let token_symbol:       string =    token.symbol;
                    let token_is_space:     boolean =   token_symbol == ' ';
                    let token_has_symbol:   boolean =   has_symbols.test(token_symbol);

                    if (has_letters.test(token_symbol))
                        return Parsing.collect_tokens.Control.INVALID;
                    else if (has_numbers.test(token_symbol))
                    {
                        number_value +=     deferred_text + token_symbol;
                        deferred_text =     '';

                        total_num_length += token_symbol.replace(/\D+/g, '').length;
                        if (total_num_length > min_number_length)
                        {
                            if (total_num_length > max_number_length)
                                return Parsing.collect_tokens.Control.INVALID;

                            if (validate_phone_number(number_value))
                                return Parsing.collect_tokens.Control.MATCH_AND_CONTINUE;
                        }
                        return Parsing.collect_tokens.Control.VALID;
                    }
                    else if (token_has_symbol || token_is_space)
                    {
                        if (deferred_matches.length == 5) //+31 - ( >^06)
                            return Parsing.collect_tokens.Control.INVALID;

                        deferred_text += token_symbol;
                        return Parsing.collect_tokens.Control.DEFER_VALID;
                    }
                    return Parsing.collect_tokens.Control.INVALID;
                }
            );

            if (!matched)
            {
                return [[], new Parsing.ClassificationScore(
                    0.0, 0.0, this
                )];
            }
            else
            {
                let score:                  number =    0.75;
                let severity_sum:           number =    (is_06(number_value) ? 0.5 : 0.35);
                let assoc_sum:              number =    0.0;
    
                let [assoc_sum_, severity_sum_] = Parsing.calc_assoc_severity_sum(
                    start_token,
                    end_token,
                    this,
                    this.language_model,
                    this.language_model.max_assoc_distance
                );
                assoc_sum +=    assoc_sum_;
                severity_sum += severity_sum_;

                return [matches, new Parsing.ClassificationScore(
                    Math.min(score + assoc_sum, 1.0),
                    Math.min(severity_sum, 1.0),
                    this
                )];
            }
        }
        else
        {
            return [[], new Parsing.ClassificationScore(
                0.0, 0.0, this
            )];
        }
    }
    public name: string = 'phone_number';
};