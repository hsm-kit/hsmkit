Card Verification Values (CVV) and Card Verification Codes (CVC) are security features that protect against card fraud. This guide explains how they are generated cryptographically.

## Types of Card Verification Values

### CVV1 (Magnetic Stripe)
- Encoded on the magnetic stripe (Track 1 and Track 2)
- Used for in-person "card present" transactions
- 3 digits

### CVV2/CVC2 (Printed)
- Printed on the card (back for Visa/MC, front for Amex)
- Used for "card not present" transactions (online/phone)
- 3 digits (Visa/MC) or 4 digits (Amex)

### iCVV (Integrated Circuit)
- Stored in the chip
- Different from CVV1 to prevent skimming attacks
- Uses a different service code (`999`) to distinguish from CVV1

### Dynamic CVV/CVC3
- Generated per transaction by contactless/chip
- Constantly changing for additional security
- Used in Mastercard contactless transactions

## CVV Calculation Process

CVV calculation uses [3DES encryption](/guides/des-3des-legacy-encryption) with a pair of Card Verification Keys (CVK).

### Input Data

1. **Primary Account Number (PAN)**: 16-digit card number
2. **Expiration Date**: MMYY or YYMM format
3. **Service Code**: 3 digits (e.g., 101 for CVV1, 000 for CVV2)
4. **CVK A and CVK B**: Card Verification Keys (16 hex each)

### Algorithm Steps

**Step 1: Prepare the Data Block**

Concatenate PAN (right-justified) + Expiration + Service Code, pad to 32 hex:

```
Block A: PAN[12 digits] + Exp[4] + ServiceCode[3] + Padding
Block B: Remaining PAN digits + Padding
```

**Step 2: Encrypt Block A**

```
Encrypted_A = 3DES_Encrypt(CVK_A, Block_A)
```

**Step 3: XOR with Block B**

```
XORed = Encrypted_A XOR Block_B
```

**Step 4: Encrypt Again**

```
Encrypted_B = 3DES_Encrypt(CVK_A, XORed)
```

**Step 5: Decimalize**

Extract digits from the result:
1. Take hex characters 0-9 as digits
2. For A-F, subtract 10 to get 0-5
3. Take first 3 (or 4 for Amex) digits

### Example

Given:
- PAN: `4012345678901234`
- Expiry: `2512` (December 2025)
- Service Code: `101`
- CVK: `0123456789ABCDEF FEDCBA9876543210`

Result: CVV = `123` (example)

## CVV2 vs CVV1 Differences

| Property | CVV1 | CVV2 |
|----------|------|------|
| Location | Magnetic stripe | Printed on card |
| Service Code | 101 | 000 |
| Purpose | Card present | Card not present |
| Can be skimmed | Yes | No (not on stripe) |

## Amex CSC (Card Security Code)

American Express uses a different scheme with multiple CSC values:
- **CSC3**: 3-digit value on the back
- **CSC4**: 4-digit value on the front (the main security code)
- **CSC5**: 5-digit value

Amex CSC uses a different algorithm from Visa/Mastercard CVV. Use our [Amex CSC Calculator](/payments-card-validation-amex-cscs) for Amex-specific calculations.

## Mastercard CVC3 (Dynamic)

Mastercard's contactless cards use **CVC3** — a dynamic value generated per transaction using:
- Application Transaction Counter (ATC)
- Unpredictable Number (UN)
- Card-specific key (derived from IMK)

This makes stolen values useless for future transactions. Use our [Mastercard CVC3 Calculator](/payments-card-validation-mastercard-cvc3).

## Security Properties

1. **One-way function**: Cannot reverse-engineer the CVK from CVV
2. **Key dependency**: Different CVKs produce different CVVs
3. **Input sensitivity**: Any change in PAN/expiry changes CVV

## CVK Key Management

CVKs are sensitive keys stored in [HSMs](/guides/hsm-key-management-overview). They are:
- Generated inside the HSM
- Split into components for loading (see [Key Splitting guide](/guides/understanding-key-splitting-kcv))
- Stored encrypted under the LMK
- Used only within the HSM for CVV generation/verification

## Why Dynamic CVV Matters

Traditional CVV is static — once stolen, it can be reused. Dynamic CVV (CVC3) changes with each transaction, making stolen values useless for future transactions.

This is part of the broader EMV chip card security model, which also includes:
- [DUKPT](/guides/dukpt-key-derivation-tutorial) for unique per-transaction keys
- [PIN blocks](/guides/pin-block-formats-iso9564) for secure PIN transmission
- [Digital signatures](/guides/ecc-digital-signatures-explained) for card authentication

## Try It Yourself

- [CVV/CVV2/iCVV Calculator](/payments-card-validation-cvvs) — Calculate and verify Visa/Mastercard CVV values
- [Amex CSC Calculator](/payments-card-validation-amex-cscs) — Amex-specific CSC calculation
- [Mastercard CVC3 Calculator](/payments-card-validation-mastercard-cvc3) — Dynamic CVC3 for contactless

All calculations run in your browser — your CVKs never leave your device.
