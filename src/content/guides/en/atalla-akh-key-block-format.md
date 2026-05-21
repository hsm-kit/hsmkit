Atalla, originally developed by HP and now owned by Utimaco, uses a proprietary key block format called AKB (Atalla Key Block). This format is common in legacy banking infrastructure, especially for PIN processing. This guide explains the AKB structure, header format, and how keys are protected.

## What is AKB?

AKB (Atalla Key Block) is a proprietary format used by Atalla HSMs to store and transport cryptographic keys. Unlike simple key encryption, AKB binds key attributes and integrity checks to the key material, providing a structured container for key management.

### Where AKB is Found

- Legacy ATM networks
- PIN translation systems
- Payment processing infrastructure
- Older banking HSM deployments

## AKB Structure Overview

An AKB key block contains several distinct sections:

```
+------------------+
| Header           |  Fixed-length header with metadata
+------------------+
| Key Type         |  Identifier for the key's purpose
+------------------+
| Encrypted Key    |  Key material encrypted under MFK
+------------------+
| KCV              |  Key Check Value for verification
+------------------+
| Trailer          |  Integrity and format markers
+------------------+
```

## Header Format

The AKB header identifies the key block and provides essential metadata.

### Header Fields

| Field | Length | Description |
|-------|--------|-------------|
| Format Code | 2 bytes | Identifies this as an AKB block |
| Version | 1 byte | AKB format version |
| Key Type | 2 bytes | Purpose of the key (ZMK, ZPK, etc.) |
| Key Length | 1 byte | Length of the encrypted key |
| Flags | 1 byte | Exportability, usage restrictions |

### Format Identification

The header typically starts with specific bytes that identify it as AKB:
- `00` or `01` for format identifier
- Version indicator for format compatibility

## Key Type Identifiers

AKB uses specific codes to identify key types:

| Code | Key Type | Description |
|------|----------|-------------|
| 00 | MFK | Master File Key |
| 01 | ZMK | Zone Master Key |
| 02 | ZPK | Zone PIN Key |
| 03 | PVK | PIN Verification Key |
| 04 | CVK | Card Verification Key |
| 05 | TMK | Terminal Master Key |
| 06 | TPK | Terminal PIN Key |
| 07 | DEK | Data Encryption Key |

## Master File Key (MFK) Encryption

Atalla uses the MFK as the root encryption key for all stored keys.

### How MFK Protects Keys

1. MFK is generated inside the HSM during initialization
2. MFK is split into components (dual control)
3. All keys stored in the HSM are encrypted under MFK
4. MFK never leaves the HSM in plaintext

### MFK Variant System

Similar to other HSM vendors, Atalla may use variants of the MFK for different key types:

```
ZMK encrypted = E(MFK XOR variant, ZMK plaintext)
ZPK encrypted = E(MFK XOR variant, ZPK plaintext)
```

This provides cryptographic separation between key types.

## Key Check Value (KCV)

The KCV in AKB serves the same purpose as in other systems — verifying key integrity.

### KCV Calculation

Standard KCV calculation applies:
1. Encrypt 8 bytes of zeros with the key
2. Take first 3 bytes of result
3. Display as 6 hex characters

```
KCV = First 3 bytes of E(Key, 0000000000000000)
```

### KCV in AKB Context

The KCV in AKB is stored alongside the encrypted key and serves as:
- A quick verification after key loading
- A cross-check during key exchange
- An audit reference point

## AKB vs TR-31

Understanding the differences between AKB and modern standards is important:

| Feature | AKB | TR-31 |
|---------|-----|-------|
| Standard | Proprietary | ANSI X9.143 |
| Vendor lock-in | Atalla only | Vendor-neutral |
| Key binding | Basic | Cryptographic binding |
| Attributes | Limited | Comprehensive |
| Adoption | Legacy | Modern standard |

Many organizations are migrating from AKB to TR-31 for interoperability.

## Working with AKB Keys

### Decoding AKB

To decode an AKB key block:

1. Parse the header to identify format and version
2. Extract key type identifier
3. Read encrypted key material
4. Extract KCV
5. Verify KCV after decryption

### Common Fields

When working with AKB, you'll typically see:

```
Format (hex) | Type (hex) | Encrypted Key (hex) | KCV (hex)
```

## Practical Scenarios

### PIN Processing

AKB is commonly used in PIN translation:

1. PIN arrives encrypted under ZPK
2. HSM looks up ZPK in AKB format
3. HSM decrypts ZPK using MFK
4. HSM translates PIN from source to target ZPK
5. Translated PIN sent to destination

### Key Exchange

When exchanging keys with a partner:

1. Generate ZMK in Atalla HSM
2. Export ZMK in AKB format
3. Transmit AKB to partner
4. Partner imports into their HSM
5. Verify KCVs match

## Common Issues

### Format Compatibility

AKB is Atalla-specific — you cannot use AKB keys with Thales or Futurex HSMs without conversion or re-encryption under TR-31.

### Legacy Migration

When migrating from Atalla to another HSM:
1. Export keys in AKB format
2. Decrypt in Atalla HSM
3. Re-encrypt under TR-31 or target vendor format
4. Import into new HSM
5. Verify all KCVs

### Header Parsing Errors

Common issues include:
- Incorrect format version handling
- Misinterpreting key type codes
- Byte order (endianness) confusion
- Missing trailer bytes

## Try It Yourself

Use our [Atalla Keys tool](/atalla-keys) to:

- Decode AKB key blocks
- Extract header information
- Parse key type and length
- Verify KCVs

The tool runs entirely in your browser — no data leaves your device.
