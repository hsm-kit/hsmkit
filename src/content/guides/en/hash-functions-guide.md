Hash functions are everywhere in security — from password storage to blockchain, from file integrity to digital signatures. This guide explains how they work, which to use, and which to avoid.

## What is a Cryptographic Hash Function?

A hash function takes an input of any size and produces a **fixed-size output** (the hash or digest). A cryptographic hash function has additional properties:

1. **Deterministic**: Same input always produces same output
2. **One-way**: Cannot reverse the hash to get the input
3. **Avalanche effect**: Tiny input change → completely different output
4. **Collision resistant**: Computationally infeasible to find two inputs with same hash

## Common Hash Algorithms

### MD5 — Broken, avoid for security
- Output: 128 bits (32 hex chars)
- Status: **Cryptographically broken** (collisions found in seconds)
- Still used for: Non-security checksums, legacy systems, file deduplication
- **Never use for**: Passwords, digital signatures, security-critical applications

### SHA-1 — Deprecated
- Output: 160 bits (40 hex chars)
- Status: **Broken** (SHAttered attack, 2017 — collision found)
- Removed from TLS 1.3
- **Never use for**: New security applications

### SHA-256 — Workhorse of modern security
- Output: 256 bits (64 hex chars)
- Part of SHA-2 family
- Used in: Bitcoin, TLS certificates, code signing, JWT (HS256/RS256)
- Status: **Secure**, widely trusted
- **Use for**: General purpose security, digital signatures, HMAC

### SHA-384 / SHA-512 — Higher security SHA-2
- Output: 384 / 512 bits
- Faster than SHA-256 on 64-bit systems
- Used in: High-security applications, government systems
- Status: **Secure**

### SHA-3 (Keccak) — NIST standard, different design
- Output: 224/256/384/512 bits
- Completely different internal structure from SHA-2 (sponge construction)
- Designed as a backup if SHA-2 is ever broken
- Status: **Secure**, less widely deployed than SHA-2

### BLAKE2 — Fast and secure
- Output: Variable (up to 512 bits)
- Faster than MD5 on modern hardware while being secure
- Used in: WireGuard, password hashing (Argon2 uses it internally)
- Status: **Secure and recommended** for performance-critical applications

### BLAKE3 — Even faster
- Output: Variable (default 256 bits)
- Parallelizable, extremely fast
- Newer, less battle-tested than BLAKE2
- Status: **Secure**, gaining adoption

### SM3 — Chinese national standard
- Output: 256 bits
- Required in China for government and financial systems
- Similar security to SHA-256
- Status: **Secure**

### RIPEMD-160
- Output: 160 bits
- Used in Bitcoin addresses (combined with SHA-256)
- Status: **Secure** but aging

## Hash Algorithm Comparison

| Algorithm | Output | Speed | Security | Use |
|-----------|--------|-------|----------|-----|
| MD5 | 128-bit | Very fast | Broken | Checksums only |
| SHA-1 | 160-bit | Fast | Broken | Legacy only |
| SHA-256 | 256-bit | Good | Strong | General purpose |
| SHA-512 | 512-bit | Good (64-bit) | Strong | High security |
| SHA-3-256 | 256-bit | Moderate | Strong | Backup to SHA-2 |
| BLAKE2b | 512-bit | Very fast | Strong | Performance |
| BLAKE3 | 256-bit | Fastest | Strong | New systems |

## HMAC — Hash-based Message Authentication

HMAC (Hash-based Message Authentication Code) uses a hash function with a secret key to provide **authentication**:

```
HMAC(key, message) = Hash((key ⊕ opad) || Hash((key ⊕ ipad) || message))
```

HMAC-SHA256 is widely used for:
- API authentication (JWT HS256)
- Message integrity in payment systems
- TLS record authentication

See our [HMAC Calculator](/payments-mac-hmac) to compute HMAC-SHA256/SHA512 values.

## Hash Functions in Payment Security

In payment systems, hashes are used for:

### MAC Algorithms
MAC (Message Authentication Code) algorithms use hash functions to verify message integrity:
- **ISO 9797-1**: DES-based MAC — see our [ISO 9797 MAC tool](/payments-mac-iso9797-1)
- **ANSI X9.9/X9.19**: Retail MAC — see our [ANSI MAC tool](/payments-mac-ansix9)
- **AES-CMAC**: Modern AES-based MAC — see our [CMAC tool](/payments-mac-cmac)

### KCV (Key Check Value)
The KCV is essentially a hash of the key — encrypt zeros with the key and take the first 3 bytes. See our [Key Splitting & KCV guide](/guides/understanding-key-splitting-kcv).

### CVV Calculation
CVV uses a DES-based hash-like process. See our [CVV guide](/guides/cvv-cvc-calculation-methods).

## Password Hashing — Special Case

Regular hash functions are **not suitable** for passwords because they're too fast (attackers can try billions of guesses per second).

Use dedicated password hashing functions:
- **bcrypt**: Time-tested, widely supported
- **Argon2**: Winner of Password Hashing Competition, recommended for new systems
- **scrypt**: Memory-hard, good alternative
- **PBKDF2**: NIST-approved, used in many standards

These are intentionally slow and memory-intensive to resist brute-force attacks.

## Try It Yourself

Use our [Hash Calculator](/hashes) to compute:

- MD5, SHA-1, SHA-256, SHA-384, SHA-512
- SHA-3 (224/256/384/512)
- BLAKE2b, BLAKE2s, BLAKE3
- SM3, RIPEMD-160
- Input as text, hex, or file

All calculations run entirely in your browser.
