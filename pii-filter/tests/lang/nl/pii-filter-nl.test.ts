import { PIIFilter } from '../../../src/pii-filter';
import { NL } from '../../../src/lang/nl/nl';
import { expect } from 'chai';
import { get_pii } from './utils';

let pii_filter = new PIIFilter(new NL());

describe('PII_Filter_NL', ()=>{
    const first_name:       string = 'Katherina';
    const first_name2:      string = 'Bram';
    const first_name3:      string = 'Peter';
    const family_name:      string = 'Vink';
    const pet_name:         string = 'Miffy';
    const medicine_name:    string = 'Paracetamol';
    const email_address:    string = 'ruimte.station@iss.nl';
    const phone_number:     string = '06 123456 78';
    const date:             string = '01 - 01 - 1970';
    
    let test_pii = (result: PIIFilter.Result, text: string, name: string, score: number, severity: number) => {
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, text);
        let pii_match_ok: boolean = pii_match && pii_all.length == 1;
        if (!pii_match_ok)
            result.print_debug();
        expect(pii_match_ok).equals(true);
        if (pii_match.classification.classifier.name != name)
            result.print_debug();
        expect(pii_match.classification.classifier.name).equals(name);
        if (pii_match.classification.score < score)
            result.print_debug();
        expect(pii_match.classification.score).gte(score);
        if (pii_match.classification.severity < severity)
            result.print_debug();
        expect(pii_match.classification.severity).gte(severity);
    };

    it('should_classify_first_name', ()=>{
        test_pii(
            pii_filter.classify(`Hoi, ik ben ${first_name}.`),
            first_name,
            'first_name',
            0.25,
            0.1
        );
    });
    it('should_classify_first_name_2', ()=>{
        test_pii(
            pii_filter.classify(`Hoi, ik ben ${first_name2}.`),
            first_name2,
            'first_name',
            0.25,
            0.1
        );
    });
    it('should_classify_first_name_3', ()=>{
        test_pii(
            pii_filter.classify(`Hoi, ik ben ${first_name3}.`),
            first_name3,
            'first_name',
            0.25,
            0.1
        );
    });
    it('should_classify_family_name', ()=>{
        test_pii(
            pii_filter.classify(`Mijn achternaam is ${family_name}.`),
            family_name,
            'family_name',
            0.25,
            0.1
        );
    });
    it('should_classify_pet_name', ()=>{
        test_pii(
            pii_filter.classify(`Mijn konijn heet ${pet_name}.`),
            pet_name,
            'pet_name',
            0.25,
            0.1
        );
    });
    it('should_classify_medicine_name', ()=>{
        test_pii(
            pii_filter.classify(`We gebruiken veel ${medicine_name}.`),
            medicine_name,
            'medicine_name',
            0.25,
            0.2
        );
    });
    it('should_classify_email_address', ()=>{
        test_pii(
            pii_filter.classify(`Mijn email adres is ${email_address}.`),
            email_address,
            'email_address',
            0.25,
            0.2
        );
    });
    it('should_ignore_not_email_address', ()=>{
        let result = pii_filter.classify(`Mijn email adres is niet @.`);
        let pii_all = result.pii();
        let pii_match = get_pii(pii_all, '@');
        expect(!pii_match && pii_all.length == 0).equals(true);
    });
    it('should_classify_phone_number', ()=>{
        test_pii(
            pii_filter.classify(`Mijn mobiele nummer is ${phone_number}.`),
            phone_number,
            'phone_number',
            0.25,
            0.3
        );
    });
    it('should_classify_date', ()=>{
        test_pii(
            pii_filter.classify(`Mijn verjaardag is op ${date}.`),
            date,
            'date',
            0.25,
            0.2
        );
    });

    let text_multiple_pii: string = 
            `Mijn voornaam is ${first_name}, mijn achternaam is ${family_name} en mijn konijn heet ${pet_name}.`;
    let text_multiple_pii_placeholders: string = 
            'Mijn voornaam is {first_name}, mijn achternaam is {family_name} en mijn konijn heet {pet_name}.';
    let text_multiple_pii_removed: string = 
            'Mijn voornaam is , mijn achternaam is  en mijn konijn heet .';

    it('should_classify_multiple', ()=>{
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

    it('should_replace_with_placeholders', ()=>{
        let result = pii_filter.classify(text_multiple_pii);
        expect(result.render_placeholders()).equals(text_multiple_pii_placeholders);
    });

    it('should_remove', ()=>{
        let result = pii_filter.classify(text_multiple_pii);
        expect(result.render_removed()).equals(text_multiple_pii_removed);
    });

    it('should_associative_scoring_stub', ()=>{
        // TODO: create unit tests as well as testing in integration
        // baseline
        let result_1 = pii_filter.classify(`Hier, ${first_name}.`);
        let pii_all_1 = result_1.pii();
        let pii_match_1 = get_pii(pii_all_1, first_name);
        expect(pii_match_1 && pii_all_1.length == 1).equals(true);
        expect(pii_match_1.classification.classifier.name).equals('first_name');
        expect(pii_match_1.classification.score).gte(0.25);
        expect(pii_match_1.classification.severity).gte(0.05);

        let check_assoc = (
            result: PIIFilter.Result,
            names: Array<string>,
            comp_score: number,
            not: boolean = false
        ): void =>
        {
            let all: Array<PIIFilter.PII> = result.pii();
            if (all.length != names.length)
                result.print_debug();
                
            expect(all.length).equals(names.length);
            let sum_score: number = 0;
            for (let name of names)
            {
                let match: PIIFilter.PII = get_pii(all, name);
                expect(match != null).equals(true);
                
                if (match.classification.classifier.name != 'first_name')
                    result.print_debug();

                expect(match.classification.classifier.name).equals('first_name');
                sum_score += match.classification.score;
            }

            if ((!not && sum_score <= comp_score) ||
                    (not && sum_score > comp_score))
                result.print_debug();

            if (not)
                expect(sum_score).lte(comp_score);
            else
                expect(sum_score).gt(comp_score);
        };
        // left
        check_assoc(
            pii_filter.classify(`Mijn voornaam is ${first_name}.`),
            [first_name],
            pii_match_1.classification.score
        );
        // right
        check_assoc(
            pii_filter.classify(`Ja dat klopt, ${first_name} is mijn voornaam.`),
            [first_name],
            pii_match_1.classification.score
        );
        // wildcard
        check_assoc(
            pii_filter.classify(`De voornaam van mijn tante is ${first_name}.`),
            [first_name],
            pii_match_1.classification.score
        );
        // Whole phrase
        let w_phrase_res = pii_filter.classify(`Kaarten, ${first_name}, ${first_name2} en ${first_name3}.`);
        let w_phrase_score: number = 0;
        for (let pii of w_phrase_res.pii())
        {
            expect(pii.classification.classifier.name).equals('first_name');
            w_phrase_score += pii.classification.score;
        }
        check_assoc(
            pii_filter.classify(`Onze voornamen zijn ${first_name}, ${first_name2} en ${first_name3}.`),
            [first_name, first_name2, first_name3],
            w_phrase_score
        );
        // Whole phrase, but not after '.'
        check_assoc(pii_filter.classify(
            `Onze voornamen zijn oeps nee toch niet. ` +
            `Ze zijn ${first_name}, ${first_name2} en ${first_name3}.`,
        ), [first_name, first_name2, first_name3], w_phrase_score, true);
    });

    it('should_associative_scoring_pii_stub', ()=>{
        let score_1 = pii_filter.classify(`Hier, ${first_name}.`).pii()[0].classification.score;
        let score_2 = pii_filter.classify(`Hier, ${family_name}.`).pii()[0].classification.score;
        let res = pii_filter.classify(`Hier, ${first_name} ${family_name}.`).pii();
        expect(res[0].classification.classifier.name).equals('first_name');
        expect(res[1].classification.classifier.name).equals('family_name');
        let score_3 = res[0].classification.score;
        let score_4 = res[1].classification.score;
        
        expect(score_1 != null && score_2 != null && score_3 != null && score_4 != null).equals(true);
        expect(score_3 + score_4).gt(score_1 + score_2);
    });
});
