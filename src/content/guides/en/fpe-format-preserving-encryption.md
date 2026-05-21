Format-Preserving Encryption (FPE) encrypts data while keeping the same format — a credit card number stays a 16-digit number, a Social Security Number stays XXX-XX-XXXX. This is critical when you need to encrypt data but your application, database, or payment processor requires a specific format.

## What is Format-Preserving Encryption?

Traditional encryption algorithms like AES produce binary ciphertext that looks nothing like the original plaintext. If you encrypt a credit card number `4111111111111111`, you get something like `a3f2b8c1d4e5...` — a hex string of completely different length and format.

FPE solves this problem. It takes input of a specific format and produces output in **the same format**:

```
Input:  4111111111111111  (16-digit number)
Output: 7392815640293847  (still a 16-digit number)
```

The encrypted value is a valid credit card number that can pass Luhn checks, fit in database columns, and be processed by payment systems — all while being cryptographically secure.

## FF1 and FF3-1 Algorithms

NIST standardized two FPE algorithms in **SP 800-38G**:

### FF1 (Format-Preserving Encryption, Feistel-based)

- Uses a 10-round unbalanced Feistel network
- Supports **any radix** (base 2 through 2^16)
- Minimum input length: **6 characters** (with default tweak)
- More flexible but slightly slower than FF3-1
- Recommended for most use cases

### FF3-1 (FF3 with revision)

- Uses an 8-round balanced Feistel network
- Also supports any radix
- Minimum input length: **8 characters** (with default tweak)
- Faster but has tighter length constraints
- Revision addresses a 2017 attack on the original FF3

Both algorithms require:
- A **symmetric key** (AES key: 128, 192, or 256 bits)
- A **tweak** (additional input that makes the same plaintext encrypt differently)

## Understanding Radix

Radix is the number base used for the character set:

| Radix | Character Set | Example Use Case |
|-------|--------------|-----------------|
| 2 | 0, 1 | Binary strings |
| 10 | 0-9 | Credit card numbers, SSNs |
| 26 | A-Z | Name-like tokens |
| 36 | 0-9, A-Z | Alphanumeric identifiers |
| 62 | 0-9, A-Z, a-z | Case-sensitive IDs |

For credit card numbers, radix is **10** (digits 0-9). For alphanumeric data, radix is **36** or **62**.

## How FPE Works

FPE uses a Feistel network structure:

```
1. Split input into left (L) and right (R) halves
2. For each round:
   a. Compute round function F using round key + tweak
   b. XOR the result with the other half
   c. Swap halves
3. Recombine to produce output in the same format
```

The round keys are derived from the main key, and the tweak ensures that the same plaintext encrypts to different ciphertext in different contexts (e.g., different card numbers can use different tweaks).

## The Tweak

The tweak is an important component of FPE:

- It acts like an **initialization vector** (IV) but more flexible
- Same key + different tweak = different ciphertext
- Common tweak sources: database record ID, transaction ID, or empty string
- Not required to be secret — can be stored alongside ciphertext

```
Encrypt("4111111111111111", key, tweak="order123") → "7392815640293847"
Encrypt("4111111111111111", key, tweak="order456") → "2958471036582914"
```

## Tokenization vs Encryption

FPE is often confused with tokenization, but they are different:

| Aspect | FPE | Tokenization |
|--------|-----|-------------|
| Reversible | Yes (with key) | Depends on implementation |
| Cryptographic | Yes | No (lookup table) |
| Key required | Yes | No (database required) |
| Format-preserving | Yes | Yes |
| Standardized | NIST SP 800-38G | No standard |

Many payment systems use a **hybrid approach**: FPE for the actual encryption, with a token vault for additional security layers.

## PCI DSS Compliance

FPE plays a significant role in PCI DSS (Payment Card Industry Data Security Standard):

### Why FPE helps with PCI DSS

- **Requirement 3.4**: Render PAN unreadable anywhere it is stored — FPE satisfies this
- **Reduced scope**: FPE-encrypted data can be excluded from PCI scope if the encryption is strong enough
- **Format compatibility**: Existing systems can work with encrypted PANs without schema changes
- **Luhn-valid output**: FF1 with radix 10 can produce Luhn-valid encrypted PANs

### PCI DSS Requirements

- Use strong cryptography (AES-128 minimum)
- Protect keys with HSMs or equivalent key management
- Document key management procedures
- Rotate keys periodically

## Practical Applications

### Credit Card Processing

```
Original PAN:  4111111111111111
Encrypted PAN: 7392815640293847  (valid 16-digit number)
Database:      Same VARCHAR(16) column, no schema changes
```

### Healthcare Data (HIPAA)

Encrypt patient IDs, SSNs, and medical record numbers while maintaining database compatibility and format validation rules.

### Legacy System Integration

When you can't modify database schemas or application logic to handle binary ciphertext, FPE lets you encrypt data transparently.

### Tokenization Replacement

Replace brittle token vaults with cryptographic FPE — no database lookup needed for decryption, just the key.

## Choosing Between FF1 and FF3-1

| Criterion | FF1 | FF3-1 |
|-----------|-----|-------|
| Minimum length | 6 chars | 8 chars |
| Speed | Slower | Faster |
| Security margin | Higher | Good (revised) |
| Recommendation | Default choice | When speed matters and input ≥ 8 chars |

For most applications, **FF1 is recommended** due to its larger security margin and more flexible length requirements.

## Implementation Considerations

### Key Management

- Use AES-128 or AES-256 keys
- Store keys in an HSM or secure key management system
- Rotate keys periodically, but plan for re-encryption

### Tweak Strategy

- **Per-record tweaks**: Use database record ID — provides maximum differentiation
- **Static tweak**: Simpler but less security differentiation
- **Empty tweak**: Simplest, but all identical plaintexts produce identical ciphertexts

### Length Constraints

FF1 and FF3-1 have minimum and maximum length requirements based on radix and key size. For radix 10 (digits):

- FF1: minimum 6 digits
- FF3-1: minimum 8 digits
- Maximum depends on key size (roughly 2^32 blocks)

## Try It Yourself

Use our [FPE Encryption Tool](/fpe-encryption) to:

- Encrypt and decrypt using FF1 and FF3-1 algorithms
- Test with different radix values (10, 26, 36, 62)
- Customize tweaks for different security contexts
- Validate Luhn-compliant output for credit card numbers
- Understand how format-preserving encryption works in practice

All processing happens in your browser — your keys and data never leave your device.
