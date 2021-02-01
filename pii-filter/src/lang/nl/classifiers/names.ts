import * as Parsing from '../../../core/parsing';


import ds_dictionary from '../dataset/ds_dictionary.json';
import ds_first_name from '../dataset/ds_first_name.json';
import ds_family_name from '../dataset/ds_family_name.json';
import ds_pet_name from '../dataset/ds_pet_name.json';
import ds_medicine_name from '../dataset/ds_medicine_name.json';

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
            ds_dictionary,
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
            ds_family_name,
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