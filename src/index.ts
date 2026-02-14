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


  // ask for express
  const { useExpress } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useExpress",
      message: "Do you want to use express",
      default: true,
    },
  ]);

  // ask for zod
  const { useZod } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useZod",
      message: "Do you want to use Zod for schema validation",
      default: true,
    },
  ]);


  // ask for zod
  const { useEnv } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useEnv",
      message: "Do you want to use .env file",
      default: true,
    },
  ]);

  // ask for prisma 
  const { usePrisma } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'usePrisma',
      message: 'Do you want to use Prisma as your ORM',
      default: true
    }
  ])

  let prismaDB = null;
  // ask for prismaDB
  if (usePrisma) {
    const res = await inquirer.prompt([
      {
        type: "list",
        name: "prismaDB",
        message: "Which Database you want to use with Prisma",
        choices: ['an SQL Database', 'Mongodb']
      }
    ])
    prismaDB = res.prismaDB;
    if (prismaDB == 'an SQL Database') {
      prismaDB = 'postgresql'
    }
  }

  let database = null;
  if (!usePrisma) {
    // ask for databse
    const res = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Which database you want to use",
        choices: ['postgreSQL', 'MongoDB', "No database"]
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
    private: true,
    scripts: isTS
      ? {
        build: "tsc",
        start: "node dist/index.ts",
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
          ${useZod ? `
          import { createUserSchema } from "../schemas/user.schema.ts";` : ''}
          
          
          export const healthCheck = (_req: Request, res: Response) => {
            const result = createUserSchema.safeParse(_req.body);
            if (!result.success) {
              return res.status(400).json(result.error.format());
            }

            res.json({
              message: "User data is valid",
              data: result.data,
            });
          
            };
            `
    :
    `
            ${useZod ? `
            import { createUserSchema } from "../schemas/user.schema.js";` : ''}
            

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
            
              `

  if (useZod) {

    fs.mkdirSync(`./${projectName}/src/schema`)

    let zodSchemaIndexContent = `
          // In this folder you can write zod schema for validation check
          
          import { z } from 'zod'; 

          export const createUserSchema  = z.object({
            name: z.string().min(2),
            email: z.string().email(),
            age: z.number().min(18),
          });
          `
    fs.writeFileSync(`./${projectName}/src/schema/user.schema.${ext}`, zodSchemaIndexContent)
  }

  // env file setup 
  if (useEnv) {
    const envContent = `
        # In this file you can write your environment variables
        PORT=3000
        DATABASE_URL=your_database_url
        `

    const envConfigContnent = `
        import dotenv from "dotenv";

        dotenv.config();

        export const env = {
          PORT: process.env.PORT || 3000,
          DATABASE_URL: process.env.DATABASE_URL || "",
        };
        `
    fs.writeFileSync(`./${projectName}/.env.example`, envContent)
    fs.writeFileSync(`./${projectName}/.env`, envContent)

    //
    fs.writeFileSync(`./${projectName}/src/config/env.${ext}`, envConfigContnent);
    
    fs.mkdirSync(`${projectPath}/src/lib`);

  }


  fs.writeFileSync(`./${projectName}/src/routes/index.${ext}`, routerContent);
  fs.writeFileSync(`./${projectName}/src/controllers/health.controller.${ext}`, controllerContent);

  // prisma setup if yes
  if (usePrisma) {



  }



  // ----- dependecny installations section -----------

  console.log("📦 Installing dependencies...");

  if (isTS) {
    let deps = " typescript @types/node ";

    if (useExpress) {
      deps += " express @types/express ";
    }

    if (useZod) {
      deps += ' zod '
    }

    if (useEnv) deps += ' dotenv '

    if (usePrisma) deps += ' @prisma/client '

    execSync("npm install prisma --save-dev", {
      cwd: projectPath,
      stdio: "inherit",
    });

    // execSync is used to execute terminal commands
    execSync(`npm install ${deps}`, {
      cwd: projectPath,
      stdio: "inherit",
    });


    execSync(`npx prisma init --datasource-provider ${prismaDB}  `, {
      cwd: projectPath,
      stdio: "inherit",
    });

    execSync("npx prisma generate", {
      cwd: projectPath,
      stdio: "inherit",
    });


  } else {

    let deps = useExpress ? "express " : "";

    if (useZod) {
      deps += ' zod '
    }

    if (useEnv) deps += ' dotenv '
    if (usePrisma) deps += ' @prisma/client '

    execSync("npm install prisma --save-dev", {
      cwd: projectPath,
      stdio: "inherit",
    });

    execSync(`npm install ${deps}`, {
      cwd: projectPath,
      stdio: "inherit",
    });

    execSync(`npx prisma init  --datasource-provider ${prismaDB} `, {
      cwd: projectPath,
      stdio: "inherit",
    });

    execSync("npx prisma generate", {
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
