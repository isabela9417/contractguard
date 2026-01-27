# ContractGuard — User & Developer Guide

This user guide explains how to use, extend, and operate ContractGuard. It is intended for developers, auditors, and operators working with the repository.

> NOTE: Replace examples, CLI names, and endpoints with repository-specific commands and interfaces.

Table of contents
- Overview
- Architecture & components
- Installation & local setup
- Configuration
- Common tasks / Workflows
- CLI / API usage (examples)
- Development workflow
- Testing strategy
- Debugging & troubleshooting
- Deployment & release checklist
- Security best practices
- FAQ
- Appendix: useful commands

---

## Overview

ContractGuard helps inspect, monitor, and enforce policies for smart contracts. Typical responsibilities:
- Static analysis and rule checks
- Monitoring contracts for suspicious events
- Triggering alerts or automated responses
- Integrating with off-chain services and dashboards

## Architecture & components

(Adapt to your code)
- Core analysis engine (TypeScript): parses ABIs, sources, and applies rules
- Data store (optional): PostgreSQL or other DB for storing findings and history
- Monitoring agent: listens to blockchain events and forwards to processing
- API / Web UI: exposes findings, configuration, and reports
- Integrations: alerting webhooks, messaging channels (Slack/Discord), dashboards

High-level flow:
1. Input contracts (ABI/source/hash) are fed to the analysis engine
2. The engine runs rules and outputs findings with severities
3. Findings are stored and optionally served by the API/UI
4. Monitoring agents stream events; rule triggers generate alerts

## Installation & local setup

Prerequisites
- Node.js >= 18
- npm / yarn / pnpm
- (Optional) PostgreSQL or another DB for persistence
- (Optional) Docker for containerized services

Setup steps
1. Clone repository:
   ```bash
   git clone https://github.com/isabela9417/contractguard.git
   cd contractguard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env` template and populate values:
   ```bash
   cp .env.example .env
   ```
4. Start dependent services (if using Docker Compose):
   ```bash
   docker compose up -d
   ```
5. Run the app in development:
   ```bash
   npm run dev
   ```

## Configuration

Important configuration items (customize to match project):
- RPC and network settings:
  - `RPC_URL` — JSON-RPC endpoint for the monitored chain
  - `CHAIN_ID` — network chain id (optional)
- Database:
  - `DATABASE_URL` — database connection string
- App:
  - `PORT` — HTTP port
  - `LOG_LEVEL` — info | debug | warn | error
- Alerting:
  - `ALERT_WEBHOOK` — webhook URL to deliver alerts
  - `ALERT_THRESHOLD` — severity threshold for sending alerts

Use environment variables or a configuration file. Consider a hierarchical config (defaults, env, per-deploy override).

## Common tasks / Workflows

Add a contract for analysis:
1. Provide contract ABI or source in `src/contracts/` or via the API.
2. Trigger analysis:
   - CLI: `node dist/cli/analyze.js --file ./contracts/MyToken.json`
   - API: POST `/api/analysis` with contract payload

Run monitoring:
- Start the monitor service: `npm run monitor`
- Configure target contracts and event handlers via `config/monitor.yml` (example)

Respond to findings:
- Review stored findings through the UI or API
- For critical severity, trigger webhooks or automatic mitigation

## CLI / API usage (example)

Example CLI (replace with actual CLI implementation):
```bash
# analyze a contract file
npm run analyze -- --file ./examples/MyToken.json

# run a suite of checks
npm run check -- --suite default
```

Example API endpoints (replace paths with real ones):
- `GET /api/health` — service health
- `POST /api/analysis` — submit a contract for analysis
- `GET /api/analysis/:id` — get analysis report

cURL example:
```bash
curl -X POST http://localhost:3000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"name":"MyToken","abi": {...}}'
```

## Development workflow

Branching model
- `main` or `master`: stable releases
- `develop`: integration branch
- feature branches: `feat/<short-desc>`

Local development tips
- Use `npm run dev` to run TypeScript in watch mode (ts-node or other)
- Write unit tests for new features
- Use linters and formatters before opening PRs

Recommended npm scripts (add to package.json):
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint 'src/**/*.{ts,tsx}'",
    "analyze": "node dist/cli/analyze.js"
  }
}
```

## Testing strategy

- Unit tests: run fast, mock external services
- Integration tests: run against a testnet/localchain, or use forked mainnet fixtures
- Contract fuzzing and property tests (if applicable)
- CI: run tests and lint on push/PR

Example:
```bash
npm run test
npm run test:integration
```

## Debugging & troubleshooting

- Increase log level: `LOG_LEVEL=debug npm run dev`
- Use breakpoints with a Node debugger or VS Code debugging profile
- Inspect DB contents using `psql` or GUI tools
- Reproduce issues in a local environment with sample contracts

Common issues
- Missing environment variables: check `.env`
- RPC timeouts: verify `RPC_URL` and network connectivity
- Type errors: run `npm run build` to catch compile-time issues

## Deployment & release checklist

- Ensure environment variables are set in the target environment
- Run build and tests:
  ```bash
  npm run build
  npm run test
  ```
- Tag releases using semantic versioning
- Publish artifacts or Docker images
- Update release notes documenting changes and upgrade instructions

## Security best practices

- Do not check secrets into source control
- Use least-privilege for any RPC provider keys
- Sanitize inputs and limit the size of uploaded contract sources
- Validate webhooks and external payloads (HMAC signing)
- Rotate keys and monitor for suspicious activity

## FAQ

Q: How do I add new rule checks?
A: Add a new rule module under `src/rules/`, export a standardized interface, add the rule to the rule registry/configuration, and add unit tests.

Q: How do I connect to a different chain?
A: Update `RPC_URL` and `CHAIN_ID` in configuration and restart the monitor services. Validate chain compatibility for any chain-specific logic.

## Appendix — Useful commands

- Install: `npm install`
- Start dev server: `npm run dev`
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

---

If you want, I can:
- Convert these into ready-to-commit files and open a branch/PR with the content,
- Or tailor both documents to the exact scripts, CLI names, and env variables in your repo if you provide package.json and example env files.
