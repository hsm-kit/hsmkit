DES and 3DES (Triple DES) were the dominant encryption standards in banking and payment systems for decades. While largely replaced by AES, they remain in widespread use in legacy payment infrastructure. This guide explains how they work and when you'll still encounter them.

## What is DES?

DES (Data Encryption Standard) was adopted by NIST in 1977. It's a **block cipher** that encrypts 64-bit (8-byte) blocks using a 56-bit key.

Key facts:
- Block size: **64 bits** (8 bytes)
- Key size: **56 bits** (stored as 64 bits with parity)
- Structure: Feistel network, 16 rounds
- Status: **Broken** — 56-bit key is too small for modern hardware

## Why DES is Broken

A 56-bit key means 2⁵⁶ ≈ 72 quadrillion possible keys. In 1998, the EFF's "Deep Crack" machine broke DES in 22 hours for $250,000. Today, similar hardware costs a few thousand dollars and can break DES in hours.

**Never use single DES for new systems.**

## What is 3DES (Triple DES)?

3DES applies DES three times to increase security:

```
Encrypt: C = DES_Encrypt(K3, DES_Decrypt(K2, DES_Encrypt(K1, P)))
Decrypt: P = DES_Decrypt(K1, DES_Encrypt(K2, DES_Decrypt(K3, C)))
```

This EDE (Encrypt-Decrypt-Encrypt) structure was chosen for backward compatibility — if K1=K2=K3, it reduces to single DES.

### 3DES Key Options

| Option | Keys | Effective Key Bits | Notes |
|--------|------|-------------------|-------|
| 3-key 3DES | K1≠K2≠K3 | 112-bit | Recommended when using 3DES |
| 2-key 3DES | K1≠K2, K3=K1 | 80-bit | Weaker, avoid |
| 1-key 3DES | K1=K2=K3 | 56-bit | Same as DES, useless |

A 3DES key is typically 16 bytes (2-key) or 24 bytes (3-key).

## DES Key Parity

DES keys have a special property: each byte contains 7 bits of key data and 1 **parity bit**. The parity bit is set so each byte has an **odd number of 1-bits**.

```
Key byte: 0101 010[P]
          ↑ 7 key bits  ↑ parity bit
```

After XOR operations (like key splitting), parity may be lost and must be restored. Our [Keyshare Generator](/keyshare-generator) automatically adjusts parity when combining key components.

## 3DES in Payment Systems

3DES remains deeply embedded in payment infrastructure:

### PIN Encryption
- ATM PIN pads encrypt PINs using 3DES (ISO 9564 Format 0/1/3)
- The PIN Encryption Key (PEK) is a 3DES key
- See our [PIN Block guide](/guides/pin-block-formats-iso9564) and [PIN Block tool](/payments-pin-blocks-general)

### DUKPT (ISO 9797)
- Original DUKPT uses 3DES for key derivation
- BDK and IPEK are 3DES keys
- See our [DUKPT guide](/guides/dukpt-key-derivation-tutorial) and [DUKPT tool](/payments-dukpt-iso9797)

### MAC Algorithms
- ISO 9797-1 algorithms use DES/3DES
- Retail MAC (ANSI X9.19) uses 3DES
- See our [MAC guide](/guides/mac-algorithms-payment-security)

### HSM Key Storage
- Thales, Futurex, and Atalla HSMs store keys encrypted under 3DES LMK
- TR-31 Versions A, B, C use 3DES key wrapping
- See our [HSM overview](/guides/hsm-key-management-overview)

### CVV/CVC Calculation
- CVV uses 3DES encryption
- See our [CVV guide](/guides/cvv-cvc-calculation-methods)

## 3DES Modes of Operation

Like AES, 3DES supports multiple modes:

### ECB (Electronic Codebook)
- Each 8-byte block encrypted independently
- Same input → same output (pattern leakage)
- Used in KCV calculation (encrypt zeros)

### CBC (Cipher Block Chaining)
- Each block XORed with previous ciphertext
- Requires 8-byte IV
- Most common mode for 3DES in payment systems

## 3DES vs AES

| Property | 3DES | AES |
|----------|------|-----|
| Block size | 64-bit | 128-bit |
| Key size | 112/168-bit | 128/192/256-bit |
| Speed | ~3× slower than DES | Much faster |
| Security | Adequate (until ~2030) | Strong |
| Status | Legacy, being phased out | Current standard |
| Payment use | Widespread legacy | Growing adoption |

NIST deprecated 3DES in 2023 and will disallow it after 2030. New payment systems should use AES.

## Migration from 3DES to AES

The payment industry is actively migrating:

- **TR-31 Version D**: AES-based key blocks (replacing Versions A/B/C)
- **DUKPT AES**: AES-based per-transaction keys (replacing 3DES DUKPT)
- **PIN Block Format 4**: AES-encrypted PIN blocks (replacing Formats 0/1/3)
- **AES-CMAC**: Replacing ISO 9797-1 MAC algorithms

## KCV for 3DES Keys

The Key Check Value for a 3DES key:
1. Encrypt 8 bytes of `0x00` using the 3DES key in ECB mode
2. Take the first 3 bytes (6 hex characters)

Example: Key `0123456789ABCDEFFEDCBA9876543210` → KCV `08D7B4`

Use our [Key Generator](/keys-dea) to generate 3DES keys with KCV, or our [Keyshare Generator](/keyshare-generator) to split them into components.

## Try It Yourself

- [DES/3DES Encryption Tool](/des-encryption) — Encrypt and decrypt with DES/3DES
- [Key Generator](/keys-dea) — Generate 3DES keys with KCV
- [Keyshare Generator](/keyshare-generator) — Split 3DES keys into components
- [PIN Block Tool](/payments-pin-blocks-general) — 3DES PIN block encoding/decoding
- [DUKPT Tool](/payments-dukpt-iso9797) — 3DES DUKPT key derivation
- [Retail MAC Tool](/payments-mac-retail) — 3DES-based MAC calculation
