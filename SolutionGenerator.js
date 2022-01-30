const fs = require("fs");
const { PackageImportTable } = require("./PackageImportTable");
const { InputFileIterator } = require("./InputFileIterator");
const { PackageFileIterator } = require("./PackageFileIterator");
const { parse } = require("java-parser");
const { _ } = require("lodash");
/**
 * This class takes a main input java file and a list of java package files used by the input file
*/
class SolutionGenerator {
    constructor(inputFile, pkgFiles) {
        this.inputFile = inputFile;
        this.pkgFiles = pkgFiles;
    }

    generateSolution() {
        let pkgImportTable = new PackageImportTable(this.pkgFiles);
        let toInlinePackages = [];   // This is a list of packages that need to be inlined before generating final output
        let codeToPrepend = []; // List of system import statements to prepend to the output file
        let codeToAppend = []; // This is a list of code that needs to be appended to the output file

        // Iterate through the input file
        let javaText = fs.readFileSync(this.inputFile, 'utf8');
        let inputFileCst = parse(javaText);
        let inputFileIteratorOutput = new InputFileIterator(javaText, inputFileCst).getOutput();
        toInlinePackages = toInlinePackages.concat(inputFileIteratorOutput.toInlinePackages);
        codeToPrepend = codeToPrepend.concat(inputFileIteratorOutput.codeToPrepend);
        codeToAppend = codeToAppend.concat(inputFileIteratorOutput.codeToAppend);
        
        console.log(inputFileIteratorOutput);

        // Iterate through the toInlinePackages array and inline the packages
        while(toInlinePackages.length > 0) {
            let pkgNameWithClass = toInlinePackages.pop();
            let pkgImportTableEntrys = pkgImportTable.getPackageEntries(pkgNameWithClass);
            if(pkgImportTableEntrys.length == 0) throw new Error(`Entries for package class ${pkgNameWithClass} not found in the PackageImportTable`);

            for(let pkgImportTableEntry of pkgImportTableEntrys) {
                if(packageFileInlined.get(pkgImportTableEntry.file)) continue;   // The package file has already been inlined
                let pkgCst = pkgImportTableEntry.cst;
                let pkgJavaText = pkgImportTableEntry.javaText;
                let packageFileIteratorOutput = new PackageFileIterator(pkgJavaText, pkgCst).getOutput();
                toInlinePackages = toInlinePackages.concat(packageFileIteratorOutput.toInlinePackages);
                codeToPrepend = codeToPrepend.concat(packageFileIteratorOutput.codeToPrepend);
                codeToAppend = codeToAppend.concat(packageFileIteratorOutput.codeToAppend);    
                console.log(packageFileIteratorOutput);
                packageFileInlined.set(pkgImportTableEntry.file, true);
            }
        }

        // Generate and Return Output Code
        let outputCode = "";
        codeToPrepend = _.uniq(codeToPrepend);
        outputCode += codeToPrepend.join("\n");
        outputCode += "\n";
        outputCode += codeToAppend.join("\n");
        return outputCode;
    }
}

module.exports = { SolutionGenerator }