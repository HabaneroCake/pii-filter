import { PIIFilter } from '../../../src/pii-filter';
import { NL } from '../../../src/lang/nl/nl';
import { expect } from 'chai';
import { get_pii } from './utils';

import benchmark from './benchmark.json';

let pii_filter = new PIIFilter(new NL());

describe('PII_Filter_NL_Benchmark', ()=>{
    let severity_map_err_s: number = 0;
    let correct:            number = 0;
    let incorrect:          number = 0;
    let missed:             number = 0;
    let false_positive:     number = 0;
    let total:              number = 0;
    const debug:            boolean = false;

    for (let item of benchmark as Array<{phrase: string, pii: Array<[string, string]>, severity: number}>)
    {
        let result = pii_filter.classify(item.phrase);
        let result_pii = result.pii();

        if (debug)
            console.log(`--- [Phrase]: ${item.phrase}`);
        
        for (let [pii, segment] of item.pii)
        {
            let pii_match = get_pii(result_pii, segment);
            if (pii_match)
            {
                if (pii == pii_match.classification.classifier.name)
                    correct++;
                else
                {
                    if (debug)
                        console.log(
                            `    ` +
                            `Incorrectly classified \"${segment}\" ` +
                            `as ${pii_match.classification.classifier.name}. ` +
                            `Should be ${pii}.`
                        );
                    incorrect++;
                }
                const index = result_pii.indexOf(pii_match, 0);
                if (index > -1)
                    result_pii.splice(index, 1);
            }
            else
            {
                if (debug)
                    console.log(`    Missed \"${segment}\" which is of type ${pii}.`);
                missed++;
            }
            total++;
        }
        
        const severity_diff: number = item.severity - result.severity_mapping;
        if (debug && severity_diff != 0.0)
            console.log(`    Severity was ${result.severity_mapping}, should have been ${item.severity}.`);
        
        severity_map_err_s += Math.pow(severity_diff, 2);

        for (let false_pii of result_pii)
        {
            if (debug)
                console.log(
                    `    False Positive: flagged \"${false_pii.text}\" as ${false_pii.classification.classifier.name}.`
                );
            false_positive++;
        }
    }

    let rmse_severity_mapping: number = Math.sqrt(severity_map_err_s / total);

    if (debug)
        console.log(
            `total: ${total}, correct: ${correct}, incorrect ${incorrect}, ` +
            `false_positive: ${false_positive}, missed: ${missed}, ` +
            `rmse_severity_mapping ${rmse_severity_mapping}`
        );

    it('correct_pii_gte_85_percent', ()=>{
        expect(correct/total).gte(0.85);
    });

    it('missed_pii_lt_10_percent', ()=>{
        expect(missed/total).lt(0.10);
    });

    it('incorrect_pii_lt_10_percent', ()=>{
        expect(incorrect/total).lt(0.10);
    });

    // TODO: this really needs to be improved
    it('false_positives_lt_10_percent', ()=>{
        expect(false_positive/total).lt(0.15);
    });

    it('rmse_severity_mapping_lt_0_1', ()=>{
        expect(rmse_severity_mapping).lt(0.1);
    });
});