# Local development

## Requirements

Install Git, Node.js with npm, and MySQL. This legacy dependency set has no documented, verified Node version. Check dependency compatibility before selecting a runtime; backend bcrypt may require native build tools if a compatible prebuilt binary is unavailable.

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

`Server/server.js` currently connects to local MySQL using database names `user_db` and `job`, with credentials embedded in the source. Do not reuse privileged credentials outside an isolated development environment.

The SQL examples in `Database/` do not recreate the schema expected by all routes. In particular, `Membership.sql` creates `users`, while the server's account routes expect `user_sign_up`; jobs use `jods_list`. A complete migration set must be implemented before reliable account and jobs testing is possible. Creating empty databases alone does not resolve missing tables.

The server does not yet load database settings from `.env`; adding an environment file alone will not configure these connections.

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
# From client: attempt the production build
npm run build
```

These commands do not prove database, authentication or hardware functionality. The server's existing `npm test` script is a failing placeholder. Document actual test results when repairing each feature.

Stop each development process with Ctrl+C. No cloud service-account key is needed merely to view the frontend; integrations requiring credentials need separate implementation and secure configuration.
