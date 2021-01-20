import { Parsing } from '../../../core/parsing';
import ds_phone_number from '../dataset/ds_phone_number.json';

function validate_phone_number(phone_number: string): boolean
{
    return /((^(((\(?\s?\+\s?|\+|00(\s|\s?\-\s?)?)31\s?\)?(\s|\s?\-\s?)?(\(?\s?0?6\s?\)?[\-\s]?|0?6\s?)?|0?6))\s?([0-9](\s?|\s?\-\s?)){8,8}$)|(^(((\(?\s?\+\s?|\+|00(\s|\s?\-\s?)?)31\s?\)?(\s|\s?\-\s?)?(\(?\s?0\s?\)?[\-\s]?|0\s?)?|0))\s?([0-9](\s?|\s?\-\s?)){9,9}$)|(^((\(\s?\d+\s?\)\s?))\s?([0-9](\s?|\s?\-\s?)){7,8}$))/.test(phone_number);
}

function is_06(phone_number: string): boolean
{
    return /^((0?)6|31(0?)6|0031(0?)6)/.test(phone_number.replace(/\D/g, ''))
}

export class PhoneNumber extends Parsing.SimpleAssociativeClassifier
{
    constructor() { super(ds_phone_number); }
    public classify_confidence(token: Parsing.Token): 
        [Array<Parsing.Token>, Parsing.ClassificationScore]
    {
        const min_number_length:    number =                7;
        const max_number_length:    number =                15;

        if (/(^(\+|\(|0|6))/.test(token.symbol))
        {
            let number_value:           string =                '';
            let total_num_length:       number =                0;
            let final_matches:          Array<Parsing.Token> =  new Array<Parsing.Token>();

            let t_it: Parsing.Token = token;

            function add_token(t: Parsing.Token): boolean
            {
                let symbol_length: number = t.symbol.replace(/\D+/g, '').length;
                if ((total_num_length + symbol_length) < max_number_length)
                {
                    number_value +=     t.symbol;
                    total_num_length += symbol_length;
                    final_matches.push(t);
                    
                    if (total_num_length > min_number_length)
                        return !validate_phone_number(number_value);
                    else
                        return true;
                }
                else
                    return false;
            }

            let has_numbers: RegExp = /^(\d+(\s?))+$/;
            let has_letters: RegExp = /[a-zA-Z]+/;
            let has_symbols: RegExp = /\-|\(|\)|\ /;

            let length_ok: boolean = add_token(t_it);
            while (length_ok && t_it.next != null)
            {
                if (has_letters.test(t_it.next.symbol))
                    break;

                if (has_numbers.test(t_it.next.symbol))
                { // has number
                    if ((length_ok = add_token(t_it.next)))
                        t_it = t_it.next;
                }
                else if (has_symbols.test(t_it.next.symbol))
                { // has symbol or space
                    if (t_it.next.next != null &&
                        !has_letters.test(t_it.next.next.symbol))
                    {
                        if (has_numbers.test(t_it.next.next.symbol))
                        {
                            if ((length_ok = add_token(t_it.next)))
                            {
                                t_it = t_it.next;
                                if ((length_ok = add_token(t_it.next)))
                                    t_it = t_it.next;
                            }
                        }
                        else if (has_symbols.test(t_it.next.next.symbol) &&
                                 t_it.next.next.next != null &&
                                 (!has_letters.test(t_it.next.next.next.symbol) &&
                                  has_numbers.test(t_it.next.next.next.symbol)))
                        {
                            if ((length_ok = add_token(t_it.next)))
                            {
                                t_it = t_it.next;
                                if ((length_ok = add_token(t_it.next)))
                                {
                                    t_it = t_it.next;
                                    if ((length_ok = add_token(t_it.next)))
                                        t_it = t_it.next;
                                }
                            }
                        }
                        else
                            break;
                    }
                    else
                        break;
                }
                else
                    break;
            }

            if (!validate_phone_number(number_value))
            {
                return [[], new Parsing.ClassificationScore(
                    0.0, 0.0, this
                )];
            }
            else
            {
                let score:                  number =    0.75;
                let severity_sum:           number =    (is_06(number_value) ? 0.5 : 0.35);;
                let assoc_sum:              number =    0.0;
    
                let [assoc_sum_, severity_sum_] = Parsing.calc_assoc_severity_sum(
                    token,
                    t_it,
                    this,
                    this.language_model,
                    this.language_model.max_assoc_distance
                );
                assoc_sum +=    assoc_sum_;
                severity_sum += severity_sum_;

                return [final_matches, new Parsing.ClassificationScore(
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