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

## 3. Configure and migrate the database

Follow [the database setup guide](DATABASE.md) to back up an existing database, create isolated development schemas, configure `Server/.env`, review the migration plan and apply it.

The versioned migrations create the account and jobs tables expected by the current routes. Older SQL examples are not a complete commerce schema. Configuration alone does not create tables.

The backend defaults to `127.0.0.1:9000`. `CLIENT_ORIGIN` accepts one exact origin such as `http://localhost:3000`, without a trailing slash. Public account-listing routes remain disabled until authenticated authorization is implemented.

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
node --test test/runtime.test.js test/migrations.test.js
# From client: attempt the production build
npm run build
```

These commands do not prove database, authentication or hardware functionality. The server's existing `npm test` script is a failing placeholder. Document actual test results when repairing each feature.

Stop each development process with Ctrl+C. No cloud service-account key is needed merely to view the frontend; integrations requiring credentials need separate implementation and secure configuration.
