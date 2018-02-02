'use strict';

const 
    fs = require('fs'),
    path = require('path'),

    anymatch = require('anymatch'),
    globParent = require('glob-parent'),
    js0 = require('js0'),
    readdirp = require('readdirp'),
;


class fsMatcher_Class
{

    getPaths(anymatchPatterns, callback)
    {
        this.getPathsPromise(anymatchPatterns)
            .catch((err) => {
                callback(err, null);
            })
            .then(() => {
                callback(null, fsPaths);
            });
    }

    getPathsPromise(anymatchPatterns)
    {
        if (typeof anymatchPatterns === 'string')
            anymatchPatterns = [ anymatchPatterns ];
        else if (!Array.isArray(anymatchPatterns))
            throw new Error('`aymatch_patterns` must be a string or an array.');

        for (let i = 0; i < anymatchPatterns.length; i++) {
            if (typeof anymatchPatterns[i] !== 'string')
                throw new Error('`anymatchPatterns` must be strings.');
        }

        let fsPaths = [];

        let file_matcher_promises = [];
        for (let i = 0; i < anymatchPatterns.length; i++) {
            file_matcher_promises.push(this._addFilePaths_Promise(
                    fsPaths, anymatchPatterns[i]));
        }

        return Promise.all(file_matcher_promises)
            .then(() => {
                return fsPaths;
            });
    }

    getReadStream(anymatchPatterns)
    {
        throw new Error('Not implemented yet.');
    }


    _addFilePaths_Promise(fsPaths, anymatchPattern)
    {
        anymatchPattern = this._formatPath(anymatchPattern);

        let basePath = globParent(anymatchPattern);
        let basePath_Abs = fs.realpathSync(basePath);

        return new Promise((resolve, reject) => {
            readdirp({
                root: basePath,
                fileFilter: (entry) => {
                    let fsPath = this._fullPathToRelPath(basePath, basePath_Abs,
                            entry.fullPath);

                    return anymatch([ anymatchPattern ], fsPath);
                },
                    })
                .on('error', (err) => {
                    reject(err);
                })
                .on('data', (entry) => {
                    if (fsPaths.indexOf(entry.fullPath) === -1)
                        fsPaths.push(entry.fullPath);
                })
                .on('end', () => {
                    resolve();
                });
        });
    }


    _formatPath(fsPath)
    {
        return fsPath.replace(/\\/g, '/');
    }

    _fullPathToRelPath(basePath, basePath_Abs, fullPath)
    {
        return this._formatPath(basePath + '/' + fullPath.substring(
                basePath_Abs.length + 1));
    }

}

module.exports = new fsMatcher_Class();
