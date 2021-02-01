/**
 * Defines parsing utilities for implementing a language model.
 * 
 * @remark This is not part of the public API and should not be depended upon, except when building a language model.
 * 
 * @packageDocumentation
 */

/**
 * Simple trie structure (with array storage).
 * @private
 */
export class TrieMulti<T>
{
    /** the nodes/branches */
    private nodes: TrieMulti.Branch<T> = new TrieMulti.Branch<T>();
    
    /**
     * Makes a TrieMulti from a word-list with a certain value.
     * @param words the words to add
     * @param value the value to add for these words
     */
    public static make<T>(words: Array<string>, value: T): TrieMulti<T>
    {
        let self = new TrieMulti<T>();
        for (let word of words)
            self.insert(word, value);
        return self;
    }
    
    /**
     * Adds a word-list to this TrieMulti.
     * @param words a word-list
     * @param value the value to add for these words
     */
    public add_list(words: Array<string>, value: T)
    {
        for (let word of words)
            this.insert(word, value);
    }

    /**
     * Inserts a word into this TrieMulti.
     * @param word the word
     * @param value the value for this word
     */
    public insert(word: string, value: T): void
    {
        let node = this.nodes;
        for (let i=0; i<word.length; ++i)
            node = node.get_or_create(word[i]);
        node.make_end();
        node.end.push(value);
    }

    /**
     * Get the matched node for this word.
     * @param word the word
     */
    public matched_node(word: string): TrieMulti.Branch<T>
    {
        let node = this.nodes;
        for (let i=0; i<word.length; ++i)
        {
            let char: string = word[i];
            if (node.has(char))
                node = node.get(char);
            else
                return null;
        }
        return node;
    }

    /**
     * Check if word is matched by TrieMulti.
     * @param word the word
     * @param partial if a partial match is also accepted
     */
    public matches(word: string, partial: boolean=false): boolean
    {
        let node = this.matched_node(word);
        return (node != null) && ((node.end != null) || partial);
    }

    /**
     * Get all partial matches for a word.
     * @param word the word
     */
    public partial_matches(word: string): Array<string>
    {
        let results: Array<string> = new Array<string>();
        let node = this.matched_node(word);
        if (node)
        {
            for (let part of node.parts)
                results.push(`${word}${part}`)
        }
        return results;
    }
};

/**
 * @private
 */
export namespace TrieMulti
{
    /**
     * A branch/node for {@link TrieMulti}
     * @private
     */
    export class Branch<T>
    {
        /** the contained nodes */
        private nodes:  Map<string, Branch<T>> =   new Map<string, Branch<T>>();
        /** if this is an end-node this array is non-null and populated */
        private _end:   Array<T>;
    
        /**
         * Gets or creates a new branch/node and returns the result.
         * @param key the letter/word to get or create
         */
        public get_or_create(key: string): Branch<T>
        {
            if (this.has(key))
            {
                return this.get(key);
            }
            else
            {
                let new_branch = new Branch<T>();
                this.nodes.set(key, new_branch);
                return new_branch;
            }
        }

        /**
         * Makes the current node an end.
         */
        public make_end()
        {
            if (this._end == null)
                this._end = new Array<T>();
        }
    
        /** An ending node. */
        public get end(): Array<T>              { return this._end; }
        /** An ending node. */
        public set end(end: Array<T>)           { this._end = end; }
    
        /**
         * Whether this branch has a key.
         * @param key the key to check for
         */
        public has(key: string): boolean        { return this.nodes.has(key); }
        
        /**
         * Gets a certain branch.
         * @param key the key to get a branch for.
         */
        public get(key: string): Branch<T>      { return this.nodes.get(key); }
        
        /**
         * Gets the number of nodes this branch contains.
         */
        public get size(): number               { return this.nodes.size; }
    
        /**
         * --
         */
        public get parts(): Array<string>
        {
            let results: Array<string> = new Array<string>();
    
            for (let [key, value] of this.nodes)
                if (value.size > 0)
                    for (let part of value.parts)
                        results.push(`${key}${part}`)
                else
                    results.push(`${key}`)
            
            return results;
        }
    };
};