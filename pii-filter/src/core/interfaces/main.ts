import { ILanguage } from './language';

export interface IClassificationResult
{
    value:          string;
    type:           string;
    confidence:     number;
    severity:       number;
    start_pos:      number;
    end_pos:        number;
};

export interface IResult
{
    found_pii:      boolean;
    severity:       number;
    pii:            ReadonlyArray<IClassificationResult>;

    render_replaced(fn: (classification: IClassificationResult) => string): string;
    render_placeholders(): string;
    render_removed(): string;
};

export interface IMain
{
    language_model: ILanguage;
    classify(
        text: string
    ): IResult;
    sanitize_str(
        text: string,
        placeholders: boolean
    ): string;
    sanitize_object(
        obj: object,
        placeholders: boolean,
        recursive: boolean,
        skip?: Array<object>
    ): object;
};