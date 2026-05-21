Thales (formerly nCipher and SafeNet) is the market leader in payment HSMs with their payShield series. The Thales LMK (Local Master Key) system is the foundation of key management in these devices. This guide explains how Thales LMK encryption works, key schemes, and variant-based key protection.

## What is Thales LMK?

The Local Master Key (LMK) is the root key stored inside a Thales HSM. It's the master key that protects all other keys in the system.

### Key Characteristics

- Stored in tamper-resistant hardware
- Never leaves the HSM in plaintext
- Split into components during key ceremony
- Used to encrypt/decrypt all working keys
- Different variants for different key types

## LMK Variant System

Thales uses a **variant-based encryption** system where different XOR masks are applied to the LMK to create distinct encryption contexts for different key types.

### How Variants Work

```
Effective Key = LMK XOR Variant Mask
Encrypted Key = E(Effective Key, Plaintext Key)
```

This ensures that keys of different types are cryptographically isolated.

### Standard Variant Masks

| Key Type | Variant Code | XOR Mask |
|----------|--------------|----------|
| ZMK | 00 | LMK XOR 00000000 00000000 00000000 00000000 |
| ZMK (variant) | 01 | LMK XOR 00000000 00000000 00000000 000000FF |
| ZPK | 02 | LMK XOR 00000000 00000000 00000000 0000FF00 |
| TPK | 03 | LMK XOR 00000000 00000000 00000000 00FF0000 |
| TMK | 04 | LMK XOR 00000000 00000000 00000000 FF000000 |
| PVK | 05 | LMK XOR 00000000 00000000 000000FF 00000000 |
| CVK | 06 | LMK XOR 00000000 00000000 0000FF00 00000000 |
| DEK | 07 | LMK XOR 00000000 00000000 00FF0000 00000000 |

## Key Scheme Formats

Thales uses specific formats to represent encrypted keys, known as key schemes.

### ZMK Scheme

The Zone Master Key scheme is used for key exchange between HSMs:

```
ZMK Scheme: [Variant] [Encrypted Key] [KCV]
```

Example:
```
U 1A2B3C4D5E6F7890 ABCD12
```

Where:
- `U` = double-length key
- `1A2B3C4D5E6F7890` = LMK-encrypted ZMK
- `ABCD12` = Key Check Value

### ZPK Scheme

The Zone PIN Key scheme protects PIN encryption keys:

```
ZPK Scheme: [Variant] [Encrypted Key] [KCV]
```

### TMK/TPK Scheme

Terminal keys use similar format:

```
TMK Scheme: [Variant] [Encrypted Key] [KCV]
```

## Key Types Explained

### Zone Master Key (ZMK)

- Used to establish secure channels between HSMs
- Exchanged manually or via secure protocol
- Encrypts other keys for transport
- Also called Key Exchange Key (KEK)

### Zone PIN Key (ZPK)

- Encrypts PINs at ATMs and POS terminals
- Used for PIN translation between zones
- Protected under LMK variant

### Terminal Master Key (TMK)

- Master key for a specific terminal
- Loaded during terminal initialization
- Protects terminal-specific keys

### Terminal PIN Key (TPK)

- Used by terminal for PIN encryption
- Derived from or protected by TMK
- Specific to each terminal

### PIN Verification Key (PVK)

- Used to verify PINs offline
- Generates PVV (PIN Verification Value)
- Must be same at both ends

### Card Verification Key (CVK)

- Generates CVV/CVC/CID values
- Printed on card magnetic stripe or chip
- Used for card-not-present verification

### Data Encryption Key (DEK)

- Encrypts cardholder data
- Used for PAN encryption
- Required by PCI DSS

## Key Check Value (KCV)

KCV verification is essential for all Thales key operations.

### Standard KCV Calculation

```
KCV = First 3 bytes of E(Key, 0000000000000000)
```

### KCV in Key Exchange

When exchanging keys:
1. Export key from source HSM with KCV
2. Import key into destination HSM
3. Destination HSM calculates KCV
4. Compare KCVs — must match exactly
5. If mismatch, key was corrupted in transit

## Key Import and Export

### Importing a Key

To import a key into a Thales HSM:

1. Receive key encrypted under ZMK
2. HSM decrypts ZMK using LMK variant
3. HSM decrypts key using ZMK
4. HSM re-encrypts key under appropriate LMK variant
5. Key is stored with KCV

### Exporting a Key

To export a key from a Thales HSM:

1. Key is decrypted from LMK variant
2. Key is encrypted under target ZMK
3. KCV is calculated
4. Encrypted key and KCV are returned

## Practical Scenarios

### Key Exchange Between Banks

When Bank A sends a ZPK to Bank B:

1. Bank A generates ZPK in HSM
2. Bank A exports ZPK encrypted under ZMK
3. ZMK was previously exchanged (manual or automated)
4. Bank B imports ZPK into their HSM
5. Both verify KCVs match

### ATM Key Loading

Loading keys to an ATM:

1. Generate TMK in HSM
2. Export TMK encrypted under ZMK
3. Load TMK to ATM via master key loading
4. Generate TPK for the ATM
5. Export TPK encrypted under TMK
6. Load TPK to ATM

## Common Issues

### Variant Mismatch

Using wrong variant is common:
- Verify key type before operations
- Check variant mask documentation
- Test with known keys first

### KCV Mismatch

If KCVs don't match after exchange:
- Verify ZMK was correctly loaded
- Check for transmission errors
- Ensure both sides use same key type
- Confirm variant codes match

### Key Length Confusion

Thales supports single, double, and triple-length keys:
- Single: 8 bytes (16 hex)
- Double: 16 bytes (32 hex)
- Triple: 24 bytes (48 hex)

Ensure correct length indicator in scheme.

## Try It Yourself

Use our [Thales Keys tool](/thales-keys) to:

- Encrypt and decrypt keys under LMK variants
- Calculate KCVs for any key
- Understand key scheme formats
- Practice key import/export scenarios

The tool runs entirely in your browser — no data leaves your device.
