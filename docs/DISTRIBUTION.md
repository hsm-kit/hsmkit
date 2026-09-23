# Distribution and Release Checklist

This document separates repository automation from account-level actions that require an HSM Kit maintainer.

## 1. Baidu Webmaster and URL submission

Repository support is ready:

- `npm run submit:baidu -- --dry-run` previews Chinese sitemap URLs.
- `npm run submit:baidu -- --all --dry-run` previews every canonical URL.
- The **Submit URLs to Baidu** workflow submits Chinese URLs by default and also supports one URL or all sitemap URLs.

Maintainer setup:

1. Add `https://hsmkit.com` in [Baidu Search Resource Platform](https://ziyuan.baidu.com/).
2. Complete site ownership verification. DNS verification is preferred because it survives deployments.
3. Open the ordinary inclusion/API submission page and copy the token from its push endpoint.
4. Add a GitHub Actions repository secret named `BAIDU_PUSH_TOKEN`.
5. Run **Actions > Submit URLs to Baidu > Run workflow** after the Chinese pages are deployed.

Submit new or materially changed URLs. Repeatedly submitting the entire sitemap wastes the daily quota.

## 2. RSS feeds

The build publishes and advertises two RSS 2.0 feeds:

- English: <https://hsmkit.com/guides/feed.xml>
- Chinese: <https://hsmkit.com/zh/guides/feed.xml>

Run `npm run generate:rss` after guide metadata changes. `src/data/rss.test.ts` checks that each guide has one canonical feed item.

## 3. GitHub distribution

### Topics

Add these in **Repository > About > Settings**:

`cryptography`, `hsm`, `payment-security`, `pki`, `webcrypto`, `security-tools`, `typescript`, `react`, `mcp`, `model-context-protocol`, `cloudflare-pages`, `open-source`

### Releases

The **Publish Packages and Release** workflow runs for `v*` tags. It verifies matching package versions, tests and builds both packages, runs the MCP stdio E2E test, publishes missing npm versions, registers the MCP server, and creates a GitHub Release.

Before creating a tag:

1. Confirm the `hsmkit` npm scope is owned by the publishing account or organization.
2. Add the repository secret `NPM_TOKEN` with permission to publish both public packages.
3. Set the same version in:
   - `packages/crypto-tools/package.json`
   - `packages/mcp-server/package.json`
   - `packages/mcp-server/server.json`
4. Commit and push the version change.
5. Create and push the matching tag, for example `git tag v0.1.0 && git push origin v0.1.0`.
6. Confirm npm, MCP Registry, and GitHub Release steps all succeed.

The npm steps are retry-safe: an already-published version is skipped when the workflow is rerun.

### Curated lists

Wait until the npm package and GitHub Release are public, then submit only to matching directories.

For `punkpeye/awesome-mcp-servers`, add this alphabetically under **Cryptography** in one PR:

```markdown
- [hsm-kit/hsmkit](https://github.com/hsm-kit/hsmkit) 📇 🏠 🍎 🪟 🐧 - Local-first HSM and payment-security utilities for Luhn checks, key-component XOR, Base64, and synthetic ISO-0 PIN blocks. No network calls or credentials. `npx -y @hsmkit/mcp-server`
```

For `wong2/awesome-mcp-servers`, do not open a PR. Use <https://mcpservers.org/submit>.

For `sobolevn/awesome-cryptography`, add this under **Resources > Web-tools** as one commit and one PR:

```markdown
- [HSM Kit](https://hsmkit.com/) - Browser-based HSM, payment-security, PKI, and cryptography tools with multilingual guides and published test vectors.
```

Do not submit HSM Kit to `modelcontextprotocol/servers`; that repository only accepts steering-group reference servers. Use the official MCP Registry instead.

Suggested PR title: `Add HSM Kit cryptography tools`

Suggested rationale: `HSM Kit is open source, runs cryptographic and payment test utilities locally in the browser or over stdio, publishes reproducible tests and vectors, and clearly limits all examples to synthetic data.`

## 4. npm core package

Package: `@hsmkit/crypto-tools`

Local checks:

```bash
npm run test -w @hsmkit/crypto-tools
npm run build -w @hsmkit/crypto-tools
npm pack -w @hsmkit/crypto-tools --dry-run
```

The initial public release is performed by the tag workflow. Do not create the tag until npm scope ownership and `NPM_TOKEN` are confirmed.

## 5. MCP server and registry

Package: `@hsmkit/mcp-server`  
Registry name: `io.github.hsm-kit/hsmkit`

Local checks:

```bash
npm run test -w @hsmkit/mcp-server
npm run build -w @hsmkit/mcp-server
npm run test:e2e -w @hsmkit/mcp-server
npm pack -w @hsmkit/mcp-server --dry-run
```

The tag workflow publishes the npm package first, authenticates `mcp-publisher` with GitHub OIDC, publishes `server.json`, and creates the GitHub Release. After it succeeds, verify the server at <https://registry.modelcontextprotocol.io/>.

Install command after publication:

```bash
npx -y @hsmkit/mcp-server
```

Use synthetic data only. Never send production keys, PINs, credentials, personal data, or live payment data through an AI client.
