PIN Verification Value (PVV) is VISA's method for verifying PINs at ATMs and POS terminals. This guide explains the PVV calculation process and how it differs from the IBM 3624 PIN Offset method.

## What is PVV?

PVV (PIN Verification Value) is a 4-digit cryptographic value derived from the customer's PIN, the card's PAN, and a secret key. It's stored on the magnetic stripe and used to verify PINs without transmitting the actual PIN to the issuer for every transaction.

PVV provides stronger security than [PIN Offset](/payments-pin-offset) because the verification value itself is cryptographically derived, not just an arithmetic difference.

## PVV Calculation Process

### Input Data

- **PIN**: The customer's 4-12 digit PIN
- **PAN**: Primary Account Number (without check digit)
- **PVK**: PIN Verification Key (16 hex characters for 3DES)
- **PVKI**: PIN Verification Key Index (0-6, selects which PVK to use)

### Algorithm Steps

**Step 1: Select the PVK**

The PVKI selects which PIN Verification Key to use:

```
PVK = PVK_Set[PVKI]
```

This allows multiple PVKs to be active simultaneously, enabling key rotation without reissuing cards.

**Step 2: Prepare the PAN**

Take the rightmost 12 digits of the PAN (excluding the check digit):

```
PAN_formatted = PAN[4:16] (positions 4 through 15, 0-indexed)
```

**Step 3: Construct the Data Block**

Concatenate PAN and PIN:

```
Data_Block = PAN_formatted || PIN[0:4]
```

The first 4 digits of the PIN are used. If the PIN is longer than 4 digits, only the first 4 are used for PVV calculation.

**Step 4: Encrypt with PVK**

Encrypt the data block using [3DES](/guides/des-3des-legacy-encryption) with the selected PVK:

```
Encrypted = 3DES_Encrypt(PVK, Data_Block)
```

**Step 5: Extract PVV**

Apply decimalization to extract a 4-digit PVV:

1. Take each hex digit of the encrypted result
2. Map to decimal using a decimalization table
3. Select the first 4 digits that are 0-9
4. Skip hex digits A-F

### Example

Given:
- PIN: `1234`
- PAN: `4012345678901234` (check digit is 4)
- PVK: `0123456789ABCDEF FEDCBA9876543210`
- PVKI: `0`

**Step 1: Format PAN**
```
Rightmost 12 digits: 012345678901
```

**Step 2: Construct Data Block**
```
Data_Block = 012345678901 || 1234 = 0123456789011234
```

**Step 3: Encrypt**
```
Encrypted = 3DES_Encrypt(PVK, 0123456789011234)
Result: A1B2C3D4E5F6A7B8
```

**Step 4: Decimalize**
```
A→0, 1→1, B→1, 2→2, C→2, 3→3, D→3, 4→4, E→4, 5→5, F→5, 6→6, A→0, 7→7, B→1, 8→8
Decimal sequence: 0112233445560718
First 4 valid digits: 0112
```

**Result**: PVV = `0112`

## PVV Verification Process

When a customer enters their PIN at an ATM:

1. ATM reads PVV and PVKI from the magnetic stripe
2. ATM sends encrypted PIN block to the host
3. Host's [HSM](/guides/hsm-key-management-overview) decrypts the PIN block
4. HSM selects PVK using PVKI
5. HSM computes PVV using the submitted PIN, PAN, and PVK
6. HSM compares computed PVV with the stored PVV
7. If match, verification succeeds

### HSM Command Flow

```
1. Read PVV and PVKI from Track 2
2. Decrypt PIN block → Extract submitted PIN
3. Select PVK using PVKI
4. Construct data block: PAN_formatted || PIN[0:4]
5. 3DES_Encrypt(PVK, data_block)
6. Decimalize → Computed PVV
7. Compare(computed_PVV, stored_PVV) → Result
```

## PVKI (PIN Verification Key Index)

The PVKI is a single digit (0-6) stored on the magnetic stripe that indicates which PVK was used:

- **PVKI 0-6**: Selects one of up to 7 active PVKs
- **PVKI 7-9**: Typically reserved for special purposes

### Key Rotation

The PVKI enables seamless key rotation:

1. Generate new PVK and assign to PVKI=1
2. New cards are issued with PVKI=1
3. Old cards with PVKI=0 continue to work
4. Eventually, phase out PVKI=0

## Where PVV is Stored

The PVV is stored in Track 2 of the magnetic stripe:

```
Track 2: PAN | Expiry | Service Code | PVKI + PVV + Other Data
```

The PVKI and PVV together occupy 5 digits in the discretionary data field.

## Security Properties

### Strengths

1. **Cryptographic verification**: PVV is a cryptographic hash, not an arithmetic offset
2. **Key separation**: Multiple PVKs can be active simultaneously
3. **No plaintext storage**: The PVV doesn't reveal the PIN
4. **Standardized**: Widely supported across the payment industry

### Comparison with PIN Offset

| Feature | PIN Offset | PVV |
|---------|------------|-----|
| Value type | Arithmetic difference | Cryptographic hash |
| Key usage | Single PDK | Multiple PVKs (via PVKI) |
| Security | Moderate | Higher |
| Reversibility | Can compute PIN if offset + natural PIN known | Cannot reverse to PIN |
| Storage | Offset on stripe | PVV on stripe |

## PVV in the EMV World

While PVV was designed for magnetic stripe transactions, it's also relevant in EMV:

- **Fallback**: When chip reading fails, magnetic stripe with PVV is used
- **Offline verification**: Some EMV implementations use PVV for offline PIN verification
- **Migration**: Cards may have both EMV chip and magnetic stripe with PVV

## Common Questions

### Can I compute the PIN from the PVV?

No. The PVV is a one-way cryptographic function. Knowing the PVV, PVK, and PAN doesn't allow you to recover the PIN — you can only verify a submitted PIN.

### What if PVKI is not present?

If the PVKI is missing, a default PVK (usually PVKI=0) is assumed. This is common in older systems.

### How is PVV different from CVV?

[CVV](/guides/cvv-cvc-calculation-methods) protects against card fraud by verifying card data. PVV protects against PIN fraud by verifying the customer's PIN. They use different keys and serve different purposes.

### Can multiple PVVs exist for one card?

No. Each card has one PVV for one PIN. If the customer changes their PIN, a new PVV is computed and stored.

## Try It Yourself

Use our PVV tools to understand and verify the VISA PIN Verification Value method:

- [PIN PVV Calculator](/payments-pin-pvv) — Compute PVVs from PIN, PAN, and PVK, and verify PINs using the PVV method

All processing happens locally in your browser — your PVK never leaves your device.
