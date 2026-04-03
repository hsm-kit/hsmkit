Message Authentication Codes (MACs) are how payment systems verify that transaction data hasn't been tampered with. This guide covers the MAC algorithms used in banking and payment processing.

## What is a MAC?

A MAC (Message Authentication Code) is a short piece of data used to verify both the **integrity** and **authenticity** of a message. Unlike a hash, a MAC requires a **secret key** — only someone with the key can generate or verify it.

```
MAC = MAC_Algorithm(Key, Message)
```

Properties:
- **Integrity**: Any change to the message produces a different MAC
- **Authentication**: Only parties with the key can generate valid MACs
- **Non-repudiation** (with asymmetric schemes): Proves who sent the message

## MAC vs Hash vs Signature

| Property | Hash | MAC | Digital Signature |
|----------|------|-----|-------------------|
| Key required | No | Yes (symmetric) | Yes (asymmetric) |
| Integrity | Yes | Yes | Yes |
| Authentication | No | Yes | Yes |
| Non-repudiation | No | No | Yes |
| Speed | Fast | Fast | Slow |
| Use in payments | KCV | Transaction auth | Certificate signing |

## ISO 9797-1 MAC Algorithms

ISO 9797-1 defines MAC algorithms based on block ciphers (typically DES/3DES). These are the foundation of payment message authentication.

### Algorithm 1 (CBC-MAC)
The simplest form: encrypt the message in CBC mode, use the last block as MAC.

```
MAC = DES_Encrypt(Key, last block of CBC chain)
```

- Simple but has known weaknesses for variable-length messages
- Still used in legacy systems

### Algorithm 3 (Retail MAC / ANSI X9.19)
The most common payment MAC algorithm:

1. Process all blocks except the last with single DES
2. Apply 3DES to the final block

```
Intermediate = DES_Encrypt(Key_Left, data blocks)
MAC = 3DES_Encrypt(Key, last intermediate block)
```

This is the **Retail MAC** used throughout the payment industry. See our [Retail MAC tool](/payments-mac-retail) and [ANSI X9.9/X9.19 tool](/payments-mac-ansix9).

### Padding Methods
- **Method 1**: Pad with zeros to block boundary
- **Method 2**: Append `0x80` then zeros (ISO padding)

Use our [ISO 9797-1 MAC tool](/payments-mac-iso9797-1) to compute MACs with all algorithm and padding combinations.

## AS2805 MAC (Australian EFTPOS)

AS2805 is the Australian standard for EFTPOS transactions, based on ISO 8583. It uses a specific MAC algorithm for transaction authentication.

Use our [AS2805 MAC tool](/payments-mac-as2805) for AS2805-specific MAC calculations.

## 3DES CBC-MAC

A straightforward 3DES-based CBC-MAC:

```
MAC = 3DES_Encrypt(Key, last block of 3DES-CBC chain)
```

Used in various legacy payment and banking protocols. See our [3DES CBC-MAC tool](/payments-mac-tdes-cbc-mac).

## HMAC — Modern Standard

HMAC (Hash-based MAC) uses a cryptographic hash function instead of a block cipher:

```
HMAC(K, m) = Hash((K ⊕ opad) || Hash((K ⊕ ipad) || m))
```

### HMAC-SHA256
- Most widely used modern MAC
- Used in: TLS, JWT, REST API authentication, AWS signatures
- 256-bit output, truncated to required length

### HMAC-SHA512
- Higher security variant
- Used in high-security applications

Use our [HMAC Calculator](/payments-mac-hmac) to compute HMAC-SHA256 and HMAC-SHA512.

## AES-CMAC — Modern Payment MAC

CMAC (Cipher-based MAC) uses AES in a special mode to produce a MAC:

```
CMAC = AES_CBC_MAC with subkey derivation
```

Advantages over CBC-MAC:
- Secure for variable-length messages
- No padding oracle vulnerabilities
- Used in modern payment standards (EMV, DUKPT AES)

Use our [CMAC tool](/payments-mac-cmac) for AES-CMAC and 3DES-CMAC calculations.

## MAC in Transaction Flow

Here's how MAC protects a typical ATM transaction:

```
1. ATM builds ISO 8583 message
2. ATM computes MAC over message fields using MAC key
3. MAC appended to message (field 64 or 128)
4. Message sent to host

5. Host receives message
6. Host computes MAC over same fields using same MAC key
7. Host compares computed MAC with received MAC
8. If match: message authentic. If mismatch: reject transaction.
```

The MAC key itself is typically a DUKPT-derived key (unique per transaction) — see our [DUKPT guide](/guides/dukpt-key-derivation-tutorial).

## MAC Key Management

MAC keys are working keys in the HSM key hierarchy:
- Derived from Zone MAC Key (ZMK) or via DUKPT
- Rotated regularly (daily, per-session, or per-transaction with DUKPT)
- Stored encrypted under LMK in HSM

For HSM key management overview, see our [HSM Key Management guide](/guides/hsm-key-management-overview).

## Choosing the Right MAC Algorithm

| Scenario | Recommended MAC |
|----------|----------------|
| Legacy ATM/POS (TDES) | ISO 9797-1 Alg 3 (Retail MAC) |
| Modern payment (AES) | AES-CMAC |
| REST API / Web | HMAC-SHA256 |
| Australian EFTPOS | AS2805 MAC |
| EMV chip transactions | AES-CMAC |

## Try It Yourself

- [ISO 9797-1 MAC](/payments-mac-iso9797-1) — All algorithms and padding methods
- [ANSI X9.9/X9.19 Retail MAC](/payments-mac-ansix9) — Classic payment MAC
- [Retail MAC](/payments-mac-retail) — ISO 9797-1 Algorithm 3
- [3DES CBC-MAC](/payments-mac-tdes-cbc-mac) — Simple 3DES MAC
- [HMAC Calculator](/payments-mac-hmac) — HMAC-SHA256/SHA512
- [CMAC Calculator](/payments-mac-cmac) — AES-CMAC and 3DES-CMAC
- [AS2805 MAC](/payments-mac-as2805) — Australian EFTPOS MAC
