AES (Advanced Encryption Standard) is the world's most widely used symmetric encryption algorithm. Whether you're securing a database, encrypting files, or protecting network traffic, AES is almost certainly involved. This guide explains how it works and how to use it correctly.

## What is AES?

AES was selected by NIST in 2001 as the replacement for the aging DES algorithm. It's a **block cipher** — it encrypts fixed-size blocks of data (128 bits / 16 bytes) using a secret key.

Key facts:
- Block size: **128 bits** (always)
- Key sizes: **128, 192, or 256 bits**
- Structure: Substitution-Permutation Network (SPN)
- Rounds: 10 (AES-128), 12 (AES-192), 14 (AES-256)

## AES Key Sizes Compared

| Key Size | Security Level | Use Case |
|----------|---------------|----------|
| AES-128 | ~128-bit security | General purpose, fast |
| AES-192 | ~192-bit security | Higher security needs |
| AES-256 | ~256-bit security | Government, long-term secrets |

AES-128 is considered secure against all known attacks. AES-256 is recommended for data that needs to remain confidential for decades.

## How AES Works (Simplified)

AES processes data through multiple **rounds**, each consisting of four operations:

### 1. SubBytes
Each byte is replaced using a fixed lookup table (S-Box). This provides **confusion** — making the relationship between key and ciphertext complex.

### 2. ShiftRows
Rows of the 4×4 state matrix are shifted cyclically. This provides **diffusion** — spreading the influence of each byte.

### 3. MixColumns
Each column is multiplied by a fixed polynomial in GF(2⁸). Further diffuses data across the block.

### 4. AddRoundKey
The current round key (derived from the main key) is XORed with the state. This is where the secret key actually enters the process.

## Modes of Operation

AES encrypts one 16-byte block at a time. For longer data, you need a **mode of operation**:

### ECB (Electronic Codebook) — Avoid for most uses
- Each block encrypted independently
- Same plaintext block always produces same ciphertext block
- **Problem**: Patterns in data are visible in ciphertext (famous "ECB penguin" problem)
- **Use only for**: Single-block encryption, key wrapping

### CBC (Cipher Block Chaining) — Most common legacy mode
- Each block XORed with previous ciphertext before encryption
- Requires an **Initialization Vector (IV)**
- IV must be random and unique per encryption
- **Use for**: File encryption, database fields

### CTR (Counter) — Stream cipher mode
- Encrypts a counter value, XORs with plaintext
- Turns AES into a stream cipher
- Parallelizable, no padding needed
- **Use for**: High-performance encryption, streaming data

### GCM (Galois/Counter Mode) — Recommended for new systems
- CTR mode + authentication tag
- Provides both **confidentiality and integrity**
- Detects tampering automatically
- **Use for**: TLS, API encryption, any modern system

### CFB / OFB
- Older stream-cipher-like modes
- Less common in modern systems

## Padding

Since AES works on 16-byte blocks, data that isn't a multiple of 16 bytes needs padding.

**PKCS#7 Padding** (most common):
- Adds N bytes of value N to reach block boundary
- Example: 13 bytes of data → add 3 bytes of `0x03`

```
Data:    48 65 6C 6C 6F (5 bytes)
Padded:  48 65 6C 6C 6F 0B 0B 0B 0B 0B 0B 0B 0B 0B 0B 0B (16 bytes)
```

GCM mode doesn't need padding (it's a stream mode).

## IV / Nonce Best Practices

The Initialization Vector (IV) or nonce is critical for security:

- **Never reuse** an IV with the same key
- For CBC: use a **random 16-byte IV**, store alongside ciphertext
- For GCM: use a **random 12-byte nonce**, store alongside ciphertext
- For CTR: use a unique counter/nonce combination

Reusing an IV can completely break encryption security.

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Using ECB mode | Patterns visible | Use CBC or GCM |
| Reusing IV/nonce | Security broken | Generate fresh random IV each time |
| Hardcoded key | Key exposure | Use key management system |
| No authentication | Tampering undetected | Use GCM or add HMAC |
| Weak key derivation | Brute-force risk | Use PBKDF2/bcrypt for password-based keys |

## AES in Payment Systems

In the payment industry, AES is used for:
- **PIN Block encryption** (AES Format 4, ISO 9564) — see our [PIN Block guide](/guides/pin-block-formats-iso9564)
- **DUKPT AES** — per-transaction key derivation — see our [DUKPT guide](/guides/dukpt-key-derivation-tutorial)
- **TR-31 key blocks** (Version D uses AES-256) — see our [TR-31 guide](/guides/what-is-tr31-key-block)
- **MAC calculation** (AES-CMAC)

## Try It Yourself

Use our [AES Encryption Tool](/aes-encryption) to:

- Encrypt and decrypt data with AES-128/192/256
- Test all modes: ECB, CBC, CFB, OFB, CTR
- Visualize IV and padding behavior
- Export results in hex or Base64

All processing happens in your browser — your keys and data never leave your device.
