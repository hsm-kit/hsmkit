PIN Block Format 4 is the newest ISO 9564 PIN block format, designed specifically for [AES encryption](/guides/aes-encryption-explained). This guide explains how Format 4 works and why it represents the future of PIN security in payment systems.

## What is PIN Block Format 4?

PIN Block Format 4 (also called ISO-4) is defined in ISO 9564-1 and provides a modern, AES-based method for encrypting PINs. It replaces the legacy [Format 0](/guides/pin-block-formats-iso9564) which was designed for [3DES](/guides/des-3des-legacy-encryption) encryption.

Format 4 is part of the broader payment industry migration from 3DES to AES, alongside [AES-DUKPT](/payments-dukpt-aes) and [TR-31 Version D](/guides/what-is-tr31-key-block) key blocks.

## Format 4 Structure

Format 4 PIN blocks are 16 bytes (128 bits) — double the size of Format 0's 8 bytes. The structure includes:

```
Byte 0:  Control field (0x44 = Format 4 identifier)
Byte 1:  PIN length (0x04 to 0x0C)
Bytes 2-7: PIN digits + random fill
Bytes 8-13: PAN hash (derived from PAN)
Bytes 14-15: Random fill + padding
```

### Control Field

The first byte identifies the format:
- `0x44` indicates Format 4
- The high nibble `4` is the format identifier
- The low nibble contains flags

### PIN Data

- PIN length occupies one nibble (4 bits)
- PIN digits follow immediately
- Remaining positions filled with random data (0x0-0x9 or 0xA-0xF)

### PAN Hash

Format 4 includes a hash of the PAN to bind the PIN block to a specific card:

```
PAN_Hash = AES-ECB(PAN_padded, PAN_Hash_Key)
```

This provides integrity verification — if the wrong PAN is used during decryption, the hash won't match.

## Format 4 vs Format 0

| Feature | Format 0 | Format 4 |
|---------|----------|----------|
| Block size | 8 bytes | 16 bytes |
| Encryption | 3DES ECB | AES-128 ECB |
| PAN required | Yes (XOR) | Yes (hash) |
| Random fill | No (fixed 0xF) | Yes |
| Integrity check | No | PAN hash |
| Security level | Legacy | Modern |
| Standard | ISO 9564 | ISO 9564-1 |

### Key Differences

1. **Random fill**: Format 4 uses random data instead of fixed padding, making identical PINs produce different PIN blocks
2. **PAN binding**: The PAN hash in Format 4 is more secure than the XOR approach in Format 0
3. **Block size**: 16 bytes accommodates AES-128's block size
4. **Integrity**: The PAN hash provides a built-in integrity check

## Encryption Process

### Step 1: Construct the PIN Block

1. Start with format identifier `0x44`
2. Add PIN length
3. Add PIN digits
4. Fill remaining positions with random data
5. Compute PAN hash and add to the block
6. Pad to 16 bytes

### Step 2: Encrypt with AES

```
Encrypted_Block = AES-128-ECB(PEK, PIN_Block)
```

The PIN Encryption Key (PEK) is a 128-bit AES key, which may be:
- A static key (legacy)
- A [DUKPT AES](/payments-dukpt-aes)-derived key (recommended)
- Transported in a [TR-31 Version D](/guides/what-is-tr31-key-block) key block

### Step 3: Transmit

The 16-byte encrypted PIN block is placed in the transaction message. For [ISO 8583](/guides/iso8583-payment-messages) messages, this typically goes in Field 52 (PIN Data).

## PAN Hash Calculation

The PAN hash binds the PIN block to a specific card number:

```
PAN_Padded = Right-justify PAN in 16 bytes, pad with 0x00
PAN_Hash = AES-ECB(PAN_Hash_Key, PAN_Padded)
```

During decryption, the HSM:
1. Decrypts the PIN block
2. Recomputes the PAN hash using the known PAN
3. Verifies the hash matches
4. If mismatch, rejects the PIN block

This prevents certain attacks where an attacker manipulates the PAN to cause PIN translation errors.

## Security Advantages of Format 4

### Random Padding

Unlike Format 0's fixed `0xF` padding, Format 4 uses random values. This means:
- Two identical PINs encrypted with the same key produce different PIN blocks
- An attacker cannot determine if two transactions use the same PIN
- Reduces information leakage

### PAN Hash Integrity

The PAN hash provides:
- Binding between PIN and card number
- Detection of PAN substitution attacks
- Verification that the correct PAN is used during translation

### AES-128 Security

AES-128 provides stronger security than 3DES:
- No known practical attacks
- 128-bit key vs 112-bit effective key for 3DES
- NIST-approved standard through 2030+

## Practical Transaction Flow

### Terminal to Acquirer

1. Customer enters PIN at terminal
2. Terminal constructs Format 4 PIN block with random fill
3. Terminal encrypts PIN block with PEK (or [AES-DUKPT](/payments-dukpt-aes) key)
4. Encrypted PIN block placed in transaction message
5. Message sent to acquirer with [MAC](/guides/mac-algorithms-payment-security)

### Acquirer to Issuer

1. Acquirer receives message with encrypted PIN block
2. Acquirer's [HSM](/guides/hsm-key-management-overview) decrypts using terminal's PEK
3. HSM verifies PAN hash integrity
4. HSM re-encrypts under interchange key
5. Translated PIN block sent to issuer

### Issuer Verification

1. Issuer's HSM decrypts PIN block
2. HSM verifies PAN hash
3. HSM extracts PIN
4. HSM verifies PIN against stored value (using [PIN Offset](/payments-pin-offset) or [PVV](/payments-pin-pvv))

## Migration Considerations

### HSM Support

Ensure your HSM supports Format 4:
- Thales payShield: Supports Format 4 with AES-DUKPT
- SafeNet Luna: Supports Format 4
- Futurex: Supports Format 4

### Terminal Support

New terminals should support Format 4 natively. Older terminals may need firmware updates.

### Key Management

Format 4 requires AES keys:
- Use [TR-31 Version D](/guides/what-is-tr31-key-block) for key transport
- Generate AES keys in the HSM
- Consider [AES-DUKPT](/payments-dukpt-aes) for per-transaction keys

### Dual Format Support

During migration, systems may need to support both Format 0 and Format 4:
- Detect format from the control field
- Process accordingly
- Gradually phase out Format 0

## Common Questions

### Why is Format 4 twice the size of Format 0?

AES-128 operates on 16-byte blocks, while 3DES operates on 8-byte blocks. The larger block size also accommodates the PAN hash and random fill.

### Can I use Format 4 with 3DES keys?

No. Format 4 is designed exclusively for AES encryption. Use Format 0 or Format 3 for 3DES-based systems.

### Is Format 4 backward compatible?

No. Format 4 is a new format that requires explicit support from terminals, HSMs, and processing systems. It cannot be mixed with Format 0 without format detection.

### When should I migrate to Format 4?

New deployments should use Format 4 from the start. Existing systems should plan migration as part of the broader 3DES-to-AES transition, especially since NIST deprecated 3DES in 2023.

## Try It Yourself

Use our PIN Block Format 4 tools to understand and practice with the AES-based PIN block format:

- [PIN Block AES Tool](/payments-pin-blocks-aes) — Encode and decode PIN blocks in Format 4 using AES-128 encryption

All processing happens locally in your browser — your keys never leave your device.
