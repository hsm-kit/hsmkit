Binary Coded Decimal (BCD) is a way of encoding decimal numbers where each digit is represented by its own binary sequence. Unlike pure binary representation, BCD preserves the exact decimal value — making it essential in financial systems, payment terminals, and HSM communication where precision matters more than storage efficiency.

## What is BCD?

In standard binary, the number `255` is stored as `11111111` (one byte). In BCD, each decimal digit is encoded separately:

```
Decimal: 255
Binary:  11111111  (one byte, value 255)
BCD:     0000 0010 0101 0101  (two bytes, each nibble = one digit)
```

BCD is less space-efficient than pure binary, but it has a critical advantage: **exact decimal representation** with no rounding errors. This is why BCD dominates in financial and payment systems.

## Packed vs Unpacked BCD

There are two main BCD formats:

### Packed BCD

Each byte stores **two decimal digits** — one in the high nibble (4 bits), one in the low nibble:

```
Number: 92
Packed BCD: 1001 0010  (0x92)

Number: 1234
Packed BCD: 0001 0010 0011 0100  (0x1234)
```

Advantages:
- More compact (2 digits per byte)
- Standard in payment and financial systems
- Used in ISO 8583 fields, card track data, PIN blocks

### Unpacked BCD

Each byte stores **one decimal digit** in the low nibble, with the high nibble typically set to 0 (or sometimes 0xF):

```
Number: 92
Unpacked BCD: 0x09 0x02  (two bytes)

Number: 1234
Unpacked BCD: 0x01 0x02 0x03 0x04  (four bytes)
```

Advantages:
- Simpler to process (one digit per byte)
- Used in some legacy systems and specific protocols
- Common in EBCDIC-based systems

## How BCD Encoding Works

### Converting Decimal to Packed BCD

For each pair of decimal digits, place the first digit in the high nibble and the second in the low nibble:

```
Decimal: 78
Digit 7 → 0111 (high nibble)
Digit 8 → 1000 (low nibble)
Packed BCD: 01111000 = 0x78
```

### Converting Decimal to Unpacked BCD

Each digit gets its own byte:

```
Decimal: 78
Digit 7 → 00000111 = 0x07
Digit 8 → 00001000 = 0x08
Unpacked BCD: 0x07 0x08
```

### Handling Odd-Length Numbers

For packed BCD with an odd number of digits, the leading nibble is padded with 0:

```
Decimal: 123
Packed BCD: 0001 0010 0011 → 0x0123 (leading zero nibble)
```

## BCD vs Hex vs Binary

Understanding the differences is crucial:

| Representation | Number 1234 | Bytes Used | Preserves Decimal |
|---------------|-------------|------------|-------------------|
| Binary | 0x04D2 | 2 | No (hex is 04D2) |
| Packed BCD | 0x1234 | 2 | Yes (looks like 1234) |
| Unpacked BCD | 0x01 0x02 0x03 0x04 | 4 | Yes |
| ASCII | 0x31 0x32 0x33 0x34 | 4 | Yes |

Key differences:
- **Binary**: Most compact, but decimal values don't map directly to hex representation
- **Packed BCD**: Compact decimal representation, each byte = 2 decimal digits
- **Unpacked BCD**: One digit per byte, easier to process
- **ASCII**: Human-readable, but uses more space

## BCD in Financial Systems

### ISO 8583 Payment Messages

ISO 8583 uses BCD extensively:

- **Field 2 (PAN)**: Packed BCD, left-justified, padded with F if odd length
- **Field 7 (Transmission Date/Time)**: Packed BCD, MMDDhhmmss
- **Field 11 (System Trace Audit Number)**: Packed BCD, 6 digits
- **Field 12/13 (Local Transaction Time/Date)**: Packed BCD

Example PAN field:
```
PAN: 4111111111111111 (16 digits)
BCD: 0x41 0x11 0x11 0x11 0x11 0x11 0x11 0x11
```

### Card Track Data

Magnetic stripe track data uses BCD:
- Track 1: Alphanumeric (not BCD)
- Track 2: Numeric only, BCD-encoded
- Track 3: Numeric only, BCD-encoded

### PIN Blocks

PIN blocks (ISO 9564) use BCD for PIN digits:
```
PIN: 1234
BCD format: 0x04 0x12 0x3F 0xFF 0xFF 0xFF 0xFF 0xFF
            ↑     ↑
            Length  PIN digits padded with F
```

### EMV Chip Data

EMV (chip card) data encoding uses BCD for numeric fields:
- Amount: 6 bytes packed BCD
- Date: 3 bytes packed BCD (YYMMDD)
- Time: 3 bytes packed BCD (HHmmss)

## Arithmetic with BCD

BCD arithmetic is different from binary arithmetic. When adding BCD digits:

```
  0x09 (9)
+ 0x01 (1)
= 0x0A (invalid BCD!)
```

The result `0x0A` is not valid BCD. You need to add 6 to correct it:

```
  0x0A
+ 0x06
= 0x10 (10 in BCD = carry + 0)
```

This correction is why BCD arithmetic is slower than binary arithmetic but preserves decimal precision.

## Signed BCD

BCD can represent negative numbers using **sign-magnitude** or **ten's complement**:

### Sign-Magnitude
The last nibble indicates the sign:
- `0xC` = positive
- `0xD` = negative

```
+1234: 0x1234C
-1234: 0x1234D
```

### Ten's Complement
Similar to two's complement in binary but for decimal. Less common in payment systems.

## BCD in HSM Commands

HSMs (Hardware Security Modules) often use BCD for:
- PIN block formats (ISO 9564)
- Key serial number (KSN) in DUKPT
- Amount fields in transaction data
- Date/time fields

When sending commands to an HSM, you must encode numeric fields as BCD, not ASCII or binary.

## Common BCD Pitfalls

### Invalid BCD Values

Each nibble must be 0-9. Values 0xA-0xF are invalid in standard BCD:

```
Valid BCD:   0x12 0x34 0x56  (123456)
Invalid BCD: 0x12 0x3A 0x56  (A is not a decimal digit)
```

### Byte Order Confusion

BCD doesn't have inherent byte order issues (it's always big-endian for the digit sequence), but the containing message may use different byte orders for multi-byte fields.

### Padding Ambiguity

Different systems use different padding:
- F-padded: `0x12 0x3F` (123 with F padding)
- Zero-padded: `0x12 0x30` (123 with zero padding)
- Space-padded: `0x12 0x32 0x00` (123 with null padding)

Always check your protocol specification.

## Try It Yourself

Use our [BCD Converter](/bcd) to:

- Convert between decimal and packed/unpacked BCD
- Encode and decode BCD values with different padding options
- Validate BCD data and identify invalid nibble values
- Understand how payment systems encode numeric fields

All processing happens in your browser — your data never leaves your device.
