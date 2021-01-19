import { ILanguage } from '../language';

export class IGroup
{
    well_formed:    number;
    n_tags:         number;
};

export interface ITag
{
    group:       IGroup;
    tag_base:    string;
    tag_rest:    Array<string>;
};

export interface ITagger
{
    none_str: string;
    tag(tokens: Array<string>, language_model: ILanguage): Array<[string, ITag]>;
};