import { Result, PII } from '../../../src/pii-filter';

export function print_debug(result: Result)
{
    if(result['tokens'].length == 0)
        return;
        
    let token = result['tokens'][0][1];
    while(token != null)
    {
        console.log(`[${token.index}] Token: \"${token.symbol}\", Stem: \"${token.stem}\"`);
        console.log(`-- POS[${token.tag.tag_base}], ${JSON.stringify(token.tag.tag_rest)}`);
        console.log(`-- WellFormedNess[${token.tag.group.well_formed}]`);
        if (token.confidence_dictionary)
            console.log(
                `- dict score: ${token.confidence_dictionary.score}, ` +
                `root: [${token.confidence_dictionary.group_root_start.index}, ` + 
                `${token.confidence_dictionary.group_root_end.index}]`
            );
        for (let assoc_arr of token.confidences_associative.values())
        {
            for (let assoc of assoc_arr)
            {
                console.log(
                    `  assoc: ${assoc.classifier.name}, ` +
                    `score: ${assoc.score}, root: [${assoc.group_root_start.index}, ` + 
                    `${assoc.group_root_end.index}]`
                );
            }
        }
        for (let conf of token.confidences_classification[token.confidences_classification.length-1].all())
        {
            console.log(
                `   ++conf: ${conf.classifier.name}, score: ${conf.score}, severity: ${conf.severity}, ` + 
                `root: [${conf.group_root_start.index}, ${conf.group_root_end.index}]`
            );
        }
        token = token.next;
    }

    console.log(`Overall severity: ${result['severity']}`);


    for (let pii of result['pii'])
        console.log(`PII[${pii.type}]: ${pii.value}`);
}

export function get_pii(
    pii_arr: ReadonlyArray<PII>,
    pii_text: string,
): PII
{
    for (let pii of pii_arr)
    {
        if (pii.value == pii_text)
            return pii;
    }
    return null;
}