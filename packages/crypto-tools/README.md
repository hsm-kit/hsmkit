# @hsmkit/crypto-tools

Small, auditable primitives shared by the open-source [HSM Kit](https://hsmkit.com/) project. The package has no runtime dependencies and works in modern browsers and Node.js 20+.

## Install

```bash
npm install @hsmkit/crypto-tools
```

## API

```ts
import {
  decodeBase64,
  encodeBase64,
  generateIso0PinBlock,
  luhnCalculateCheckDigit,
  luhnValidate,
  xorHex,
} from '@hsmkit/crypto-tools';

luhnCalculateCheckDigit('7992739871'); // "3"
luhnValidate('79927398713'); // true
xorHex('FF00FF00', '00FF00FF'); // "FFFFFFFF"
generateIso0PinBlock('1234', '4111111111111111'); // "041225EEEEEEEEEE"
encodeBase64('HSM Kit'); // "SFNNIEtpdA=="
decodeBase64('SFNNIEtpdA=='); // "HSM Kit"
```

Additional exports provide strict Hex and Base64 byte conversion. Invalid inputs throw `CryptoToolsError` with a stable `code`.

## Security boundary

This package is intended for educational, interoperability, and synthetic test data. It does not provide key custody, production HSM access, secure memory, or certified cryptographic modules. Never pass production PINs, keys, credentials, or live payment data to development tools.

Documentation and browser tools: <https://hsmkit.com/>  
Issues: <https://github.com/hsm-kit/hsmkit/issues>
