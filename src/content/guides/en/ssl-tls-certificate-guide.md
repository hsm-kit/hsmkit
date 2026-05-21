SSL/TLS certificates are the foundation of secure internet communication. They verify server identity, enable encryption, and establish trust between parties. This guide explains X.509 certificate structure, certificate chains, self-signed certificates, CSRs, and everything you need to understand and work with certificates.

## What is an SSL/TLS Certificate?

An SSL/TLS certificate is a digital document that:

1. **Identifies** a server (or organization)
2. **Contains** a public key for encryption
3. **Is signed** by a trusted authority (or self-signed)
4. **Enables** HTTPS connections

When you visit `https://example.com`, your browser checks the site's certificate to verify it's legitimate and establish an encrypted connection.

## X.509 Certificate Structure

X.509 is the standard format for public key certificates. A certificate contains:

### Version

```
Version: v3 (most common)
```

V3 is the current version, supporting extensions like Subject Alternative Names.

### Serial Number

A unique identifier assigned by the Certificate Authority (CA):

```
Serial Number: 0x04e5c8d9f2a1b3c4d5e6f7a8b9c0d1e2
```

### Signature Algorithm

The algorithm used to sign the certificate:

```
Signature Algorithm: sha256WithRSAEncryption
```

Common algorithms:
- `sha256WithRSAEncryption` — SHA-256 with RSA (standard)
- `sha384WithRSAEncryption` — SHA-384 with RSA (higher security)
- `ecdsa-with-SHA256` — ECDSA with P-256 curve

### Issuer

The CA that issued the certificate:

```
Issuer: CN=DigiCert SHA2 Extended Validation Server CA
        O=DigiCert Inc
        C=US
```

### Validity Period

```
Not Before: Jan  1 00:00:00 2024 GMT
Not After:  Jan 31 23:59:59 2025 GMT
```

### Subject

The entity the certificate identifies:

```
Subject: CN=www.example.com
         O=Example Inc
         L=San Francisco
         ST=California
         C=US
```

### Subject Public Key Info

The public key for encryption:

```
Public Key Algorithm: rsaEncryption
    RSA Public-Key: (2048 bit)
    Modulus: 00:b0:12:34:...
    Exponent: 65537 (0x10001)
```

### Extensions (v3)

Critical additional information:

| Extension | Purpose |
|-----------|---------|
| Subject Alternative Names (SAN) | Additional domain names |
| Key Usage | Permitted key operations |
| Extended Key Usage | Specific purposes (server auth, client auth) |
| Basic Constraints | CA certificate or end-entity |
| CRL Distribution Points | Certificate revocation list location |
| Authority Information Access | OCSP responder URL |

### Signature

The CA's digital signature over the certificate content.

## Certificate Chains

Certificates form a chain of trust:

```
Root CA Certificate (self-signed, trusted)
    ↓ signs
Intermediate CA Certificate
    ↓ signs
End-Entity Certificate (your server)
```

### Root Certificates

- Self-signed by the CA
- Pre-installed in browsers and operating systems
- Typically valid for 15-25 years
- Stored in the "trusted root certificate store"

### Intermediate Certificates

- Signed by a root CA or another intermediate
- Act as a buffer between root and end-entity certificates
- Root CA private key stays offline
- Typically valid for 5-10 years

### End-Entity Certificates

