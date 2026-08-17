#!/usr/bin/env node

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
type Language = "TypeScript" | "JavaScript";
type PrismaProvider = "postgresql" | "mysql" | "sqlite";

type ToolSelection = {
  language: Language;
  useExpress: boolean;
  usePrisma: boolean;
  useZod: boolean;
  useEnv: boolean;
  prismaProvider?: PrismaProvider;
  database?: "PostgreSQL" | "MongoDB" | "No database";
};

async function main() {
  showBanner();
  console.log(chalk.gray("────────────────────────────────────\n"));

  const projectName = process.argv[2];
  if (!projectName) {
    console.log("❌ Please provide a project name");
    process.exit(1);
  }

  const isCurrentFolder = projectName === "." || projectName === "./";
  const projectPath = isCurrentFolder ? process.cwd() : path.resolve(projectName);

  if (!isCurrentFolder && fs.existsSync(projectPath)) {
    console.log("❌ Folder already exists");
    process.exit(1);
  }

  const selection = await askQuestions();
  const isTS = selection.language === "TypeScript";
  const ext = isTS ? "ts" : "js";

  fs.mkdirSync(projectPath, { recursive: true });
  const displayName = isCurrentFolder ? "current folder" : projectName;
  console.log(chalk.cyan("📁 Creating project in", displayName));

  createProjectStructure(projectPath, selection);
  writeProjectFiles(projectPath, projectName, selection, ext);
  console.log(chalk.green(" Project folder structure created"));

  installDependencies(projectPath, selection, isTS);
  runPrismaSetup(projectPath, selection);

  initializeGit(projectPath);
  createReadme(projectPath, projectName, selection);

  if (isTS) {
    createTsConfig(projectPath);
  }

  console.log(chalk.green("✨ Project created successfully!"));
}

async function askQuestions(): Promise<ToolSelection> {
  const { language } = await inquirer.prompt<{ language: Language }>([
    {
      type: "list",
      name: "language",
      message: "Which language do you want to use?",
      choices: ["TypeScript", "JavaScript"],
    },
  ]);

  const { useExpress } = await inquirer.prompt<{ useExpress: boolean }>([
    {
      type: "confirm",
      name: "useExpress",
      message: "Do you want to add Express?",
      default: true,
    },
  ]);

  const { usePrisma } = await inquirer.prompt<{ usePrisma: boolean }>([
    {
      type: "confirm",
      name: "usePrisma",
      message: "Do you want to add Prisma?",
      default: false,
    },
  ]);

  const { useZod } = await inquirer.prompt<{ useZod: boolean }>([
    {
      type: "confirm",
      name: "useZod",
      message: "Do you want to add Zod?",
      default: false,
    },
  ]);

  const { useEnv } = await inquirer.prompt<{ useEnv: boolean }>([
    {
      type: "confirm",
      name: "useEnv",
      message: "Do you want to add Dotenv?",
      default: true,
    },
  ]);

  let prismaProvider: PrismaProvider | undefined;
  if (usePrisma) {
    const prismaAnswer = await inquirer.prompt<{ prismaProvider: PrismaProvider }>([
      {
        type: "list",
        name: "prismaProvider",
        message: "Which database provider should Prisma use?",
        choices: [
          { name: "PostgreSQL", value: "postgresql" },
          { name: "MySQL", value: "mysql" },
          { name: "SQLite", value: "sqlite" },
        ],
      },
    ]);
    prismaProvider = prismaAnswer.prismaProvider;
  }

  let database: ToolSelection["database"];
  if (!usePrisma) {
    const dbAnswer = await inquirer.prompt<{
      database: "PostgreSQL" | "MongoDB" | "No database";
    }>([
      {
        type: "list",
        name: "database",
        message: "Which database do you plan to use?",
        choices: ["PostgreSQL", "MongoDB", "No database"],
      },
    ]);
    database = dbAnswer.database;
  }

  const selection: ToolSelection = {
    language,
    useExpress,
    usePrisma,
    useZod,
    useEnv,
  };

  if (prismaProvider) {
    selection.prismaProvider = prismaProvider;
  }

  if (database) {
    selection.database = database;
  }

  return selection;
}

function createProjectStructure(projectPath: string, selection: ToolSelection) {
  const srcPath = path.join(projectPath, "src");
  fs.mkdirSync(srcPath, { recursive: true });

  if (selection.useExpress) {
    ["controllers", "routes", "middlewares", "utils"].forEach((folder) => {
      fs.mkdirSync(path.join(srcPath, folder), { recursive: true });
    });
  }

  if (selection.useEnv || selection.useExpress) {
    fs.mkdirSync(path.join(srcPath, "config"), { recursive: true });
  }

  if (selection.useZod) {
    fs.mkdirSync(path.join(srcPath, "schemas"), { recursive: true });
  }

  if (selection.usePrisma) {
    fs.mkdirSync(path.join(srcPath, "lib"), { recursive: true });
  }
}

