# @hsmkit/mcp-server

A local-first Model Context Protocol server for HSM Kit. It exposes small, deterministic tools for encoding, check digits, key-component tests, and synthetic payment test data.

## Run

```bash
npx -y @hsmkit/mcp-server
```

Claude Desktop example:

```json
{
  "mcpServers": {
    "hsmkit": {
      "command": "npx",
      "args": ["-y", "@hsmkit/mcp-server"]
    }
  }
}
```

## Tools

- `luhn_calculate_check_digit`
- `luhn_validate`
- `xor_key_components`
- `iso0_pin_block`
- `base64_encode`
- `base64_decode`

Each result includes a related `https://hsmkit.com/` documentation URL. The server uses stdio, makes no network requests, and does not log tool inputs.

## Security boundary

Use synthetic test data only. AI clients may retain prompts or tool arguments independently of this server. Never submit production keys, real PINs, credentials, personal information, or live payment data.

Source: <https://github.com/hsm-kit/hsmkit/tree/main/packages/mcp-server>  
Issues: <https://github.com/hsm-kit/hsmkit/issues>
