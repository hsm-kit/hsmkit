Base64 is one of the most common encodings in computing — you see it in emails, JWTs, certificates, and API responses. This guide explains how it works, when to use it, and the variants you'll encounter.

## What is Base64?

Base64 is a binary-to-text encoding scheme that represents binary data using only 64 printable ASCII characters. It's used when you need to transmit binary data through systems that only handle text.

The 64 characters used:
- `A-Z` (26 characters)
- `a-z` (26 characters)
- `0-9` (10 characters)
- `+` and `/` (2 characters)
- `=` for padding

## How Base64 Works

Base64 converts every 3 bytes (24 bits) of binary data into 4 characters (each representing 6 bits):

```
Binary:  01001101 01100001 01101110
Groups:  010011 010110 000101 101110
Decimal: 19     22     5      46
Base64:  T      W      F      u
```

### Padding
If the input length isn't a multiple of 3, padding `=` characters are added:
- 1 remaining byte → 2 Base64 chars + `==`
- 2 remaining bytes → 3 Base64 chars + `=`

### Size Overhead
Base64 increases data size by approximately **33%** (3 bytes → 4 characters).

## Base64 Variants

### Standard Base64 (RFC 4648)
- Uses `+` and `/`
- Padding with `=`
- Used in: MIME email, PEM certificates, most general purposes

### URL-Safe Base64 (Base64url)
- Uses `-` and `_` instead of `+` and `/`
- Padding optional (often omitted)
- Used in: **JWT tokens**, URLs, filenames, web APIs

### Base64 without padding
- Standard or URL-safe but without `=` padding
- Common in JWTs and many web APIs

### MIME Base64
- Standard Base64 with line breaks every 76 characters
- Used in email attachments

## Common Uses of Base64

### Certificates and Keys (PEM format)
Every PEM file is Base64-encoded DER:
```
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiI...
-----END CERTIFICATE-----
```
Decode this to get the raw DER bytes, then parse with our [ASN.1 Parser](/asn1-parser).

### JWT Tokens
JSON Web Tokens use Base64url encoding for each section:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.signature
  ↑ Header (Base64url)  ↑ Payload (Base64url)  ↑ Signature
```

### Data URIs
Embedding images directly in HTML/CSS:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

### API Responses
Many APIs return binary data (images, files, cryptographic values) as Base64 strings.

### Cryptographic Values
Key material, IVs, ciphertext are often transmitted as Base64 in configuration files and APIs.

## Base64 vs Other Encodings

| Encoding | Characters | Size overhead | Use case |
|----------|-----------|---------------|----------|
| Hex | 0-9, A-F | 100% | Cryptographic values, debugging |
| Base64 | 64 chars | 33% | Binary data in text systems |
| Base64url | 64 URL-safe | 33% | URLs, JWTs |
| Base94 | 94 printable | ~22% | Maximum density text encoding |

For maximum density, Base94 uses all 94 printable ASCII characters. See our [Base94 Encoder](/base94).

## Hex vs Base64 for Cryptographic Data

In payment and HSM contexts, you'll encounter both:

| Format | Example (AES key) | Length |
|--------|-------------------|--------|
| Hex | `0123456789ABCDEF0123456789ABCDEF` | 32 chars |
| Base64 | `ASNFZ4mrze8BI0VniavN7w==` | 24 chars |

- **Hex** is more common in HSM tools and payment systems
- **Base64** is more common in web/API contexts and certificates

Our [Character Encoding Converter](/character-encoding) can convert between hex, Base64, ASCII, binary, and EBCDIC.

## Decoding Base64 in Practice

### Inspect a JWT
A JWT like `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.xxx`:
1. Split by `.` to get 3 parts
2. Base64url-decode each part (add padding if needed)
3. Header and payload are JSON; signature is binary

### Inspect a Certificate
1. Remove `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`
2. Base64-decode the content to get DER bytes
3. Parse with our [ASN.1 Parser](/asn1-parser) or [SSL Certificate Parser](/ssl-certificates)

### Extract Key from PEM
1. Remove header/footer lines
2. Base64-decode to get DER
3. Parse with our [RSA DER Public Key Decoder](/rsa-der-public-key)

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using standard Base64 in URLs | `+` and `/` break URLs | Use Base64url |
| Forgetting padding | Decode fails | Add `=` padding to make length multiple of 4 |
| Confusing Base64 with encryption | Base64 is NOT encryption | Use AES for actual encryption |
| Double-encoding | Garbled data | Encode only once |

**Important**: Base64 is an encoding, not encryption. Anyone can decode it. Never use Base64 to "hide" sensitive data.

## Try It Yourself

Use our [Base64 Encoder/Decoder](/base64) to:

- Encode text or hex to Base64
- Decode Base64 to text or hex
- Handle standard and URL-safe variants
- Process padding automatically

For converting between multiple formats (hex, Base64, ASCII, binary, EBCDIC), use our [Character Encoding Converter](/character-encoding).
