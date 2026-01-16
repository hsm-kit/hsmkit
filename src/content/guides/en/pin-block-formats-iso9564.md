PIN blocks are the standard format for encrypting and transmitting Personal Identification Numbers (PINs) in financial systems. This guide covers all ISO 9564 formats.

## What is a PIN Block?

A PIN block is a formatted data block that contains a PIN in a specific format, designed to be encrypted and transmitted securely. The format combines:

- The PIN itself
- A "fill" pattern (random or fixed data)
- Often the Primary Account Number (PAN)

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

The newest and most secure format, designed for AES:

- 16 bytes (128 bits) instead of 8 bytes
- Uses AES-128 encryption
- Includes additional security features

Structure:
- Control field with format indicator
- PIN length
- PIN digits
- Random fill
- PAN hash

## Security Comparison

| Format | PAN Required | Fill Type | Block Size | Recommended |
|--------|-------------|-----------|------------|-------------|
| 0 | Yes | Fixed (0xF) | 8 bytes | Legacy |
| 1 | No | Random | 8 bytes | Good |
| 2 | N/A | Fixed | 8 bytes | Chip only |
| 3 | Yes | Random | 8 bytes | Better |
| 4 | Yes | Random | 16 bytes | Best |

## When to Use Each Format

- **Format 0**: Legacy systems, ATM networks
- **Format 1**: Systems without PAN access
- **Format 3**: Modern TDES-based systems
- **Format 4**: New AES-based implementations

## Try It Yourself

Use our PIN Blocks tool to encode and decode PIN blocks in all formats with step-by-step visualization of the process.
