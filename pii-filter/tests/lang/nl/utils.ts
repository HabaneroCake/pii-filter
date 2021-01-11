import { PIIFilter } from '../../../src/pii-filter';

export function get_pii(
    pii_all: Array<PIIFilter.PII>,
    pii_text: string,
): PIIFilter.PII
{
    for (let pii of pii_all)
    {
        if (pii.text == pii_text)
            return pii;
    }
    return null;
}