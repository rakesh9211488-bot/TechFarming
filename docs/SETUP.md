# Local setup on Windows

## 1. Requirements

Install Git, Node.js 22.12 or newer with npm, and MySQL. Use a dedicated local development database account. The active backend uses bcryptjs and no longer requires a native bcrypt binary.

Check tools in PowerShell:

```powershell
node --version
npm --version
git --version
```

## 2. Get the reviewed code

```powershell
git clone https://github.com/rakesh9211488-bot/TechFarming.git
cd TechFarming
```

A pull request branch must be checked out explicitly until it is merged; cloning master alone will not include an unmerged update. Use the branch shown in the review pull request if testing that version.

## 3. Install dependencies

```powershell
npm run setup
```

The setup helper installs both applications from their lockfiles. Keep all lockfiles committed. Root scripts coordinate the applications without adding another runtime dependency.

## 4. Configure and migrate MySQL

Follow [DATABASE.md](DATABASE.md) to back up an older database, create isolated development schemas and grant the local application account its required permissions.

```powershell
Copy-Item Server\.env.example Server\.env
notepad Server\.env
```

Supply the real local database settings. Never commit this file. Existing process environment variables take precedence over its values.

```powershell
cd Server
node scripts/migrate.js --plan
node scripts/migrate.js
npm test
cd ..
```

The migration plan is read-only. Applying migrations changes the configured schemas, so review them first. MySQL-backed integration tests are restricted to disposable CI schemas; the normal local test command skips that one integration test.

TechFarming uses website port **3001**, leaving CareerOrbit’s port 3000 free.

## 5. Start both services

From the repository root, use one PowerShell terminal:

```powershell
npm run dev
```

This starts the API and Vite together. Open **http://localhost:3001**. Keep `CLIENT_ORIGIN=http://localhost:3001` in Server/.env for that browser address. Opening `127.0.0.1:3001` requires the corresponding exact origin instead.

The local helper coordinates the API port with Vite's proxy, and stops both services when you press Ctrl+C. The API's `/api/health` endpoint checks the required database tables.

## 6. Alternative separate terminals

If troubleshooting, start `npm run dev` inside Server in one terminal and `npm start` inside client in another. These use the default API port 9000 unless the frontend's TF_API_TARGET is explicitly configured.

## 7. Check the complete user journey

Create an account, sign in, refresh the workspace and sign out. Browse the catalog and jobs. Register a test device only if you are ready to keep its one-time key private.

A fresh database has no jobs. Regular users cannot publish jobs. An administrator may promote an existing local account using MySQL after verifying its email:

```sql
UPDATE techfarming_users_dev.user_sign_up
SET Role = 'admin'
WHERE Email = 'your-verified-local-account@example.com';
```

Use your real reviewed account and schema names. Roles cannot be set by signup requests. An administrator sees the job-publishing form in the workspace.

## 8. Build and stop

```powershell
npm run build
```

Stop the combined process with Ctrl+C. For local preview of an existing build, use `npm run preview`, which starts the API and preview together. Production deployment needs HTTPS, a matching HTTPS origin and a deliberate hosting configuration; the preview command is not a production hosting plan.
