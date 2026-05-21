Futurex is a major HSM vendor widely deployed in US banking, ATM networks, and payment processing. Understanding Futurex key management is essential for anyone working with these systems. This guide explains the Futurex key architecture, variant encryption, key schemes, and KCV verification.

## Futurex HSM Overview

Futurex manufactures Hardware Security Modules used primarily in financial services. Their HSMs are found in:

- ATM networks (Diebold Nixdorf, NCR, Hyosung)
- Payment processing centers
- PIN translation gateways
- Key management systems

Futurex HSMs use a proprietary key management scheme that differs from Thales and Atalla in how keys are encrypted and formatted.

## Master File Key (MFK)

The Master File Key is the root key in Futurex's key hierarchy. It serves as the foundation for all key encryption.

### How MFK Works

The MFK is a **double-length DES key** (128 bits effective) stored inside the HSM hardware. It never leaves the device in plaintext. All other keys stored in the HSM are encrypted under the MFK or its variants.

```
MFK (stored in HSM)
    ├── Encrypted under MFK variants for storage
    ├── Used to decrypt keys during operations
    └── Protected by tamper-resistant hardware
```

### MFK Variant Encryption

Futurex uses **variant encryption** to separate different key types. A variant is created by applying an XOR mask to the MFK before encryption:

| Key Type | Variant XOR Mask |
|----------|-----------------|
| ZMK (Zone Master Key) | MFK XOR 00000000 000000FF |
| ZPK (Zone PIN Key) | MFK XOR 00000000 0000FF00 |
| TPK (Terminal PIN Key) | MFK XOR 00000000 00FF0000 |
| TMK (Terminal Master Key) | MFK XOR 00000000 FF000000 |
| DEK (Data Encryption Key) | MFK XOR 000000FF 00000000 |

This approach ensures that different key types are cryptographically isolated — even if one key type is compromised, others remain protected.

## Key Scheme Format

Futurex uses a specific format to represent encrypted keys, known as the **Key Scheme**. Understanding this format is critical when exchanging keys between systems.

### Structure

A Futurex key scheme entry typically contains:

```
Key Type (1 byte) | Key Length (1 byte) | Encrypted Key | KCV (3 bytes)
```

For example, a ZMK might appear as:
```
U1 1A4DC4...3F 8E24A1
```

Where:
- `U` indicates double-length key
- `1` is the key type identifier
- `1A4DC4...3F` is the MFK-encrypted key value
- `8E24A1` is the Key Check Value

### Key Length Indicators

| Indicator | Meaning |
|-----------|---------|
| S | Single-length key (8 bytes) |
| U | Double-length key (16 bytes) |
| T | Triple-length key (24 bytes) |

## Key Check Value (KCV)

The KCV is a critical verification mechanism used to confirm key integrity without revealing the key itself.

### How KCV is Calculated

1. Encrypt a block of zeros (8 bytes of 0x00) using the key
2. Take the first 3 bytes of the result
3. Represent as 6 hex characters

```
KCV = First 3 bytes of E(K, 0000000000000000)
```

### Why KCV Matters

- **Key verification**: Confirm a key was loaded correctly
- **Key exchange**: Verify keys match between two HSMs
- **Audit trail**: Record key fingerprints for compliance
- **Error detection**: Catch transcription errors during manual entry

## Working with Futurex Keys

### Key Import Process

When importing a key into a Futurex HSM:

1. The key arrives encrypted under the ZMK
2. HSM decrypts using the ZMK (or its variant)
3. Key is re-encrypted under the appropriate MFK variant
4. KCV is calculated and stored
5. Key is ready for use

### Key Export Process

When exporting a key from a Futurex HSM:

1. Key is decrypted from MFK variant encryption
2. Key is encrypted under the target ZMK
3. KCV is calculated
4. Encrypted key + KCV are returned

## Practical Scenarios

### ATM Key Loading

When loading keys to an ATM:

1. Generate ZMK components (manual entry by custodians)
2. Import ZMK into HSM under MFK variant
3. Generate Terminal Master Key (TMK)
4. Export TMK encrypted under ZMK
5. Load TMK to ATM via master key loading procedure
6. Generate and load PIN encryption key (TPK)

### Key Rotation

Periodic key rotation is required by PCI DSS:

1. Generate new ZMK
2. Re-encrypt all working keys under new ZMK
3. Distribute new ZMK to partner HSMs
4. Verify KCVs match
5. Retire old ZMK

## Common Issues

### Key Mismatch Errors

If KCV doesn't match after key exchange:
- Verify both sides used the same key components
- Check for variant mask errors
- Ensure correct key length indicator
- Confirm no transcription errors in hex values

### Variant Confusion

Using the wrong variant mask is a common mistake. Always verify:
- Which key type you're working with
- The correct variant mask for that key type
- Whether the HSM expects variant encryption

## Try It Yourself

Use our [Futurex Keys tool](/futurex-keys) to:

- Encrypt and decrypt keys under MFK variants
- Calculate KCVs for any key
- Convert between key scheme formats
- Verify key integrity

The tool runs entirely in your browser — no data leaves your device.
