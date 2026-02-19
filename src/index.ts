#!/usr/bin/env node

import fs from "fs";
import inquirer from "inquirer";
import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";

// import chalk from "chalk";

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
  // create project folder
  fs.mkdirSync(projectPath);
  console.log(chalk.cyan("📁 Creating Project ", projectName));
  console.log(chalk.green("✔ Project folder created"));

  // ask for programing lenguage
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which language do you want to use?",
      choices: ["TypeScript", "JavaScript"],
    },
  ]);

  const { tools } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "tools",
      message: "Select tools to include",
      choices: [
        { name: "Express", value: "express", checked: false },
        { name: "Prisma", value: "prisma", checked: false },
        { name: "Zod", value: "zod", checked: false },
        { name: "Dotenv", value: "env", checked: false },
      ],
    },
  ]);

  const useExpress = tools.includes("express");
  const usePrisma = tools.includes("prisma");
  const useZod = tools.includes("zod");
  const useEnv = tools.includes("env");

  let prismaDB = null;
  // ask for prismaDB
  if (usePrisma) {
    const res = await inquirer.prompt([
      {
        type: "list",
        name: "prismaDB",
        message: "Which Database you want to use with Prisma",
        choices: [
          { name: "PostgreSQL", value: "postgresql" },
          { name: "MySQL", value: "mysql" },
          { name: "SQLite", value: "sqlite" },
        ],
      },
    ]);
    prismaDB = res.prismaDB;
  }

  let database = null;
  if (!usePrisma) {
    // ask for databse
    const res = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Which database you want to use",
        choices: ["postgreSQL", "MongoDB", "No database"],
      },
    ]);
    database = res.database;
  }

  const isTS = language == "TypeScript";
  const ext = isTS ? "ts" : "js";

  // content of the project's package.json file
  const packageJson = {
    name: projectName,
    version: "0.0.1",
    type: "module",
    private: true,
    scripts: isTS
      ? {
          build: "tsc",
          start: "node dist/index.js",
        }
      : { start: "node src/index.js" },
  };

  // create the package.json file and insert the content into it
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
      "Utils",
      "config",
      "routes",
      "middlewares",
      // "services"
    ];

    folders.forEach((folder) => {
      fs.mkdirSync(`${projectPath}/src/${folder}`);
    });
  }

  console.log(chalk.green("✔ Project folder structure created"));

  //content for index file
  let indexFileContent = "";
  if (useExpress) {
    indexFileContent = isTS
      ? `
        import express from "express";
        import router from "./routes";
        import { env } from "./config/env";
  
        const app = express();
      
  
        app.use(express.json())
          app.use("/", router);
  
        app.listen(env.PORT, () => {
          console.log(\`Server running on http://localhost:\${env.PORT}\`);
        });
        `.trim()
      : `
        import express from "express";
        import router from "./routes";
        import { env } from "./config/env";

        const app = express();
      
  
        app.use(express.json());
        app.use("/", router);
  
  
        app.listen(env.PORT, () => {
          console.log(\`Server running on http://localhost:\${env.PORT}\`);
        });
        `.trim();
  } else {
    indexFileContent = `console.log("hello from ${projectName}")`;
  }

  fs.writeFileSync(`./${projectName}/src/index.${ext}`, indexFileContent);

  // content of main route file
  const routerContent = `
          import { Router } from "express";
          import { healthCheck } from "../controllers/health.controller";
  
          const router = Router();
  
          router.get("/", healthCheck);
  
          export default router;`;

  const controllerContent = isTS
    ? `
          import { Request, Response } from "express";
          ${
            useZod
              ? `
          import { createUserSchema } from "../schemas/user.schema.ts";`
              : ""
          }
          
          
          export const healthCheck = (_req: Request, res: Response) => {

          if (typeof createUserSchema !== 'undefined' ) {
          
          const result = createUserSchema.safeParse(_req.body); 
          if (!result.success) {
            return res.status(400).json(result.error.format());
            }
          }

            res.json({
              message: "User data is valid",
              data: result.data,
            });
          
            };
            `
    : `
            ${
              useZod
                ? `
            import { createUserSchema } from "../schemas/user.schema.js";`
                : ""
            }
            

            exports.healthCheck = (req, res) => {
              
              const result = createUserSchema.safeParse(req.body);
              if (!result.success) {
                return res.status(400).json(result.error.format());
              }

              res.json({
                message: "User data is valid",
                data: result.data,
              });
            };
            
              `;

  if (useZod) {
    fs.mkdirSync(`./${projectName}/src/schemas`);

    let zodSchemaIndexContent = `
          // In this folder you can write zod schema for validation check
          
          import { z } from 'zod'; 

          export const createUserSchema  = z.object({
            name: z.string().min(2),
            email: z.string().email(),
            age: z.number().min(18),
          });
          `;
    fs.writeFileSync(
      `./${projectName}/src/schemas/user.schema.${ext}`,
      zodSchemaIndexContent,
    );
  }

  // env file setup
  if (useEnv) {
    const envContent = `
        # In this file you can write your environment variables
        PORT=3000
        DATABASE_URL=your_database_url
        `;

    const envConfigContnent = `
        import dotenv from "dotenv";

        dotenv.config();

        export const env = {
          PORT: process.env.PORT || 3000,
          DATABASE_URL: process.env.DATABASE_URL || "",
        };
        `;
    fs.writeFileSync(`./${projectName}/.env.example`, envContent);
    fs.writeFileSync(`./${projectName}/.env`, envContent);

    //
    fs.writeFileSync(
      `./${projectName}/src/config/env.${ext}`,
      envConfigContnent,
    );
    // fs.mkdirSync(`${projectPath}/src/lib`);
  }

  fs.writeFileSync(`./${projectName}/src/routes/index.${ext}`, routerContent);
  fs.writeFileSync(
    `./${projectName}/src/controllers/health.controller.${ext}`,
    controllerContent,
  );

  // prisma setup if yes
  if (usePrisma) {
    const prismaFileContent = `
      import { PrismaClient } from "@prisma/client";

      export const prisma = new PrismaClient();
    `;

    fs.mkdirSync(`./${projectName}/src/lib`);
    fs.writeFileSync(`./${projectName}/src/lib/prisma.js`, prismaFileContent);
  }

  // ----- dependecny installations section -----------

  if (isTS) {
    let deps = " typescript @types/node ";

    if (useExpress) {
      deps += " express @types/express ";
    }

    if (useZod) {
      deps += " zod ";
    }

    if (useEnv) deps += " dotenv ";

    const installSpinner = ora(chalk.blue("📦 Installing dependencies...")).start();
    // execSync is used to execute terminal commands
    try {
      execSync(`npm install ${deps} --silent --silent `, {
        cwd: projectPath,
        stdio: "pipe",
      });

      if (usePrisma) {
        execSync("npm install prisma --save-dev --silent ", {
          cwd: projectPath,
          stdio: "pipe",
        });

        execSync("npm install @prisma/client --silent", {
          cwd: projectPath,
          stdio: "pipe",
        });
      }

      installSpinner.succeed(chalk.green("✔ Dependencies installed"));
    } catch (error) {
      installSpinner.fail(chalk.red("✔ Dependencies installation Failed"));
      process.exit(1);
    }

    if (usePrisma) {
      // console.log(chalk.blue("🗄 Setting up Prisma...  (this may take a minute)"));

      const prismaSpinner = ora(
        "🗄 Setting up Prisma...  (this may take a minute)",
      ).start();

      try {
        execSync(`npx prisma init --datasource-provider ${prismaDB}`, {
          cwd: projectPath,
          stdio: "pipe",
        });

        execSync("npx prisma generate  ", {
          cwd: projectPath,
          stdio: "ignore",
        });

        prismaSpinner.succeed(chalk.green("✔ Prisma ready"));
      } catch (error) {
        prismaSpinner.fail(chalk.red("Prisma setup failed"));
        process.exit(1);
      }
    }

  } else {
    let deps = useExpress ? "express " : "";

    if (useZod) {
      deps += " zod ";
    }

    if (useEnv) deps += " dotenv ";


    const installSpinner = ora(chalk.blue("📦 Installing dependencies...")).start();
    // execSync is used to execute terminal commands
    try {
      execSync(`npm install ${deps} --silent --silent `, {
        cwd: projectPath,
        stdio: "pipe",
      });

      if (usePrisma) {
        execSync("npm install prisma --save-dev --silent ", {
          cwd: projectPath,
          stdio: "pipe",
        });

        execSync("npm install @prisma/client --silent", {
          cwd: projectPath,
          stdio: "pipe",
        });
      }

      installSpinner.succeed(chalk.green("✔ Dependencies installed"));
    } catch (error) {
      installSpinner.fail(chalk.red("✔ Dependencies installation Failed"));
      process.exit(1);
    }


        if (usePrisma) {
      // console.log(chalk.blue("🗄 Setting up Prisma...  (this may take a minute)"));

      const prismaSpinner = ora(
        "🗄 Setting up Prisma...  (this may take a minute)",
      ).start();

      try {
        execSync(`npx prisma init --datasource-provider ${prismaDB}`, {
          cwd: projectPath,
          stdio: "pipe",
        });

        execSync("npx prisma generate  ", {
          cwd: projectPath,
          stdio: "ignore",
        });

        prismaSpinner.succeed(chalk.green("✔ Prisma ready"));
      } catch (error) {
        prismaSpinner.fail(chalk.red("Prisma setup failed"));
        process.exit(1);
      }
    }
  }


  // ----- dependecny installations section -----------
  if (isTS) {
    
    const tsSpinner = ora(chalk.blue("🛠 Creating tsconfig...")).start()
    try {

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

    tsSpinner.succeed(chalk.green(" TypeScript configured"));
    
  } catch (error) {
      tsSpinner.fail(chalk.green(" TypeScript configured Failed"));
      process.exit(1)
    }
  }

  console.log(chalk.green("✨ Project created successfully!"));
}

main();
