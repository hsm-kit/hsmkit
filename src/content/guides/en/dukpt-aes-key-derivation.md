AES-DUKPT is the modern evolution of the DUKPT key management scheme, replacing the legacy 3DES-based approach with AES encryption. This guide covers the AES-DUKPT derivation process and its advantages over TDEA-DUKPT.

## What is AES-DUKPT?

AES-DUKPT (Advanced Encryption Standard - Derived Unique Key Per Transaction) is defined in ANSI X9.24-3 and provides the same per-transaction key uniqueness as traditional DUKPT, but using [AES](/guides/aes-encryption-explained) instead of [3DES](/guides/des-3des-legacy-encryption).

NIST deprecated 3DES in 2023, making AES-DUKPT the recommended approach for new payment terminal deployments.

## AES-DUKPT vs TDEA-DUKPT

| Feature | TDEA-DUKPT | AES-DUKPT |
|---------|------------|-----------|
| Encryption algorithm | Triple DES | AES-128/192/256 |
| Key size | 16 bytes (2-key) | 16, 24, or 32 bytes |
| Counter space | 2¹ transactions | 2²⁴ transactions |
| Derivation method | XOR-based | CMAC-based (NIST SP 800-108) |
| PIN block format | Format 0/3 | Format 4 (AES) |
| Standard | ANSI X9.24-1 | ANSI X9.24-3 |
| Security level | Legacy | Modern |

## Key Components

### Base Derivation Key (BDK)

The master key held by the acquirer or payment processor:

- Stored in the [HSM](/guides/hsm-key-management-overview) encrypted under the [LMK](/guides/thales-lmk-key-encryption)
- Used to derive Initial Keys for devices
- Never leaves the secure key management system
- In [TR-31 format](/guides/what-is-tr31-key-block), key usage code is `B0`

### Initial Key (IK)

The AES-DUKPT equivalent of IPEK in TDEA-DUKPT:

- Derived from the BDK and the device's Initial Key Serial Number (IKSN)
- Injected into the PIN pad or terminal
- Once injected, the BDK is no longer needed on the device

### Initial Key Serial Number (IKSN)

An 80-bit identifier containing:

- **Key Set ID**: Identifies which BDK was used
- **Device ID**: Unique per terminal/device
- **Transaction Counter**: Starts at 0 and increments

The IKSN serves the same purpose as the KSN in TDEA-DUKPT but with a larger counter space.

### Future Keys

AES-DUKPT pre-computes a set of future keys during initialization:

- Stored in the device's key registers
- Used as the transaction counter advances
- Provides forward secrecy — compromise of a current key doesn't expose future keys

## Key Derivation Process

### Step 1: Derive the Initial Key

The IK is derived from the BDK using CMAC-based derivation:

```
IK = KDF(BDK, IKSN_data)
```

Where KDF is the NIST SP 800-108 Key Derivation Function using CMAC in counter mode.

### Step 2: Derive Transaction Keys

For each transaction, the working key is derived from the IK and the current counter:

```
Transaction_Key = DeriveKey(IK, Counter)
```

The derivation uses a tree-based approach where:
- Each bit position in the counter corresponds to a key derivation step
- Keys are derived by applying the KDF at each set bit position
- The final result is the unique transaction key

### Step 3: Derive Working Keys

From the transaction key, derive specific working keys for different purposes:

- **PIN Encryption Key**: For encrypting [PIN blocks (Format 4)](/guides/pin-block-formats-iso9564)
- **MAC Key**: For computing [message authentication codes](/guides/mac-algorithms-payment-security)
- **Data Encryption Key**: For encrypting sensitive data

Each working key is derived by applying the KDF with a different context/label.

## CMAC-Based Derivation

Unlike TDEA-DUKPT's XOR-based approach, AES-DUKPT uses CMAC (Cipher-based Message Authentication Code):

```
Derived_Key = AES-CMAC(Derivation_Key, Input_Data)
```

This provides:
- Stronger cryptographic properties
- Better diffusion of input changes
- Alignment with NIST recommendations

## Practical Example

Given:
- BDK: `0123456789ABCDEFFEDCBA98765432100123456789ABCDEF`
- IKSN: `FFFF9876543210E00000`

**Step 1: Derive IK**
```
IK: (derived using CMAC-based KDF)
```

**Step 2: Derive Transaction Key for Counter 1**
```
Transaction Key: (derived from IK and counter)
```

**Step 3: Derive PIN Encryption Key**
```
PEK: (derived using PIN-specific context)
```

## Security Properties

### Forward Secrecy

AES-DUKPT provides forward secrecy through the key derivation tree:

- Compromise of transaction key N does not reveal transaction key N+1
- Future keys are derived using one-way functions
- Each transaction key is cryptographically independent

### Larger Counter Space

AES-DUKPT supports 2²⁴ (approximately 16.7 million) transactions per device, compared to TDEA-DUKPT's 2¹ (approximately 2 million).

### Algorithm Strength

AES-128 provides stronger security than 2-key 3DES:

- No known practical attacks against AES-128
- 3DES has known meet-in-the-middle attacks reducing effective key size
- AES is the current NIST standard

## PIN Block Format 4

AES-DUKPT works with [PIN Block Format 4](/guides/pin-block-formats-iso9564), which is the AES-based PIN block format:

- 16 bytes instead of 8 bytes
- AES-128 encryption instead of 3DES
- Includes PAN hash for integrity
- Random fill for additional security

Format 4 is part of the broader migration from 3DES to AES in payment systems.

## Migration from TDEA-DUKPT

For organizations migrating from TDEA-DUKPT to AES-DUKPT:

1. **HSM Support**: Ensure your [HSM](/guides/hsm-key-management-overview) supports AES-DUKPT (Thales, SafeNet, etc.)
2. **Terminal Updates**: Deploy new terminals with AES-DUKPT support
3. **Key Injection**: Perform new key injection ceremonies with AES BDKs
4. **Dual Support**: Run both systems in parallel during transition
5. **TR-31 Version D**: Use [TR-31 Version D](/guides/what-is-tr31-key-block) key blocks for AES key transport

## Try It Yourself

Use our AES-DUKPT tools to understand and verify key derivation:

- [DUKPT AES Tool](/payments-dukpt-aes) — Derive Initial Keys from BDK, generate transaction keys, compute working keys for PIN, MAC, and data encryption

All processing happens locally in your browser — your BDK never leaves your device.
