import { PIIFilter } from '../src/pii-filter';
import { expect } from 'chai';

describe('PII_Filter', ()=>{
    it('classify_single_token', ()=>{
        let pii_filter = new PIIFilter();
        let result = pii_filter.classify('Product is heel aangekomen, ondanks het gat in de verpakking. \
                                          Doet wat het moet doen, mvg Bernard.');
        expect(result).not.equals(null);
        expect(result).is.instanceOf(PIIFilter.Classification.Result);
        expect(result.num_pii).equals(1);
        expect(result.pii[0].type).equals('voornaam');
        expect(result.pii[0].severity).equals(1);
        expect(result.severity).equals(1);
        
    });

    it('classify_multi_token', ()=>{
        let pii_filter = new PIIFilter();
        let result = pii_filter.classify('Product is heel aangekomen, ondanks het gat in de verpakking. \
                                          Doet wat het moet doen, mvg Bernard.');
        expect(result).not.equals(null);
        expect(result).is.instanceOf(PIIFilter.Classification.Result);
        expect(result.num_pii).equals(1);
        expect(result.pii[0].type).equals('voornaam');
        expect(result.pii[0].severity).equals(1);
        expect(result.severity).equals(1);
        
    });
});
