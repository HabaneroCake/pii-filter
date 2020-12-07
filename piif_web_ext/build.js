const browserify = require('browserify');
const tsify = require('tsify');
const fs = require('fs');

browserify()
    .add('src/service.ts')
    .plugin(tsify, { noImplicitAny: true })
    .bundle()
    .on('error', error => {
        console.error(error.toString());
    })
    .pipe(fs.createWriteStream('./build/service.js'));

browserify()
    .add('src/client.ts')
    .plugin(tsify, { noImplicitAny: true })
    .bundle()
    .on('error', error => {
        console.error(error.toString());
    })
    .pipe(fs.createWriteStream('./build/client.js'));
