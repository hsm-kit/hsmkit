RSA is the foundation of public-key cryptography. It secures HTTPS connections, signs software updates, and protects email. Understanding RSA helps you make better decisions about key sizes, padding schemes, and when to use it versus alternatives like ECC.

## What is RSA?

RSA (Rivest–Shamir–Adleman, 1977) is an **asymmetric encryption algorithm** based on the mathematical difficulty of factoring large numbers.

Unlike AES which uses one secret key, RSA uses a **key pair**:
- **Public key**: Share with anyone. Used to encrypt or verify signatures.
- **Private key**: Keep secret. Used to decrypt or create signatures.

## The Math Behind RSA (Simplified)

RSA security relies on this: multiplying two large prime numbers is easy, but factoring the result back into primes is computationally infeasible.

### Key Generation
1. Choose two large primes **p** and **q**
2. Compute **n = p × q** (the modulus)
3. Compute **φ(n) = (p-1)(q-1)**
4. Choose **e** (public exponent, usually 65537)
5. Compute **d** such that **e × d ≡ 1 (mod φ(n))** (private exponent)

**Public key**: (n, e)  
**Private key**: (n, d)

### Encryption and Decryption
- Encrypt: `C = M^e mod n`
- Decrypt: `M = C^d mod n`

## RSA Key Sizes

| Key Size | Security Level | Status |
|----------|---------------|--------|
| 1024-bit | Broken | Do not use |
| 2048-bit | ~112-bit security | Minimum acceptable |
| 3072-bit | ~128-bit security | Recommended |
| 4096-bit | ~140-bit security | High security / slow |

NIST recommends **2048-bit minimum** through 2030, **3072-bit** beyond that.

## Padding Schemes — Critical for Security

Raw RSA (textbook RSA) is **not secure**. You must use a padding scheme:

### PKCS#1 v1.5 — Legacy
- Widely supported, used in TLS 1.2 and older
- Vulnerable to **Bleichenbacher's attack** if not implemented carefully
- Still acceptable for signatures, avoid for encryption in new systems

### OAEP (Optimal Asymmetric Encryption Padding) — Recommended for encryption
- Randomized padding using a hash function
- Secure against chosen-ciphertext attacks
- Use `OAEP-SHA256` for new implementations

### PSS (Probabilistic Signature Scheme) — Recommended for signatures
- Randomized padding for signatures
- Provably secure (unlike PKCS#1 v1.5 signatures)
- Required by some modern standards

## RSA vs ECC

| Property | RSA-2048 | ECC-256 |
|----------|----------|---------|
| Security level | ~112-bit | ~128-bit |
| Key size | 2048 bits | 256 bits |
| Performance | Slower | Much faster |
| Key generation | Slow | Fast |
| Signature size | Large | Small |
| Support | Universal | Widely supported |

For new systems, **ECC is generally preferred** — smaller keys, faster operations, same or better security. See our [ECC guide](/guides/ecc-digital-signatures-explained) for details.

## RSA in Practice

### When to use RSA encryption
- Encrypting small amounts of data (e.g., an AES key)
- Legacy system compatibility
- Certificate-based systems (TLS, S/MIME)

### When NOT to use RSA encryption
- Encrypting large data (use AES + RSA to wrap the AES key)
- High-performance systems (use ECC instead)

### Hybrid Encryption Pattern
RSA is almost always used in a **hybrid** scheme:
1. Generate a random AES key
2. Encrypt the data with AES
3. Encrypt the AES key with RSA public key
4. Send both encrypted AES key + encrypted data

This gives you RSA's key exchange security + AES's performance.

## RSA Key Formats

RSA keys are commonly stored in these formats:

### PEM Format
Base64-encoded DER with header/footer:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
```

### DER Format
Binary encoding of the ASN.1 structure. Use our [ASN.1 Parser](/asn1-parser) to inspect DER-encoded keys, or our [RSA DER Public Key Decoder](/rsa-der-public-key) to extract key parameters.

### PKCS#8 vs PKCS#1
- **PKCS#1**: RSA-specific format
- **PKCS#8**: Algorithm-agnostic format (preferred for new systems)

## Common RSA Pitfalls

| Issue | Risk | Solution |
|-------|------|----------|
| Small key (< 2048-bit) | Factoring attack | Use 2048+ bit keys |
| No padding | Textbook RSA attacks | Always use OAEP or PSS |
| Same key for encrypt + sign | Cross-protocol attacks | Use separate key pairs |
| Weak random number generator | Key compromise | Use OS CSPRNG |

## Try It Yourself

Use our [RSA Encryption Tool](/rsa-encryption) to:

- Generate RSA key pairs (1024/2048/4096-bit)
- Encrypt and decrypt with PKCS#1 v1.5 or OAEP
- Sign and verify with PKCS#1 or PSS
- Export keys in PEM/DER format

For parsing existing RSA public keys from certificates, try our [RSA DER Public Key Decoder](/rsa-der-public-key).
