
import dataset from './dataset.json';
import { Trie } from './trie';

// redo trie (array etc)
// how to integrate assoc
// how to add severity mappings
// write tests
// write benchmark tests
// more pii

export class PIIFilter
{
    private static readonly initialized:    boolean = PIIFilter.init();
    private static association_trie:        Trie<[string, number]>;
    private static main_trie:               Trie<string>;
    private static severity_mapping:        Array<{pii: string[], severity: number}>;
    private static segment_classifiers:     Map<string, PIIFilter.SegmentClassifier>;

    private static init_build_lexicon(word_lists: any, verbosity: number=0): boolean
    {
        PIIFilter.association_trie =    new Trie();
        PIIFilter.main_trie =           new Trie();
        for (const key in word_lists)
        {
            if ('association_multipliers' in dataset['wordlists'][key] &&
                dataset['wordlists'][key]['association_multipliers'].length > 0)
            {
                for (const [word, multiplier] of dataset['wordlists'][key]['association_multipliers'])
                    PIIFilter.association_trie.insert(word, [key, multiplier]);
            }
            if ('main' in dataset['wordlists'][key] && dataset['wordlists'][key]['main'].length > 0)
                PIIFilter.main_trie.add_list(word_lists[key]['main'], key)
        }
        return true;
    }


    private static init_severity_mapping(severity_mapping: Array<{pii: string[], severity: number}>,
                                         verbosity: number=0): boolean
    {
        if (verbosity > 0)
        {
            console.log('Initializing severity mapping.');
        }
        // only assigning for now
        PIIFilter.severity_mapping = severity_mapping;
        return true;
    }
    private static init(verbosity: number=1): boolean
    {
        if (verbosity > 0)
        {
            console.log(`Initializing PII Filter.`);
            console.log(`Dataset name: ${dataset['name']}.`);
            console.log(`Dataset version: ${dataset['version']}.`);
        }
        // console.log(dataset);
        
        let lexicon_ok: boolean =           PIIFilter.init_build_lexicon(dataset['wordlists'], verbosity);
        if (verbosity > 0)
            console.log(`lexicon ${lexicon_ok ? 'ok': 'failed'}`);
        
        let severity_mapping_ok: boolean =  PIIFilter.init_severity_mapping(dataset['severity_mapping'], verbosity);
        if (verbosity > 0)
            console.log(`severity_mapping ${severity_mapping_ok ? 'ok': 'failed'}`);
        
        return true;
    }

    public static classify(text: string): Array<Array<string>> // todo result type
    {
        /*
        result needs to include:
        total severity score,
        score for each segment
        tagged words
        */
        // have a context type with all necessary info (also full phrase and possibly rest of text)

        // build return type / classified types

        // parse text, split by period etc. and others into phrases
        // for each phrase
        //  (first pass for assoc mults then for pii detection)
        //  create cursor / context (add assoc data on second pass)
        //  construct phrase return type
        //  while cursor is not at end
        //      for each classifier:
        //       copy cursor
        //       classify, add classification score and cursor to list
        //      select max classification, use cursor
        //  add phrase return type to return
        // return all


        return null;
    }
};

export namespace PIIFilter
{
    export namespace Classification
    {
        export class Context
        {
            private static initialized:         boolean =   Context.init();
            private static text_split_regex:    RegExp;
            private static phrase_split_regex:  RegExp;

            // TODO

            private phrases:                    Array<string>;
            private _active_phrase_index:       number =    0;
            private phrase_segments:            Array<string>;

            private static init(): boolean
            {
                Context.text_split_regex = new RegExp('\\.');
                Context.text_split_regex.compile();
                Context.phrase_split_regex = new RegExp('\\ ');
                Context.phrase_split_regex.compile();
                return true;
            }

            constructor(public readonly text: string)
            {
                this.phrases = text.split(Context.text_split_regex);
                this.active_phrase_index = 0;
            }

            public set active_phrase_index(_active_phrase_index: number)
            {
                this._active_phrase_index =     _active_phrase_index;
                this.phrase_segments =          this.phrases[
                                                    this._active_phrase_index
                                                ].split(Context.phrase_split_regex);
            }

            public get active_phrase_index(): number
            {
                return this._active_phrase_index;
            }

            public make_cursor_for_phrase(): Cursor
            {
                return new Cursor(this.phrase_segments);
            }

            public get current_phrase(): string
            {
                return this.phrases[this._active_phrase_index];
            }
            // phrase
            // results_so_far
        };
        export class Cursor
        {
            constructor(phrase: Array<string>)
            {

            }
            // needs copy()
            // needs a distance_to(x) null(not found)/number(distance)
        };
        export class Result
        {
            constructor(
                public readonly confidence: number,
                public readonly cursor:     Classification.Cursor
            ) {}
        };
    }
    //-------
    export interface IClassifier
    {
        classify(context: Classification.Context, cursor: Classification.Cursor): Classification.Result;
    };
    export abstract class SegmentClassifier implements IClassifier
    {
        protected _pii_associative_multipliers: Array<[string, number]>;

        public set pii_associative_multipliers(_pii_associative_multipliers: Array<[string, number]>)
        { this._pii_associative_multipliers = _pii_associative_multipliers; }

        public classify;
    };

    // TRIE should be sep. out.

    export class WordClassifier extends SegmentClassifier
    {
        constructor()
        {
            super();
        }

        // classify todo
    };
};

// TODO:
// add test text
// convert test texts
// generate tests
// build tests
// attempt to complete tests
// what coverage should succeed? or is integration testing a separate from benchmark?