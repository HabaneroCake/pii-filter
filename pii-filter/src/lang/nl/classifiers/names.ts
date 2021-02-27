import * as Parsing from '../../../core/parsing';


import ds_dictionary_0 from '../dataset/ds_dictionary_0.json';
import ds_dictionary_1 from '../dataset/ds_dictionary_1.json';

import ds_first_name from '../dataset/ds_first_name_0.json';

import ds_family_name_0 from '../dataset/ds_family_name_0.json';
import ds_family_name_1 from '../dataset/ds_family_name_1.json';
import ds_family_name_2 from '../dataset/ds_family_name_2.json';

import ds_pet_name from '../dataset/ds_pet_name_0.json';
import ds_medicine_name from '../dataset/ds_medicine_name_0.json';


function merge_json(json_objects: Array<object>): object
{   // flat (array) merge
    let compiled_object = {};
    for (const object of json_objects)
    {
        for (const key of Object.keys(object))
        {
            if (Object.keys(compiled_object).includes(key))
            {
                if (Array.isArray(object[key]))
                    for (const element of object[key])
                        compiled_object[key].push(element);
            } else {
                compiled_object[key] = object[key];
            }
        }
    }
    return compiled_object;
}

/**
 * The Dutch dictionary.
 * @private
 */
export class Dictionary extends Parsing.CoreDictionary
{
    /**
     * Creates a new Dutch dictionary.
     */
    constructor()
    { 
        super(
            merge_json([ds_dictionary_0, ds_dictionary_1]),
            0.2,
            0.4
    ); }

    /** @inheritdoc */
    public name: string = 'dictionary';
};

/**
 * A Dutch first name classifier.
 * @private
 */
export class FirstName extends Parsing.CoreMultiNameClassifier
{
    /**
     * Creates a new first name classifier.
     */
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
                    severity_score_base: 0.05,
                    dataset_name: 'main',
                },
                {   // international names
                    classification_score_base: 0.025,
                    uppercase_classification_score_base: 0.075,
                    pos_classification_score_base: 0.075,
                    pos_possible_classification_score_base: 0.025,
                    severity_score_base: 0.025,
                    dataset_name: 'int',
                }
            ],
            true
        );
    }

    /** @inheritdoc */
    public name: string = 'first_name';
};

/**
 * A Dutch family name classifier.
 * @private
 */
export class FamilyName extends Parsing.CoreMultiNameClassifier
{
    /**
     * Creates a new family name classifier.
     */
    constructor() 
    {
        super(
            merge_json([ds_family_name_0, ds_family_name_1, ds_family_name_2]),
            [
                {   // dutch family names
                    classification_score_base: 0.05,
                    uppercase_classification_score_base: 0.15,
                    pos_classification_score_base: 0.15,
                    pos_possible_classification_score_base: 0.05,
                    severity_score_base: 0.10,
                    dataset_name: 'main',
                },
                {   // international family names
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

    /** @inheritdoc */
    public name: string = 'family_name';
};

/**
 * A Dutch pet name classifier.
 * @private
 */
export class PetName extends Parsing.CoreNameClassifier
{
    /**
     * Creates a new pet name classifier.
     */
    constructor() 
    {
        super(
            ds_pet_name,
            0.05,
            0.10,
            0.10,
            0.05,
            0.10
        );
    }

    /** @inheritdoc */
    public name: string = 'pet_name';
};

/**
 * A Dutch medicine name classifier.
 * @private
 */
export class MedicineName extends Parsing.CoreNameClassifier
{
    /**
     * Creates a new medicine name classifier.
     */
    constructor()
    {
        super(
            ds_medicine_name,
            0.10,
            0.15,
            0.10,
            0.05,
            0.20
        );
    }

    /** @inheritdoc */
    public name: string = 'medicine_name';
};