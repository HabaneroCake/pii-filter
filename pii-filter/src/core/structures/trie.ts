/**
 * simple trie structure
 */
export class Trie<T>
{
    private nodes: Trie.Branch<T> = new Trie.Branch<T>();
    
    public static make<T>(words: Array<string>, value: T): Trie<T>
    {
        let self = new Trie<T>();
        for (let word of words)
            self.insert(word, value);
        return self;
    }

    public add_list(words: Array<string>, value: T)
    {
        for (let word of words)
            this.insert(word, value);
    }

    public insert(word: string, value: T): void
    {
        let node = this.nodes;
        for (let i=0; i<word.length; ++i)
            node = node.get_or_create(word[i]);

        node.end = value;
    }

    public matched_node(word: string): Trie.Branch<T>
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

    public matches(word: string, partial: boolean=false): boolean
    {
        let node = this.matched_node(word);
        return (node != null) && ((node.end != null) || partial);
    }

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

export namespace Trie
{
    export class Branch<T>
    {
        private nodes:  Map<string, Branch<T>> =   new Map<string, Branch<T>>();
        private _end:   T;
    
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
    
        public get end(): T                     { return this._end; }
        public set end(end: T)                  { this._end = end; }
    
        public has(key: string): boolean        { return this.nodes.has(key); }
        public get(key: string): Branch<T>      { return this.nodes.get(key); }
        
        public get size(): number               { return this.nodes.size; }
    
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