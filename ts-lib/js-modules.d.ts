declare module "glob-parent" {
    const globParent: (matcher: string) => string; 
    export default globParent;
}
declare module "anymatch" {
    const anymatch: (matchers: Array<string>, testString: string) => boolean;
    export default anymatch;
}