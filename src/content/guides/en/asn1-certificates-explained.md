ASN.1 (Abstract Syntax Notation One) is the data format underlying X.509 certificates, RSA keys, and most cryptographic data structures. Understanding it helps you debug certificate issues, parse key files, and understand what's inside a TLS certificate.

## What is ASN.1?

ASN.1 is a standard notation for describing data structures in a platform-independent way. Think of it as a type system for binary data. It was developed in the 1980s and remains the foundation of:

- X.509 certificates (TLS/SSL)
- RSA, ECC, DSA key formats
- PKCS standards (#1, #7, #8, #10, #12)
- SNMP, LDAP, Kerberos protocols
- EMV payment card data

## DER vs BER vs PEM

ASN.1 defines the structure; encoding rules define the binary format:

### DER (Distinguished Encoding Rules)
- **Canonical** encoding — one and only one way to encode each value
- Used for certificates, keys, signatures
- Required for cryptographic operations (signatures are over DER-encoded data)

### BER (Basic Encoding Rules)
- More flexible than DER
- Multiple valid encodings for same data
- Used in some protocols (SNMP, LDAP)

### PEM (Privacy Enhanced Mail)
- Not an ASN.1 encoding — it's DER encoded as **Base64** with header/footer
- Human-readable, easy to copy-paste
- The `-----BEGIN CERTIFICATE-----` format you see everywhere

```
-----BEGIN CERTIFICATE-----     ← Header
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
...                              ← Base64-encoded DER
-----END CERTIFICATE-----       ← Footer
```

## TLV Structure

ASN.1 DER encoding uses **Tag-Length-Value (TLV)** format:

```
[Tag] [Length] [Value]
  1+    1+       N bytes
```

### Tag Examples
| Tag (hex) | Type |
|-----------|------|
| 02 | INTEGER |
| 03 | BIT STRING |
| 04 | OCTET STRING |
| 05 | NULL |
| 06 | OBJECT IDENTIFIER (OID) |
| 0C | UTF8String |
| 13 | PrintableString |
| 17 | UTCTime |
| 18 | GeneralizedTime |
| 30 | SEQUENCE |
| 31 | SET |
| A0, A1... | Context-specific (EXPLICIT) |
| 80, 81... | Context-specific (IMPLICIT) |

### Length Encoding
- Short form: 1 byte (0x00–0x7F) for lengths 0–127
- Long form: First byte = `0x80 | N`, followed by N bytes of length

Example: `82 01 F4` = length 500 (0x01F4)

## X.509 Certificate Structure

An X.509 certificate is an ASN.1 SEQUENCE containing:

```
Certificate ::= SEQUENCE {
    tbsCertificate    TBSCertificate,
    signatureAlgorithm AlgorithmIdentifier,
    signatureValue    BIT STRING
}

TBSCertificate ::= SEQUENCE {
    version           [0] EXPLICIT INTEGER,
    serialNumber      INTEGER,
    signature         AlgorithmIdentifier,
    issuer            Name,
    validity          Validity,
    subject           Name,
    subjectPublicKeyInfo SubjectPublicKeyInfo,
    extensions        [3] EXPLICIT Extensions OPTIONAL
}
```

### Key Certificate Fields

| Field | Description |
|-------|-------------|
| Version | v1 (0), v2 (1), v3 (2) — modern certs are v3 |
| Serial Number | Unique number assigned by CA |
| Issuer | Who signed this certificate (CA name) |
| Validity | Not Before / Not After dates |
| Subject | Who this certificate is for |
| Public Key | The public key and algorithm |
| Extensions | SANs, key usage, CRL distribution points, etc. |
| Signature | CA's signature over TBSCertificate |

## Common OIDs

Object Identifiers (OIDs) identify algorithms and attributes:

| OID | Meaning |
|-----|---------|
| 1.2.840.113549.1.1.1 | rsaEncryption |
| 1.2.840.113549.1.1.11 | sha256WithRSAEncryption |
| 1.2.840.10045.2.1 | ecPublicKey |
| 1.2.840.10045.4.3.2 | ecdsa-with-SHA256 |
| 2.5.4.3 | commonName (CN) |
| 2.5.4.10 | organizationName (O) |
| 2.5.4.6 | countryName (C) |
| 2.5.29.17 | subjectAltName |
| 2.5.29.19 | basicConstraints |

## RSA Public Key Structure

An RSA public key in PKCS#1 format:

```
RSAPublicKey ::= SEQUENCE {
    modulus           INTEGER,  -- n
    publicExponent    INTEGER   -- e (usually 65537)
}
```

Wrapped in SubjectPublicKeyInfo (SPKI) for use in certificates:

```
SubjectPublicKeyInfo ::= SEQUENCE {
    algorithm         AlgorithmIdentifier,
    subjectPublicKey  BIT STRING  -- contains RSAPublicKey
}
```

Use our [RSA DER Public Key Decoder](/rsa-der-public-key) to extract modulus and exponent from RSA public keys.

## ECC Public Key Structure

```
SubjectPublicKeyInfo ::= SEQUENCE {
    algorithm SEQUENCE {
        id-ecPublicKey OID,
        namedCurve     OID  -- e.g., prime256v1
    },
    subjectPublicKey BIT STRING  -- uncompressed point: 04 || x || y
}
```

## Practical: Reading a Certificate

Use our [ASN.1 Parser](/asn1-parser) to decode any DER/PEM structure. For complete certificate parsing with human-readable field names, use our [SSL Certificate Parser](/ssl-certificates).

### Example: Decode a PEM Certificate
1. Copy the PEM certificate (including `-----BEGIN CERTIFICATE-----` lines)
2. Paste into the [SSL Certificate Parser](/ssl-certificates)
3. See all fields: subject, issuer, validity, public key, extensions, SANs

### Example: Inspect a Raw Key
1. Copy the DER bytes (hex or Base64)
2. Paste into the [ASN.1 Parser](/asn1-parser)
3. Navigate the TLV tree to see each field

## Certificate Chain and Trust

TLS uses a chain of certificates:

```
Root CA Certificate (self-signed, in browser trust store)
    └── Intermediate CA Certificate (signed by Root CA)
            └── Server Certificate (signed by Intermediate CA)
```

Each certificate's signature is verified against the issuer's public key. This chain of trust ultimately anchors to a Root CA that browsers and operating systems trust.

## Common Certificate Issues

| Error | Cause | Fix |
|-------|-------|-----|
| Certificate expired | Past Not After date | Renew certificate |
| Hostname mismatch | CN/SAN doesn't match domain | Get cert with correct SAN |
| Untrusted root | Root CA not in trust store | Install CA certificate |
| Chain incomplete | Missing intermediate cert | Include full chain |
| Weak signature | SHA-1 signature | Reissue with SHA-256 |

## Try It Yourself

- [ASN.1 Parser](/asn1-parser) — Parse any DER/BER/PEM structure
- [SSL Certificate Parser](/ssl-certificates) — Full X.509 certificate analysis
- [RSA DER Public Key Decoder](/rsa-der-public-key) — Extract RSA key parameters
- [ECC Tool](/ecc-encryption) — Work with ECC keys and signatures
