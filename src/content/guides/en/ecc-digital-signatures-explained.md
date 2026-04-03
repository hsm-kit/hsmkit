Elliptic Curve Cryptography (ECC) delivers stronger security with smaller keys compared to RSA. It powers modern TLS, Bitcoin, and most mobile authentication systems. This guide explains the concepts and practical usage.

## What is ECC?

ECC is a form of **asymmetric cryptography** based on the algebraic structure of elliptic curves over finite fields. The security relies on the **Elliptic Curve Discrete Logarithm Problem (ECDLP)** — given a point Q = k·G on a curve, finding k is computationally infeasible.

## Why ECC Over RSA?

| Property | RSA-2048 | ECC-256 | ECC-384 |
|----------|----------|---------|---------|
| Security bits | ~112 | ~128 | ~192 |
| Key size | 2048 bits | 256 bits | 384 bits |
| Signature size | 256 bytes | 64 bytes | 96 bytes |
| Key generation | ~100ms | ~1ms | ~2ms |
| Sign/Verify | Slower | Much faster | Fast |
| TLS handshake | Slower | Faster | Fast |

For equivalent security, ECC keys are **10× smaller** than RSA keys.

## Common Elliptic Curves

### P-256 (secp256r1 / prime256v1)
- NIST standard curve
- Used in TLS, JWT (ES256), Android, iOS
- 128-bit security
- **Most widely supported**

### P-384 (secp384r1)
- NIST standard curve
- Used in government/high-security applications
- 192-bit security

### P-521 (secp521r1)
- NIST standard curve
- 260-bit security
- Rarely needed in practice

### secp256k1
- Bitcoin's curve
- Used in Ethereum, most cryptocurrencies
- Not a NIST curve, but widely used in blockchain

### Curve25519 / Ed25519
- Modern, highly optimized curves
- Designed to avoid implementation pitfalls
- Used in SSH, Signal, WireGuard
- **Recommended for new systems** where compatibility allows

## ECDSA — Elliptic Curve Digital Signature Algorithm

ECDSA is the most common ECC-based signature scheme.

### How ECDSA Signing Works
1. Generate random nonce **k**
2. Compute point **R = k·G**, take x-coordinate as **r**
3. Compute **s = k⁻¹(hash(message) + r·privateKey) mod n**
4. Signature = **(r, s)**

### How ECDSA Verification Works
1. Compute **u1 = hash(message) · s⁻¹ mod n**
2. Compute **u2 = r · s⁻¹ mod n**
3. Compute point **X = u1·G + u2·PublicKey**
4. Verify that **X.x ≡ r (mod n)**

### Critical: Nonce Reuse is Catastrophic
If the same nonce **k** is used for two different signatures, the private key can be mathematically recovered. This is how the PlayStation 3 was hacked in 2010.

**Always use a cryptographically secure random nonce for each signature.**

## ECDH — Elliptic Curve Diffie-Hellman

ECDH is used for **key agreement** — two parties derive a shared secret without transmitting it.

### How ECDH Works
1. Alice has private key `a`, public key `A = a·G`
2. Bob has private key `b`, public key `B = b·G`
3. Alice computes: `S = a·B = a·b·G`
4. Bob computes: `S = b·A = b·a·G`
5. Both get the same shared secret `S`

This shared secret is then used to derive an AES key for symmetric encryption.

## ECC Key Formats

### Uncompressed Point Format
```
04 | x-coordinate (32 bytes) | y-coordinate (32 bytes)
```
Total: 65 bytes for P-256

### Compressed Point Format
```
02 or 03 | x-coordinate (32 bytes)
```
Total: 33 bytes for P-256. The y-coordinate is derived from x.

### PEM Format
```
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIBkg4LKJH8...
-----END EC PRIVATE KEY-----
```

Use our [ASN.1 Parser](/asn1-parser) to inspect the internal structure of ECC keys and certificates.

## ECC in Payment Security

ECC is increasingly used in payment systems:

- **EMV chip cards**: ECDSA for card authentication
- **VISA certificates**: ECDSA-based certificate chains — see our [VISA Certificate tool](/payments-visa-certificates)
- **SSL/TLS**: ECDHE for key exchange in payment gateways — see our [SSL Certificate Parser](/ssl-certificates)

## ECC vs RSA: When to Choose

**Choose ECC when:**
- Building new systems
- Performance matters (mobile, IoT, high-volume)
- Small key/signature size is important (bandwidth, storage)
- Modern TLS (ECDHE cipher suites)

**Stick with RSA when:**
- Legacy system compatibility required
- Interoperability with older hardware HSMs
- Regulatory requirements specify RSA

## Try It Yourself

Use our [ECC Encryption Tool](/ecc-encryption) to:

- Generate ECC key pairs (P-256, P-384, P-521, secp256k1)
- Sign messages with ECDSA
- Verify ECDSA signatures
- Perform ECDH key agreement
- Export keys in PEM/DER format

For inspecting ECC keys from certificates, use our [ASN.1 Parser](/asn1-parser) or [SSL Certificate Parser](/ssl-certificates).