function writeProjectFiles(
  projectPath: string,
  projectName: string,
  selection: ToolSelection,
  ext: "ts" | "js",
) {
  const isTS = ext === "ts";

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
      : {
          start: "node src/index.js",
        },
  };

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  fs.writeFileSync(
    path.join(projectPath, `src/index.${ext}`),
    createIndexContent(projectName, selection, ext),
  );

  if (selection.useExpress) {
    fs.writeFileSync(
      path.join(projectPath, `src/routes/index.${ext}`),
      createRouteContent(),
    );
    fs.writeFileSync(
      path.join(projectPath, `src/controllers/health.controller.${ext}`),
      createControllerContent(selection.useZod, ext),
    );
  }

  if (selection.useZod) {
    fs.writeFileSync(
      path.join(projectPath, `src/schemas/user.schema.${ext}`),
      createZodSchemaContent(),
    );
  }

  if (selection.useEnv) {
    const envContent = `PORT=3000\nDATABASE_URL=your_database_url\n`;
    fs.writeFileSync(path.join(projectPath, ".env.example"), envContent);
    fs.writeFileSync(path.join(projectPath, ".env"), envContent);
    fs.writeFileSync(
      path.join(projectPath, `src/config/env.${ext}`),
      createEnvConfigContent(),
    );
  }

  if (selection.usePrisma) {
    fs.writeFileSync(
      path.join(projectPath, `src/lib/prisma.${ext}`),
      `import { PrismaClient } from "@prisma/client";\n\nexport const prisma = new PrismaClient();\n`,
    );
  }
}

