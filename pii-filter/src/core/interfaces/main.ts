import { ILanguage } from './language';
import { IClassificationScore, IClassifier } from './parsing/classification';
import { IToken } from './parsing/tokens';

export interface IClassificationResult
{
    classification: IClassificationScore,
    text:           string;
};

export interface IResult
{
    total_num_pii:       number;
    num_pii:             Map<IClassifier, number>;
    severity_mapping:    number;
    tokens:              Array<[IClassificationScore, IToken]>;

    render_replaced(fn: (classification: IClassificationScore, text: string) => string, 
                    confidence_threshold?: number, severity_threshold?: number): string;
    render_placeholders(confidence_threshold?: number, severity_threshold?: number): string;
    render_removed(confidence_threshold?: number, severity_threshold?: number): string;
    pii(confidence_threshold?: number, severity_threshold?: number): Array<IClassificationResult>;
    print_debug();
};

export interface IMain
{
    language_model: ILanguage;
    classify(text: string) : IResult;
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