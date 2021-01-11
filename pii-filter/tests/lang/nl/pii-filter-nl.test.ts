import { PIIFilter } from '../../../src/pii-filter';
import { NL } from '../../../src/lang/nl/nl';
import { expect } from 'chai';
import { get_pii } from './utils';

let pii_filter = new PIIFilter(new NL());

describe('PII_Filter_NL', ()=>{
    const first_name:       string = 'Katherina';
    const family_name:      string = 'Vink';
    const pet_name:         string = 'Miffy';
    const medicine_name:    string = 'Paracetamol';
    const email_address:    string = 'ruimte.station@iss.nl';
    const phone_number:     string = '06 123456 78';
    const date:             string = '01 - 01 - 1970';

    it('classify_first_name', ()=>{
        let result = pii_filter.classify(`Hoi, ik ben ${first_name}.`);
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, first_name);
        expect(pii_match && pii_all.length == 1).equals(true);
        expect(pii_match.classification.classifier.name).equals('first_name');
        expect(pii_match.classification.score).gte(0.25);
        expect(pii_match.classification.severity).gte(0.1);
    });
    it('classify_family_name', ()=>{
        let result = pii_filter.classify(`Mijn achternaam is ${family_name}.`);
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, family_name);
        expect(pii_match && pii_all.length == 1).equals(true);
        expect(pii_match.classification.classifier.name).equals('family_name');
        expect(pii_match.classification.score).gte(0.25);
        expect(pii_match.classification.severity).gte(0.2);
    });
    it('classify_pet_name', ()=>{
        let result = pii_filter.classify(`Mijn konijn heet ${pet_name}.`);
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, pet_name);
        expect(pii_match && pii_all.length == 1).equals(true);
        expect(pii_match.classification.classifier.name).equals('pet_name');
        expect(pii_match.classification.score).gte(0.25);
        expect(pii_match.classification.severity).gte(0.1);
    });
    it('classify_medicine_name', ()=>{
        let result = pii_filter.classify(`We gebruiken veel ${medicine_name}.`);
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, medicine_name);
        expect(pii_match && pii_all.length == 1).equals(true);
        expect(pii_match.classification.classifier.name).equals('medicine_name');
        expect(pii_match.classification.score).gte(0.25);
        expect(pii_match.classification.severity).gte(0.5);
    });
    it('classify_email_address', ()=>{
        let result = pii_filter.classify(`Mijn email adres is ${email_address}.`);
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, email_address);
        expect(pii_match && pii_all.length == 1).equals(true);
        expect(pii_match.classification.classifier.name).equals('email_address');
        expect(pii_match.classification.score).gte(0.25);
        expect(pii_match.classification.severity).gte(0.5);
    });
    it('classify_phone_number', ()=>{
        let result = pii_filter.classify(`Mijn mobiele nummer is ${phone_number}.`);
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, phone_number);
        expect(pii_match && pii_all.length == 1).equals(true);
        expect(pii_match.classification.classifier.name).equals('phone_number');
        expect(pii_match.classification.score).gte(0.25);
        expect(pii_match.classification.severity).gte(0.5);
    });
    it('classify_date', ()=>{
        let result = pii_filter.classify(`Mijn verjaardag is op ${date}.`);
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, date);
        expect(pii_match && pii_all.length == 1).equals(true);
        expect(pii_match.classification.classifier.name).equals('date');
        expect(pii_match.classification.score).gte(0.25);
        expect(pii_match.classification.severity).gte(0.2);
    });

    let text_multiple_pii: string = 
            `Mijn voornaam is ${first_name}, mijn achternaam is ${family_name} en mijn konijn heet ${pet_name}.`;
    let text_multiple_pii_placeholders: string = 
            'Mijn voornaam is {first_name}, mijn achternaam is {family_name} en mijn konijn heet {pet_name}.';
    let text_multiple_pii_removed: string = 
            'Mijn voornaam is , mijn achternaam is  en mijn konijn heet .';

    it('classify_multiple', ()=>{
        let result = pii_filter.classify(text_multiple_pii);
        let pii_all = result.pii();
        let pii_match_first_name = get_pii(pii_all, first_name);
        let pii_match_family_name = get_pii(pii_all, family_name);
        let pii_match_pet_name = get_pii(pii_all, pet_name);
        expect(
            pii_match_first_name != null &&
            pii_match_family_name != null &&
            pii_match_pet_name != null
        ).equals(true);
        expect(pii_match_first_name.classification.classifier.name).equals('first_name');
        expect(pii_match_family_name.classification.classifier.name).equals('family_name');
        expect(pii_match_pet_name.classification.classifier.name).equals('pet_name');
    });

    it('replace_placeholders', ()=>{
        let result = pii_filter.classify(text_multiple_pii);
        expect(result.render_placeholders()).equals(text_multiple_pii_placeholders);
    });

    it('replace_removed', ()=>{
        let result = pii_filter.classify(text_multiple_pii);
        expect(result.render_removed()).equals(text_multiple_pii_removed);
    });
});
