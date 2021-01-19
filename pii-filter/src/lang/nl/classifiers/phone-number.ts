import { Parsing } from '../../../core/parsing';
import ds_phone_number from '../dataset/ds_phone_number.json';

// stub

// TODO:
/**
 * look for mobile numbers vs landline numbers (06)
 */
export class PhoneNumber extends Parsing.SimpleAssociativeClassifier
{
    constructor() { super(ds_phone_number); }
    public classify_confidence(token: Parsing.Token): 
        [Array<Parsing.Token>, Parsing.ClassificationScore]
    {
        const min_number_length:    number =                6; // although 7 is more common
        const max_number_length:    number =                15;
        const max_n_other_symbols:  number =                5;

        let n_other_symbols:        number =                0;
        let number_value:           string =                '';
        let final_matches:          Array<Parsing.Token> =  new Array<Parsing.Token>();

        const phone_symbols: Array<string> = [
            '(', ')', '-', '[', ']'
        ];

        const start_symbols: Array<string> = [
            '+', '(', '['
        ];
        
        function get_symbols(token: string):
            { letters: string, numbers: string, other: string }
        {
            return {
                letters:    token.replace(/[^a-zA-Z]+/g, ''),
                numbers:    token.replace(/\D+/g, ''),
                other:      token.replace(/[a-zA-Z0-9]/g, '')
            }
        }

        function parse_token(token: Parsing.Token): [boolean, number, string]
        {
            let symbols = get_symbols(token.symbol);
            return [
                start_symbols.indexOf(token.symbol) > -1 ||
                    ((symbols.other.length <= 3 && symbols.other != '.') &&
                        symbols.letters.length == 0 && 
                        symbols.numbers.length > 0),
                symbols.letters.length + symbols.other.length,
                symbols.numbers
            ];
        }
        
        // TODO: should be cleaned up
        let [could_be_number, n_other_sym, number_part] = parse_token(token);
        if (token.symbol != ' ' && could_be_number)
        {
            number_value    += number_part;
            n_other_symbols += n_other_sym;
            
            let right_it = token;
            while (right_it.next != null)
            {
                let is_space = right_it.next.symbol == ' ';
                let is_phone_symbol = phone_symbols.indexOf(right_it.next.symbol) > -1;
                [could_be_number, n_other_sym, number_part] = parse_token(right_it.next);
                
                if (!is_phone_symbol && !is_space && !could_be_number)
                    break;
                else if (could_be_number)
                {
                    number_value +=     number_part;
                    n_other_symbols +=  n_other_sym;
                }

                right_it = right_it.next;
            }

            // don't keep overshoot
            while (right_it.previous != null && this.language_model.punctuation_map.has(right_it.symbol))
                right_it = right_it.previous;

            if (number_value.length < min_number_length ||
                number_value.length > max_number_length ||
                n_other_symbols >= max_n_other_symbols)
                return [final_matches, new Parsing.ClassificationScore(
                    0.0, 0.0, this
                )];

            let country_plus:           boolean =   token.symbol.indexOf('+') == 0;
            let score:                  number =    (country_plus ? 0.35 : 0.25);
            let severity_sum:           number =    (country_plus ? 0.5 : 0.35);;
            let assoc_sum:              number =    0.0;

            let [assoc_sum_, severity_sum_] = Parsing.calc_assoc_severity_sum(
                token,
                right_it,
                this,
                this.language_model,
                this.language_model.max_assoc_distance
            );
            assoc_sum +=    assoc_sum_;
            severity_sum += severity_sum_;

            while (token.index < right_it.index)
            {
                final_matches.push(token);
                token = token.next;
            }
            final_matches.push(token);

            return [final_matches, new Parsing.ClassificationScore(
                Math.min(score + assoc_sum, 1.0), Math.min(severity_sum, 1.0), this
            )];
        }
        else
            return [final_matches, new Parsing.ClassificationScore(
                0.0, 0.0, this
            )];
    }
    public name: string = 'phone_number';
};