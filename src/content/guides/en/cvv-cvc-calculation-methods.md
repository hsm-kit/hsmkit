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
- Used to verify chip was present

### Dynamic CVV/CVC3
- Generated per transaction by contactless/chip
- Constantly changing for additional security

## CVV Calculation Process

### Input Data

1. **Primary Account Number (PAN)**: 16-digit card number
2. **Expiration Date**: MMYY or YYMM format
3. **Service Code**: 3 digits (e.g., 101, 201)
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

## Security Properties

1. **One-way function**: Cannot reverse-engineer the CVK from CVV
2. **Key dependency**: Different CVKs produce different CVVs
3. **Input sensitivity**: Any change in PAN/expiry changes CVV

## Why Dynamic CVV Matters

Traditional CVV is static - once stolen, it can be reused. Dynamic CVV (CVC3) changes with each transaction using:

- Application Transaction Counter (ATC)
- Unpredictable Number (UN)
- Card-specific key (derived from IMK)

This makes stolen values useless for future transactions.

## Try It Yourself

Use our CVV Calculator to:

- Calculate CVV/CVV2/iCVV
- Verify existing CVV values
- Understand the step-by-step process
- Test with sample data
