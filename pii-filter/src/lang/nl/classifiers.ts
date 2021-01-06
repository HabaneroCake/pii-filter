import { Parsing } from '../../parsing';

import ds_dictionary from './dataset/ds_dictionary.json';
import ds_first_name from './dataset/ds_first_name.json';
import ds_family_name from './dataset/ds_family_name.json';
import ds_pet_name from './dataset/ds_pet_name.json';
import ds_medicine_name from './dataset/ds_medicine_name.json';
import ds_email_address from './dataset/ds_email_address.json';

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
            let assoc_multiplier: number = 1;
            let at_index = token.symbol.indexOf('@');
            if (at_index > -1)
            {
                let score = (at_index > 0 ? 0.5 : 0.25);

                let left_it = token;
                while (left_it.previous != null && left_it.previous.symbol != ' ')
                    left_it = left_it.previous;
                
                let right_it = token;
                while (right_it.next != null)
                {
                    if (right_it.symbol == ' ' && this.language_model.punctuation_map.has(right_it.next.symbol))
                        break;
                    right_it = right_it.next;
                }

                if (pass_index > 0)
                {
                    assoc_multiplier = Parsing.calc_assoc_multiplier(
                        left_it,
                        right_it,
                        this,
                        this.language_model,
                        20
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
                    score * assoc_multiplier, this
                )];
            }
            else
                return [final_matches, new Parsing.ClassificationScore(
                    0.0, this
                )];
        }
        public name: string = 'email_address';
    };
};