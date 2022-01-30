const { parse, BaseJavaCstVisitorWithDefaults } = require("java-parser");
const { isJavaBuiltInPackage, Range } = require("./utils");

class InputFileIterator extends BaseJavaCstVisitorWithDefaults {
    constructor(javaText, cst) {
      super();
      this.javaText = javaText;
      this.cst = cst;

      // Iterate the cst and store information collected
      this.toInlinePackages = [];
      this.codeToPrepend = [];
      this.codeToAppend = [];
      this.rangesToRemove = []; // This is a list of ranges that need to be removed to generate codeToAppend from the input file
      this.visit(this.cst);
      this.validateVisitor();

      this.codeToAppend.push(this.generateAppendCode()); // Generate Append Code from Iteration Result
    }

    importDeclaration(ctx) {
      // Get import package name including the class Name
      let pkgNameWithClass = this.javaText.substring(ctx.packageOrTypeName[0].location.startOffset, ctx.Semicolon[0].endOffset);

      // Decide what to do with the package
      if(isJavaBuiltInPackage(pkgNameWithClass)) {
        let importStatement = this.javaText.substring(ctx.Import[0].startOffset, ctx.Semicolon[0].endOffset+1);
        this.codeToPrepend.push(importStatement);
      } else {
        this.toInlinePackages.push(pkgNameWithClass);
      }

      this.rangesToRemove.push(new Range(ctx.Import[0].startOffset, ctx.Semicolon[0].endOffset+1));
      super.classMemberDeclaration(ctx);
    }

    generateAppendCode() {
      let appendCode = this.javaText;

      // -- Remove the ranges in rangesToRemove Array --
      // Sort Ranges in assending order
      this.rangesToRemove.sort((a, b) => {
        return a.startOffset - b.startOffset;
      });

      // Ensure there is no overlapping ranges
      for(let i = 0; i < this.rangesToRemove.length-1; i++) {
        let currRange = this.rangesToRemove[i];
        let nextRange = this.rangesToRemove[i+1];
        if(currRange.endOffset > nextRange.startOffset) {
          throw new Error("Overlapping ranges to remove detected!");
        }
      }

      // Remove Ranges in reverse order
      for(let i = this.rangesToRemove.length-1; i >= 0; i--) {
        let range = this.rangesToRemove[i];
        appendCode = appendCode.substring(0, range.startOffset) + appendCode.substring(range.endOffset, appendCode.length);
      }

      return appendCode.trim();
    }

    getOutput() {
      return {toInlinePackages: this.toInlinePackages, codeToPrepend: this.codeToPrepend, codeToAppend: this.codeToAppend};
    }
}

module.exports = { InputFileIterator }