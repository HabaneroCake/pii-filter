"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trie = void 0;
/**
 * simple trie structure
 */
class Trie {
    constructor() {
        this.nodes = new Trie.Branch();
    }
    static make(words) {
        let self = new Trie();
        for (let word of words)
            self.insert(word);
        return self;
    }
    insert(word) {
        let node = this.nodes;
        for (let i = 0; i < word.length; ++i)
            node = node.get_or_create(word[i]);
        node.end = true;
    }
    matched_node(word) {
        let node = this.nodes;
        for (let i = 0; i < word.length; ++i) {
            let char = word[i];
            if (node.has(char))
                node = node.get(char);
            else
                return null;
        }
        return node;
    }
    matches(word, partial = false) {
        let node = this.matched_node(word);
        return node && (node.end || partial);
    }
    partial_matches(word) {
        let results = new Array();
        let node = this.matched_node(word);
        if (node) {
            for (let part of node.parts)
                results.push(`${word}${part}`);
        }
        return results;
    }
}
exports.Trie = Trie;
;
(function (Trie) {
    class Branch {
        constructor() {
            this.nodes = new Map();
            this._end = false;
        }
        get_or_create(key) {
            if (this.has(key)) {
                return this.get(key);
            }
            else {
                let new_branch = new Branch();
                this.nodes.set(key, new_branch);
                return new_branch;
            }
        }
        get end() { return this._end; }
        set end(end) { this._end = end; }
        has(key) { return this.nodes.has(key); }
        get(key) { return this.nodes.get(key); }
        get size() { return this.nodes.size; }
        get parts() {
            let results = new Array();
            for (let [key, value] of this.nodes)
                if (value.size > 0)
                    for (let part of value.parts)
                        results.push(`${key}${part}`);
                else
                    results.push(`${key}`);
            return results;
        }
    }
    Trie.Branch = Branch;
    ;
})(Trie = exports.Trie || (exports.Trie = {}));
;
//# sourceMappingURL=trie.js.map