'use strict';

const path = require('path');

const anymatch = require('anymatch');
const globParent = require('glob-parent');
const readdirp = require('readdirp');


class fsMatcher_Class
{

    getPaths(anymatch_patterns, callback)
    { let self = this;
        if (typeof anymatch_patterns === 'string')
            anymatch_patterns = [ anymatch_patterns ];
        else if (!Array.isArray(anymatch_patterns))
            throw new Error('`aymatch_patterns` must be a string or an array.');

        for (let i = 0; i < anymatch_patterns.length; i++) {
            if (typeof anymatch_patterns[i] !== 'string')
                throw new Error('`anymatch_patterns` must be strings.');
        }

        let fs_paths = [];

        let file_matcher_promises = [];
        for (let i = 0; i < anymatch_patterns.length; i++) {
            file_matcher_promises.push(self._addFilePaths_Promise(
                    fs_paths, anymatch_patterns[i]));
        }

        Promise.all(file_matcher_promises)
            .catch((err) => {
                callback(err, null);
            })
            .then(() => {
                callback(null, fs_paths);
            });
    }


    _addFilePaths_Promise(fs_paths, anymatch_pattern)
    { let self = this;
        anymatch_pattern = self._formatPath(anymatch_pattern);

        let base_path = globParent(anymatch_pattern);
        let base_path_abs = path.resolve(base_path);

        return new Promise((resolve, reject) => {
            readdirp({
                root: base_path,
                fileFilter: (entry) => {
                    let fs_path = self._fullPathToRelPath(base_path, base_path_abs,
                            entry.fullPath);

                    return anymatch([ anymatch_pattern ], fs_path);
                },
                    })
                .on('error', (err) => {
                    reject(err);
                })
                .on('data', (entry) => {
                    if (fs_paths.indexOf(entry.fullPath) === -1)
                        fs_paths.push(entry.fullPath);
                })
                .on('end', () => {
                    resolve();
                });
        });
    }


    _formatPath(fs_path)
    { let self = this;
        return fs_path.replace(/\\/, '/');
    }

    _fullPathToRelPath(base_path, base_path_abs, full_path)
    { let self = this;
        return self._formatPath(base_path + '/' + full_path.substring(
                base_path_abs.length + 1));
    }

}

module.exports = new fsMatcher_Class();
