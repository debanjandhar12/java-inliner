const fs = require("fs");
const { parse, BaseJavaCstVisitorWithDefaults } = require("java-parser");
const { _ } = require("lodash");

/**
 * This class contains information about the packages in given list of java files location
 */
class PackageImportTable {
    constructor(files) {
        this.tableEntries = [];

        for(let file of files) {
            this.addEntry(file);
        }
    }

    addEntry(file) {
        let javaText = fs.readFileSync(file, 'utf8');
        let cst = parse(javaText);
        let pkgName = new PackageIterator(javaText, cst).pkgName;
        let entry = {file: file, pkgName: pkgName, javaText: javaText, cst: cst};
        this.tableEntries.push(entry);
    }

    query(q) {
        return _.filter(this.tableEntries, q);
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