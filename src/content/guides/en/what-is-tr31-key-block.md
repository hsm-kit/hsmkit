TR-31 (also known as ANSI X9.143) is the industry standard format for securely wrapping and transporting cryptographic keys. This guide provides a comprehensive overview of the format.

## What is TR-31?

TR-31 is a key block specification that provides:

- **Key encryption**: Protects the key during transport
- **Key binding**: Ties key attributes to the key material
- **Integrity protection**: Detects tampering
- **Key usage control**: Defines how the key can be used

## Key Block Structure

A TR-31 key block consists of several parts:

```
[Version][Block Length][Key Usage][Algorithm][Mode][Key Version][Exportability][Optional Blocks][Key Data][MAC]
```

### Header Fields

| Field | Length | Description |
|-------|--------|-------------|
| Version ID | 1 | 'A' (TDES), 'B' (TDES-KD), 'C' (TDES-V), 'D' (AES) |
| Block Length | 4 | Total block length in bytes (hex) |
| Key Usage | 2 | Purpose of the key (P0, K0, B0, etc.) |
| Algorithm | 1 | Key algorithm (T=TDES, A=AES) |
| Mode of Use | 1 | How key can be used (E=Encrypt only, etc.) |
| Key Version | 2 | Version number |
| Exportability | 1 | Export restrictions (E, N, S) |
| Opt. Blocks | 2 | Number of optional blocks |

### Key Usage Codes

Common key usage codes:

| Code | Description |
|------|-------------|
| P0 | PIN Encryption Key |
| B0 | BDK Base Derivation Key |
| K0 | Key Encryption/Wrapping Key |
| M0 | ISO 9797-1 MAC (Algorithm 1) |
| M3 | ISO 9797-1 MAC (Algorithm 3) |
| D0 | Symmetric Key for Data Encryption |
| V0 | PIN Verification Key (VISA PVV) |

### Mode of Use

| Code | Description |
|------|-------------|
| B | Both encrypt and decrypt |
| C | Compute (MAC generation only) |
| D | Decrypt only |
| E | Encrypt only |
| G | Generate keys |
| N | No special restrictions |
| S | Signature only |
| V | Verify (MAC verification only) |
| X | Key derivation |

### Exportability

| Code | Description |
|------|-------------|
| E | Exportable (in trusted key block) |
| N | Non-exportable |
| S | Sensitive (exportable only to non-exportable) |

## Version Differences

### Version A (Original TDES)
- Uses TDES key wrapping
- 16-byte MAC
- Basic security

### Version B (TDES Key Derivation)
- Uses key derivation before wrapping
- Improved cryptographic binding
- 16-byte MAC

### Version C (TDES Variant)
- Uses CMAC instead of X9.19 MAC
- Better integrity protection

### Version D (AES)
- Uses AES for key wrapping (AES-256 KBPK)
- CMAC for authentication
- Strongest security
- **Recommended for new implementations**

## Encoding Example

Let's encode a PIN encryption key (P0):

**Inputs:**
- Key: `0123456789ABCDEFFEDCBA9876543210`
- KBPK: `00112233445566778899AABBCCDDEEFF`
- Usage: P0 (PIN Encryption)
- Algorithm: T (TDES)
- Mode: B (Both directions)
- Exportability: E

**Result:**
```
D0112P0TB00E0000...
```

## Decoding a Key Block

When you receive a TR-31 key block:

1. **Verify header**: Check version, usage, algorithm
2. **Verify MAC**: Using your KBPK
3. **Decrypt key**: Using the derived encryption key
4. **Apply key**: According to usage and mode

## Security Best Practices

1. **Use Version D**: AES-based protection is strongest
2. **Strong KBPK**: Use 256-bit AES KBPKs
3. **Verify before use**: Always verify MAC before decryption
4. **Honor restrictions**: Respect exportability and mode flags
5. **Key rotation**: Regularly rotate KBPKs

## Common Issues

### "MAC verification failed"
- KBPK mismatch
- Corrupted key block
- Wrong version decoding

### "Invalid key length"
- Algorithm mismatch
- Padding issues

### "Unknown key usage"
- Unsupported or vendor-specific code

## Try It Yourself

Use our TR-31 Key Block Tool to:

- Encode keys into TR-31 format
- Decode and verify existing key blocks
- View all header fields and attributes
- Support for all versions (A, B, C, D)

All processing happens locally in your browser for maximum security.