function createIndexContent(
  projectName: string,
  selection: ToolSelection,
  ext: "ts" | "js",
) {
  if (!selection.useExpress) {
    return `console.log("hello from ${projectName}");\n`;
  }

  const routeImport = ext === "ts" ? "./routes/index" : "./routes/index.js";
  const envImport = ext === "ts" ? "./config/env" : "./config/env.js";
  const portValue = selection.useEnv ? "env.PORT" : "3000";

  return [
    'import express from "express";',
    `import router from "${routeImport}";`,
    selection.useEnv ? `import { env } from "${envImport}";` : "",
    "",
    "const app = express();",
    "",
    "app.use(express.json());",
    'app.use("/", router);',
    "",
    `app.listen(${portValue}, () => {`,
    `  console.log(\`Server running on http://localhost:\${${portValue}}\`);`,
    "});",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

function createRouteContent() {
  return [
    'import { Router } from "express";',
    'import { healthCheck } from "../controllers/health.controller";',
    "",
    "const router = Router();",
    "",
    'router.get("/", healthCheck);',
    "",
    "export default router;",
    "",
  ].join("\n");
}

function createControllerContent(useZod: boolean, ext: "ts" | "js") {
  const schemaImport = ext === "ts" ? "../schemas/user.schema" : "../schemas/user.schema.js";

  if (ext === "ts") {
    return [
      'import { Request, Response } from "express";',
      useZod ? `import { createUserSchema } from "${schemaImport}";` : "",
      "",
      "export const healthCheck = (req: Request, res: Response) => {",
      useZod
        ? "  const result = createUserSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json(result.error.format());\n  }\n\n  return res.json({ message: \"Request body is valid\", data: result.data });"
        : "  return res.json({ message: \"API is healthy\" });",
      "};",
      "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    useZod ? `import { createUserSchema } from "${schemaImport}";` : "",
    "",
    "export const healthCheck = (req, res) => {",
    useZod
      ? "  const result = createUserSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json(result.error.format());\n  }\n\n  return res.json({ message: \"Request body is valid\", data: result.data });"
      : "  return res.json({ message: \"API is healthy\" });",
    "};",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

function createZodSchemaContent() {
  return [
    'import { z } from "zod";',
    "",
    "export const createUserSchema = z.object({",
    "  name: z.string().min(2),",
    "  email: z.string().email(),",
    "  age: z.number().min(18),",
    "});",
    "",
  ].join("\n");
}

function createEnvConfigContent() {
  return [
    'import dotenv from "dotenv";',
    "",
    "dotenv.config();",
    "",
    "export const env = {",
    "  PORT: Number(process.env.PORT ?? 3000),",
    "  DATABASE_URL: process.env.DATABASE_URL ?? \"\",",
    "};",
    "",
  ].join("\n");
}

function installDependencies(
  projectPath: string,
  selection: ToolSelection,
  isTS: boolean,
) {
  const dependencies = new Set<string>();
  const devDependencies = new Set<string>();

  if (selection.useExpress) {
    dependencies.add("express");
    if (isTS) {
      devDependencies.add("@types/express");
    }
  }

  if (selection.useZod) {
    dependencies.add("zod");
  }

  if (selection.useEnv) {
    dependencies.add("dotenv");
  }

  if (isTS) {
    devDependencies.add("typescript");
    devDependencies.add("@types/node");
  }

  if (selection.usePrisma) {
    dependencies.add("@prisma/client");
    devDependencies.add("prisma");
  }

  if (dependencies.size === 0 && devDependencies.size === 0) {
    return;
  }

  const installSpinner = ora(chalk.blue("📦 Installing dependencies...")).start();
  try {
    if (dependencies.size > 0) {
      execSync(`npm install ${Array.from(dependencies).join(" ")} --silent`, {
        cwd: projectPath,
        stdio: "pipe",
      });
    }

    if (devDependencies.size > 0) {
      execSync(`npm install -D ${Array.from(devDependencies).join(" ")} --silent`, {
        cwd: projectPath,
        stdio: "pipe",
      });
    }

    installSpinner.succeed(chalk.green(" Dependencies installed"));
  } catch {
    installSpinner.fail(chalk.red(" Dependencies installation failed"));
    process.exit(1);
  }
}

function runPrismaSetup(projectPath: string, selection: ToolSelection) {
  if (!selection.usePrisma || !selection.prismaProvider) {
    return;
  }

  const prismaSpinner = ora("🗄 Setting up Prisma... (this may take a minute)").start();
  try {
    execSync(`npx prisma init --datasource-provider ${selection.prismaProvider}`, {
      cwd: projectPath,
      stdio: "pipe",
    });

    execSync("npx prisma generate", {
      cwd: projectPath,
      stdio: "ignore",
    });

    prismaSpinner.succeed(chalk.green(" Prisma ready"));
  } catch {
    prismaSpinner.fail(chalk.red("Prisma setup failed"));
    process.exit(1);
  }
}

function createTsConfig(projectPath: string) {
  const tsSpinner = ora(chalk.blue("🛠 Creating tsconfig...")).start();
  try {
    const tsConfig = {
      compilerOptions: {
        module: "nodenext",
        target: "esnext",
        types: ["node"],
        rootDir: "src",
        outDir: "dist",
        strict: true,
      },
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2),
    );

    tsSpinner.succeed(chalk.green(" TypeScript configured"));
  } catch {
    tsSpinner.fail(chalk.red(" TypeScript configuration failed"));
    process.exit(1);
  }
}

function showBanner() {
  const banner = figlet.textSync("Create Node", {
    horizontalLayout: "default",
  });

  console.log(chalk.cyan(banner));
  console.log(
    chalk.gray("Scaffold modern Node.js backends wiht just a few click\n"),
  );
}


function initializeGit(projectPath: string) {
  try {
    const gitignoreContent = `
      node_modules
      .env
      dist
      build
      coverage
      .prisma
      `;

    fs.writeFileSync(`${projectPath}/.gitignore`, gitignoreContent.trim());

    execSync("git init", { cwd: projectPath, stdio: "ignore" });
    execSync("git branch -M main", { cwd: projectPath, stdio: "ignore" });
    execSync("git add .", { cwd: projectPath, stdio: "ignore" });
    execSync('git commit -m "Initial commit"', {
      cwd: projectPath,
      stdio: "ignore",
    });

    console.log(chalk.green(" Git repository initialized"));
  } catch (error) {
    console.log(chalk.red("⚠️ Git initialization skipped (Git may not be installed)"));
  }
}


function createReadme(
  projectPath: string,
  projectName: string,
  selection: ToolSelection,
) {
  const stack = [
    "Node.js",
    selection.useExpress ? "Express" : null,
    selection.usePrisma ? "Prisma" : null,
    selection.useZod ? "Zod" : null,
    selection.useEnv ? "Dotenv" : null,
  ].filter(Boolean) as string[];

  const structureLines = [
    "src/",
    "  index.(ts|js)",
    selection.useExpress ? "  controllers/" : null,
    selection.useExpress ? "  routes/" : null,
    selection.useExpress ? "  middlewares/" : null,
    selection.useExpress ? "  utils/" : null,
    selection.useZod ? "  schemas/" : null,
    selection.usePrisma ? "  lib/" : null,
    selection.useEnv || selection.useExpress ? "  config/" : null,
  ].filter(Boolean) as string[];

  const content = `# ${projectName}

A backend project generated using @enoughio/create-node-project.

## Installation

\`\`\`bash
npm install
\`\`\`

## Run

\`\`\`bash
npm start
\`\`\`

## Project Structure

\`\`\`text
${structureLines.join("\n")}
\`\`\`

## Tech Stack

${stack.map((item) => `- ${item}`).join("\n")}
`;

  fs.writeFileSync(path.join(projectPath, "README.md"), content);
}



main();
