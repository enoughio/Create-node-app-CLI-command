# @enoughio/create-node-project

Interactive CLI to scaffold a Node.js backend starter project.

It currently supports TypeScript/JavaScript selection, optional Express/Prisma/Zod/Dotenv setup, project structure generation, dependency installation, Git initialization, and starter README generation.

---

## Installation

Use with `npx`:

```bash
npx @enoughio/create-node-project my-app
```

Or install globally:

```bash
npm install -g @enoughio/create-node-project
```

Then run:

```bash
@enoughio/create-node-project my-app
```

---

## Usage

```bash
npx @enoughio/create-node-project my-app
```

The CLI will ask:

1. Language: `TypeScript` or `JavaScript`
2. `Express`: yes/no
3. `Prisma`: yes/no
4. `Zod`: yes/no
5. `Dotenv`: yes/no
6. If Prisma is selected: datasource provider (`postgresql`, `mysql`, or `sqlite`)
7. If Prisma is not selected: preferred database (`PostgreSQL`, `MongoDB`, or `No database`)

---

## What it generates

Base output:

```text
my-app/
├── src/
│   └── index.(ts|js)
├── package.json
├── README.md
├── .gitignore
└── (optional files/folders based on selections)
```

If Express is selected:

```text
src/
├── controllers/
├── routes/
├── middlewares/
└── utils/
```

If Express or Dotenv is selected:

```text
src/config/
```

If Zod is selected:

```text
src/schemas/user.schema.(ts|js)
```

If Dotenv is selected:

```text
.env
.env.example
src/config/env.(ts|js)
```

If Prisma is selected:

```text
prisma/                 # created by `prisma init`
src/lib/prisma.(ts|js)
```

---

## Generated scripts

For TypeScript projects:

```json
{
	"build": "tsc",
	"start": "node dist/index.js"
}
```

For JavaScript projects:

```json
{
	"start": "node src/index.js"
}
```

---

## Included setup actions

- Installs selected dependencies
- Installs Prisma packages when Prisma is selected
- Runs `npx prisma init --datasource-provider <provider>` and `npx prisma generate`
- Creates `.gitignore`
- Runs `git init`, creates `main` branch, and makes an initial commit

---

## Current notes

- This README reflects the current implementation in `src/index.ts`.
- If behavior changes, update this file to keep CLI docs in sync.

---

## License

MIT