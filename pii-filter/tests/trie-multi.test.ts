import { TrieMulti } from '../src/trie-multi';
import { expect } from 'chai';

describe('TrieMulti_Branch', ()=>{
    it('test_get_or_create', ()=>{
        let trie_branch = new TrieMulti.Branch<boolean>();
        let branch =    trie_branch.get_or_create('a');
        let branch2 =   trie_branch.get_or_create('a');
        expect(branch).not.equals(null);
        expect(branch).instanceOf(TrieMulti.Branch);
        expect(branch).equals(branch2);
        expect(trie_branch['nodes'].size).equals(1);
    });

    it('test_has', ()=>{
        let trie_branch = new TrieMulti.Branch<boolean>();
        trie_branch.get_or_create('a');
        expect(trie_branch.has('a')).true;
    });

    it('test_get', ()=>{
        let trie_branch = new TrieMulti.Branch<boolean>();
        trie_branch.get_or_create('a');
        expect(trie_branch.get('a')).not.equals(null);
        expect(trie_branch.get('a')).is.instanceOf(TrieMulti.Branch);
        expect(trie_branch.get('a').size).equals(0);
    });

    it('test_parts', ()=>{
        let trie_branch = new TrieMulti.Branch<boolean>();
        trie_branch.get_or_create('a').get_or_create('b').get_or_create('c');
        trie_branch.get_or_create('a').get_or_create('b').get_or_create('e');
        trie_branch.get_or_create('b').get_or_create('d').get_or_create('f');
        trie_branch.get_or_create('b').get_or_create('e').get_or_create('r').get_or_create('t');
        expect(trie_branch.parts[0]).equals('abc');
        expect(trie_branch.parts[1]).equals('abe');
        expect(trie_branch.parts[2]).equals('bdf');
        expect(trie_branch.parts[3]).equals('bert');
    });
});

describe('TrieMulti', ()=>{
    it('test_insert', ()=>{
        let trie = new TrieMulti<boolean>();
        for (let w of ['hoi', 'hallo', 'waldo', 'wat'])
            trie.insert(w, true);
        expect(trie['nodes'].size).equals(2);
    });

    it('test_matched_node', ()=>{
        let trie = new TrieMulti<boolean>();
        for (let w of ['hoi', 'hallo', 'waldo', 'wat'])
            trie.insert(w, true);
        expect(trie.matched_node('hoi')).not.equals(null);
    });

    it('test_matched_node_end', ()=>{
        let trie = new TrieMulti<boolean>();
        for (let w of ['hoi', 'hallo', 'waldo', 'wat'])
            trie.insert(w, true);
        expect(trie.matched_node('hoi').end[0]).equals(true);
    });

    it('test_matches', ()=>{
        let trie = new TrieMulti<boolean>();
        for (let w of ['hoi', 'hallo', 'waldo', 'wat'])
            trie.insert(w, true);
        expect(trie.matches('hallo')).true;
        expect(trie.matches('hall', true)).true;
        expect(trie.matches('hall')).false;
        expect(trie.matches('waldo')).true;
    });

    it('test_partial_matches', ()=>{
        let trie = new TrieMulti<boolean>();
        for (let w of ['hoi', 'hallo', 'waldo', 'wat'])
            trie.insert(w, true);
        let matches = trie.partial_matches('h')
        expect(matches[0]).equals('hoi');
        expect(matches[1]).equals('hallo');
        expect(matches.length).equals(2);
    });

    it('test_make', ()=>{
        expect(()=>{
            let trie = TrieMulti.make([
                'hoi',
                'hallo',
                'hello',
                'test',
                'thee',
                'tas kaffee',
                'kat'
            ], true);
            expect(trie).not.equals(null);
            expect(trie).instanceOf(TrieMulti);
            expect(trie['nodes'].size).equals(3);
        }).to.not.throw()
    });
});