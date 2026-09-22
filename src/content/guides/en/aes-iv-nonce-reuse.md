An AES initialization vector (IV) or nonce is public metadata, not a second secret key. Its job is to make repeated encryption safe. Using the correct length is not enough: the value must satisfy the uniqueness or unpredictability rule of the selected mode. Reuse is one of the most damaging real-world encryption mistakes.

## IV, Nonce, and Counter

The terms overlap, but their security requirements differ:

- An **IV** initializes a mode such as CBC. CBC needs a random, unpredictable 16-byte IV.
- A **nonce** is a number used once. GCM normally uses a unique 12-byte nonce.
- A **counter** is a structured nonce that increases without repetition, often used by CTR-like modes.

These values are normally stored with ciphertext. Hiding an IV does not repair a weak design, and exposing a correctly generated IV does not expose the key.

## What Reuse Breaks

| Mode | Requirement | Consequence of reuse |
|---|---|---|
| CBC | Fresh, unpredictable 16-byte IV | Equal first plaintext blocks produce equal first ciphertext blocks; predictable IVs enable chosen-plaintext attacks |
| CTR | Unique counter stream under each key | Ciphertexts become a two-time pad; XOR exposes the XOR of plaintexts |
| GCM | Unique nonce under each key | CTR confidentiality fails and authentication can be compromised |
| OFB | Unique IV under each key | Keystream repeats, exposing plaintext relationships |

### CTR and GCM: repeated keystream

CTR encrypts counter blocks and XORs the result with plaintext. If the same key and initial counter are reused:

```text
C1 = P1 XOR S
C2 = P2 XOR S
C1 XOR C2 = P1 XOR P2
```

The secret stream `S` cancels. Structured or partially known plaintext can then reveal the other message. GCM uses CTR internally, so it inherits this problem. Nonce reuse also creates algebraic relationships in GCM authentication, making the failure more serious than plaintext leakage alone.

### CBC: repeated first-block relationship

CBC XORs the first plaintext block with the IV before encryption. Reusing an IV with the same key reveals whether first plaintext blocks are equal. Predictable IVs can also allow an attacker who controls plaintext to test relationships between blocks.

CBC IV reuse is not identical to GCM nonce reuse, but it still violates the mode's security assumptions and should be treated as a defect.

## Safe Generation Patterns

### Random CBC IV

Generate 16 random bytes for every encryption:

```text
IV = CSPRNG(16 bytes)
ciphertext = IV || AES-CBC(key, IV, paddedPlaintext)
```

Use the operating system or cryptographic library random generator. Do not use `Math.random()`, timestamps, UUID text, hashes of plaintext, or a static configuration value.

### Random GCM nonce

For many applications, generate a 12-byte nonce from a cryptographically secure random source. The collision probability grows with the number of messages, so define a per-key message limit and rotate keys well before collision risk becomes material.

Random generation alone is not a complete distributed-systems design. Multiple processes or restored virtual-machine snapshots may accidentally repeat random state or counters.

### Structured GCM nonce

High-volume systems can combine a unique machine or process prefix with a monotonically increasing counter:

```text
nonce = 32-bit instance ID || 64-bit message counter
```

The instance ID must not collide, and the counter must never reset while the key remains active. Persist counter state before acknowledging encryption, or allocate non-overlapping ranges to workers.

## Storage and Envelope Design

A ciphertext envelope should identify how to interpret every field:

```text
version || key_id || nonce || ciphertext || authentication_tag
```

Store the nonce with the encrypted record. Bind the version, key identifier, and business context as GCM additional authenticated data when those fields must not be altered.

A database uniqueness constraint on `(key_id, nonce)` can provide useful defense in depth. It does not replace correct allocation, but it can turn a catastrophic cryptographic failure into a visible write error.

## Common Production Failures

### Static IV in configuration

A constant IV makes tests repeatable but invalidates production security. Tests should inject a deterministic generator only in test code; production must use the real generator.

### Counter reset after restart

An in-memory counter starts at zero whenever a service restarts. If the key remains the same, old nonce values repeat. Persist the counter, rotate the key at restart, or allocate durable counter ranges.

### Multiple writers sharing a key

Two servers can generate the same counter value. Partition the nonce space by instance ID or centralize allocation. Ensure instance IDs cannot be reused while encrypted data under the key still exists.

### Retrying encryption

A retry may repeat a nonce with different plaintext. Either reuse the complete previously produced ciphertext for an idempotent request, or allocate a new nonce for every fresh encryption operation.

### Truncating or transforming nonces

Encoding a nonce as an integer, dropping leading zero bytes, or truncating a UUID can alter length and uniqueness. Define a fixed binary representation and test round trips.

## Detection and Response

Nonce reuse is difficult to detect from ciphertext alone unless the system records nonce and key identifiers. Log non-sensitive envelope metadata, monitor duplicate constraints, and audit counters during failover tests.

If GCM nonce reuse is confirmed:

1. Stop encryption with the affected key.
2. Generate a new key and repair nonce allocation.
3. Identify all records sharing the key and nonce.
4. Treat affected confidentiality and authenticity as compromised.
5. Re-encrypt trustworthy plaintext under the new key.

Simply generating new nonces for future messages does not repair previously affected records.

## Implementation Checklist

- Select the mode before defining the IV rule.
- Use 16 random bytes for CBC IVs.
- Use unique 12-byte nonces for GCM unless the library specifies otherwise.
- Scope nonce uniqueness to a specific key.
- Store nonce and key identifier with ciphertext.
- Define key rotation and per-key message limits.
- Test restarts, retries, concurrency, backups, and disaster recovery.

For mode selection, read [AES-GCM vs AES-CBC](/guides/aes-gcm-vs-cbc/). To inspect IV behavior safely, use the [AES Encryption Tool](/aes-encryption) with non-sensitive test vectors.
