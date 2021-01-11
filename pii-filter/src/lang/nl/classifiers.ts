import { Parsing } from '../../common/parsing';
import { Trie } from '../../common/trie';

import ds_dictionary from './dataset/ds_dictionary.json';
import ds_first_name from './dataset/ds_first_name.json';
import ds_family_name from './dataset/ds_family_name.json';
import ds_pet_name from './dataset/ds_pet_name.json';
import ds_medicine_name from './dataset/ds_medicine_name.json';
import ds_email_address from './dataset/ds_email_address.json';
import ds_phone_number from './dataset/ds_phone_number.json';
import ds_date from './dataset/ds_date.json';

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
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            let [tokens, score] = super.classify_confidence(token, pass_index);
            score.severity = Math.min(score.severity + 0.1, 1.0);
            return [tokens, score];
        }
        public name: string = 'first_name';
    };

    export class FamilyName extends Parsing.SimpleNameClassifier
    {
        constructor() { super(ds_family_name); }
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            let [tokens, score] = super.classify_confidence(token, pass_index);
            score.severity = Math.min(score.severity + 0.2, 1.0);
            return [tokens, score];
        }
        public name: string = 'family_name';
    };

    export class PetName extends Parsing.SimpleNameClassifier
    {
        constructor() { super(ds_pet_name); }
        public name: string = 'pet_name';
    };
    
    // NOTE: still needs assoc list
    export class MedicineName extends Parsing.SimpleNameClassifier
    {
        constructor() { super(ds_medicine_name); }
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            let [tokens, score] = super.classify_confidence(token, pass_index);
            score.severity = Math.min(score.severity + 0.5, 1.0);
            return [tokens, score];
        }
        public name: string = 'medicine_name';
    };

    // stub, TODO: rework/clean up
    export class EmailAddress extends Parsing.SimpleAssociativeClassifier
    {
        constructor() { super(ds_email_address); }
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            let final_matches: Array<Parsing.Token> = new Array<Parsing.Token>();
            let at_index = token.symbol.indexOf('@');
            if (at_index > -1)
            {
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

                // don't overshoot
                if (this.language_model.punctuation_map.has(right_it.symbol))
                    right_it = right_it.previous;


                let assoc_sum:      number = 0.0;
                let score:          number = (at_index > 0 ? 0.5 : 0.25);
                let severity_sum:   number = (at_index > 0 ? 0.5 : 0.25);
                if (pass_index > 0)
                {
                    let [assoc_sum_, severity_sum_] = Parsing.calc_assoc_severity_sum(
                        left_it,
                        right_it,
                        this,
                        this.language_model,
                        this.language_model.max_assoc_distance
                    );
                    assoc_sum +=    severity_sum_;
                    severity_sum += severity_sum_;
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
                {
                    score +=        0.5;
                    severity_sum += 0.25;
                }

                return [final_matches, new Parsing.ClassificationScore(
                    Math.min(score + assoc_sum, 1.0), Math.min(severity_sum, 1.0), this
                )];
            }
            else
                return [final_matches, new Parsing.ClassificationScore(
                    0.0, 0.0, this
                )];
        }
        public name: string = 'email_address';
    };

    // stub
    export class PhoneNumber extends Parsing.SimpleAssociativeClassifier
    {
        constructor() { super(ds_phone_number); }
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            const min_number_length:    number =                6; // although 7 is more common
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

                if (number_value.length < min_number_length || n_other_symbols >= max_n_other_symbols)
                    return [final_matches, new Parsing.ClassificationScore(
                        0.0, 0.0, this
                    )];

                let country_plus:           boolean =   token.symbol.indexOf('+') == 0;
                let score:                  number =    (country_plus ? 0.35 : 0.25);
                let severity_sum:           number =    (country_plus ? 0.5 : 0.35);;
                let assoc_sum:              number =    0.0;

                if (pass_index > 0)
                {
                    let [assoc_sum_, severity_sum_] = Parsing.calc_assoc_severity_sum(
                        token,
                        right_it,
                        this,
                        this.language_model,
                        this.language_model.max_assoc_distance
                    );
                    assoc_sum +=    assoc_sum_;
                    severity_sum += severity_sum_;
                }

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

    // TODO: clean up and calculate better confidences based on patterns
    export class Date extends Parsing.SimpleAssociativeClassifier
    {
        protected match_trie:   Trie<Date.SegmentFormats> = new Trie();

        constructor() 
        {
            super(ds_date);
            this.match_trie.add_list(this.dataset['day'], Date.SegmentFormats.day);
            this.match_trie.add_list(this.dataset['month'], Date.SegmentFormats.month);
            this.match_trie.add_list(this.dataset['ordinal'], Date.SegmentFormats.ordinal);
            this.match_trie.add_list(this.dataset['number'], Date.SegmentFormats.number);
            this.match_trie.add_list(this.dataset['unit'], Date.SegmentFormats.unit);
        }
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            const separators:       Array<string> =         ['.', ' ', '/', '\\', '-', '_', ':'];
            const max_n_sep:        number =                5;
            let final_matches:      Array<Parsing.Token> =  new Array<Parsing.Token>();
            let score:              number =                0.0;
            let severity:           number =                0.0;

            function token_part_of_date(token: Parsing.Token,
                                        match_trie: Trie<Date.SegmentFormats>):
                [boolean, Array<Parsing.Token>, Date.SegmentFormats, number]
            {

                let [matches, value] =  Parsing.tokens_trie_lookup<Date.SegmentFormats>(token, match_trie);
                if (value)
                {
                    return [true, matches, value, 0];
                }
                else
                {
                    let numbers =   token.symbol.replace(/\D+/g, '');
                    let rest =      token.symbol.replace(/[^\D+]/g, '');
                    let n_sep: number = 0;
                    for (let c of rest)
                        if (separators.indexOf(c) > -1)
                            n_sep++;
                    if (numbers.length > 0 && numbers.length+n_sep == token.symbol.length)
                        return [true, [token], Date.SegmentFormats.number, n_sep];
                }
                return [false, new Array<Parsing.Token>(), Date.SegmentFormats.invalid, 0];
            }

            let token_ok:           boolean;
            let seg_tokens:         Array<Parsing.Token>;
            let segment_type:       Date.SegmentFormats;
            let n_sep_:             number;
            
            let matches:            Array<[Parsing.Token, Date.SegmentFormats]> = 
                                                new Array<[Parsing.Token, Date.SegmentFormats]>();

            let last_valid_token:   Parsing.Token;
            let last_valid_n_sep:   number =                0;

            let n_sep:              number =                0;
            let n_seg:              number =                0;
            let formats_found:      Map<Date.SegmentFormats, number> = new Map<Date.SegmentFormats, number>();
            do
            {
                [token_ok, seg_tokens, segment_type, n_sep_] = token_part_of_date(token, this.match_trie);
                n_sep += n_sep_;
                if (n_sep >= max_n_sep)
                    break;
                if (token_ok)
                {
                    for (let tok of seg_tokens)
                    {
                        if (!formats_found.has(segment_type))
                            formats_found.set(segment_type, 1);
                        else
                            formats_found.set(segment_type, formats_found.get(segment_type) + 1);

                        matches.push([tok, segment_type]);
                        
                        n_seg +=            1;
                        token =             tok;
                        last_valid_token =  token;
                        last_valid_n_sep =  n_sep;
                    }
                }
                else if (n_seg > 0 && separators.indexOf(token.symbol) > -1)
                {
                    token_ok = true;
                    matches.push([token, Date.SegmentFormats.separator]);

                    if (token.symbol != ' ')
                        n_sep += 1;
                }
                token = token.next;
            } while(token != null && token_ok)
            
            if (n_seg != 0 && n_seg >= last_valid_n_sep && last_valid_n_sep < max_n_sep)
            {
                let only_numbers = formats_found.has(Date.SegmentFormats.number) &&
                                    formats_found.get(Date.SegmentFormats.number) == n_seg;

                let only_units = formats_found.has(Date.SegmentFormats.unit) &&
                                    formats_found.get(Date.SegmentFormats.unit) == n_seg;

                if (!only_units && (!only_numbers || (only_numbers && last_valid_n_sep != 0)))
                {
                    if (only_numbers)
                    {
                        score =     (n_seg-1 >= last_valid_n_sep ? 0.5 : 0.25);
                        severity =  (n_seg-1 >= last_valid_n_sep ? 0.2 : 0.1);
                    }
                    else
                    {
                        score =     0.5;
                        severity =  0.2;
                    }
                    
                        
                    for (let [match, type] of matches)
                    {
                        final_matches.push(match);
                        if (last_valid_token == match)
                            break;
                    }

                    if (pass_index > 0)
                    {
                        let [assoc_sum, severity_sum] = Parsing.calc_assoc_severity_sum(
                            final_matches[0],
                            final_matches[final_matches.length-1],
                            this,
                            this.language_model,
                            this.language_model.max_assoc_distance
                        );
                        score +=    assoc_sum;
                        severity += severity_sum;
                    }
                }
            }

            return [final_matches, new Parsing.ClassificationScore(
                Math.min(score, 1.0), Math.min(severity, 1.0), this
            )];
        }
        public name: string = 'date';
    };
    export namespace Date {
        export enum SegmentFormats {
            invalid = 0,
            day,
            month,
            number,
            ordinal,
            unit,
            separator,
        };
    };
};