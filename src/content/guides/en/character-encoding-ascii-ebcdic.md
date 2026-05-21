Character encoding is the foundation of how computers represent text. ASCII and EBCDIC are the two oldest encoding systems, and understanding them — especially their differences — is essential when working with legacy payment systems, mainframes, and HSMs. This guide covers both encodings and how to convert between them.

## What is Character Encoding?

Character encoding maps characters (letters, digits, symbols) to numeric values that computers can store and process. The letter `A` doesn't exist in memory — instead, it's stored as a number: `65` in ASCII or `193` in EBCDIC.

Every piece of text you encounter uses some encoding. If you interpret bytes with the wrong encoding, you get garbled output — this is the classic "mojibake" problem.

## ASCII

**ASCII** (American Standard Code for Information Interchange) was published in 1963 and became the dominant encoding for English text.

### ASCII Table Structure

- **128 characters** (0-127), using 7 bits
- **Control characters**: 0-31 and 127 (non-printable)
- **Printable characters**: 32-126

Key ranges:

| Decimal | Hex | Characters | Description |
|---------|-----|-----------|-------------|
| 48-57 | 30-39 | `0-9` | Digits |
| 65-90 | 41-5A | `A-Z` | Uppercase letters |
| 97-122 | 61-7A | `a-z` | Lowercase letters |
| 32 | 20 | Space | Whitespace |
| 33-47 | 21-2F | `! " # $ %...` | Common punctuation |

### Common Control Characters

| Decimal | Hex | Name | Description |
|---------|-----|------|-------------|
| 0 | 00 | NUL | Null character |
| 10 | 0A | LF | Line feed (newline) |
| 13 | 0D | CR | Carriage return |
| 27 | 1B | ESC | Escape |
| 9 | 09 | HT | Horizontal tab |

### ASCII in Modern Systems

ASCII is the foundation of virtually all modern encodings. UTF-8 is backward-compatible with ASCII — any valid ASCII text is also valid UTF-8. This is why ASCII knowledge remains essential.

## EBCDIC

**EBCDIC** (Extended Binary Coded Decimal Interchange Code) was developed by IBM in 1963-1964 for their System/360 mainframe. It remains in use on IBM mainframes (z/OS) and AS/400 (IBM i) systems.

### EBCDIC Table Structure

- **256 characters** (0-255), using 8 bits
- Different layout from ASCII — this is where confusion arises
- Gaps in the letter ranges (not contiguous)

Key ranges:

| Decimal | Hex | Characters | Description |
|---------|-----|-----------|-------------|
| 240-249 | F0-F9 | `0-9` | Digits |
| 193-202 | C1-CA | `A-J` | Letters A-J |
| 209-217 | D1-D9 | `J-R` | Letters J-R |
| 226-233 | E2-E9 | `S-Z` | Letters S-Z |
| 129-137 | 81-89 | `a-i` | Lowercase a-i |

Note the **gaps** — EBCDIC letters are not contiguous like ASCII. This makes range-based character checks more complex.

### EBCDIC in Payment Systems

EBCDIC is still widely used in:

- **IBM mainframes** (z/ISO-TP, z/VSE) processing financial transactions
- **Payment switches** running on mainframe platforms
- **ATM networks** using ISO 8583 messages in EBCDIC
- **Card processing systems** where legacy mainframe integration is required

Many HSMs support EBCDIC because they interface directly with mainframe payment systems.

## ASCII vs EBCDIC Comparison

| Aspect | ASCII | EBCDIC |
|--------|-------|--------|
| Bit width | 7-bit (stored in 8) | 8-bit |
| Total characters | 128 | 256 |
| Digits | 48-57 (contiguous) | 240-249 (contiguous) |
| Uppercase | 65-90 (contiguous) | 193-202, 209-217, 226-233 (gaps) |
| Lowercase | 97-122 (contiguous) | 129-137, 145-153, 162-169 (gaps) |
| Origin | Industry standard | IBM |
| Modern usage | Universal | Mainframes only |

### The Digit Offset

A useful fact: in ASCII, digits start at 48 (hex `30`). In EBCDIC, digits start at 240 (hex `F0`). To convert a digit character to its numeric value:

- ASCII: `char - 0x30` (e.g., `'5'` = 0x35, so `0x35 - 0x30 = 5`)
- EBCDIC: `char - 0xF0` (e.g., `'5'` = 0xF5, so `0xF5 - 0xF0 = 5`)

## Hex and Binary Representation

Each encoding maps to specific hex values. Understanding hex representation is critical for HSM and payment work:

### Example: "HELLO" in Different Encodings

| Character | ASCII Hex | EBCDIC Hex |
|-----------|-----------|------------|
| H | 48 | C8 |
| E | 45 | C5 |
| L | 4C | D3 |
| L | 4C | D3 |
| O | 4F | D6 |

The same word produces completely different byte sequences depending on encoding.

### Converting Between Encodings

To convert text between ASCII and EBCDIC, you need a **translation table** that maps each character from one encoding to the other. This is not a simple arithmetic operation — it requires a lookup.

Common conversion approach:
1. Look up the source byte in the source encoding table → get the character
2. Look up the character in the destination encoding table → get the destination byte

## Encoding Compatibility Issues

### Data Corruption

When EBCDIC-encoded data is interpreted as ASCII (or vice versa), the result is garbled:

```
EBCDIC bytes: C8 C5 D3 D3 D6  (represents "HELLO")
Interpreted as ASCII: ÈÅÓÓÖ  (meaningless characters)
```

This is a common issue when transferring data between mainframes and modern systems.

### ISO 8583 Messages

ISO 8583 payment messages can be encoded in either ASCII or EBCDIC depending on the system. When an HSM processes these messages, it must know which encoding is used. Mismatched encoding causes:
- Incorrect PAN extraction
- Wrong MAC calculation
- Failed PIN block processing

### HSM Communication

Many HSMs (especially Thales/PayShield) use ASCII for command communication, but some IBM-compatible HSMs use EBCDIC. Always check your HSM documentation.

## Practical Applications

### Mainframe Integration

When integrating modern applications with IBM mainframes:
- Convert request from ASCII to EBCDIC before sending
- Convert response from EBCDIC to ASCII after receiving
- Handle numeric fields carefully (packed decimal, BCD)

### Debugging Payment Messages

When debugging ISO 8583 or APDU commands:
- Check which encoding is expected
- Convert hex values to characters using the correct table
- Look for common patterns: digits (ASCII 30-39, EBCDIC F0-F9)

### Log Analysis

Mainframe logs are often in EBCDIC. When analyzing these logs on modern systems, you need to convert the text to be readable.

## Extended ASCII and Code Pages

Beyond basic ASCII (0-127), **extended ASCII** (128-255) varies by code page:

- **CP437**: Original IBM PC character set
- **CP850**: Multilingual Latin I
- **ISO 8859-1 (Latin-1)**: Western European
- **Windows-1252**: Superset of Latin-1

Similarly, EBCDIC has multiple code pages (CP037 for US English, CP500 for international).

## Try It Yourself

Use our [Character Encoding Converter](/character-encoding) to:

- Convert text between ASCII, EBCDIC, Hex, Binary, and Base64
- View the complete ASCII and EBCDIC tables side by side
- Debug encoding issues by seeing byte-level representation
- Translate mainframe data for modern system analysis

All processing happens in your browser — your data never leaves your device.
