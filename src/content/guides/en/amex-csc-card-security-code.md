American Express uses Card Security Code (CSC) algorithms that differ from the standard CVV/CVC used by Visa and Mastercard. This guide explains the CSC3, CSC4, and CSC5 calculation methods specific to AMEX cards.

## What is AMEX CSC?

The Card Security Code on AMEX cards serves the same purpose as CVV on Visa/Mastercard — it verifies that the person making a transaction has physical possession of the card. However, AMEX uses a distinct cryptographic approach with multiple CSC values.

### CSC Types

- **CSC3**: A 3-digit code, similar in function to Visa's CVV2. Printed on the card but not encoded on the magnetic stripe.
- **CSC4**: A 4-digit code printed on the front of the card. This is the primary security code for AMEX "card not present" transactions.
- **CSC5**: A 5-digit code used in specific AMEX security contexts.

## How CSC Differs from CVV

While Visa and Mastercard use a single CVK pair (CVK-A and CVK-B) for all card verification, AMEX CSC uses a different approach:

| Feature | Visa/MC CVV | AMEX CSC |
|---------|-------------|----------|
| Number of codes | 1 (CVV1/CVV2) | Multiple (CSC3/4/5) |
| Digits | 3 | 3, 4, or 5 |
| Front/back | Back | Front (CSC4) + Back (CSC3) |
| Algorithm | Single DES-based | Multiple variants |
| Service codes | Different per type | Type-specific |

## CSC Algorithm Overview

The AMEX CSC calculation shares some similarities with standard [CVV calculation](/guides/cvv-cvc-calculation-methods) but uses different key management and processing steps.

### Input Data

- **PAN**: Primary Account Number (15 digits for AMEX)
- **Expiration Date**: YYMM format
- **Service Code**: 3 digits (varies by CSC type)
- **CSC Key A and CSC Key B**: AMEX-specific card verification keys

### CSC3 Calculation

CSC3 uses a 3-digit output and follows this process:

1. Construct data block from PAN, expiry, and service code
2. Encrypt with CSC Key A using [3DES](/guides/des-3des-legacy-encryption)
3. XOR with remaining PAN data
4. Encrypt again
5. Extract 3 decimal digits through the decimalization process

### CSC4 Calculation

CSC4 produces a 4-digit code and uses a modified algorithm:

1. Construct data block with PAN (15 digits for AMEX), expiry, and service code
2. Process through the CSC4-specific encryption chain
3. Apply the CSC4 decimalization to extract 4 digits

The 4-digit output provides a larger keyspace (10,000 possible values vs 1,000 for 3-digit codes), offering stronger verification for online transactions.

### CSC5 Calculation

CSC5 is a 5-digit code used in specific AMEX security applications. It follows a similar cryptographic process but produces a 5-digit output, providing 100,000 possible values.

## AMEX Card Characteristics

AMEX cards have several unique characteristics that affect CSC calculation:

- **15-digit PAN**: AMEX cards use 15-digit PANs (starting with 34 or 37), unlike the 16-digit PANs used by Visa/Mastercard
- **No check digit in some calculations**: The Luhn check digit handling may differ
- **Front-printed security code**: CSC4 is printed on the front, making it visible during card-present transactions
- **Multiple verification codes**: The ability to have CSC3, CSC4, and CSC5 on a single card

## Practical Use Cases

### Online Transaction Verification

When an AMEX card is used for an online purchase:

1. Merchant requests CSC4 (the 4-digit front code)
2. AMEX receives the CSC4 value in the authorization message
3. HSM recalculates the expected CSC4 using the stored CSC keys
4. If the submitted CSC4 matches, the transaction proceeds

### Fraud Detection

Multiple CSC values allow AMEX to implement layered security:

- CSC4 for primary online verification
- CSC3 for secondary verification channels
- CSC5 for specialized security applications

## Key Management for CSC Keys

AMEX CSC keys follow the same security principles as other card verification keys:

- Generated inside the [HSM](/guides/hsm-key-management-overview)
- Stored encrypted under the [LMK](/guides/thales-lmk-key-encryption)
- Split into components for loading (see [Key Splitting guide](/guides/understanding-key-splitting-kcv))
- Never exposed in plaintext outside the HSM
- Rotated periodically per AMEX security policy

## Security Properties

1. **One-way function**: Cannot derive CSC keys from known CSC values
2. **Key separation**: Different CSC types may use different keys
3. **Input sensitivity**: Any change in PAN or expiry produces a completely different CSC
4. **Larger keyspace**: CSC4 (10,000 values) and CSC5 (100,000 values) offer stronger verification than 3-digit codes

## Common Questions

### Why does AMEX use multiple CSC values?

Multiple CSC values allow AMEX to differentiate between transaction types and channels, providing layered security. Each CSC type can be validated independently, and compromised values in one channel don't affect others.

### Why is the AMEX CSC on the front of the card?

AMEX places the 4-digit CSC4 on the front for historical and practical reasons. It also distinguishes AMEX cards visually from Visa/Mastercard, which place their verification codes on the back.

### Can I calculate CSC values without the HSM?

The CSC keys are secret and only available inside the HSM. While the algorithm is known, without the keys you cannot compute valid CSC values. Our tool lets you experiment with the algorithm using test keys.

## Try It Yourself

Use our AMEX CSC tools to understand and verify Card Security Code calculations:

- [Amex CSC Calculator](/payments-card-validation-amex-cscs) — Calculate CSC3, CSC4, and CSC5 values using test keys

All calculations run in your browser — your CSC keys never leave your device.
