import { ILanguage } from './language';
import { IClassificationScore, IClassifier } from './parsing/classification';
import { IToken } from './parsing/tokens';

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
    pii:            Array<IClassificationResult>;

    render_replaced(fn: (classification: IClassificationResult) => string): string;
    render_placeholders(): string;
    render_removed(): string;
    print_debug();
};

export interface IMain
{
    language_model: ILanguage;
    classify(
        text: string,
        confidence_threshold?: number,
        severity_threshold?: number
    ): IResult;
    sanitize_str(
        text: string,
        placeholders: boolean,
        confidence_threshold?: number,
        severity_threshold?: number
    ): string;
    sanitize_object(
        obj: object,
        placeholders: boolean,
        confidence_threshold?: number,
        severity_threshold?: number
    ): object;
};