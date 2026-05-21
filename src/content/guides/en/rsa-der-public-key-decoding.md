RSA public keys come in different formats — PEM, DER, PKCS#1, PKCS#8, SPKI — and understanding how they're structured is essential for cryptographic work. This guide explains the DER encoding format, how RSA public keys are structured using ASN.1, and how to extract the modulus and exponent from a DER-encoded key.

## RSA Public Key Formats

RSA public keys can be represented in several formats:

### PEM (Privacy Enhanced Mail)

PEM is a text format that Base64-encodes the DER bytes and wraps them with headers:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWe
...
-----END PUBLIC KEY-----
```

PEM is just Base64-encoded DER with human-readable headers. To get the raw bytes, strip the headers and Base64-decode.

### DER (Distinguished Encoding Rules)

DER is a binary format — raw bytes with no encoding overhead. It's used in:
- Certificate files (.cer, .der)
- Embedded systems
- Protocol-level communication
- Binary key storage

DER is more compact than PEM (no Base64 overhead) but not human-readable.

### Converting Between Formats

```
PEM → DER:  Strip headers, Base64-decode
DER → PEM:  Base64-encode, add headers
```

## ASN.1 Structure

RSA keys are defined using **ASN.1** (Abstract Syntax Notation One), a standard for describing data structures. DER is one of the encoding rules for ASN.1.

### PKCS#1 Format (RSAPublicKey)

The original RSA-specific format. Contains only the RSA key components:

```
RSAPublicKey ::= SEQUENCE {
    modulus           INTEGER,    -- n
    publicExponent    INTEGER     -- e
}
```

This is the simplest RSA public key structure. The modulus is the large prime product, and the public exponent is typically 65537 (0x10001).

### PKCS#8 Format (PublicKey)

A generic format that wraps the algorithm-specific key in an algorithm identifier:

```
PublicKeyInfo ::= SEQUENCE {
    algorithm         AlgorithmIdentifier,
    publicKey         BIT STRING
}

AlgorithmIdentifier ::= SEQUENCE {
    algorithm         OBJECT IDENTIFIER,  -- rsaEncryption (1.2.840.113549.1.1.1)
    parameters        ANY DEFINED BY algorithm OPTIONAL
}
```

The `publicKey` field contains the PKCS#1 RSAPublicKey as a bit string.

### SubjectPublicKeyInfo (SPKI)

This is what most people mean by "DER public key." It's the PKCS#8 structure used in X.509 certificates:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
```

When you see `-----BEGIN PUBLIC KEY-----`, it's SPKI format.

## Extracting Modulus and Exponent

### From SPKI/PKCS#8 DER

The structure is nested:

```
SEQUENCE {                          -- SubjectPublicKeyInfo
  SEQUENCE {                        -- AlgorithmIdentifier
    OID 1.2.840.113549.1.1.1       -- rsaEncryption
    NULL
  }
  BIT STRING {                      -- publicKey
    SEQUENCE {                      -- RSAPublicKey (PKCS#1)
      INTEGER                       -- modulus (n)
      INTEGER                       -- publicExponent (e)
    }
  }
}
```

To extract:
1. Parse the outer SEQUENCE
2. Verify the OID is `1.2.840.113549.1.1.1` (rsaEncryption)
3. Extract the BIT STRING
4. Parse the inner SEQUENCE from the bit string
5. Read the INTEGER values (modulus and exponent)

### From PKCS#1 DER

Simpler structure:

```
SEQUENCE {                          -- RSAPublicKey
  INTEGER                           -- modulus (n)
  INTEGER                           -- publicExponent (e)
}
```

To extract:
1. Parse the SEQUENCE
2. Read the two INTEGER values

## PKCS#1 vs PKCS#8 vs SPKI

| Format | Header | Contains | Algorithm Info |
|--------|--------|----------|---------------|
| PKCS#1 | `-----BEGIN RSA PUBLIC KEY-----` | Just n and e | No |
| PKCS#8/SPKI | `-----BEGIN PUBLIC KEY-----` | Algorithm OID + n and e | Yes |

