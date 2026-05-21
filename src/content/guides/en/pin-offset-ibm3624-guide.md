The IBM 3624 PIN verification method, also known as PIN Offset, is one of the oldest and most widely deployed PIN verification schemes in the banking industry. This guide explains how PIN Offset works and how it's used in ATM and POS networks.

## What is IBM 3624 PIN Offset?

The IBM 3624 method verifies a customer's PIN by computing a "natural PIN" from the card number (PAN) and comparing it to the actual PIN using an offset value. The offset is the difference between the customer's chosen PIN and the computed natural PIN.

### Core Concept

```
Natural PIN = f(PAN, PIN_Derivation_Key)
PIN Offset = Customer_PIN - Natural_PIN (mod 10)
```

To verify a PIN:
```
Expected PIN = Natural_PIN + PIN_Offset (mod 10)
```

If the expected PIN matches the submitted PIN, the verification succeeds.

## How PIN Offset Works

### Natural PIN Generation

The natural PIN is derived from the PAN using a PIN Derivation Key (PDK):

**Step 1: Prepare the PAN**

Take the PAN (Primary Account Number), exclude the check digit, and format it:

```
PAN_formatted = Rightmost 12 digits of PAN (excluding check digit)
```

**Step 2: Encrypt with PDK**

Use [3DES](/guides/des-3des-legacy-encryption) encryption with the PIN Derivation Key:

```
Encrypted = 3DES_Encrypt(PDK, PAN_formatted)
```

**Step 3: Decimalize**

Convert the encrypted result to decimal digits using a Decimalization Table:

1. Take each hex digit of the encrypted result
2. Map it to a decimal digit using the table
3. Select the first N digits (where N is the PIN length, typically 4)

### Decimalization Table

The Decimalization Table maps hex digits (0-F) to decimal digits (0-9):

```
Hex:    0 1 2 3 4 5 6 7 8 9 A B C D E F
Decimal:0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
```

This is the default table. Banks can customize it for additional security — if an attacker knows the algorithm but not the table, they cannot compute the natural PIN.

### PIN Offset Calculation

Once the natural PIN is generated, the PIN offset is calculated:

```
PIN Offset = (Customer_PIN - Natural_PIN) mod 10
```

Each digit is calculated independently:

```
Offset_digit[i] = (Customer_digit[i] - Natural_digit[i]) mod 10
```

### Example

Given:
- PAN: `4012345678901234` (check digit is 4)
- PDK: `0123456789ABCDEF FEDCBA9876543210`
- Customer PIN: `1234`
- Decimalization Table: Default

**Step 1: Format PAN**
```
PAN (without check digit): 401234567890123
Rightmost 12 digits: 012345678901
```

**Step 2: Encrypt**
```
Encrypted = 3DES_Encrypt(PDK, 012345678901)
Result: A1B2C3D4E5F6A7B8
```

**Step 3: Decimalize**
```
Using default table: 012345078056
Natural PIN (first 4 digits): 0123
```

**Step 4: Calculate Offset**
```
Offset = (1234 - 0123) mod 10 = 1111
```

**Stored value**: PIN Offset = `1111`

## PIN Verification Process

When a customer enters their PIN at an ATM:

1. ATM sends encrypted PIN block to the host
2. Host's [HSM](/guides/hsm-key-management-overview) decrypts the PIN block
3. HSM retrieves the stored PIN offset for the card
4. HSM computes the natural PIN using PDK and PAN
5. HSM adds the offset to the natural PIN
6. HSM compares the result with the submitted PIN
7. If match, transaction proceeds

### HSM Command Flow

```
1. Decrypt PIN block → Extract submitted PIN
2. Encrypt(PDK, PAN_formatted) → Encrypted result
3. Decimalize(encrypted result) → Natural PIN
4. Natural_PIN + PIN_Offset → Expected PIN
5. Compare(submitted_PIN, expected_PIN) → Result
```

## Where PIN Offset is Stored

The PIN offset can be stored in several places:

- **On the magnetic stripe**: Encoded in Track 2 or Track 3
- **In the issuer's database**: Associated with the card record
- **In the chip**: For EMV cards, may be stored in the chip

### Magnetic Stripe Storage

Traditionally, the PIN offset is stored in the discretionary data field of Track 2:

```
Track 2: PAN | Expiry | Service Code | Discretionary Data (includes PIN Offset)
```

## Security Considerations

### Strengths

1. **Simplicity**: Easy to implement and understand
2. **Efficiency**: Requires only one encryption operation per verification
3. **Compatibility**: Works with existing magnetic stripe infrastructure

### Weaknesses

1. **No PIN encryption**: The offset itself is not encrypted — if the database is compromised, attackers can compute PINs
2. **Table dependency**: Security relies on keeping the Decimalization Table secret
3. **Natural PIN exposure**: If the PDK is compromised, natural PINs can be computed for all cards

### Mitigations

- Keep the PDK secure inside the [HSM](/guides/hsm-key-management-overview)
- Use non-default Decimalization Tables
- Protect the PIN offset database
- Consider migrating to [PVV](/payments-pin-pvv) for stronger security

## PIN Offset vs PVV

| Feature | PIN Offset (IBM 3624) | PVV (VISA) |
|---------|----------------------|------------|
| Origin | IBM | VISA |
| Verification | Add offset to natural PIN | Compare PVV values |
| Storage | Offset on stripe/DB | PVV on stripe |
| Algorithm | 3DES + Decimalization | 3DES + Decimalization |
| Security | Moderate | Higher |
| Key | PDK | PVK |

PVV provides stronger security because the verification value is itself encrypted, not just an offset. See our [PIN PVV guide](/payments-pin-pvv) for details.

## Practical Applications

### ATM Networks

PIN Offset is still widely used in ATM networks worldwide:
- Most ATMs support IBM 3624 verification
- Backward compatibility with legacy systems
- Simple implementation in HSMs

### Migration Path

Many banks are migrating from PIN Offset to PVV or EMV chip verification:
1. Implement dual verification (support both methods)
2. Gradually reissue cards with PVV
3. Eventually phase out PIN Offset

## Try It Yourself

Use our PIN Offset tools to understand and verify the IBM 3624 method:

- [PIN Offset Calculator](/payments-pin-offset) — Compute natural PINs, calculate PIN offsets, and verify PINs using the IBM 3624 method

All processing happens locally in your browser — your PDK never leaves your device.
