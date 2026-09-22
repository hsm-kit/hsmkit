AES-GCM and AES-CBC both use the AES block cipher, but they provide different security guarantees. GCM is an authenticated-encryption mode designed for modern systems. CBC is an older confidentiality-only mode that must be combined with a separate message authentication code (MAC). This guide explains the practical differences and how to choose safely.

## Short Answer

Use **AES-GCM for new applications** unless a protocol or legacy integration requires CBC. GCM encrypts the data and authenticates it in one operation. CBC only encrypts; without a correctly constructed MAC, an attacker may modify ciphertext without detection.

CBC remains appropriate when compatibility is mandatory and the design uses **encrypt-then-MAC** with independent encryption and authentication keys.

## Security Comparison

| Property | AES-GCM | AES-CBC |
|---|---|---|
| Confidentiality | Yes | Yes |
| Integrity and authenticity | Built-in authentication tag | Not built in |
| Padding required | No | Yes, normally PKCS#7 |
| IV / nonce size | 12-byte nonce recommended | 16-byte IV |
| IV requirement | Unique for every message under a key | Random and unpredictable |
| Parallel encryption | Yes | No |
| Common failure | Nonce reuse | Missing MAC, padding oracle, predictable IV |
| New-system recommendation | Preferred | Use only for compatibility |

The AES key size does not change these mode-level properties. AES-256-CBC without authentication is still easier to misuse than AES-128-GCM with a unique nonce.

## Why Authentication Matters

Encryption alone hides plaintext, but it does not necessarily prove that ciphertext is genuine. An active attacker may flip, remove, reorder, or replace bytes. The application must reject altered data before using it.

GCM produces an authentication tag, commonly 128 bits, alongside the ciphertext. Decryption succeeds only when the key, nonce, ciphertext, tag, and optional additional authenticated data (AAD) all match.

CBC has no tag. A secure CBC construction normally computes an HMAC over the IV and ciphertext using a separate authentication key:

```text
ciphertext = AES-CBC-Encrypt(encryptionKey, IV, paddedPlaintext)
tag = HMAC(authenticationKey, version || IV || ciphertext)
```

The receiver verifies the tag **before** attempting CBC decryption. A home-grown encrypt-and-MAC or MAC-then-encrypt design can introduce subtle vulnerabilities; use a reviewed protocol or library instead.

## IV and Nonce Requirements

### GCM nonce

NIST recommends a 96-bit (12-byte) nonce for GCM. It does not need to be secret, but it must never repeat with the same key. Reuse can reveal relationships between plaintexts and undermine authentication.

A random 96-bit nonce is simple for moderate message volumes. High-volume or distributed systems should use a documented counter-based strategy with collision-free allocation. See [AES IV and nonce reuse](/guides/aes-iv-nonce-reuse/) for failure analysis and design options.

### CBC IV

CBC requires a fresh 16-byte IV that is unpredictable before the plaintext is chosen. Generate it with a cryptographically secure random number generator. Store or transmit it next to the ciphertext; secrecy is unnecessary.

Do not derive a CBC IV from a timestamp, record ID, previous IV, or password. Predictable IVs can expose relationships in the first plaintext block.

## Performance and Message Size

GCM supports parallel processing and usually benefits from hardware acceleration. It is widely optimized in modern CPUs, TLS stacks, browser Web Crypto, and cryptographic libraries. Its output overhead is typically:

- 12-byte nonce
- ciphertext with the same length as plaintext
- 16-byte authentication tag

CBC encryption is sequential because each plaintext block depends on the previous ciphertext block. It also adds between 1 and 16 bytes of [PKCS#7 padding](/guides/pkcs7-padding-aes/), plus a 16-byte IV and the output of a separate MAC when implemented securely.

For small records, protocol overhead matters more than raw AES speed. For large streams, GCM's parallelism is usually advantageous.

## Compatibility Considerations

CBC may still be required by:

- legacy file or database formats;
- older payment and enterprise protocols;
- systems that cannot negotiate an AEAD cipher;
- existing data that must remain decryptable during migration.

Compatibility does not justify unauthenticated encryption. If the existing format has no place for a MAC, treat it as a legacy risk and design a versioned replacement rather than silently extending it.

GCM is broadly available in current versions of OpenSSL, Java, .NET, Web Crypto, Node.js, Go, Python cryptography libraries, and cloud key-management services.

## Migration from CBC to GCM

A safe migration should distinguish old and new records explicitly:

```text
version || algorithm || nonce_or_iv || ciphertext || tag
```

A practical sequence is:

1. Add a version or algorithm identifier to the envelope.
2. Write new records with GCM and a fresh nonce.
3. Continue reading authenticated legacy CBC records.
4. Re-encrypt old records after successful authentication and decryption.
5. Retire CBC writing, then remove CBC reading after the retention period.

Never guess the mode from ciphertext length. Explicit versioning prevents downgrade and parsing ambiguity.

## Decision Checklist

Choose GCM when:

- you control a new protocol or storage format;
- authenticated encryption is required;
- the platform provides a mature GCM implementation;
- you can guarantee nonce uniqueness.

Use CBC only when:

- compatibility requires it;
- ciphertext is authenticated with encrypt-then-MAC;
- encryption and MAC keys are independently derived;
- errors do not reveal whether padding or authentication failed;
- IVs are generated with a secure random source.

## Test the Modes

Use the [AES Encryption Tool](/aes-encryption) to compare CBC and other AES modes, inspect IV handling, and observe padding behavior. For browser application code, continue with the [Web Crypto AES-GCM guide](/guides/web-crypto-aes-gcm/). Test data only; never paste production keys or sensitive plaintext into an online tool.
