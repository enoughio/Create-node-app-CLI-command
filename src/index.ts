#!/usr/bin/env node

import fs from "fs";
import inquirer from "inquirer";
import { execSync } from "child_process";

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

  // optimize the flow leter
  // create project filder
  fs.mkdirSync(projectPath);
  console.log("📁 Project folder created:", projectName);

  // ask for programing lenguage
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which language do you want to use?",
      choices: ["TypeScript", "JavaScript"],
    },
  ]);

  const { useExpress } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useExpress",
      message: "Do you want to use express",
      default: true,
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
      ? {
          build: "tsc",
          start: "node dist/index.ts",
        }
      : { start: "node src/index.js" },
  };

  // create the packege.json file and insert the content into it
  fs.writeFileSync(
    `${projectPath}/package.json`,
    JSON.stringify(packageJson, null, 2),
  );

  
      // create src folder
      const srcPath = `${projectPath}/src`;
      fs.mkdirSync(srcPath, {
          recursive: true,
      });
  
  
      if (useExpress) {
          const folders = [
              "controllers",
              "helpers",
              "public",
              "config",
              "routes",
              "middelwares",
              "services"
          ]
  
          folders.forEach((folder) => {
              fs.mkdirSync(`${projectPath}/src/${folder}`)
          })
      }
  
  
      //content for index file
      let indexFileContent = "";
      if (useExpress) {
          indexFileContent = isTS
              ? `
        import express from "express";
        import router from "./routes";
  
        const app = express();
        const PORT = 3000;
  
        app.use(express.json)
          app.use("/", router);
  
        app.listen(PORT, () => {
          console.log(\`Server running on http://localhost:\${PORT}\`);
        });
        `.trim()
              : `
        import express from "express";
        import router from "./routes";

        const app = express();
        const PORT = 3000;
  
        app.use(express.json());
        app.use("/", router);
  
  
        app.listen(PORT, () => {
          console.log(\`Server running on http://localhost:\${PORT}\`);
        });
        `.trim();
      }
      else {
          indexFileContent = `console.log("hello from ${projectName}")`;
      }
  
      fs.writeFileSync(`./${projectName}/src/index.${ext}`, indexFileContent);
  
  
      // content of main route file
      const routerContent = `
          import { Router } from "express";
          import { healthCheck } from "../controllers/health.controller";
  
          const router = Router();
  
          router.get("/", healthCheck);
  
          export default router;`
  
      const controllerContent = isTS ? `
          import { Request, Response } from "express";
  
          export const healthCheck = (_req: Request, res: Response) => {
          res.json({ status: "ok" });
          };
          ` : 
          `exports.healthCheck = (req, res) => {
              res.json({ status: "ok" });
          };
          `
      
  fs.writeFileSync(`./${projectName}/src/routes/index.${ext}`, routerContent);
  fs.writeFileSync(`./${projectName}/src/controllers/health.controller.${ext}`, controllerContent);



  // ----- dependecny installations section -----------

  console.log("📦 Installing dependencies...");

  if (isTS) {
    let deps = " typescript @types/node ";

    if (useExpress) {
      deps += " express @types/express ";
    }

    // execSync is used to execute terminal commands
    execSync(`npm install ${deps}`, {
      cwd: projectPath,
      stdio: "inherit",
    });
  } else {
    let deps = useExpress ? "express" : "";

    execSync(`npm install ${deps}`, {
      cwd: projectPath,
      stdio: "inherit",
    });
  }

  console.log("✅ Dependencies installed");

  // ----- dependecny installations section -----------

  if (isTS) {
    const tsConfig = {
      compilerOptions: {
        // target : "ES2020"
        module: "nodenext",
        target: "esnext",
        types: ["node"],
        rootDir: "src",
        outDir: "dist",
        strict: true,
      },
    };

    fs.writeFileSync(
      `${projectPath}/tsconfig.json`,
      JSON.stringify(tsConfig, null, 2),
    );

    console.log("🛠 tsconfig.json created");
  }

  console.log("Project Created 🔥");
}

main();
