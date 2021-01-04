import dataset from './dataset.json';
import { Trie } from './trie';
import { Parsing } from './parsing';
// redo trie (array etc)
// how to integrate assoc
// how to add severity mappings
// write tests
// write benchmark tests
// more pii

class Something extends Parsing.Classifier
{
    public init(dataset: object) {}
    public classify(Token): Parsing.ClassificationScore
    {
        return null;
    }
    public name: string = 'Something';
};

export class PIIFilter
{
    private static readonly verbosity:      number =                    2;
    private static classifiers:             Array<Parsing.Classifier> = [
        new Something()
    ];

    private static association_trie:        Trie<[Parsing.Classifier, number]>;
    private static main_trie:               Trie<Parsing.Classifier>;
    private static severity_mapping:        Array<{pii: Parsing.Classifier[], severity: number}>;
    private static readonly initialized:    boolean = PIIFilter.init();
    // private static segment_classifiers:     Map<Parsing.Classifier, PIIFilter.SegmentClassifier>;

    private static init(): boolean
    {
        if (PIIFilter.verbosity > 0) console.log(`Initializing PII Filter.`);
        PIIFilter.association_trie =    new Trie();
        PIIFilter.main_trie =           new Trie();

        
        if (PIIFilter.verbosity > 0) console.log(`Parsing dataset: ${dataset['name']}, version: ${dataset['version']}.`);
        if (PIIFilter.verbosity > 0) console.log(`Passing dataset to classifiers.`);
        for (let classifier of PIIFilter.classifiers)
        {
            classifier.init(dataset);
            dataset['wordlists']
            // if ( classifier.name)
        }

        if (PIIFilter.verbosity > 0) console.log(`Parsing wordlists.`);
        for (const key in dataset['wordlists'])
        {
            if (PIIFilter.verbosity > 1) console.log(`Parsing ${key}.`);

            // verb > 1

            if ('association_multipliers' in dataset['wordlists'][key] &&
                dataset['wordlists'][key]['association_multipliers'].length > 0)
            {
                for (const [word, multiplier] of dataset['wordlists'][key]['association_multipliers'])
                    PIIFilter.association_trie.insert(word, [key, multiplier]);
            }
            if ('main' in dataset['wordlists'][key] && dataset['wordlists'][key]['main'].length > 0)
                PIIFilter.main_trie.add_list(dataset['wordlists'][key]['main'], key)
        }
        

        if (PIIFilter.verbosity > 0) console.log('Parsings severity mapping.');
        // only assigning for now
        PIIFilter.severity_mapping = dataset['severity_mapping'];

        return true;
    }

    /**
     * 
     * @param pii list of filter names to use (null = all)
     */
    constructor(
        pii: Array<string> =    null
    )
    {
        
    }

    public classify(text: string)
    {
        
        let tokenizer = new Tokenizer(text);
        // let all_text = new PIIFilter.Parsing.Context(text);
        for (let token of tokenizer.tokens)
        {

        }
    }
};

/**
 * include piifilter
 * 
 * let something_filter = new pii_filter({settings})
 * 
 * process_input(text: string)
 * {
 *  let result =    something_filter.classify(text)
 *  let new_text =  result.replace_pii_with_placeholders(threshold=0.5)
 * }
 */

// export namespace PIIFilter
// {
//     export namespace Parsing
//     {
//         export class Context
//         {
//             private static initialized:         boolean =   Context.init();
//             private static text_split_regex:    RegExp;
//             private static init(): boolean
//             {
//                 Context.text_split_regex = new RegExp(/(\.|\!|\?|\;)/g);
//                 Context.text_split_regex.compile();
//                 return true;
//             }
//             public phrases:                     Array<Context.Phrase>;
//             constructor(public readonly text: string)
//             {
//                 this.phrases = new Array<Context.Phrase>();
//                 for (let phrase of text.split(Context.text_split_regex))
//                     this.phrases.push(new Context.Phrase(phrase));
//             }
//             *[Symbol.iterator](): IterableIterator<Context.Phrase>
//             {
//                 for (let phrase of this.phrases)
//                     yield phrase;
//             }
//         };
//         export namespace Context
//         {
//             export class Phrase
//             {
//                 // associative vars
//                 // pii vars
//                 // TODO
//                 private phrase_segments: Array<string>;
//                 constructor(public readonly text: string)
//                 {
//                     this.phrase_segments = text.split(' ');
//                 }

//                 get cursor(): Cursor
//                 {
//                     return new Cursor(this.phrase_segments);
//                 }
                
//                 *[Symbol.iterator](): IterableIterator<Cursor>
//                 {
//                     for (let segment of this.phrase_segments)
//                         yield segment;
//                 }
//                 // next_phrase?
//             };
//         };
//         export class Cursor
//         {
//             private _index:     number =    0;
//             private _length:    number =    0;
//             constructor(public readonly segments: Array<string>)
//             {
//                 this._length = segments.length;
//             }
//             set index(_index: number)
//             {
//                 if (_index >= this._length || _index < 0)
//                     throw new RangeError('Index out of range.');
//                 this._index = _index;
//             }
//             get index(): number
//             {
//                 return this._index;
//             }
//             get length(): number
//             {
//                 return this._length;
//             }
//             get current_word(): string
//             {
//                 return this.segments[this.index];
//             }
//             // distance_to(x) null(not found)/number(distance)
//             public distance_to(word: string): number
//             {
//                 return null;
//             }
//             // needs copy()
//         };
//         export class Result
//         {
//             constructor(
//                 public readonly confidence: number,
//                 public readonly cursor:     Parsing.Cursor
//                 // how does tagging work here?
//             ) {}
//         };
//         // TODO total result type?
//     }
//     //-------
//     export interface IClassifier
//     {
//         classify(context: Parsing.Context, cursor: Parsing.Cursor): Parsing.Result;
//     };
//     export abstract class SegmentClassifier implements IClassifier
//     {
//         protected _pii_associative_multipliers: Array<[string, number]>;

//         public set pii_associative_multipliers(_pii_associative_multipliers: Array<[string, number]>)
//         { this._pii_associative_multipliers = _pii_associative_multipliers; }

//         public classify;
//     };

//     // TRIE should be sep. out.

//     export class WordClassifier extends SegmentClassifier
//     {
//         constructor()
//         {
//             super();
//         }

//         // classify todo
//     };
// };

// TODO:
// add test text
// convert test texts
// generate tests
// build tests
// attempt to complete tests
// what coverage should succeed? or is integration testing a separate from benchmark?