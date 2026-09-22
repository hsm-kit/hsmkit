The Web Crypto API provides browser-native cryptographic primitives through `crypto.subtle`. AES-GCM is the preferred general-purpose symmetric mode in Web Crypto because it combines encryption and integrity protection. Correct use still requires unique nonces, deliberate key handling, and a stable ciphertext format.

## When Browser Encryption Helps

Web Crypto is useful when encryption must happen before data leaves the browser, for example:

- encrypting an export before download;
- protecting locally stored application data;
- implementing end-to-end encryption where the server never receives plaintext;
- interoperating with a service that already defines an AES-GCM envelope.

Browser encryption does not protect data from malicious script running in the same page. Cross-site scripting, compromised dependencies, or a malicious browser extension may access plaintext before encryption or after decryption. Content Security Policy, dependency control, and application security remain essential.

## Generate an AES-GCM Key

Generate keys with Web Crypto rather than `Math.random()` or hand-built random strings:

```js
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt'],
);
```

The `extractable` argument is `true` above so the key can be exported for demonstration. Set it to `false` when the key should remain a non-exportable `CryptoKey` in the current environment.

AES-128 and AES-256 are both secure choices when used correctly. Key storage and nonce uniqueness usually matter more than selecting the larger key size.

## Encrypt UTF-8 Text

Web Crypto accepts bytes, not JavaScript strings. Encode text with `TextEncoder` and generate a fresh 12-byte nonce:

```js
const encoder = new TextEncoder();
const nonce = crypto.getRandomValues(new Uint8Array(12));
const plaintext = encoder.encode('Sensitive test message');
const aad = encoder.encode('hsmkit:v1:message');

const encrypted = await crypto.subtle.encrypt(
  {
    name: 'AES-GCM',
    iv: nonce,
    additionalData: aad,
    tagLength: 128,
  },
  key,
  plaintext,
);

const ciphertextAndTag = new Uint8Array(encrypted);
```

In Web Crypto, the returned buffer contains ciphertext followed by the authentication tag. Other libraries may expose ciphertext and tag as separate fields, so define the interchange format explicitly.

## Decrypt and Authenticate

Decryption must receive the same key, nonce, AAD, and tag length:

```js
const decrypted = await crypto.subtle.decrypt(
  {
    name: 'AES-GCM',
    iv: nonce,
    additionalData: aad,
    tagLength: 128,
  },
  key,
  ciphertextAndTag,
);

const message = new TextDecoder().decode(decrypted);
```

If the ciphertext, tag, nonce, AAD, or key is wrong, the promise rejects. Treat rejection as a single authentication failure. Do not use unauthenticated plaintext or attempt to ignore a failed tag.

## Package the Ciphertext

Store enough metadata to decrypt the record later. A compact JSON envelope might look like:

```json
{
  "v": 1,
  "alg": "A256GCM",
  "kid": "2026-09-primary",
  "iv": "base64url nonce",
  "ct": "base64url ciphertext plus tag"
}
```

The algorithm and version are public. The nonce is public. Only the key must remain secret. Encode binary fields with Base64url or Base64 according to a documented rule; never convert arbitrary ciphertext bytes directly to a JavaScript string.

Bind fields such as version, record ID, tenant ID, or content type through `additionalData` when they must not be changed. AAD is authenticated but not encrypted, so do not place secrets in it.

## Nonce Management

A 12-byte nonce is recommended for GCM. Generate a new nonce for every encryption under a key:

```js
const nonce = crypto.getRandomValues(new Uint8Array(12));
```

Never reuse the nonce when encrypting different plaintext with the same key. Retries, multiple tabs, service workers, restored application state, and shared accounts all need consideration. For high-volume systems, design a durable nonce allocation scheme rather than assuming random generation solves coordination forever.

Read [AES IV and nonce reuse](/guides/aes-iv-nonce-reuse/) before designing shared or long-lived keys.

## Export and Import Keys

Export a generated key as raw bytes only when the application has a secure wrapping or storage plan:

```js
const rawKey = await crypto.subtle.exportKey('raw', key);

const importedKey = await crypto.subtle.importKey(
  'raw',
  rawKey,
  { name: 'AES-GCM' },
  false,
  ['encrypt', 'decrypt'],
);
```

Do not store raw AES keys in localStorage. Any script running on the origin can read localStorage. IndexedDB can store non-exportable `CryptoKey` objects in supported browsers, but same-origin malicious script may still use the key. For strong user authentication or cross-device recovery, use a reviewed key-management design.

## Passwords Are Not AES Keys

A password must be processed by a password-based key derivation function (KDF). Do not UTF-8 encode a password, truncate it to 16 or 32 bytes, or hash it once and call the result a key.

Web Crypto supports PBKDF2. A password-based envelope must store a random salt and KDF parameters alongside the nonce and ciphertext. Choose iteration counts based on current platform measurements and policy. For new designs requiring memory-hard derivation, a reviewed Argon2 implementation may be more appropriate, although it is not currently a native Web Crypto algorithm.

## Common Errors

| Error | Why it fails | Correct approach |
|---|---|---|
| Reusing a fixed nonce | Breaks GCM security | Generate or allocate a unique 12-byte nonce |
| Using `Math.random()` | Not cryptographically secure | Use `crypto.getRandomValues()` |
| Omitting envelope version | Prevents safe migration | Store explicit version and algorithm |
| Storing raw key in localStorage | Readable by same-origin script | Use non-exportable keys or external key management |
| Losing AAD | Decryption authentication fails | Define and persist AAD inputs |
| Splitting the Web Crypto output incorrectly | Drops or corrupts the tag | Document ciphertext/tag layout |
| Encrypting without XSS controls | Malicious script can steal plaintext | Harden the application and CSP |

## Interoperability Notes

Before exchanging AES-GCM data with Java, .NET, OpenSSL, Node.js, or another service, agree on:

- key length and raw key bytes;
- 12-byte nonce representation;
- 128-bit tag length;
- whether ciphertext and tag are combined;
- exact AAD bytes;
- Base64 versus Base64url and padding rules;
- envelope version and byte order.

Use known test vectors before production integration. The [AES Encryption Tool](/aes-encryption) can help inspect encodings with non-sensitive data. For the mode decision itself, see [AES-GCM vs AES-CBC](/guides/aes-gcm-vs-cbc/).
