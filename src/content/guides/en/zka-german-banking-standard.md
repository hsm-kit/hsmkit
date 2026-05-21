ZKA (Zentraler Kreditausschuss) is the German banking industry standard for secure PIN processing and message authentication. This guide covers the ZKA specification, session key derivation, and its cryptographic operations.

## What is ZKA?

ZKA is the standard defined by the German Central Credit Committee (Zentraler Kreditausschuss) for securing electronic banking transactions in Germany. It specifies:

- PIN encryption and verification
- Session key derivation
- MAC (Message Authentication Code) calculation
- Key management for banking terminals

ZKA is widely used in German banking infrastructure, including ATMs, POS terminals, and online banking systems. It provides a standardized approach to transaction security that is specific to the German banking ecosystem.

## Session Key Derivation

A core concept in ZKA is the **Session Key** — a temporary key derived for each banking session or transaction. This limits the exposure if any single key is compromised.

### Session Key Components

Session keys are derived from:

- **Master Key**: A long-term key stored in the [HSM](/guides/hsm-key-management-overview)
- **Transaction Data**: Unique data from the current transaction (e.g., timestamp, sequence number)
- **Random Data**: Nonces or random values to ensure uniqueness

### Derivation Process

```
Session_Key = KDF(Master_Key, Transaction_Data || Random_Data)
```

The Key Derivation Function (KDF) typically uses:

- [3DES](/guides/des-3des-legacy-encryption) encryption in CBC mode
- [AES](/guides/aes-encryption-explained) for newer implementations
- CMAC-based derivation for stronger security

### Key Hierarchy

```
Master Key (MK)
 ├── Session Key for PIN Encryption
 ├── Session Key for MAC
 └── Session Key for Data Encryption
```

Each session key is derived independently, providing key separation between different security functions.

## SK-pac (Session Key for PIN and Authentication Cryptogram)

SK-pac is a specific session key used for PIN encryption and authentication in the ZKA framework.

### Purpose

SK-pac is used to:

- Encrypt PIN blocks for transmission
- Generate authentication cryptograms
- Verify transaction integrity

### Derivation

SK-pac is derived from the master key using:

```
SK-pac = Derive(MK, "pac" || Session_Data)
```

The derivation includes a context label ("pac") to ensure the key is used only for its intended purpose.

### Usage

1. Terminal requests a new session
2. HSM derives SK-pac from the master key
3. SK-pac is used to encrypt the customer's PIN
4. PIN block is transmitted securely
5. Recipient's HSM derives the same SK-pac to decrypt

## PIN Encryption in ZKA

ZKA defines how PINs are encrypted for secure transmission:

### PIN Block Format

ZKA typically uses [ISO 9564 Format 0](/guides/pin-block-formats-iso9564) for PIN blocks:

```
PIN Block = PIN Field XOR PAN Field
```

The PAN field uses the standard ISO-0 format with the rightmost 12 digits of the PAN.

### Encryption Process

1. Customer enters PIN at terminal
2. Terminal formats PIN as ISO-0 PIN block
3. PIN block encrypted with SK-pac
4. Encrypted PIN block placed in transaction message
5. Message sent to bank's HSM for verification

### Key Security

- SK-pac is a session key, valid only for the current session
- Even if intercepted, the key expires after the session
- The master key is never exposed outside the [HSM](/guides/hsm-key-management-overview)

## MAC Calculation in ZKA

ZKA uses Message Authentication Codes to ensure transaction integrity:

### MAC Algorithm

ZKA typically uses CBC-MAC based on [3DES](/guides/des-3des-legacy-encryption):

1. Divide the message into 8-byte blocks
2. Encrypt the first block with the MAC session key
3. XOR the result with the next block
4. Encrypt again
5. Repeat for all blocks
6. Final result is the MAC (truncated to 4 or 8 bytes)

### MAC Key Derivation

The MAC session key is derived separately from SK-pac:

```
SK-mac = Derive(MK, "mac" || Session_Data)
```

This provides key separation — even if the PIN key is compromised, the MAC key remains secure.

### MAC Verification

1. Sender computes MAC over the transaction message
2. MAC is appended to the message
3. Receiver recomputes the MAC using the same key
4. If MACs match, the message is authentic and unmodified

## Practical Transaction Flow

### ATM Transaction

1. Customer inserts card and enters PIN
2. ATM establishes secure session with bank's HSM
3. HSM derives SK-pac and SK-mac for the session
4. ATM encrypts PIN block using SK-pac
5. ATM computes MAC using SK-mac
6. Transaction message sent to bank
7. Bank's HSM verifies MAC and PIN
8. Transaction authorized or declined

### POS Transaction

Similar to ATM but with additional considerations:

- Terminal may support multiple card schemes
- Session keys may be pre-derived for efficiency
- Contactless transactions may use different session management

## ZKA vs International Standards

| Feature | ZKA | ISO 9564 | ANSI X9.24 |
|---------|-----|----------|------------|
| Region | Germany | International | International |
| Session keys | Yes | Optional | Yes |
| MAC standard | CBC-MAC | N/A | CBC-MAC |
| Key derivation | ZKA-specific | Standard KDF | Standard KDF |
| PIN format | Format 0 | All formats | All formats |

## Security Properties

### Key Separation

ZKA enforces strict key separation:

- Different session keys for PIN, MAC, and data
- Context labels prevent key misuse
- Each session has unique keys

### Session Isolation

Each banking session uses fresh keys:

- Compromised session keys don't affect other sessions
- Keys expire after session ends
- Forward secrecy for session keys

### Master Key Protection

The master key never leaves the HSM:

- All key derivation happens inside the HSM
- Session keys are derived on demand
- Master key components are split for loading (see [Key Splitting guide](/guides/understanding-key-splitting-kcv))

## Common Questions

### Is ZKA only used in Germany?

ZKA is primarily a German banking standard, but it may be used by German banks operating internationally. Other countries have their own standards (e.g., AS2805 in Australia).

### Can ZKA use AES?

Newer ZKA implementations support [AES](/guides/aes-encryption-explained) encryption, though 3DES remains common in legacy systems.

### How does ZKA relate to EMV?

ZKA operates at the network/host level, while EMV operates at the card/terminal level. They complement each other — EMV secures the card-terminal interface, while ZKA secures the terminal-host interface.

### What is the difference between ZKA and TR-31?

[TR-31](/guides/what-is-tr31-key-block) is a key block format for transporting keys. ZKA is a complete security framework that defines how keys are derived and used. TR-31 can be used within a ZKA implementation for key transport.

## Try It Yourself

Use our ZKA tools to understand and practice with the German banking security standard:

- [ZKA Tool](/payments-zka) — Session key derivation, PIN encryption, and MAC calculation according to the ZKA specification

All processing happens locally in your browser — your master keys never leave your device.
