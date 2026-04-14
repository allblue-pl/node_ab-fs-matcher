import fs from "node:fs";
import path from "node:path";

import anymatch from "anymatch";
import globParent from "glob-parent";
import readdirp from "readdirp";


export default class fsMatcher_Class {
    getPaths(anymatchPatterns: Array<string>, callback: (error: Error|null, 
            fsPaths: Array<string>) => void): void {
        (async () => {
            try {
                callback(null, await this.getPaths_Async(anymatchPatterns));
            } catch (err: any) {
                callback(err, []);   
            }
        })();
    }

    async getPaths_Async(anymatchPatterns: Array<string>): Promise<Array<string>> {
        for (let i = 0; i < anymatchPatterns.length; i++) {
            if (typeof anymatchPatterns[i] !== 'string')
                throw new Error('`anymatchPatterns` must be strings.');
        }

        let fsPaths: Array<string> = [];

        let fileMatcherPromises = [];
        for (let i = 0; i < anymatchPatterns.length; i++) {
            fileMatcherPromises.push(this.#addFilePaths_Async(
                    fsPaths,anymatchPatterns[i]));
        }

        return Promise.all(fileMatcherPromises)
            .then(() => {
                return fsPaths;
            });
    }

    getReadStream(anymatchPatterns: Array<string>) {
        throw new Error('Not implemented yet.');
    }


    async #addFilePaths_Async(fsPaths: Array<string>,
             anymatchPattern: string): Promise<void> {
        anymatchPattern = this.#formatPath(anymatchPattern);

        let basePath = globParent(anymatchPattern);
        let basePath_Abs = fs.realpathSync(basePath);

        return new Promise((resolve, reject) => {
            readdirp(basePath, {
                    fileFilter: (entry) => {
                        let fsPath = this.#fullPathToRelPath(basePath, basePath_Abs,
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

    #formatPath(fsPath: string) {
        return fsPath.replace(/\\/g, '/');
    }

    #fullPathToRelPath(basePath: string, basePath_Abs: string, fullPath: string) {
        return this.#formatPath(basePath + '/' + fullPath.substring(
                basePath_Abs.length + 1));
    }

}

module.exports = new fsMatcher_Class();
