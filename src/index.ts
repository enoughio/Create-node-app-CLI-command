#!/usr/bin/env node

import fs from "fs";
import inquirer from "inquirer";

// const projectName = process.argv[2];

// if (!projectName) {
//   console.log("❌ Please provide a project name");
//   console.log("Usage: create-node-stack <project-name>");
//   process.exit(1);
// }

// const projectPath = `./${projectName}`;
// if (fs.existsSync(projectPath)) {
//   console.log("❌ Folder already exists");
//   process.exit(1);
// }

// fs.mkdirSync(projectPath)
// console.log("📁 Project folder created:", projectName);

// // package.json file creation
// const packageJson = {
//   name: projectName,
//   version: "0.0.1",
//   private: true,
//   scripts: {
//     dev: "node src/index.js",
//     start: "node src/index.js"
//   }
// };

// fs.writeFileSync(
//   `${projectPath}/package.json`,
//   JSON.stringify(packageJson,null,2)
// )
// console.log("📦 package.json created");

async function main() {
  const projectName = process.argv[2];

  if (!projectName) {
    console.log("❌ Please provide a project name");
    process.exit(1);
  }

  const projectPath = `./${projectName}`;

  if (fs.existsSync(projectPath)) {
    console.log("❌ Folder already exists");
    process.exit(1);
  }

  // create project filder
  fs.mkdirSync(projectPath);
  console.log("📁 Project folder created:", projectName);


  // ask for programing lenguage
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which language do you want to use?",
      choices: ["TypeScript", "JavaScript"]
    },
  ]);


  const isTS = language == "TypeScript";
  const ext = isTS ? "ts" : "js";


  // content of the project's package.json file
  const packageJson = {
    name: projectName,
    version: "0.0.1",
    private: true,
    scripts: isTS
      ? { dev: "ts-node src/index.ts" }
      : { dev: "node src/index.js" },
  };

  // create the packege.json file and insert the content into it
  fs.writeFileSync(
    `${projectPath}/package.json`,
    JSON.stringify(packageJson, null, 2),
  );

  // create src folder
  // fs.mkdirSync(`${projectPath}/src`)

  //create and write content inside index file (under src folder) for the project
  const indexFileContent = `console.log('hello form ${projectName}')`;
  fs.writeFileSync(`./${projectName}/src/index.${ext}`, indexFileContent);

  console.log("You chose:", language);
}

main();
