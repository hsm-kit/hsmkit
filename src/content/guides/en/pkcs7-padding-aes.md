AES encrypts 16-byte blocks. CBC mode therefore needs a reversible rule for plaintext whose length is not a multiple of 16. PKCS#7 padding supplies that rule by appending bytes whose values encode the padding length. The format is simple, but validation errors can create serious padding-oracle vulnerabilities.

## The PKCS#7 Rule

Let the block size be `B` bytes and the plaintext length be `L`. The number of padding bytes is:

```text
N = B - (L mod B)
```

Append `N` bytes, each containing the numeric value `N`. For AES, `B` is always 16, so `N` is between 1 and 16.

### Example: five-byte plaintext

The ASCII string `HELLO` is 5 bytes. It needs 11 bytes of padding (`0x0B`):

```text
48 45 4C 4C 4F 0B 0B 0B 0B 0B 0B 0B 0B 0B 0B 0B
```

After decryption, the final byte says that 11 bytes were added. All 11 final bytes must equal `0x0B` before they are removed.

## Why a Full Block Is Added

If plaintext is already an exact multiple of 16 bytes, PKCS#7 adds a complete block of padding:

```text
10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10
```

Without this extra block, a receiver could not tell whether the final byte `0x01` was real data or padding. PKCS#7 is unambiguous because every padded message contains padding.

This behavior surprises developers who expect a 16-byte plaintext to produce only one 16-byte ciphertext block. Under AES-CBC with PKCS#7 it produces two blocks, before accounting for the IV.

## Valid and Invalid Padding

For AES, these endings are valid:

```text
... 01
... 02 02
... 03 03 03
... 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10
```

These endings are invalid:

```text
... 00             # zero is not a valid padding length
... 02 03          # bytes do not match the declared length
... 11 ...         # 17 exceeds the 16-byte AES block size
```

A decoder must reject invalid padding. Silently trimming bytes based only on the last value can corrupt data and weaken security.

## PKCS#5 vs PKCS#7

The names are often used interchangeably in APIs, but their original definitions differ:

- PKCS#5 padding was defined for an 8-byte block size.
- PKCS#7/CMS padding supports block sizes from 1 to 255 bytes.
- AES has a 16-byte block, so the precise term is PKCS#7 padding.

Some Java providers expose `PKCS5Padding` for AES while implementing the generalized PKCS#7 rule. Check provider documentation rather than relying only on the label.

## Which AES Modes Need Padding?

| Mode | PKCS#7 needed? | Reason |
|---|---|---|
| CBC | Yes for arbitrary-length data | Processes complete blocks |
| ECB | Yes for arbitrary-length data | Processes complete blocks |
| CTR | No | Produces a byte stream |
| GCM | No | Counter-based authenticated mode |
| CFB / OFB | No | Stream-like operation |

Do not manually add PKCS#7 when the cryptographic library already applies it. Double padding creates an extra layer that remains after one unpadding step.

## The Padding Oracle Problem

Padding is not authentication. In CBC, modifying a ciphertext block predictably changes the next decrypted plaintext block. If a service reveals whether padding was valid, an attacker can make repeated requests and recover plaintext without knowing the key.

The signal can be explicit or indirect:

- different error messages for invalid padding and invalid JSON;
- different HTTP status codes;
- measurable response-time differences;
- connection behavior that changes after decryption.

The preferred fix is to use authenticated encryption such as AES-GCM. When legacy CBC is unavoidable, authenticate the version, IV, and ciphertext with encrypt-then-MAC and verify the MAC before decryption. See [AES-GCM vs AES-CBC](/guides/aes-gcm-vs-cbc/) for the construction differences.

## Safe Unpadding

Application code should normally call a maintained cryptographic library rather than implement unpadding. The library should:

1. Verify ciphertext authentication before CBC decryption.
2. Confirm the decrypted length is a non-zero multiple of the block size.
3. Read the final padding length and require a value from 1 through 16.
4. Check every declared padding byte.
5. Return one generic failure for all invalid encrypted records.

Avoid logging decrypted bytes or detailed padding failures. Detailed diagnostics are useful in isolated tests, not in attacker-visible production responses.

## Interoperability Checklist

When two systems disagree about AES-CBC output, verify:

- both use the same raw key bytes and key length;
- both use the same 16-byte IV;
- both interpret plaintext in the same character encoding;
- both use PKCS#7 rather than zero padding or no padding;
- ciphertext is encoded the same way (hex or Base64);
- the IV is transmitted separately or prefixed consistently;
- authentication tags or HMAC fields are not mistaken for ciphertext.

A string's character count is not its byte count. UTF-8 text containing non-ASCII characters may require more bytes than expected and therefore a different padding length.

## Worked Length Examples

| Plaintext bytes | Padding bytes | Padded length |
|---:|---:|---:|
| 0 | 16 × `0x10` | 16 |
| 1 | 15 × `0x0F` | 16 |
| 15 | 1 × `0x01` | 16 |
| 16 | 16 × `0x10` | 32 |
| 31 | 1 × `0x01` | 32 |
| 32 | 16 × `0x10` | 48 |

Use the [AES Encryption Tool](/aes-encryption) with test data to compare plaintext, IV, and ciphertext encodings. For new application designs, prefer an authenticated mode that does not require padding.
