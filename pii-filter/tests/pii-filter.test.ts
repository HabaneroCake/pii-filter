import { PIIFilter } from '../src/pii-filter';
import { NL } from '../src/lang/nl/nl';
import { expect } from 'chai';

let pii_filter = new PIIFilter(new NL());

// test first name
// test family name
// test pet name
// test medicine name
// test email address
// test phone number
// test date

describe('PII_Filter_NL', ()=>{
    it('classify_single_token', ()=>{
        let result = pii_filter.classify(
            'Hee Hoi Hallo Hee, asdasd asd Ben is jalala voornaam Bram, ik wilde graag melden dat mijn achternaam verkeerd staat in jullie dossier sinds vandaag, op 2 november 1550 en 6-08-2010, het is namelijk van der Beek. Er is overigens meer vraag naar Paracetamol. Daarnaast heb je hier mijn mail adres: hoi.a_twts-d@hankel_asd.com en mijn telefoonnummer: +31 (6) 10987654. blaasdasd .asdasd'
        );
        console.log(result.render_placeholders(0.25, 0.1));
        console.log(result.render_removed(0.25, 0.25));
        for (let x of result.pii())
        {
            console.log(`${x.classification.classifier.name}: ${x.text}, ${x.classification.score}, ${x.classification.severity}`)
        }
        // expect(result).not.equals(null);
        // expect(result).is.instanceOf(PIIFilter.Classification.Result);
        // expect(result.num_pii).equals(1);
        // expect(result.pii[0].type).equals('voornaam');
        // expect(result.pii[0].severity).equals(1);
        // expect(result.severity).equals(1);
        
    });

    // it('classify_multi_token', ()=>{
    //     let pii_filter = new PIIFilter();
    //     let result = pii_filter.classify('Product is heel aangekomen, ondanks het gat in de verpakking. \
    //                                       Doet wat het moet doen, mvg Bernard.');
    //     expect(result).not.equals(null);
    //     expect(result).is.instanceOf(PIIFilter.Classification.Result);
    //     expect(result.num_pii).equals(1);
    //     expect(result.pii[0].type).equals('voornaam');
    //     expect(result.pii[0].severity).equals(1);
    //     expect(result.severity).equals(1);
        
    // });
});
