import { Parsing } from '../../parsing';

import ds_dictionary from './dataset/ds_dictionary.json';
import ds_first_name from './dataset/ds_first_name.json';
import ds_family_name from './dataset/ds_family_name.json';
import ds_pet_name from './dataset/ds_pet_name.json';
import ds_medicine_name from './dataset/ds_medicine_name.json';
import ds_email_address from './dataset/ds_email_address.json';
import ds_phone_number from './dataset/ds_phone_number.json';

export namespace Classifiers
{
    export class Dictionary extends Parsing.SimpleDictionary
    {
        constructor() { super(ds_dictionary); }
        public name: string = 'dictionary';
    };

    export class FirstName extends Parsing.SimpleNameClassifier
    {
        constructor() { super(ds_first_name); }
        public name: string = 'first_name';
    };

    export class FamilyName extends Parsing.SimpleNameClassifier
    {
        constructor() { super(ds_family_name); }
        public name: string = 'family_name';
    };

    export class PetName extends Parsing.SimpleNameClassifier
    {
        constructor() { super(ds_pet_name); }
        public name: string = 'pet_name';
    };

    // !TODO
    export class MedicineName extends Parsing.SimpleNameClassifier
    {
        constructor() { super(ds_medicine_name); }
        public name: string = 'medicine_name';
    };

    export class EmailAddress extends Parsing.SimpleTextClassifier
    {
        constructor() { super(ds_email_address); }
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            let final_matches: Array<Parsing.Token> = new Array<Parsing.Token>();
            let assoc_sum: number = 0.0;
            let at_index = token.symbol.indexOf('@');
            if (at_index > -1)
            {
                let score: number = (at_index > 0 ? 0.5 : 0.25);

                let left_it = token;
                while (left_it.previous != null && left_it.previous.symbol != ' ')
                    left_it = left_it.previous;
                
                let right_it = token;
                while (right_it.next != null)
                {
                    if (right_it.next.symbol == ' ')
                        break;
                    right_it = right_it.next;
                }

                if (pass_index > 0)
                {
                    assoc_sum = Parsing.calc_assoc_sum(
                        left_it,
                        right_it,
                        this,
                        this.language_model,
                        this.language_model.max_assoc_distance
                    );
                }

                if (left_it.index == right_it.index)
                    final_matches.push(left_it);

                while (left_it.index < right_it.index)
                {
                    final_matches.push(left_it);
                    left_it = left_it.next;
                }
                final_matches.push(left_it);

                // add to score if contains ".something"
                if (final_matches.length > 1 && final_matches[final_matches.length - 2].symbol == '.')
                    score += 0.5;

                return [final_matches, new Parsing.ClassificationScore(
                    Math.min(score + assoc_sum, 1.0), this
                )];
            }
            else
                return [final_matches, new Parsing.ClassificationScore(
                    0.0, this
                )];
        }
        public name: string = 'email_address';
    };

    export class PhoneNumber extends Parsing.SimpleTextClassifier
    {
        constructor() { super(ds_phone_number); }
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            const min_number_length:    number =                5; // although 7 is more common
            
            let number_value:           string =                '';
            let final_matches:          Array<Parsing.Token> =  new Array<Parsing.Token>();
            let assoc_sum:              number =                0.0;
            
            function get_symbols(token: string):
                { letters: string, numbers: string, other: string }
            {
                return {
                    letters:    token.replace(/[^a-zA-Z]+/g, ''),
                    numbers:    token.replace(/\D+/g, ''),
                    other:      token.replace(/[a-zA-Z0-9]/g, '')
                }
            }

            function parse_token(token: Parsing.Token): [boolean, string]
            {
                let symbols = get_symbols(token.symbol);
                return [(symbols.other.length <= 3 && symbols.other != '.') &&
                            symbols.letters.length == 0 && 
                            symbols.numbers.length > 0, symbols.numbers];
            }
            
            let [could_be_number, number_part] = parse_token(token);
            if (could_be_number)
            {
                number_value += number_part;
                
                let right_it = token;
                while (right_it.next != null)
                {
                    let is_space =                      right_it.next.symbol == ' ';
                    [could_be_number, number_part] =    parse_token(right_it.next);
                    
                    if (!is_space && !could_be_number)
                        break;
                    else if (could_be_number)
                        number_value += number_part;

                    right_it = right_it.next;
                }

                if (number_value.length < min_number_length)
                    return [final_matches, new Parsing.ClassificationScore(
                        0.0, this
                    )];

                let score: number = (token.symbol.indexOf('+') == 0 ? 0.35 : 0.25);

                if (pass_index > 0)
                {
                    assoc_sum = Parsing.calc_assoc_sum(
                        token,
                        right_it,
                        this,
                        this.language_model,
                        this.language_model.max_assoc_distance
                    );
                }

                while (token.index < right_it.index)
                {
                    final_matches.push(token);
                    token = token.next;
                }
                final_matches.push(token);

                return [final_matches, new Parsing.ClassificationScore(
                    Math.min(score + assoc_sum, 1.0), this
                )];
            }
            else
                return [final_matches, new Parsing.ClassificationScore(
                    0.0, this
                )];
        }
        public name: string = 'phone_number';
    };
};