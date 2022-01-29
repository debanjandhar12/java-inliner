const fs = require("fs");
const { parse, BaseJavaCstVisitorWithDefaults } = require("java-parser");

/**
 * This class contains information about the packages in given list of java files location
 */
class PackageImportTable {
    constructor(files) {
        this.tableEntriesByPkgName = new Map();

        for(let file of files) {
            this.addEntryForFile(file);
        }
    }

    addEntryForFile(file) {
        let javaText = fs.readFileSync(file, 'utf8');
        let cst = parse(javaText);
        let pkgName = new PackageIterator(javaText, cst).pkgName;
        this.tableEntriesByPkgName.set(pkgName, {javaText: javaText, cst: cst, file: file});
    }

    editEntryByPkgName(pkgName, obj) {
        let entry = this.tableEntriesByPkgName.get(pkgName);
        if(entry) {
            Object.assign(entry, obj); // Modifies only the properties that are provided while retaining the rest
        }
    }

    getEntryByPkgName(pkgName) {
        return this.tableEntriesByPkgName.get(pkgName);
    }
}

// This iterates a java file's text cst and get the package name of it.
class PackageIterator extends BaseJavaCstVisitorWithDefaults {
    constructor(javaText, cst) {
        super();
        this.pkgName = null;
        this.javaText = javaText;
        this.cst = cst;
        this.visit(this.cst);
        this.validateVisitor();
      }

      packageDeclaration(ctx) {
        this.pkgName = this.javaText.substring(ctx.Identifier[0].startOffset, ctx.Identifier[ctx.Identifier.length-1].endOffset+1);
      }
}

module.exports = { PackageImportTable }