# @netresearch/node-red-contrib-magento-eqp

[![npm version](https://img.shields.io/npm/v/@netresearch/node-red-contrib-magento-eqp?style=flat-square)](https://www.npmjs.com/package/@netresearch/node-red-contrib-magento-eqp)
[![CI](https://img.shields.io/github/actions/workflow/status/netresearch/node-red-contrib-magento-eqp/lint.yml?branch=main&style=flat-square&label=CI)](https://github.com/netresearch/node-red-contrib-magento-eqp/actions/workflows/lint.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/netresearch/node-red-contrib-magento-eqp/codeql.yml?branch=main&style=flat-square&label=CodeQL)](https://github.com/netresearch/node-red-contrib-magento-eqp/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/npm/l/@netresearch/node-red-contrib-magento-eqp?style=flat-square)](https://github.com/netresearch/node-red-contrib-magento-eqp/blob/main/LICENSE)
[![Node.js](https://img.shields.io/node/v/@netresearch/node-red-contrib-magento-eqp?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)

[Node-RED](https://nodered.org/) nodes for parsing [Adobe Commerce Marketplace EQP API](https://developer.adobe.com/commerce/marketplace/guides/eqp/v1/) callbacks.

## Installation

Install via npm or the Node-RED Palette Manager:

```sh
npm install @netresearch/node-red-contrib-magento-eqp
```

## Nodes

| Node                          | Description                              |
| ----------------------------- | ---------------------------------------- |
| `magento-eqp-config`          | Configuration node with API secret       |
| `magento-eqp-callback-parser` | Parse EQP callbacks from `http in` nodes |

## Example Flow

An example flow is available at [example/flow.json](https://github.com/netresearch/node-red-contrib-magento-eqp/blob/main/example/flow.json).

![Example Usage](https://i.imgur.com/xGD2WvE.png)

## Related packages

- [`@netresearch/node-magento-eqp`](https://github.com/netresearch/node-magento-eqp) — TypeScript API wrapper for the EQP API

## Contributing

Contributions, issues, and feature requests are welcome. See the [issues page](https://github.com/netresearch/node-red-contrib-magento-eqp/issues).

## License

[MIT](LICENSE) - Netresearch DTT GmbH
