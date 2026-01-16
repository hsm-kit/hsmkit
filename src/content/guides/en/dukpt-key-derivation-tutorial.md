DUKPT (Derived Unique Key Per Transaction) is a key management scheme that generates a unique encryption key for each transaction. This tutorial explains the complete derivation process.

## What is DUKPT?

DUKPT provides a method for:

1. Deriving unique transaction keys from a single base key
2. Ensuring that compromise of one transaction key doesn't expose others
3. Supporting millions of transactions without key exhaustion

## Key Components

### Base Derivation Key (BDK)
The master key held by the acquirer/processor. Never leaves the secure key management system.

### Initial PIN Encryption Key (IPEK)
Derived from BDK and the initial KSN. Injected into the PIN pad device.

### Key Serial Number (KSN)
A unique identifier that includes:
- Key Set ID (KSI): Identifies the BDK
- Device ID: Unique per device
- Transaction Counter: Increments with each transaction

Format: `KKKKKKKKKKTTTTTTTTTT` (80 bits)
- K: Key Set ID + Device ID
- T: Transaction Counter (21 bits)

### Current Transaction Key
Derived from IPEK using the counter portion of KSN.

## Derivation Process

### Step 1: Calculate IPEK

```
IPEK = TDES_Encrypt(BDK, KSN with counter zeroed) 
     || TDES_Encrypt(BDK XOR C0C0..., KSN with counter zeroed)
```

### Step 2: Future Key Derivation

For each transaction:

1. Start with IPEK (or current key register)
2. For each set bit in counter (from left to right):
   - Apply the "black box" function
   - XOR and encrypt to derive intermediate key
3. Final result is the Current Key

### Step 3: Working Key Derivation

From the Current Key, derive specific working keys:

- **PIN Encryption Key (PEK)**: XOR with mask `0x00000000000000FF00000000000000FF`
- **MAC Key**: XOR with mask `0x000000000000FF00000000000000FF00`
- **Data Encryption Key**: XOR with mask `0x0000000000FF00000000000000FF0000`

## Practical Example

Given:
- BDK: `0123456789ABCDEFFEDCBA9876543210`
- KSN: `FFFF9876543210E00001`

**Step 1: Extract Initial KSN (zero counter)**
```
Initial KSN: FFFF9876543210E00000
```

**Step 2: Calculate IPEK**
```
IPEK: 6AC292FAA1315B4D858AB3A3D7D5933A
```

**Step 3: Derive for Counter 1**
```
Current Key: 042666B49184CFA368DE9628D0397BC9
```

**Step 4: Derive PEK**
```
PEK: 042666B49184CF5C68DE962BD0397B36
```

## Security Considerations

1. **Counter Exhaustion**: After 2^21 (about 2 million) transactions, the device needs re-injection
2. **Future Key Secrecy**: Even if current key is compromised, future keys cannot be derived
3. **BDK Protection**: The BDK must never be exposed; all security depends on it

## AES DUKPT

Modern implementations use AES instead of TDES:

- 128/192/256-bit key sizes
- Enhanced security
- Larger counter space
- Different derivation algorithm (NIST SP 800-108)

## Try It Yourself

Use our DUKPT Tool to:

- Calculate IPEK from BDK and KSN
- Derive transaction keys step by step
- Generate PIN, MAC, and data encryption keys
- Visualize the entire derivation tree
