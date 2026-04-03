PIN blocks are the standard format for encrypting and transmitting Personal Identification Numbers (PINs) in financial systems. This guide covers all ISO 9564 formats.

## What is a PIN Block?

A PIN block is a formatted data block that contains a PIN in a specific format, designed to be encrypted and transmitted securely. The format combines:

- The PIN itself
- A "fill" pattern (random or fixed data)
- Often the Primary Account Number (PAN)

PIN blocks are encrypted using a PIN Encryption Key (PEK), which is a working key in the [HSM key hierarchy](/guides/hsm-key-management-overview). For high-volume deployments, the PEK is typically a [DUKPT](/guides/dukpt-key-derivation-tutorial)-derived key, unique per transaction.

## ISO 9564 PIN Block Formats

### Format 0 (ISO-0)

The most widely used format, requires PAN for encoding:

```
PIN Block = PIN Field XOR PAN Field
```

**PIN Field Structure:**
- Byte 0: `0x0` (format identifier) | PIN length (4 bits)
- Bytes 1-7: PIN digits followed by `0xF` padding

**PAN Field Structure:**
- First 4 nibbles: `0x0000`
- Next 12 nibbles: Rightmost 12 digits of PAN (excluding check digit)

**Encryption**: Typically [3DES](/guides/des-3des-legacy-encryption) in ECB mode

### Format 1 (ISO-1)

Does NOT require PAN, uses random fill:

- Byte 0: `0x1` | PIN length
- PIN digits followed by random fill

Advantage: Works without PAN, more secure random padding  
Disadvantage: Cannot verify PIN block integrity without decryption

### Format 2 (ISO-2)

ICC (chip card) format, never transmitted:

- Byte 0: `0x2` | PIN length
- PIN digits followed by `0xF` fill
- Used only for PIN verification within chip cards

### Format 3 (ISO-3)

Similar to Format 0 but with random fill:

- Byte 0: `0x3` | PIN length  
- PIN digits followed by random fill (0xA-0xE range)
- XORed with PAN field

More secure than Format 0 due to randomness.

### Format 4 (ISO-4)

The newest and most secure format, designed for [AES encryption](/guides/aes-encryption-explained):

- 16 bytes (128 bits) instead of 8 bytes
- Uses AES-128 encryption
- Includes additional security features

Structure:
- Control field with format indicator
- PIN length
- PIN digits
- Random fill
- PAN hash

Format 4 is part of the migration from 3DES to AES in payment systems, alongside [DUKPT AES](/payments-dukpt-aes) and [TR-31 Version D](/guides/what-is-tr31-key-block).

## Security Comparison

| Format | PAN Required | Fill Type | Block Size | Recommended |
|--------|-------------|-----------|------------|-------------|
| 0 | Yes | Fixed (0xF) | 8 bytes | Legacy |
| 1 | No | Random | 8 bytes | Good |
| 2 | N/A | Fixed | 8 bytes | Chip only |
| 3 | Yes | Random | 8 bytes | Better |
| 4 | Yes | Random | 16 bytes | Best |

## When to Use Each Format

- **Format 0**: Legacy systems, ATM networks (most common today)
- **Format 1**: Systems without PAN access
- **Format 3**: Modern TDES-based systems
- **Format 4**: New AES-based implementations

## PIN Block in the Transaction Flow

1. Customer enters PIN at ATM/POS
2. Terminal formats PIN as PIN block (Format 0 or 3)
3. PIN block encrypted with PEK (or DUKPT-derived key)
4. Encrypted PIN block placed in [ISO 8583](/guides/iso8583-payment-messages) Field 52
5. Message with MAC sent to acquirer
6. Acquirer re-encrypts PIN block under interchange key
7. Issuer decrypts and verifies PIN

The [MAC](/guides/mac-algorithms-payment-security) in the ISO 8583 message protects the entire transaction from tampering.

## PIN Verification Methods

### IBM 3624 (PIN Offset)
- Issuer derives a "natural PIN" from the PAN using a PIN derivation key
- PIN offset = customer PIN - natural PIN (mod 10)
- Offset stored on card or in database
- Use our [PIN Offset Calculator](/payments-pin-offset)

### VISA PVV (PIN Verification Value)
- 4-digit value derived from PIN, PAN, and PVK
- Stored on magnetic stripe
- Use our [PIN PVV Calculator](/payments-pin-pvv)

## Try It Yourself

Use our PIN Block tools to encode and decode PIN blocks in all formats:

- [PIN Block General Tool](/payments-pin-blocks-general) — All ISO 9564 formats (0, 1, 2, 3)
- [PIN Block AES Tool](/payments-pin-blocks-aes) — Format 4 (AES-based)
- [PIN Offset Calculator](/payments-pin-offset) — IBM 3624 PIN offset
- [PIN PVV Calculator](/payments-pin-pvv) — VISA PIN Verification Value

Step-by-step visualization of the encoding/decoding process is included.
