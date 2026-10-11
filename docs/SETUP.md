# Local development

## Requirements

Install Git, Node.js 22 or newer with npm, and MySQL. Node is required for the built-in environment-file loader. The legacy dependency set still needs compatibility validation; backend bcrypt may require native build tools if a compatible prebuilt binary is unavailable.

Keep this prototype on a trusted local development machine. Read [SECURITY.md](../SECURITY.md) before supplying credentials or exposing ports.

## 1. Clone

```powershell
git clone https://github.com/rakesh9211488-bot/TechFarming.git
cd TechFarming
```

## 2. Install dependencies

```powershell
cd client
npm ci
cd ..\Server
npm ci
cd ..
```

The root package only declares a deployment helper; it is not the frontend or backend application. Keep all package lockfiles committed. Do not use `npm audit fix --force` without reviewing breaking changes.

## 3. Understand the database gap

Create the local configuration file:

```powershell
Copy-Item Server\.env.example Server\.env
notepad Server\.env
```

Set `DB_USER` and `DB_PASSWORD` to a dedicated local MySQL account, and set the database names to your local schemas. Do not paste passwords into GitHub or commit `Server/.env`. Existing process environment variables take precedence over the file. Missing database settings stop startup with a configuration error.

The listener defaults to `127.0.0.1:9000`. `CLIENT_ORIGIN` accepts one exact origin, such as `http://localhost:3000`, without a trailing slash. Public account-listing routes are disabled until authenticated authorization is implemented.

The SQL examples in `Database/` do not recreate the schema expected by all routes. In particular, `Membership.sql` creates `users`, while the server's account routes expect `user_sign_up`; jobs use `jods_list`. A complete migration set must be implemented before reliable account and jobs testing is possible. Creating empty databases alone does not resolve missing tables.

Configuration does not create database tables. The missing migration set remains a separate implementation task.

## 4. Start the backend

In a PowerShell terminal at the repository root:

```powershell
cd Server
npm run dev
```

The backend listens on port 9000. `npm start` runs it without the development watcher.

## 5. Start the frontend

In a second PowerShell terminal at the repository root:

```powershell
cd client
npm start
```

Open `http://localhost:3000`. The frontend development proxy targets `http://localhost:9000`.

## 6. Validate incrementally

```powershell
# From Server: syntax check only
node --check server.js
node --test test/runtime.test.js
# From client: attempt the production build
npm run build
```

These commands do not prove database, authentication or hardware functionality. The server's existing `npm test` script is a failing placeholder. Document actual test results when repairing each feature.

Stop each development process with Ctrl+C. No cloud service-account key is needed merely to view the frontend; integrations requiring credentials need separate implementation and secure configuration.
