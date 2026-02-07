#!/usr/bin/env node

import fs from 'fs'



const projectName = process.argv[2];

if (!projectName) {
  console.log("❌ Please provide a project name");
  console.log("Usage: create-node-stack <project-name>");
  process.exit(1);
}

const projectPath = `./${projectName}`;
if (fs.existsSync(projectPath)) { 
  console.log("❌ Folder already exists");
  process.exit(1);
}

fs.mkdirSync(projectPath)
console.log("📁 Project folder created:", projectName);

// package.json file creation
const packageJson = {
  name: projectName,
  version: "0.0.1",
  private: true,
  scripts: {
    dev: "node src/index.js",
    start: "node src/index.js"
  }
};


fs.writeFileSync(
  `${projectPath}/package.json`,
  JSON.stringify(packageJson,null,2)

)
console.log("📦 package.json created");