- Signed by an intermediate CA
- Installed on your server
- Typically valid for 1-2 years (90 days for Let's Encrypt)

### Chain Validation

Your browser validates the certificate chain:
1. Checks the end-entity certificate signature
2. Follows the chain to the intermediate
3. Follows to the root
4. Verifies the root is in the trusted store
5. Checks validity dates, revocation status, and domain match

## Self-Signed Certificates

A self-signed certificate is signed by its own private key, not by a CA:

```
Certificate:
    Data:
        Issuer: CN=My Server
        Subject: CN=My Server
    Signature Algorithm: sha256WithRSAEncryption
    Signature: (signed by the same key)
```

### When to Use Self-Signed Certificates

- **Development and testing**: No cost, instant generation
- **Internal services**: Where you control trust
- **IoT devices**: Device-to-device communication
- **Personal projects**: Where browser warnings are acceptable

### When NOT to Use Self-Signed Certificates

- **Production websites**: Users will see browser warnings
- **Public APIs**: Clients can't verify identity
- **E-commerce**: Loss of customer trust

### Creating a Self-Signed Certificate

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate self-signed certificate
openssl req -new -x509 -key server.key -out server.crt -days 365 \
  -subj "/CN=example.com"
```

## Certificate Signing Request (CSR)

A CSR is a message sent to a CA to request a certificate:

### CSR Contents

```
-----BEGIN CERTIFICATE REQUEST-----
MIICvDCCAaQCAQAwdzELMAkGA1UEBhMCVVMxETAPBgNVBAgTCENhbGlmb3JuaWEx
...
-----END CERTIFICATE REQUEST-----
```

A CSR contains:
- Subject information (organization, domain, location)
- Public key
- Signature (proves possession of private key)

### Generating a CSR

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate CSR
openssl req -new -key server.key -out server.csr \
  -subj "/C=US/ST=California/L=San Francisco/O=Example Inc/CN=example.com"
```

### CSR Fields

| Field | Description | Example |
|-------|-------------|---------|
| CN | Common Name (domain) | example.com |
| O | Organization | Example Inc |
| OU | Organizational Unit | IT Department |
| L | Locality | San Francisco |
| ST | State | California |
| C | Country | US |

## Certificate Types

### Domain Validated (DV)

- Verifies domain ownership only
- Issued in minutes (automated)
- No organization information
- Let's Encrypt issues DV certificates

### Organization Validated (OV)

- Verifies domain ownership AND organization existence
- Takes 1-3 days
- Organization name visible in certificate
- More trust than DV

### Extended Validation (EV)

- Most rigorous validation
- Verifies legal entity, physical address, operational existence
- Takes 1-2 weeks
- Green address bar (in older browsers)
- Highest trust level

### Wildcard Certificates

Covers all subdomains of a domain:

```
*.example.com → covers:
  - www.example.com
  - api.example.com
  - mail.example.com
  - (but NOT example.com itself)
```

### Multi-Domain (SAN) Certificates

Covers multiple different domains:

```
Subject Alternative Names:
  - example.com
  - www.example.com
  - example.org
  - api.example.net
```

## Certificate Validity Period

| Certificate Type | Typical Validity |
|-----------------|------------------|
| DV (Let's Encrypt) | 90 days |
| DV (commercial) | 1 year |
| OV | 1-2 years |
| EV | 1-2 years |
| Root CA | 15-25 years |
| Intermediate CA | 5-10 years |

### Why Short Validity?

- Limits damage from compromised certificates
- Encourages automation
- Ensures regular re-validation
- Industry trend toward shorter certificates

## Certificate Revocation

Certificates can be revoked before expiration:

### CRL (Certificate Revocation List)

- CA publishes a list of revoked certificate serial numbers
- Downloaded periodically by clients
- Can be large and stale

### OCSP (Online Certificate Status Protocol)

- Real-time check with the CA's OCSP responder
- More current than CRL
- Privacy concerns (CA sees which sites you visit)

### OCSP Stapling

- Server fetches its own OCSP response
- Includes it in the TLS handshake
- Best of both worlds: current and private

## Common Certificate Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Expired certificate | Browser warning | Renew certificate |
| Domain mismatch | Browser warning | Issue cert for correct domain |
| Missing intermediate | Chain incomplete | Install intermediate cert |
| Self-signed | Browser warning | Use CA-signed certificate |
| Revoked | Connection blocked | Issue new certificate |

## PEM vs DER Format

Certificates are stored in two formats:

### PEM Format

Text-based, Base64-encoded:
```
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiI...
-----END CERTIFICATE-----
```

File extensions: `.pem`, `.crt`, `.cer` (text)

### DER Format

Binary, not encoded:
```
(raw binary bytes)
```

File extensions: `.der`, `.cer` (binary)

### Converting Between Formats

```bash
# PEM to DER
openssl x509 -in cert.pem -out cert.der -outform DER

# DER to PEM
openssl x509 -in cert.der -inform DER -out cert.pem -outform PEM
```

## Tools for Certificate Inspection

### OpenSSL Commands

```bash
# View certificate details
openssl x509 -in cert.pem -text -noout

# Check expiration
openssl x509 -in cert.pem -enddate -noout

# Verify certificate chain
openssl verify -CAfile ca-bundle.crt server.crt

# Check remote server certificate
openssl s_client -connect example.com:443
```

## Try It Yourself

Use our [SSL Certificate Parser](/ssl-certificates) to:

- Parse and inspect X.509 certificates
- View all certificate fields and extensions
- Decode PEM and DER certificates
- Examine certificate chains
- Check validity dates and issuer information

All processing happens in your browser — your certificates never leave your device.
