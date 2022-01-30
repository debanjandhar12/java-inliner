const fs = require("fs");
const { PackageImportTable } = require("./PackageImportTable");
const { InputFileIterator } = require("./InputFileIterator");
const { PackageFileIterator } = require("./PackageFileIterator");
const { parse } = require("java-parser");

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
        let packageInlined = new Map();
        while(toInlinePackages.length > 0) {
            let pkgName = toInlinePackages.pop();
            let pkgImportTableEntrys = pkgImportTable.query({pkgName: pkgName});
            if(pkgImportTableEntrys.length == 0) throw new Error(`Entries for package ${pkgName} not found in the PackageImportTable`);
            if(packageInlined.get(pkgName)) continue;   // The package has already been inlined

            for(let pkgImportTableEntry of pkgImportTableEntrys) {
                let pkgCst = pkgImportTableEntry.cst;
                let pkgJavaText = pkgImportTableEntry.javaText;
                let packageFileIteratorOutput = new PackageFileIterator(pkgJavaText, pkgCst).getOutput();
                toInlinePackages = toInlinePackages.concat(packageFileIteratorOutput.toInlinePackages);
                codeToPrepend = codeToPrepend.concat(packageFileIteratorOutput.codeToPrepend);
                codeToAppend = codeToAppend.concat(packageFileIteratorOutput.codeToAppend);    
                console.log(packageFileIteratorOutput);
            }

            packageInlined.set(pkgName, true);
        }

        // Generate and Return Output Code
        let outputCode = "";
        outputCode += codeToPrepend.join("\n");
        outputCode += "\n";
        outputCode += codeToAppend.join("\n");
        return outputCode;
    }
}

module.exports = { SolutionGenerator }