### Why Multiple Formats?

- **PKCS#1**: Simple, RSA-specific, compact
- **PKCS#8/SPKI**: Generic, supports any algorithm, used in certificates and standard tools

Most tools output SPKI format. PKCS#1 is used in some legacy systems and specific protocols.

## Common RSA Public Exponents

| Exponent | Hex Value | Usage |
|----------|-----------|-------|
| 3 | 0x03 | Fast, but some consider weak |
| 17 | 0x11 | Less common |
| 65537 | 0x10001 | **Standard, recommended** |

The exponent 65537 (0x10001) is chosen because:
- It's a Fermat prime (2^16 + 1)
- It has only two set bits, making modular exponentiation efficient
- It's large enough to avoid small-exponent attacks
- It's the de facto industry standard

## Understanding the Modulus

The RSA modulus `n` is the product of two large primes: `n = p × q`

- Typical sizes: 1024, 2048, 3072, or 4096 bits
- 2048-bit is the current minimum recommendation
- 3072-bit recommended for long-term security
- 4096-bit for highest security needs

The modulus determines the key size. A 2048-bit RSA key has a 2048-bit modulus.

## OID (Object Identifier) Reference

Common OIDs you'll encounter:

| OID | Meaning |
|-----|---------|
| 1.2.840.113549.1.1.1 | RSA encryption |
| 1.2.840.113549.1.1.11 | SHA256 with RSA |
| 1.2.840.10045.2.1 | EC public key |
| 1.2.840.10045.3.1.7 | P-256 curve |

When parsing a DER key, always verify the OID matches the expected algorithm.

## Practical Example

Given a Base64-encoded SPKI public key:

```
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWe
...
```

1. Base64-decode to get DER bytes
2. Parse ASN.1 structure
3. Verify OID is RSA (1.2.840.113549.1.1.1)
4. Extract modulus (large integer, typically 256 bytes for 2048-bit key)
5. Extract exponent (usually 65537 = 3 bytes: 01 00 01)

## Debugging DER Keys

When working with DER keys, you may encounter:

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Parse error | Wrong format | Check if it's PKCS#1 or SPKI |
| Wrong OID | Algorithm mismatch | Verify the key algorithm |
| Truncated data | Incomplete copy | Check file length |
| Encoding error | PEM line wrapping | Re-encode with proper line breaks |

### Tools for Inspection

- **OpenSSL command line**: `openssl rsa -pubin -in key.pem -text -noout`
- **ASN.1 dump**: `openssl asn1parse -in key.der -inform DER`
- **Online tools**: Our RSA DER decoder provides instant parsing

## Key Format Conversion

### PEM to DER

```bash
openssl rsa -pubin -in key.pem -out key.der -outform DER
```

### DER to PEM

```bash
openssl rsa -pubin -in key.der -inform DER -out key.pem -outform PEM
```

### PKCS#1 to SPKI

```bash
openssl rsa -RSAPublicKey_in -in pkcs1.pem -pubout -out spki.pem
```

### Extract Components

```bash
openssl rsa -pubin -in key.pem -text -noout
```

This outputs the modulus and exponent in human-readable form.

## Use Cases for DER Keys

### Certificate Parsing

X.509 certificates contain the public key in SPKI DER format inside the certificate structure. Our [SSL Certificate Parser](/ssl-certificates) extracts this automatically.

### API Authentication

Some APIs require public keys in DER format for signature verification or encryption.

### Embedded Systems

DER's compact binary format is preferred in resource-constrained environments.

### Key Pinning

Public key pinning often uses the hash of the DER-encoded public key (SPKI pinning).

## Try It Yourself

Use our [RSA DER Public Key Decoder](/rsa-der-public-key) to:

- Parse DER-encoded RSA public keys (SPKI and PKCS#1 formats)
- Extract the modulus and exponent
- View the complete ASN.1 structure
- Decode PEM public keys to see their DER content

All processing happens in your browser — your keys never leave your device.
