function isJavaBuiltInPackage(pkgName) {
    const mainPkgName = pkgName.split('.')[0];
    return mainPkgName == "java" || mainPkgName == "javax" || mainPkgName == "org" || mainPkgName == "com";
}

class Range {
    constructor(startOffset, endOffset) {
        this.startOffset = startOffset;
        this.endOffset = endOffset;
    }
}

module.exports = { isJavaBuiltInPackage, Range }