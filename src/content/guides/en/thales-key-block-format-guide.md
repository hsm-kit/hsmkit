Thales key blocks are a proprietary format used by Thales payShield HSMs to securely store and transport cryptographic keys. While TR-31 is the industry standard, Thales key blocks remain widely deployed. This guide explains the format structure, header layout, and how it differs from TR-31.

## What is a Thales Key Block?

A Thales key block is a structured container that wraps a cryptographic key with metadata, integrity checks, and encryption. It provides:

- Key encryption under LMK variants
- Key type identification
- Integrity verification
- Format versioning

### Where Thales Key Blocks Are Used

- Thales payShield 10K and older models
- Payment processing networks
- ATM key management
- Inter-bank key exchange
- Legacy payment infrastructure

## Thales Key Block Structure

A Thales key block has a specific layout:

```
+------------------+
| Header           |  2 bytes: version + key type
+------------------+
| Key Length       |  2 bytes: length of encrypted key
+------------------+
| Encrypted Key    |  Variable: key under LMK variant
+------------------+
| KCV              |  3 bytes: Key Check Value
+------------------+
| Padding          |  Optional: for alignment
+------------------+
```

### Header Format

The header identifies the key block format and key type:

| Field | Length | Description |
|-------|--------|-------------|
| Version | 1 byte | Format version identifier |
| Key Type | 1 byte | Purpose of the key |
| Key Length | 2 bytes | Length of encrypted key data |

### Key Type Codes

| Code | Key Type | Description |
|------|----------|-------------|
| 00 | ZMK | Zone Master Key |
| 01 | ZPK | Zone PIN Key |
| 02 | TPK | Terminal PIN Key |
| 03 | TMK | Terminal Master Key |
| 04 | PVK | PIN Verification Key |
| 05 | CVK | Card Verification Key |
| 06 | DEK | Data Encryption Key |
| 07 | BDK | Base Derivation Key (DUKPT) |
| 08 | IKK | Initial Key (DUKPT) |

## Header Deep Dive

### Version Byte

The version byte indicates the format version:

| Value | Version | Notes |
|-------|---------|-------|
| 0x00 | Version 0 | Original format |
| 0x01 | Version 1 | With additional flags |
| 0x02 | Version 2 | Extended attributes |

### Key Length Encoding

Key length is encoded as 2 bytes, big-endian:

```
0x0010 = 16 bytes (double-length key)
0x0018 = 24 bytes (triple-length key)
```

## Encrypted Key Section

The encrypted key is the core of the key block.

### LMK Variant Encryption

Keys are encrypted under LMK variants:

```
Encrypted Key = E(LMK XOR variant, plaintext_key)
```

Different key types use different variants (see our [Thales LMK guide](/guides/thales-lmk-key-encryption)).

### Key Padding

Keys may be padded to meet alignment requirements:
- DES keys: 8-byte aligned
- AES keys: 16-byte aligned

## Key Check Value (KCV)

The KCV at the end of the key block serves as an integrity check.

### KCV Calculation

Standard method:
```
KCV = First 3 bytes of E(Key, 0000000000000000)
```

### KCV Purpose

- Verify key integrity after import
- Confirm keys match during exchange
- Detect corruption during transmission

## TLV Structure

Some Thales key blocks use a Tag-Length-Value (TLV) structure for extended attributes.

### TLV Format

```
Tag (1-2 bytes) | Length (1-2 bytes) | Value (variable)
```

### Common Tags

| Tag | Description |
|-----|-------------|
| 0x01 | Key type |
| 0x02 | Key length |
| 0x03 | Key usage |
| 0x04 | Exportability |
| 0x05 | Algorithm |

## Thales Key Block vs TR-31

Understanding the differences is important for migration and interoperability.

### Format Comparison

| Feature | Thales Key Block | TR-31 |
|---------|------------------|-------|
| Standard | Proprietary | ANSI X9.143 |
| Vendor | Thales only | Vendor-neutral |
| Header | Fixed 4 bytes | Variable length |
| Key binding | Basic | Cryptographic |
| Attributes | Limited | Comprehensive |
| Versioning | Simple | Detailed |

### Attribute Comparison

| Attribute | Thales | TR-31 |
|-----------|--------|-------|
| Key usage | Type code | A-Z code |
| Algorithm | Implied | Explicit |
| Exportability | Flag | Multiple modes |
| Validity | Not included | Optional |

### Migration Considerations

When migrating from Thales to TR-31:

1. Map key type codes to TR-31 usage codes
2. Add algorithm attributes
3. Set exportability flags
4. Regenerate key blocks in TR-31 format
5. Verify KCVs after conversion

## Practical Scenarios

### Key Import

Importing a Thales key block:

1. Parse header to get key type
2. Extract encrypted key
3. Decrypt under appropriate LMK variant
4. Re-encrypt for storage
5. Verify KCV

### Key Export

Exporting a key as Thales key block:

1. Get key type from request
2. Decrypt key from storage
3. Encrypt under target LMK variant
4. Build header with key type
5. Calculate KCV
6. Assemble key block

### Key Exchange

Exchanging Thales key blocks between HSMs:

1. Export key block from source HSM
2. Transmit key block (secure channel)
3. Import into destination HSM
4. Destination verifies KCV
5. Both sides now have same key

## Common Issues

### Version Mismatch

If importing fails:
- Check version byte compatibility
- Ensure HSM supports the version
- May need to downgrade format

### Key Type Confusion

Wrong key type causes:
- Decryption failure (wrong variant)
- KCV mismatch
- Operational errors

### Length Errors

Common length issues:
- Wrong endianness
- Including/excluding padding
- Header length miscount

## Best Practices

1. **Always verify KCV** after key import
2. **Document key types** used in your system
3. **Use consistent format** across HSMs
4. **Plan migration** to TR-31 for future-proofing
5. **Test key exchange** before production

## Try It Yourself

Use our [Thales Key Block tool](/thales-key-block) to:

- Parse Thales key block headers
- Extract key type and length
- Understand TLV structure
- Compare with TR-31 format

The tool runs entirely in your browser — no data leaves your device.
