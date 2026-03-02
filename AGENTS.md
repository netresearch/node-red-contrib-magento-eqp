<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Managed by agent: keep sections and order; edit content, not structure -->
<!-- Last updated: 2026-03-02 | Last verified: 2026-03-02 -->

# AGENTS.md

**Precedence:** the **closest `AGENTS.md`** to the files you're changing wins. Root holds global defaults only.

## Project

| Key             | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Name            | `@netresearch/node-red-contrib-magento-eqp`                             |
| Purpose         | Node-RED nodes for parsing Adobe Commerce Marketplace EQP API callbacks |
| Type            | Node-RED contribution package (npm)                                     |
| Language        | TypeScript (strict mode)                                                |
| Node            | >=20                                                                    |
| Package manager | yarn                                                                    |
| Registry        | npm (`@netresearch` scope) + GitHub Packages                            |
| Runtime         | Node-RED (Node.js)                                                      |

### Upstream dependency

| Package                                                                            | Dep spec | API surface used                                                                               |
| ---------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| [`@netresearch/node-magento-eqp`](https://github.com/netresearch/node-magento-eqp) | `^5.0.0` | `EQP` class, `HttpError`, `EQPStatusUpdateEvent`, `MalwareScanCompleteEvent`, callback service |

## Commands

> Source: CI (github-actions) + package.json — CI-sourced commands are most reliable

| Task            | Command              | ~Time |
| --------------- | -------------------- | ----- |
| Install         | `yarn install`       | ~10s  |
| Build           | `yarn build`         | ~15s  |
| Build lib only  | `yarn build:lib`     | ~5s   |
| Lint            | `yarn lint`          | ~5s   |
| Test            | `yarn test`          | ~1s   |
| Test + coverage | `yarn test:coverage` | ~1s   |

> Tests use **vitest** with `@vitest/coverage-v8`. Coverage thresholds enforced at 95% (statements/branches/functions/lines). Currently at 100%.

## Workflow

1. **Before coding**: Read this AGENTS.md
2. **After each change**: Run the smallest relevant check (test → lint → build)
3. **Before committing**: Run `yarn test && yarn lint && yarn build:lib`
4. **Before claiming done**: Run verification and **show output as evidence**

## Architecture

```
src/
├── index.ts                           → Barrel re-export (types + all modules)
├── types.ts                           → MagentoEQPConfigNode interface
├── magento-eqp-config.ts             → Config node: credentials, EQP instantiation
├── magento-eqp-config.html           → Config node editor UI
├── magento-eqp-callback-parser.ts    → Input node: parse EQP webhook events
├── magento-eqp-callback-parser.html  → Callback parser editor UI
├── magento-eqp-register-callback.ts  → Input node: register webhook callbacks
├── magento-eqp-register-callback.html → Register callback editor UI
└── __tests__/                         → vitest test suite (30 tests, 100% coverage)
    ├── helpers/node-red-mock.ts       → MockNode + MockRED factories
    ├── magento-eqp-config.test.ts
    ├── magento-eqp-callback-parser.test.ts
    └── magento-eqp-register-callback.test.ts
```

**Key patterns:**

- Each node is a CommonJS module exporting `function(RED)` — Node-RED convention
- `magento-eqp-config` is a shared config node holding `EQP` instance and credentials
- Other nodes get the config node via `RED.nodes.getNode(config.config)`
- Dual output pattern: `[successMsg, null]` or `[null, errorMsg]` for callback parser
- `HttpError.data` is extracted into `httpResponse` field on error messages

## File Map

```
src/              → TypeScript source (nodes + types)
dist/             → Compiled output (gitignored)
coverage/         → v8 coverage reports (gitignored)
.github/workflows → CI/CD workflows
tsconfig.build.json → Build config (excludes __tests__ from output)
vitest.config.ts    → Test config (95% thresholds, v8 coverage)
copyAssets.js       → Copies .html files to dist/ during build
```

## Testing

- **Framework:** vitest with `@vitest/coverage-v8`
- **Config:** `vitest.config.ts` (root `./src`, 95% thresholds)
- **Build exclusion:** `tsconfig.build.json` excludes `__tests__/` and `*.test.ts` from dist
- **Node-RED mocking:** Custom lightweight mock in `helpers/node-red-mock.ts` (no `node-red-node-test-helper`)
- **Test pattern:** Call `module(RED)` → extract constructor from `registerType` → call `Constructor.call(mockNode, config)` → emit events → assert
- **Module loading:** Use `await import('../module')` (not `require`) — vitest runs TypeScript natively via ESM transforms
- **Coverage:** 30 tests, 100% coverage

## Golden Samples (follow these patterns)

| For           | Reference                                           | Key patterns                                      |
| ------------- | --------------------------------------------------- | ------------------------------------------------- |
| Config node   | `src/magento-eqp-config.ts`                         | Credential validation, EQP instantiation          |
| Input node    | `src/magento-eqp-callback-parser.ts`                | Config lookup, input listener, dual output        |
| Node test     | `src/__tests__/magento-eqp-callback-parser.test.ts` | Mock RED + node, async setupNode pattern          |
| Node-RED mock | `src/__tests__/helpers/node-red-mock.ts`            | EventEmitter-based MockNode, nodeStore-backed RED |

## Heuristics (quick decisions)

| When                      | Do                                                                  |
| ------------------------- | ------------------------------------------------------------------- |
| Committing                | Use Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)           |
| Adding dependency         | Ask first — keep lightweight for Node-RED users                     |
| Adding a new node         | Create `.ts` + `.html`, register in `package.json` node-red section |
| Changing EQP API usage    | Check upstream `@netresearch/node-magento-eqp` AGENTS.md            |
| Unsure about node pattern | Check `magento-eqp-callback-parser.ts` as canonical example         |

## Repository Settings

- **Default branch:** `main`
- **Merge strategy:** rebase
- **Required checks:** Lint, Build, Test
- **Require up-to-date:** yes — rebase before merge
- **Dependency updates:** Renovate (auto-merge minor/patch)
- **Release flow:** release-please creates version-bump PR → maintainer pushes signed tag → CI publishes

## Boundaries

### Always Do

- Run `yarn test && yarn lint && yarn build:lib` before committing
- Add tests for new code (maintain ≥95% coverage)
- Use TypeScript strict mode
- Use conventional commit format: `type(scope): subject`
- **Show build/lint/test output as evidence before claiming work is complete**

### Ask First

- Adding new dependencies
- Modifying CI/CD configuration
- Changing the public node interface (inputs/outputs/config)
- Bumping major version

### Never Do

- Commit secrets, credentials, or sensitive data
- Modify `node_modules/` or `dist/`
- Push directly to main branch
- Use `any` type without justification
- Import `node-red-node-test-helper` (use the lightweight mock instead)

## When instructions conflict

Explicit user prompts override files. For TypeScript patterns, follow project eslint/prettier config.
