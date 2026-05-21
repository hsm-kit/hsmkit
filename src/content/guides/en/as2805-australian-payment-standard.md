AS2805 is the Australian standard for electronic funds transfer (EFT) security, governing how PINs, keys, and messages are protected in the Australian payment network. This guide covers the cryptographic operations defined by AS2805.

## What is AS2805?

AS2805 is a multi-part standard published by Standards Australia that defines the security requirements for electronic financial transactions. It covers:

- PIN encryption and translation
- Key management procedures
- Message authentication (MAC)
- Cryptographic algorithms and their usage

The standard is widely used across Australian banks, payment processors, and ATM networks. It aligns with international standards like [ISO 9564](/guides/pin-block-formats-iso9564) and ISO 16609 but includes Australia-specific requirements and adaptations.

## Terminal Key Set

A central concept in AS2805 is the **Terminal Key Set** — a group of keys loaded into a terminal (ATM or POS) that enables secure communication with the host/HSM.

### Components

A Terminal Key Set typically contains:

- **Terminal Master Key (TMK)**: Encrypts other keys for injection into the terminal. Sometimes called the Key Encryption Key (KEK).
- **PIN Encryption Key (PEK)**: Encrypts [PIN blocks](/guides/pin-block-formats-iso9564) for transmission from terminal to host.
- **MAC Key**: Used to compute [message authentication codes](/guides/mac-algorithms-payment-security) for transaction integrity.
- **Data Encryption Key**: Encrypts sensitive data fields in messages.

### Key Hierarchy

```
LMK (in HSM)
 └── TMK (Terminal Master Key)
      ├── PEK (PIN Encryption Key)
      ├── MAC Key
      └── Data Key
```

The TMK is injected into the terminal during a key loading ceremony, encrypted under the [LMK](/guides/thales-lmk-key-encryption) inside the HSM. The working keys are then derived or transported under the TMK.

## PIN Block Translation

AS2805 defines how PIN blocks are translated when moving between different zones (e.g., from terminal to issuer network). PIN block translation is the process of converting a PIN block encrypted under one key to be encrypted under another key, without ever exposing the plaintext PIN.

### Translation Process

1. Terminal encrypts PIN block under PEK (terminal key)
2. HSM receives the encrypted PIN block
3. HSM decrypts using the terminal's PEK
4. HSM re-encrypts under the interchange key (zone key)
5. Translated PIN block is sent to the destination

This is performed inside the [HSM](/guides/hsm-key-management-overview) and never exposes the PIN in plaintext outside the secure boundary.

### AS2805 PIN Block Format

AS2805 primarily uses [ISO 9564 Format 0](/guides/pin-block-formats-iso9564) (ISO-0) for PIN blocks:

```
PIN Block = PIN Field XOR PAN Field
```

The PAN field uses the rightmost 12 digits of the PAN (excluding the check digit), which is consistent with the ISO-0 standard.

## MAC Calculation

AS2805 specifies message authentication codes (MAC) to ensure the integrity and authenticity of transaction messages. The MAC protects against:

- Message tampering
- Replay attacks
- Unauthorized message injection

### MAC Algorithm

AS2805 typically uses a CBC-MAC based on [3DES](/guides/des-3des-legacy-encryption):

1. Divide the message into 8-byte blocks
2. Encrypt the first block with the MAC key
3. XOR the result with the next block
4. Encrypt again with the MAC key
5. Repeat for all blocks
6. The final result (or a portion of it) is the MAC

The MAC is usually truncated to 4 or 8 bytes before being placed in the message. This is similar to the MAC algorithms used in [ISO 8583](/guides/iso8583-payment-messages) messages.

## OWF (One-Way Function)

AS2805 uses One-Way Functions for key derivation and PIN verification. OWFs are cryptographic operations that are easy to compute in one direction but computationally infeasible to reverse.

### Applications in AS2805

- **Key Derivation**: Deriving working keys from master keys using OWFs
- **PIN Verification**: Creating a verification value from the PIN that cannot be reversed to recover the PIN
- **Token Generation**: Creating irreversible tokens for stored PIN references

### Common OWF Algorithms

- **DES/3DES-based OWF**: Encrypt data with a key, use the result as a derived key or verification value
- **SHA-based OWF**: Hash-based one-way functions for newer implementations
- **ANSI X9.24 OWF**: Standardized key derivation using CMAC or retail MAC

## Practical Scenarios

### ATM Transaction Flow

1. Customer inserts card and enters PIN at ATM
2. Terminal formats PIN as [PIN block (Format 0)](/guides/pin-block-formats-iso9564)
3. PIN block encrypted under PEK
4. MAC computed over the transaction message
5. Message sent to acquirer/processor
6. HSM translates PIN block from PEK to interchange key
7. HSM verifies MAC
8. Transaction forwarded to issuer for PIN verification

### Key Loading Ceremony

1. Generate TMK components inside the HSM
2. Export TMK encrypted under LMK
3. Inject TMK into terminal (often via [TR-31 key block](/guides/what-is-tr31-key-block))
4. Derive or inject working keys (PEK, MAC key, Data key)
5. Verify key loading with test transactions

## AS2805 vs International Standards

| Feature | AS2805 | ISO 9564 | ISO 16609 |
|---------|--------|----------|-----------|
| Region | Australia | International | International |
| PIN Format | Format 0 | All formats | N/A |
| MAC Standard | CBC-MAC | N/A | CBC-MAC |
| Key Management | Australia-specific | ANSI X9.24 | ANSI X9.24 |

## Security Considerations

1. **Key Custody**: All keys must be stored encrypted under the [LMK](/guides/thales-lmk-key-encryption) in the HSM
2. **Dual Control**: Key loading requires split knowledge and dual control
3. **Key Rotation**: Working keys should be rotated regularly per AS2805 guidelines
4. **Audit Trail**: All key management operations must be logged
5. **Algorithm Migration**: Newer implementations should consider [AES](/guides/aes-encryption-explained) and [DUKPT AES](/payments-dukpt-aes) as 3DES is deprecated

## Try It Yourself

Use our AS2805 tools to practice with Australian payment security operations:

- [AS2805 Tool](/payments-as2805) — Terminal Key Set management, PIN block translation, MAC calculation, and OWF operations

All processing happens locally in your browser — your keys never leave your device.
