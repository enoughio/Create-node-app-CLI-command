# @enoughio/create-node-project

**Interactive CLI to scaffold modern Node.js backend projects**

Quickly scaffold production-ready Node.js backends with TypeScript/JavaScript support, optional Express, Prisma, Zod validation, and environment management.

---


## Installation

### Quick Start (Recommended)

Use `npx` without installing globally:

```bash
npx @enoughio/create-node-project my-app
```

### Global Installation

Install globally once for reusable access:

```bash
npm install -g @enoughio/create-node-project
```

Then create projects anytime:

```bash
create-node-project my-app
```

---

## Usage

### Create a New Project

```bash
npx @enoughio/create-node-project my-app
```

### Create in Current Directory

To scaffold directly in the current folder:

```bash
npx @enoughio/create-node-project ./

```


## Features

 **Language Support**
- TypeScript or JavaScript
- Fully configured with proper type definitions

 **Framework & Libraries**
- Express.js for HTTP server (optional)
- Prisma ORM for database management (optional)
- Zod for schema validation (optional)
- Dotenv for environment configuration (optional)

 **Automatic Setup**
- Project structure generation
- Dependency installation
- Git repository initialization
- TypeScript configuration
- Environment file setup
- Generated starter README

---



### Interactive Setup

The CLI will prompt you to configure:

1. **Language** → Choose between `TypeScript` or `JavaScript`
2. **Express** → Include web framework? (default: yes)
3. **Prisma** → Include database ORM? (default: no)
4. **Zod** → Include schema validation? (default: no)
5. **Dotenv** → Include environment config? (default: yes)
6. **Database** → Select provider:
   - If Prisma enabled: `postgresql`, `mysql`, or `sqlite`
   - If Prisma disabled: `PostgreSQL`, `MongoDB`, or `No database`

---

## Project Structure

### Base Project

Every project includes:

```text
my-app/
├── src/
│   └── index.(ts|js)
├── package.json
├── .gitignore
├── README.md
└── .env (if Dotenv selected)
```

### With Express

Express projects include routing and controller layers:

```text
src/
├── routes/                 # API route definitions
├── controllers/            # Business logic handlers
├── middlewares/            # Express middleware
└── utils/                  # Utility functions
```

### With Prisma

Database access layer:

```text
prisma/
├── schema.prisma           # Database schema
└── migrations/             # Schema version history

src/lib/prisma.(ts|js)      # Prisma client export
```

### With Zod

Data validation:

```text
src/schemas/user.schema.(ts|js)    # Example validation schema
```

### With Dotenv

Environment management:

```text
.env                        # Local environment (not in git)
.env.example                # Template for environment variables
src/config/env.(ts|js)      # Parsed environment config
```

---

## Generated npm Scripts

### TypeScript Projects

```json
{
  "build": "tsc",           // Compile TypeScript to JavaScript
  "start": "node dist/index.js"  // Run compiled application
}
```

Run with:
```bash
npm run build   # Compile
npm start       # Run
```

### JavaScript Projects

```json
{
  "start": "node src/index.js"   // Run directly without compilation
}
```

Run with:
```bash
npm start
```

---

## What's Automated

✅ **Dependencies** - Installs all selected package dependencies  
✅ **TypeScript** - Configures `tsconfig.json` with strict mode (if TypeScript selected)  
✅ **Prisma** - Runs `prisma init` with your selected database provider  
✅ **Git** - Initializes repository, creates `main` branch, and makes initial commit  
✅ **Environment** - Creates `.env` and `.env.example` files  
✅ **Project Files** - Generates starter code for routes, controllers, and schemas  

---

## Troubleshooting

### Git initialization fails
```
⚠️ Git initialization skipped (Git may not be installed)
```
**Solution:** Install [Git](https://git-scm.com/), or initialize manually in the project directory afterward:
```bash
cd my-app
git init
```

### Prisma setup fails
Make sure your database provider is running and accessible. Prisma requires a valid connection string in the `.env` file.

### npm install fails
Try clearing npm cache and reinstalling:
```bash
npm cache clean --force
npm install
```

---

## Example: Full TypeScript + Express + Prisma

```bash
npx @enoughio/create-node-project my-api
```

Select:
- Language: `TypeScript`
- Express: `yes`
- Prisma: `yes` → `PostgreSQL`
- Zod: `yes`
- Dotenv: `yes`

Then:
```bash
cd my-api
npm start          # Run development server
npm run build      # Compile TypeScript
```

---

## Tips

 **Update environment variables** in `.env` before running with Prisma  
 **Create database schema** in `prisma/schema.prisma` after generation  
 **Modify generated schemas** in `src/schemas/` for your API validation  
 **Extend Express app** in `src/index.ts` for custom middleware and routes  


---

## Prerequisites

- **Node.js** v14 or higher
- **npm** v6 or higher
- **Git** (optional, for repository initialization)


---

## License

MIT

## Contact
please leave your feedback or suggestions or complains at : 
aniketjatav.dev@gmail.com


PS : I am currently looking for a job is you have one or can help me get one please contact.


________________________
