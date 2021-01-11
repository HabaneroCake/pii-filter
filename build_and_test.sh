#!/bin/bash

python3 ./dataset/generate_dataset.py;
cd pii-filter;
npm run compile;
npm run test;