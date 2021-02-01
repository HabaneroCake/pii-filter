#!/bin/bash

echo 'Generating datasets.';
python3 ./dataset/generate_dataset.py;

cd pii-filter;
echo 'Building pii-filter.';
npm run compile;

echo 'Testing pii-filter.';
npm run test;

echo 'Building documentation.';
npx typedoc --out '../docs' \
    'src/pii-filter.ts' \
    'src/core/parsing.ts' \
    'src/core/interfaces.ts' \
    'src/core/structures/trie.ts';

cd ../;