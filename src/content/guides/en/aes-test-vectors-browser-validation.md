Known-answer tests answer a precise question: given an exact key, mode, IV, padding rule, and plaintext byte sequence, does an implementation produce the expected ciphertext? HSM Kit publishes a normalized AES validation set so browser code, command-line tools, application libraries, and HSM integrations can be compared byte for byte.

## Download the Validation Set

The complete machine-readable dataset is available as [AES test vectors in JSON](/test-vectors/aes.json). It includes source links, parameters, expected ciphertext, and the verification method used by this project.

These are published NIST values, not randomly generated examples. HSM Kit's contribution is the normalized schema, executable regression harness, browser workflow, and mismatch diagnosis described here.

## Included Vectors

| ID | Algorithm | Mode | Input size | Primary source |
|---|---|---|---:|---|
| `fips-197-aes-128-ecb` | AES-128 | ECB | 16 bytes | FIPS 197 Appendix C.1 |
| `fips-197-aes-192-ecb` | AES-192 | ECB | 16 bytes | FIPS 197 Appendix C.2 |
| `fips-197-aes-256-ecb` | AES-256 | ECB | 16 bytes | FIPS 197 Appendix C.3 |
| `sp800-38a-aes-128-cbc` | AES-128 | CBC | 64 bytes | SP 800-38A F.2.1 |

All vectors use raw hexadecimal bytes and **no padding**. That detail is essential: many libraries apply PKCS#7 by default and therefore produce an additional ciphertext block.

## Quick AES-128 Check

Use the following FIPS 197 values:

```text
Algorithm:  AES-128
Mode:       ECB
Padding:    None
Key:        000102030405060708090A0B0C0D0E0F
Plaintext:  00112233445566778899AABBCCDDEEFF
Ciphertext: 69C4E0D86A7B0430D8CDB78070B4C55A
```

Open the [AES encryption tool](/aes-encryption/), select AES-128, ECB, and Hexadecimal, then enter the key and plaintext. The result must equal the ciphertext exactly. Decryption must recover the original plaintext.

## CBC Multi-Block Check

The SP 800-38A vector verifies chaining across four blocks rather than only testing the AES primitive:

```text
Key: 2B7E151628AED2A6ABF7158809CF4F3C
IV:  000102030405060708090A0B0C0D0E0F
```

The JSON file contains the 64-byte plaintext and ciphertext. A one-bit change to the IV changes the first decrypted block. A one-bit change to a ciphertext block affects its corresponding plaintext block and the same bit position in the following block. These properties make the CBC vector useful for finding IV handling and chaining errors.

## Independent Reproduction

HSM Kit's automated test suite performs two independent checks:

1. Every vector is encrypted with CryptoJS using explicit `NoPadding` and the specified mode.
2. The AES-CBC vector is encrypted again with the browser-compatible Web Crypto API. Web Crypto always applies CBC padding, so the test verifies the four NIST blocks as an exact ciphertext prefix and separately asserts the additional 16-byte padding block.

The expected ciphertext is not calculated at page-render time. It is stored in the public dataset and compared byte for byte during tests. A build fails if the CryptoJS result or the Web Crypto NIST prefix differs.

## Why Results Commonly Differ

### Text versus hexadecimal bytes

The text `0011` is four ASCII bytes (`30 30 31 31`). The hexadecimal value `0011` is two bytes. Confirm whether an API expects text, a hex decoder, Base64, or a byte array.

### Automatic padding

Known-answer vectors are already block aligned. Disable PKCS#7, PKCS#5, zero padding, or ISO 7816 padding when the API permits it. An extra 16-byte block usually indicates automatic full-block padding. Web Crypto AES-CBC always pads; compare the NIST-length ciphertext prefix or use a library with an explicit NoPadding mode for exact output.

### Incorrect IV encoding

CBC uses a 16-byte IV. Passing the characters of a 32-character hex string instead of decoding that string produces a 32-byte ASCII value and a different result.

### Mode mismatch

ECB has no IV and encrypts each block independently. CBC XORs every plaintext block with the preceding ciphertext block. GCM and CTR use counters and cannot reproduce CBC or ECB vectors.

### Key-size inference

Use the key byte length, not a UI label, to identify AES-128, AES-192, or AES-256. Truncating, hashing, or zero-extending a password silently creates a different key.

### Output packaging

Some APIs prepend an IV, salt, version field, or authentication tag. Compare the raw ciphertext bytes, not a library-specific envelope.

## Interoperability Checklist

- Decode every hexadecimal field to bytes before encryption.
- Specify mode and padding explicitly.
- Verify key and IV lengths in bytes.
- Compare uppercase or lowercase hex without separators.
- Test encryption and decryption.
- Keep protocol packaging outside the primitive known-answer test.
- Record library, platform, and version when reporting a mismatch.

## Security Boundary

Passing a known-answer test proves that one configuration reproduces expected bytes. It does not prove that a protocol is secure, that keys are generated safely, or that an implementation resists side channels. ECB is included only as a primitive validation mode and should not be used for multi-block confidential data.

For new authenticated-encryption designs, see [AES-GCM versus AES-CBC](/guides/aes-gcm-vs-cbc/) and [AES IV and nonce reuse](/guides/aes-iv-nonce-reuse/).