import { Parsing } from '../../../core/parsing';


import ds_dictionary from '../dataset/ds_dictionary.json';
import ds_first_name from '../dataset/ds_first_name.json';
import ds_family_name from '../dataset/ds_family_name.json';
import ds_pet_name from '../dataset/ds_pet_name.json';
import ds_medicine_name from '../dataset/ds_medicine_name.json';

export class Dictionary extends Parsing.SimpleDictionary
{
    constructor() 
    { 
        super(
            ds_dictionary,
            0.2,
            0.4
    ); }
    public name: string = 'dictionary';
};

export class FirstName extends Parsing.SimpleMultiNameClassifier
{
    constructor() 
    { 
        super(
            ds_first_name,
            [
                {   // dutch names
                    classification_score_base: 0.05,
                    uppercase_classification_score_base: 0.15,
                    pos_classification_score_base: 0.15,
                    pos_possible_classification_score_base: 0.05,
                    severity_score_base: 0.10,
                    dataset_name: 'main',
                },
                {   // international names
                    classification_score_base: 0.025,
                    uppercase_classification_score_base: 0.075,
                    pos_classification_score_base: 0.075,
                    pos_possible_classification_score_base: 0.025,
                    severity_score_base: 0.05,
                    dataset_name: 'int',
                }
            ],
            true
        );
    }
    public name: string = 'first_name';
};

export class FamilyName extends Parsing.SimpleMultiNameClassifier
{
    constructor() 
    {
        super(
            ds_family_name,
            [
                {   // dutch family names
                    classification_score_base: 0.05,
                    uppercase_classification_score_base: 0.15,
                    pos_classification_score_base: 0.15,
                    pos_possible_classification_score_base: 0.05,
                    severity_score_base: 0.20,
                    dataset_name: 'main',
                },
                {   // international family names
                    classification_score_base: 0.025,
                    uppercase_classification_score_base: 0.075,
                    pos_classification_score_base: 0.075,
                    pos_possible_classification_score_base: 0.025,
                    severity_score_base: 0.10,
                    dataset_name: 'int',
                }
            ],
            true
        );
    }
    public name: string = 'family_name';
};

export class PetName extends Parsing.SimpleNameClassifier
{
    constructor() 
    {
        super(
            ds_pet_name,
            0.05,
            0.10,
            0.10,
            0.05,
            0.15
        );
    }
    public name: string = 'pet_name';
};

// NOTE: still needs assoc list
export class MedicineName extends Parsing.SimpleNameClassifier
{
    constructor()
    {
        super(
            ds_medicine_name,
            0.10,
            0.15,
            0.10,
            0.05,
            0.30
        );
    }
    public name: string = 'medicine_name';
};