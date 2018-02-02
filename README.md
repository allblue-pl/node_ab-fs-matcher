# AB FS Matcher

```js
const abFSMatcher = require('ab-fs-matcher');


abFSMatcher.getPaths('**/*.txt', (err, fsPaths) => {

});

abFSMatcher.getPaths([
    '**/*.html',
    '**/js/*.js',
], (err, fsPaths) => {
    if (err) {
        console.error(`Cannot get file paths.`);
        return;
    }

    console.log(`Multiple anymatch patterns.`, )
});

abFSMatcher.getPathsPrmise('best_*.jpg')
    .then((fsPaths) => {
        console.log('Using promise:', fsPaths);
    })

```

