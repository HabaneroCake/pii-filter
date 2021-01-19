import { IStemmer } from '../../core/interfaces/parsing/tokens';

export class Stemmer implements IStemmer
{
    stem(token: string): string 
    {
        throw new Error('Method not implemented.');
    }
};