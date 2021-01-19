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

export class FirstName extends Parsing.SimpleNameClassifier
{
    constructor() 
    { 
        super(
            ds_first_name,
            0.05,
            0.15,
            0.15,
            0.05,
            0.10,
        );
    }
    public name: string = 'first_name';
};

export class FamilyName extends Parsing.SimpleNameClassifier
{
    constructor() 
    {
        super(
            ds_family_name,
            0.05,
            0.15,
            0.15,
            0.05,
            0.20
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
            0.15,
            0.15,
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
            0.15,
            0.25,
            0.10,
            0.05,
            0.30
        );
    }
    public name: string = 'medicine_name';
};