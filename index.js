const { promises: fs } = require("fs");
const { parse } = require("java-parser");
const { PackageImportTable } = require("./PackageImportTable");
const { SolutionGenerator } = require("./SolutionGenerator");

async function inline_file(file) {
    let javaText = await fs.readFile(file, 'utf8');
    
    const cst = parse(javaText);
    
    const {
      BaseJavaCstVisitorWithDefaults
    } = require("java-parser");
    
    // Use "BaseJavaCstVisitor" if you need to implement all the visitor methods yourself.
    class LambdaArrowsPositionCollector extends BaseJavaCstVisitorWithDefaults {
      constructor() {
        super();
        this.customResult = [];
        this.validateVisitor();
      }

      importDeclaration(ctx) {
        let pkg = ctx.packageOrTypeName[0];

        // Get import package name excluding the class Name
        let pkgName = javaText.substring(pkg.location.startOffset, pkg.location.endOffset+1);
        pkgName = pkgName.split('.');
        pkgName.pop();
        pkgName = pkgName.join('.');

        this.customResult.push(pkgName);
        // console.log(ctx);
      }

      classModifier(ctx) {
        // console.log(ctx);
      }
    }
    
    const lambdaArrowsCollector = new LambdaArrowsPositionCollector();
    lambdaArrowsCollector.visit(cst);
}

// inline_file("./test/test1/libs/InputReader.java");

// let a = new PackageImportTable(["./test/test1/libs/InputReader.java"]);
// console.log(a.query({pkgName: "libs"}));

// let s = new SolutionGenerator("./test/test1/HelloWorld.java", ["./test/test1/libs/InputReader.java"]);
// console.log(s.generateSolution());

let s = new SolutionGenerator("./test/test2/Main.java", ["./test/test2/libs/Bank.java", "./test/test2/libs/SBI.java"]);
console.log(s.generateSolution());